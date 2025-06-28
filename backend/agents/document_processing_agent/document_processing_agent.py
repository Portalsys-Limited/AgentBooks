"""Document processing agent for handling multi-step document analysis workflow using LangGraph."""

from typing import Dict, Any, Annotated, Optional, Callable
from langgraph.graph import StateGraph
from langchain.tools import BaseTool
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
from datetime import datetime

from db.models import Document, Practice
from db.models.documents import DocumentAgentState

from .states import AgentState, DOCUMENT_CATEGORIES, CLIENT_REQUIRED_CATEGORIES
from .nodes import classify_document_node
from .client_nodes import (
    check_client_assignment_node,
    send_rejection_message_node,
    send_selection_poll_node,
    assign_single_client_node
)

class DocumentClassificationTool(BaseTool):
    """Tool for classifying documents."""
    name: str = "classify_document"
    description: str = "Classify a document based on its content and metadata"
    args_schema: Optional[type] = None  # Type annotation for args_schema
    
    def _run(self, document_category: str, confidence: float, explanation: str) -> Dict[str, Any]:
        """Run the tool."""
        # Map common variations to standardized categories
        category_mapping = {
            "invoice": "invoice",
            "receipt": "receipt",
            "bank statement": "bank_statement",
            "bank_statement": "bank_statement",
            "contract": "contract",
            "engagement letter": "engagement_letter",
            "engagement_letter": "engagement_letter",
            "id card": "id_card",
            "id_card": "id_card",
            "passport": "passport",
        }
        
        # Extract category from explanation if not properly set
        if document_category == "other":
            # Look for category keywords in the explanation
            explanation_lower = explanation.lower()
            for key, value in category_mapping.items():
                if key in explanation_lower:
                    document_category = value
                    break
        
        # Validate the category is in allowed categories
        if document_category not in DOCUMENT_CATEGORIES:
            document_category = "other"
            
        return {
            "document_category": document_category,
            "confidence": confidence,
            "explanation": explanation
        }
        
    async def _arun(self, document_category: str, confidence: float, explanation: str) -> Dict[str, Any]:
        """Run the tool asynchronously."""
        return self._run(document_category, confidence, explanation)

def end_workflow(state: AgentState) -> None:
    """End node for the workflow."""
    state["current_node"] = "end"
    return None

