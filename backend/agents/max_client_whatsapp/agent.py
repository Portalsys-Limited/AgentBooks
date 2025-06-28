"""WhatsApp agent using LangGraph supervisor to coordinate document and chat agents."""

from langgraph_supervisor import create_supervisor
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Dict, Any

from db.models import Message, Customer, Practice, Document
from .chat_agent import chat_agent
from .document_agent import document_agent

SUPERVISOR_PROMPT = """# WhatsApp Customer Service Supervisor - {practice_name}

You are an intelligent supervisor managing customer communications for {practice_name}, an accounting practice.

**Customer:** {customer_name} ({customer_phone})

{conversation_history}

You coordinate two specialized agents to provide comprehensive customer service:

---

## 💬 Chat Agent  
Handles general customer service including:
- Greetings and general conversation
- Questions about services and processes
- Appointment scheduling requests
- Status updates and follow-ups
- General inquiries about accounting services
- Customer support and relationship management

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
- General conversation and customer service
- When in doubt about general inquiries

**Route to Document Agent when:**
- Documents are attached to the message
- Message mentions documents, invoices, receipts, uploads, files
- Customer asks about document processing or analysis
- Any document-related keywords are present

---

## 📋 Instructions
- Always delegate to the appropriate specialist agent
- Do not handle tasks yourself - use the specialized agents
- Route based on message content and context
- Consider the conversation history when routing
- Provide professional, friendly service
- Ensure customer receives appropriate expertise for their needs

---
"""

class MaxClientWhatsAppAgent:
    """
    LangGraph Supervisor-based WhatsApp Agent using langgraph_supervisor.
    Coordinates document and chat agents for comprehensive customer service.
    """
    
    def __init__(self, practice: Practice, customer: Customer, db_session: Session):
        self.practice = practice
        self.customer = customer
        self.db_session = db_session
    
    def get_conversation_history(self, limit: int = 10) -> str:
        """
        Get the last N messages from the database to provide conversation context.
        
        Args:
            limit: Number of recent messages to retrieve (default 10)
            
        Returns:
            Formatted conversation history string
        """
        try:
            # Get recent messages for this customer
            messages = self.db_session.execute(
                select(Message)
                .where(Message.customer_id == self.customer.id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            ).scalars().all()
            
            if not messages:
                return "## 📋 Conversation History\n\nNo previous messages found.\n"
            
            # Format conversation history (reverse to show chronological order)
            history_lines = ["## 📋 Recent Conversation History\n"]
            
            for msg in reversed(messages):
                # Format timestamp
                timestamp = msg.created_at.strftime("%Y-%m-%d %H:%M")
                
                # Direction indicator
                direction = "📤" if msg.direction.value == "outgoing" else "📥"
                sender = self.practice.name if msg.direction.value == "outgoing" else self.customer.name
                
                # Add message to history
                history_lines.append(f"**{timestamp}** {direction} **{sender}:** {msg.body}")
            
            history_lines.append("")  # Add empty line after history
            
            return "\n".join(history_lines)
            
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
            print(f"📱 From: {self.customer.name}")
            print(f"💬 Message: {message.body}")
            print(f"📎 Documents: {len(documents)} attached")
            
            # Get conversation history
            conversation_history = self.get_conversation_history()
            
            # Create supervisor prompt with history
            supervisor_prompt = SUPERVISOR_PROMPT.format(
                practice_name=self.practice.name,
                customer_name=self.customer.name,
                customer_phone=self.customer.primary_phone,
                conversation_history=conversation_history
            )
            
            # Create and compile the supervisor with updated prompt
            supervisor_graph = create_supervisor(
                agents=[
                    chat_agent(self.practice, self.customer, self.db_session),
                    document_agent(self.practice, self.customer, self.db_session)
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
                "customer_id": str(self.customer.id),
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
                "customer_id": str(self.customer.id),
                "practice_id": str(self.practice.id)
            } 