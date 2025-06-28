"""Node definitions for document processing workflow."""

from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain.tools import BaseTool
from langchain_core.messages import HumanMessage

from .states import AgentState, DOCUMENT_CATEGORIES

def classify_document_node(state: AgentState, llm: ChatOpenAI, tools: List[BaseTool]) -> AgentState:
    """Node for classifying documents."""
    # Prepare context for classification
    context = f"""
    You are a document classification expert for an accounting and business services firm. Analyze the following document and classify it into one of these categories:

    - invoice: Any document requesting payment for goods or services
    - receipt: Proof of payment or purchase
    - id_card: Any government-issued ID card or similar identification document
    - passport: International travel documents and passports
    - bank_statement: Bank account statements and transaction records
    - contract: Legal agreements, contracts, and terms of service
    - engagement_letter: Professional service agreements and engagement letters
    - other: Documents that don't fit into the above categories

    Document text:
    {state['extracted_text']}

    Document metadata:
    {state['document_metadata']}

    Instructions:
    1. Analyze both the document text and metadata
    2. Look for key identifying features of each document type
    3. Consider the document's structure and content
    4. Choose the most appropriate category
    5. Start your response with the category name in lowercase, followed by your explanation
    
    Example response format:
    "invoice This appears to be an invoice because it contains line items, prices, and payment instructions..."
    """
    
    # Add classification request to messages
    state["messages"].append(HumanMessage(content=context))
    
    # Get classification from LLM
    response = llm.invoke(state["messages"])
    state["messages"].append(response)
    
    # Extract category from response (first word)
    category = response.content.split()[0].lower()
    if category not in DOCUMENT_CATEGORIES:
        category = "other"
    
    # Use tool to formalize classification
    classification_tool = tools[0]  # Get the classification tool
    classification = classification_tool.invoke({
        "document_category": category,
        "confidence": 0.9,  # TODO: Implement proper confidence scoring
        "explanation": response.content
    })
    
    # Store classification result
    state["classification_result"] = classification
    state["current_node"] = "classification_complete"
    
    return state 