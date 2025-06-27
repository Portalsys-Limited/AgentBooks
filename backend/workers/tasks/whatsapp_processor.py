from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
import os
from datetime import datetime

from config.database import get_sync_session
from db.models import Message, Customer, Practice, Document
from agents.max_client_whatsapp.agent import MaxClientWhatsAppAgent
from workers.celery_app import celery_app

@celery_app.task(bind=True, name='process_whatsapp_message')
def process_whatsapp_message_task(self, message_id: str, customer_id: str, practice_id: str):
    """
    Celery task to process incoming WhatsApp messages using LangGraph agents.
    
    Args:
        message_id: UUID of the message to process
        customer_id: UUID of the customer who sent the message
        practice_id: UUID of the practice receiving the message
    """
    try:
        # Run the sync processing function
        return _process_whatsapp_message_sync(
            message_id=message_id,
            customer_id=customer_id, 
            practice_id=practice_id
        )
    except Exception as e:
        print(f"Error in Celery task process_whatsapp_message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        # Retry the task with exponential backoff
        raise self.retry(exc=e, countdown=60, max_retries=3)

def _process_whatsapp_message_sync(message_id: str, customer_id: str, practice_id: str):
    """
    Sync function to process WhatsApp messages with LangGraph agents.
    """
    print(f"🤖 Starting WhatsApp message processing for message {message_id}")
    
    # Create sync database session
    db = get_sync_session()
    try:
        # Fetch message from database
        message = db.execute(
            select(Message).where(Message.id == uuid.UUID(message_id))
        ).scalar_one_or_none()
        
        if not message:
            print(f"❌ Message {message_id} not found in database")
            return {"success": False, "error": "Message not found"}
        
        # Fetch customer from database
        customer = db.execute(
            select(Customer).where(Customer.id == uuid.UUID(customer_id))
        ).scalar_one_or_none()
        
        if not customer:
            print(f"❌ Customer {customer_id} not found in database")
            return {"success": False, "error": "Customer not found"}
        
        # Fetch practice from database
        practice = db.execute(
            select(Practice).where(Practice.id == uuid.UUID(practice_id))
        ).scalar_one_or_none()
        
        if not practice:
            print(f"❌ Practice {practice_id} not found in database")
            return {"success": False, "error": "Practice not found"}
        
        # Check if there are any documents associated with this message
        documents = db.execute(
            select(Document).where(Document.message_id == uuid.UUID(message_id))
        ).scalars().all()
        
        print(f"📱 Processing message from {customer.name} ({customer.primary_phone})")
        print(f"📄 Found {len(documents)} documents attached to this message")
        print(f"💬 Message body: {message.body}")
        
        # Initialize the Max Client WhatsApp Agent
        agent = MaxClientWhatsAppAgent(
            practice=practice,
            customer=customer,
            db_session=db
        )
        
        # Process the message through the agent
        agent_response = agent.process_message(
            message=message,
            documents=documents
        )
        
        print(f"✅ Agent processing completed for message {message_id}")
        print(f"🤖 Agent response: {agent_response}")
        
        return {
            "success": True,
            "message_id": message_id,
            "agent_response": agent_response,
            "processed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error processing WhatsApp message {message_id}: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "message_id": message_id
        }
    finally:
        db.close()

def trigger_whatsapp_processing(message_id: str, customer_id: str, practice_id: str):
    """
    Helper function to trigger the Celery task for WhatsApp message processing.
    
    Args:
        message_id: UUID string of the message
        customer_id: UUID string of the customer
        practice_id: UUID string of the practice
    """
    try:
        # Trigger the Celery task asynchronously
        task = process_whatsapp_message_task.delay(
            message_id=message_id,
            customer_id=customer_id,
            practice_id=practice_id
        )
        
        print(f"🚀 Triggered WhatsApp processing task {task.id} for message {message_id}")
        return {"task_id": task.id, "status": "queued"}
        
    except Exception as e:
        print(f"❌ Failed to trigger WhatsApp processing task: {str(e)}")
        return {"error": str(e), "status": "failed"} 