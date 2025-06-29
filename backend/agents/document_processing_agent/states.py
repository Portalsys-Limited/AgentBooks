"""State definitions for document processing workflow."""

from typing import Dict, Any, List, TypedDict, Union, Optional
from langchain_core.messages import HumanMessage, AIMessage

class ClientInfo(TypedDict):
    """Information about a client."""
    client_id: str
    client_name: str
    customer_id: str
    customer_name: str

class AgentState(TypedDict):
    """State type for document processing workflow."""
    messages: List[Union[HumanMessage, AIMessage]]
    current_node: str
    document_id: str
    extracted_text: str
    document_metadata: Dict[str, Any]
    classification_result: Dict[str, Any]
    individual_id: Optional[str]
    available_clients: List[ClientInfo]
    requires_client_selection: bool
    whatsapp_message_sent: bool
    invoice_id: Optional[str]

# Document categories
DOCUMENT_CATEGORIES = [
    "invoice",
    "receipt",
    "id_card",
    "passport",
    "bank_statement",
    "contract",
    "engagement_letter",
    "other"
]

# Categories that require client assignment
CLIENT_REQUIRED_CATEGORIES = [
    "invoice",
    "receipt",
    "bank_statement",
    "contract",
    "engagement_letter"
] 