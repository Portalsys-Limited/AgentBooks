"""Document processing workflow definition."""

from typing import Dict, Any
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI
from langchain.tools import BaseTool
from sqlalchemy.orm import Session

from .states import AgentState
from .nodes import (
    classify_document_node,
    check_client_assignment_node,
    send_rejection_message_node,
    send_selection_poll_node,
    assign_single_client_node,
    process_invoice_node,
    process_receipt_node
)

def end_workflow(state: AgentState) -> None:
    """End node for the workflow."""
    state["current_node"] = "end"
    return None

def create_document_processing_workflow(db_session: Session, llm, llm_invoice: ChatOpenAI, tools: list[BaseTool]) -> StateGraph:
    """Create the document processing workflow graph."""
    
    # Create workflow graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node(
        "classify_document", 
        lambda state: classify_document_node(state, llm, tools)
    )
    
    workflow.add_node(
        "check_client_assignment",
        lambda state: check_client_assignment_node(state, db_session)
    )
    
    workflow.add_node(
        "send_rejection_message",
        lambda state: send_rejection_message_node(state, db_session)
    )
    
    workflow.add_node(
        "send_selection_poll",
        lambda state: send_selection_poll_node(state, db_session)
    )
    
    workflow.add_node(
        "assign_single_client",
        lambda state: assign_single_client_node(state, db_session)
    )
    
    workflow.add_node(
        "process_invoice",
        lambda state: process_invoice_node(state, db_session, llm_invoice)
    )
    
    workflow.add_node(
        "process_receipt",
        lambda state: process_receipt_node(state, db_session, llm_invoice)
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
            "process_invoice": "process_invoice",
            "process_receipt": "process_receipt",
            "end": "end",
        },
    )
    
    def route_after_assign_single_client(state: AgentState) -> str:
        """Determine next step after assigning single client."""
        return state["current_node"]
    
    workflow.add_conditional_edges(
        "assign_single_client",
        route_after_assign_single_client,
        {
            "process_invoice": "process_invoice",
            "process_receipt": "process_receipt",
            "end": "end",
        },
    )
    
    workflow.add_edge("send_rejection_message", "end")
    workflow.add_edge("send_selection_poll", "end")
    workflow.add_edge("process_invoice", "end")
    workflow.add_edge("process_receipt", "end")
    
    # Set entry point
    workflow.set_entry_point("classify_document")
    
    return workflow.compile() 