"""Classification nodes for document processing workflow."""

from typing import Dict, Any, List
import json
from langchain_openai import ChatOpenAI
from langchain.tools import BaseTool
from langchain_core.messages import HumanMessage

from ..states import AgentState, DOCUMENT_CATEGORIES

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
    5. Provide a confidence score between 0.0 and 1.0
    6. Return your response in JSON format only

    Required JSON format:
    {{
        "document_category": "category_name",
        "confidence": 0.95,
        "explanation": "Detailed explanation of why this document belongs to this category, including specific features identified"
    }}

    Return only valid JSON, no additional text.
    """
    
    # Add classification request to messages
    state["messages"].append(HumanMessage(content=context))
    
    # Get classification from LLM
    response = llm.invoke(state["messages"])
    state["messages"].append(response)
    
    # Parse JSON response
    try:
        classification_data = json.loads(response.content.strip())
        
        # Validate and clean the category
        category = classification_data.get("document_category", "other").lower()
        if category not in DOCUMENT_CATEGORIES:
            category = "other"
        
        # Ensure confidence is a float between 0 and 1
        confidence = float(classification_data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
        
        explanation = classification_data.get("explanation", "No explanation provided")
        
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Raw response: {response.content}")
        
        # Fallback to old method if JSON parsing fails
        category = response.content.split()[0].lower() if response.content else "other"
        if category not in DOCUMENT_CATEGORIES:
            category = "other"
        confidence = 0.5
        explanation = response.content
    
    # Use tool to formalize classification
    classification_tool = tools[0]  # Get the classification tool
    classification = classification_tool.invoke({
        "document_category": category,
        "confidence": confidence,
        "explanation": explanation
    })
    
    # Store classification result
    state["classification_result"] = classification
    state["current_node"] = "classification_complete"
    
    return state 