"""WhatsApp agent using LangGraph supervisor to coordinate document and chat agents."""

from langgraph_supervisor import create_supervisor
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Dict, Any

from db.models import Message, Individual, Practice, Document
from .chat_agent import chat_agent
from .document_agent import document_agent
from .tools import WhatsAppTools

SUPERVISOR_PROMPT = """# WhatsApp Service Supervisor - {practice_name}

You are an intelligent supervisor managing communications for {practice_name}, an accounting practice.

**Individual:** {individual_name} ({individual_phone})

{conversation_history}

You coordinate two specialized agents to provide comprehensive service:

---

## 💬 Chat Agent  
Handles general service including:
- Greetings and general conversation
- Questions about services and processes
- Appointment scheduling requests
- Status updates and follow-ups
- General inquiries about accounting services
- Support and relationship management

---

## 📄 Document Agent
Handles all document-related tasks including:
- Processing uploaded documents, invoices, receipts
- Document analysis and categorization  
- Financial document review and feedback
- Document storage and organization
- Any requests mentioning "documents", "invoices", "receipts", "upload", "files"

---

## 🎯 Routing Guidelines

**Route to Chat Agent when:**
- General greetings ("Hello", "Hi", "Good morning")
- Questions about services ("What do you offer?", "How much does it cost?")
- Appointment requests ("Can I schedule a meeting?")
- General conversation and service
- When in doubt about general inquiries

**Route to Document Agent when:**
- Documents are attached to the message
- Message mentions documents, invoices, receipts, uploads, files
- Individual asks about document processing or analysis
- Any document-related keywords are present

---

## 📋 Instructions
- Always delegate to the appropriate specialist agent
- Do not handle tasks yourself - use the specialized agents
- Route based on message content and context
- Consider the conversation history when routing
- Provide professional, friendly service
- Ensure individual receives appropriate expertise for their needs

---
"""

class MaxClientWhatsAppAgent:
    """
    LangGraph Supervisor-based WhatsApp Agent using langgraph_supervisor.
    Coordinates document and chat agents for comprehensive service.
    """
    
    def __init__(self, practice: Practice, individual: Individual, db_session: Session):
        self.practice = practice
        self.individual = individual
        self.db_session = db_session
    
    def get_conversation_history(self, limit: int = 10) -> str:
        """
        Get formatted conversation history for this individual.
        
        Args:
            limit: Number of recent messages to include
            
        Returns:
            Markdown formatted conversation history
        """
        try:
            # Get individual name
            individual_name = f"{self.individual.first_name} {self.individual.last_name}"
            
            # Create WhatsApp tools instance
            tools = WhatsAppTools(self.practice, self.individual, self.db_session)
            
            # Get recent messages
            messages = tools.get_recent_messages(limit)
            
            # Format conversation history
            history = [
                "## 📋 Conversation History\n",
                f"Recent messages with {individual_name}:\n"
            ]
            
            for msg in messages:
                direction = "➡️" if msg["direction"] == "outgoing" else "⬅️"
                timestamp = msg["created_at"].split("T")[0]  # Just get the date part
                history.append(f"{direction} **{timestamp}**: {msg['body']}\n")
            
            return "\n".join(history)
            
        except Exception as e:
            print(f"❌ Error retrieving conversation history: {str(e)}")
            return "## 📋 Conversation History\n\nError loading conversation history.\n"
    
    def process_message(self, message: Message, documents: List[Document] = None) -> Dict[str, Any]:
        """
        Process a WhatsApp message using the supervisor system.
        
        Args:
            message: The incoming WhatsApp message
            documents: List of documents attached to the message
            
        Returns:
            Dict containing the processing result
        """
        
        if documents is None:
            documents = []
        
        try:
            print(f"🚀 Starting supervisor workflow for message: {message.id}")
            # Get individual name
            individual_name = f"{self.individual.first_name} {self.individual.last_name}"
            print(f"📱 From: {individual_name}")
            print(f"💬 Message: {message.body}")
            print(f"📎 Documents: {len(documents)} attached")
            
            # Get conversation history
            conversation_history = self.get_conversation_history()
            
            # Create supervisor prompt with history
            supervisor_prompt = SUPERVISOR_PROMPT.format(
                practice_name=self.practice.name,
                individual_name=individual_name,
                individual_phone=self.individual.primary_mobile,
                conversation_history=conversation_history
            )
            
            # Create and compile the supervisor with updated prompt
            supervisor_graph = create_supervisor(
                agents=[
                    chat_agent(self.practice, self.individual, self.db_session),
                    document_agent(self.practice, self.individual, self.db_session)
                ],
                model=ChatOpenAI(model="gpt-4o-mini"),
                prompt=supervisor_prompt,
            )
            
            # Compile the graph to make it executable
            supervisor = supervisor_graph.compile()
            
            # Prepare input with document context
            message_content = message.body
            if documents:
                message_content += f"\n\nATTACHED DOCUMENTS: {len(documents)} files"
            
            # Run supervisor system
            result = supervisor.invoke({
                "messages": [{
                    "role": "human",
                    "content": message_content
                }]
            })
            
            print(f"✅ Supervisor workflow completed")
            
            return {
                "success": True,
                "message_id": str(message.id),
                "individual_id": str(self.individual.id),
                "practice_id": str(self.practice.id)
            }
            
        except Exception as e:
            print(f"❌ Error in supervisor workflow: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": str(e),
                "message_id": str(message.id),
                "individual_id": str(self.individual.id),
                "practice_id": str(self.practice.id)
            } 