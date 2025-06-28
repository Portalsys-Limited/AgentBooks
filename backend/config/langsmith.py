"""
LangSmith Configuration for Agent Monitoring

This module sets up LangSmith for tracking agent performance, debugging,
and monitoring conversation flows.
"""

import os
from langsmith import Client

def setup_langsmith():
    """
    Set up LangSmith tracing for the application.
    
    Environment variables needed:
    - LANGCHAIN_TRACING_V2: Set to "true" to enable tracing
    - LANGCHAIN_ENDPOINT: LangSmith API endpoint (optional)
    - LANGCHAIN_API_KEY: Your LangSmith API key
    - LANGCHAIN_PROJECT: Project name for organizing traces
    """
    
    # Enable LangSmith tracing
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    
    # Set default endpoint if not provided
    if not os.getenv("LANGCHAIN_ENDPOINT"):
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
    
    # Set project name if not provided
    if not os.getenv("LANGCHAIN_PROJECT"):
        os.environ["LANGCHAIN_PROJECT"] = "AgentBooks-WhatsApp-Agents"
    
    # Verify configuration
    api_key = os.getenv("LANGCHAIN_API_KEY")
    if not api_key:
        print("⚠️  LANGCHAIN_API_KEY not found. LangSmith tracing will be disabled.")
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        return False
    
    try:
        # Test connection
        client = Client()
        project_name = os.getenv("LANGCHAIN_PROJECT")
        print(f"✅ LangSmith configured successfully for project: {project_name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup LangSmith: {str(e)}")
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        return False

def get_langsmith_tags(agent_type: str, customer_name: str = None) -> list:
    """
    Generate standardized tags for LangSmith tracing.
    
    Args:
        agent_type: Type of agent (routing, document, chat)
        customer_name: Optional customer name for filtering
        
    Returns:
        List of tags for LangSmith tracing
    """
    tags = [
        "agentbooks",
        "whatsapp",
        f"agent-{agent_type}",
        "production"  # Change to "development" in dev environment
    ]
    
    if customer_name:
        # Sanitize customer name for tagging
        safe_name = customer_name.replace(" ", "-").lower()
        tags.append(f"customer-{safe_name}")
    
    return tags

def create_langsmith_metadata(
    customer_id: str,
    practice_id: str,
    message_type: str = "whatsapp",
    has_documents: bool = False
) -> dict:
    """
    Create metadata dictionary for LangSmith tracing.
    
    Args:
        customer_id: UUID of the customer
        practice_id: UUID of the practice
        message_type: Type of message (whatsapp, email, etc.)
        has_documents: Whether the message has document attachments
        
    Returns:
        Dictionary of metadata for LangSmith
    """
    return {
        "customer_id": customer_id,
        "practice_id": practice_id,
        "message_type": message_type,
        "has_documents": has_documents,
        "environment": os.getenv("ENVIRONMENT", "production"),
        "version": "1.0.0"
    }

# Initialize LangSmith on import
if __name__ != "__main__":
    setup_langsmith() 