class DocumentProcessingAgent:
    def __init__(self, db_session: Session, document_id: uuid.UUID):
        """Initialize the document processing agent."""
        self.db_session = db_session
        self.document_id = document_id
        self.document = self._load_document()
        
        if not self.document:
            raise ValueError(f"Document {document_id} not found")
            
        self.practice = self._load_practice()
        
        # Initialize LangGraph components
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        self.tools = [DocumentClassificationTool()]
        self.workflow = self._create_workflow()
        
    def _load_document(self) -> Document:
        """Load document from database."""
        return self.db_session.execute(
            select(Document).where(Document.id == self.document_id)
        ).scalar_one_or_none()
        
    def _load_practice(self) -> Practice:
        """Load practice from database."""
        return self.db_session.execute(
            select(Practice).where(Practice.id == self.document.practice_id)
        ).scalar_one_or_none()
    
    def _create_workflow(self) -> StateGraph:
        """Create the document processing workflow graph."""
        # Create workflow graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node(
            "classify_document", 
            lambda state: classify_document_node(state, self.llm, self.tools)
        )
        
        workflow.add_node(
            "check_client_assignment",
            lambda state: check_client_assignment_node(state, self.db_session)
        )
        
        workflow.add_node(
            "send_rejection_message",
            lambda state: send_rejection_message_node(state, self.db_session)
        )
        
        workflow.add_node(
            "send_selection_poll",
            lambda state: send_selection_poll_node(state, self.db_session)
        )
        
        workflow.add_node(
            "assign_single_client",
            lambda state: assign_single_client_node(state, self.db_session)
        )
        
        workflow.add_node("end", end_workflow)
        
        # Set conditional edges
        workflow.add_edge("classify_document", "check_client_assignment")
        
        def route_after_check_client_assignment(state: AgentState) -> str:
            """Determine next step after checking client assignment."""
            return state["current_node"]
        
        workflow.add_conditional_edges(
            "check_client_assignment",
            route_after_check_client_assignment,
            {
                "send_rejection_message": "send_rejection_message",
                "send_selection_poll": "send_selection_poll",
                "assign_single_client": "assign_single_client",
                "end": "end",
            },
        )
        
        workflow.add_edge("send_rejection_message", "end")
        workflow.add_edge("send_selection_poll", "end")
        workflow.add_edge("assign_single_client", "end")
        
        # Set entry point
        workflow.set_entry_point("classify_document")
        
        return workflow.compile()
    
    def process_document(self) -> Dict[str, Any]:
        """Process document through the workflow."""
        try:
            print(f"Starting document processing for document {self.document_id}")
            
            # Ensure we're starting with a clean session
            if self.db_session.in_transaction():
                self.db_session.rollback()
            
            # Start initial transaction
            self.db_session.begin()
            
            try:
                # Reload document
                self.document = self.db_session.execute(
                    select(Document).where(Document.id == self.document_id)
                ).scalar_one_or_none()
                
                if not self.document:
                    raise ValueError(f"Document {self.document_id} not found")
                
                # Update document state
                self.document.agent_state = DocumentAgentState.processing
                self.db_session.commit()
                print("Updated document state to processing")
                
            except Exception as e:
                self.db_session.rollback()
                raise
            
            # Prepare initial state
            initial_state = AgentState(
                messages=[],
                current_node="classify_document",
                document_id=str(self.document_id),
                extracted_text=self.document.raw_extracted_text or "",
                document_metadata={
                    "filename": self.document.filename,
                    "mime_type": self.document.mime_type,
                    "file_size": self.document.file_size,
                    "source": self.document.document_source.value
                },
                classification_result={},
                individual_id=None,
                available_clients=[],
                requires_client_selection=False,
                whatsapp_message_sent=False
            )
            
            print("Running workflow...")
            # Run the workflow
            final_state = self.workflow.invoke(initial_state)
            print("Workflow completed")
            
            # Start final transaction for updates
            if self.db_session.in_transaction():
                self.db_session.rollback()
            
            self.db_session.begin()
            
            try:
                # Reload document in new transaction
                self.document = self.db_session.execute(
                    select(Document).where(Document.id == self.document_id)
                ).scalar_one_or_none()
                
                if not self.document:
                    raise ValueError(f"Document {self.document_id} not found after workflow")
                
                # Update document with classification result
                classification = final_state["classification_result"]
                print(f"Classification result: {classification}")
                
                # Save the category
                old_category = self.document.document_category
                self.document.document_category = classification["document_category"]
                print(f"Updating document category from {old_category} to {self.document.document_category}")
                
                # Update metadata
                self.document.agent_metadata = {
                    **(self.document.agent_metadata or {}),
                    "classification": {
                        "category": classification["document_category"],
                        "confidence": classification["confidence"],
                        "explanation": classification["explanation"],
                        "classified_at": datetime.utcnow().isoformat()
                    }
                }
                
                # Update state based on client assignment
                if final_state.get("whatsapp_message_sent"):
                    if final_state.get("requires_client_selection"):
                        self.document.agent_state = DocumentAgentState.awaiting_client_selection
                    else:
                        self.document.agent_state = DocumentAgentState.rejected
                else:
                    self.document.agent_state = DocumentAgentState.processed
                    
                self.document.processed_at = datetime.utcnow()
                
                # Commit final changes
                self.db_session.add(self.document)
                self.db_session.commit()
                print(f"Changes committed. New document category: {self.document.document_category}")
                
                return {
                    "success": True,
                    "document_id": str(self.document_id),
                    "classification": classification,
                    "document_category": self.document.document_category,
                    "agent_metadata": self.document.agent_metadata,
                    "requires_client_selection": final_state.get("requires_client_selection", False),
                    "whatsapp_message_sent": final_state.get("whatsapp_message_sent", False)
                }
                
            except Exception as e:
                self.db_session.rollback()
                raise
            
        except Exception as e:
            print(f"Error in document processing: {str(e)}")
            
            # Ensure we're in a clean transaction state for error handling
            if self.db_session.in_transaction():
                self.db_session.rollback()
            
            try:
                # Start fresh transaction for error state
                self.db_session.begin()
                
                # Reload document
                self.document = self.db_session.execute(
                    select(Document).where(Document.id == self.document_id)
                ).scalar_one_or_none()
                
                if self.document:
                    # Update document state to failed
                    self.document.agent_state = DocumentAgentState.failed
                    self.document.agent_metadata = {
                        **(self.document.agent_metadata or {}),
                        "processing_error": str(e),
                        "failed_at": datetime.utcnow().isoformat()
                    }
                    self.db_session.add(self.document)
                    self.db_session.commit()
            except Exception as inner_e:
                print(f"Error updating document failure state: {str(inner_e)}")
                if self.db_session.in_transaction():
                    self.db_session.rollback()
            
            raise
