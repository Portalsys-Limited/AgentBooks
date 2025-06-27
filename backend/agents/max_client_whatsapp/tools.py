import os
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from twilio.rest import Client as TwilioClient
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from db.models import Customer, Practice, Message, Client, Document
from db.models.message import MessageDirection, MessageStatus, MessageType

class SendMessageInput(BaseModel):
    """Input for sending WhatsApp messages."""
    message: str = Field(description="Message content to send")
    
class CustomerInfoInput(BaseModel):
    """Input for getting customer information."""
    customer_id: Optional[str] = Field(None, description="Optional customer ID to filter by")
    
class PracticeInfoInput(BaseModel):
    """Input for getting practice information."""
    practice_id: Optional[str] = Field(None, description="Optional practice ID to filter by")

class WhatsAppTools:
    """Synchronous tools for WhatsApp agents to interact with Twilio and database."""
    
    def __init__(self, practice: Practice, customer: Customer, db_session: Session):
        self.practice = practice
        self.customer = customer
        self.db_session = db_session
        
        # Initialize Twilio client
        twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        
        if twilio_account_sid and twilio_auth_token:
            self.twilio_client = TwilioClient(twilio_account_sid, twilio_auth_token)
        else:
            print("⚠️ Warning: Twilio credentials not found in environment variables")
            self.twilio_client = None
    
    def send_whatsapp_message(self, message_content: str) -> Dict[str, Any]:
        """
        Send a WhatsApp message to the customer via Twilio and record in database.
        
        Args:
            message_content: The text message to send
            
        Returns:
            Dict with success status and message details
        """
        try:
            if not self.twilio_client:
                print(f"⚠️ Twilio client not available - simulating message to {self.customer.name}")
                return {
                    "success": True,
                    "message_sid": "SIMULATED_MESSAGE_ID",
                    "content": message_content,
                    "recipient": self.customer.primary_phone,
                    "simulated": True
                }
            
            # Create WhatsApp message using Twilio
            twilio_message = self.twilio_client.messages.create(
                body=message_content,
                from_=os.getenv('TWILIO_WHATSAPP_FROM'),
                to=f"whatsapp:{self.customer.primary_phone}"
            )
            
            print(f"✅ WhatsApp message sent via Twilio to {self.customer.name}: {twilio_message.sid}")
            
            # Create message record in database with correct enum values
            try:
                msg = Message(
                    body=message_content,
                    message_type=MessageType.whatsapp,
                    direction=MessageDirection.outgoing,  # Using correct enum value
                    status=MessageStatus.sent,
                    customer_id=self.customer.id,
                    practice_id=self.practice.id,
                    twilio_sid=twilio_message.sid
                )
                
                self.db_session.add(msg)
                self.db_session.commit()
                print(f"✅ Message record created in database: {msg.id}")
                
                return {
                    "success": True,
                    "message_sid": twilio_message.sid,
                    "message_id": str(msg.id),
                    "content": message_content,
                    "recipient": self.customer.primary_phone
                }
                
            except Exception as db_error:
                print(f"⚠️ Database error (message still sent): {str(db_error)}")
                self.db_session.rollback()
                # Message was still sent via Twilio, so we'll return success but note the DB issue
                return {
                    "success": True,
                    "message_sid": twilio_message.sid,
                    "message_id": "db_error_but_sent",
                    "content": message_content,
                    "recipient": self.customer.primary_phone,
                    "warning": f"Message sent but DB error: {str(db_error)}"
                }
                
        except Exception as e:
            print(f"❌ Error sending WhatsApp message: {str(e)}")
            # Rollback session if there's an error
            if self.db_session:
                try:
                    self.db_session.rollback()
                except:
                    pass
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_customer_clients(self) -> List[Dict[str, Any]]:
        """
        Get all clients associated with the current customer.
        
        Returns:
            List of client information
        """
        try:
            from db.models.customer_client_association import CustomerClientAssociation
            
            # Get clients through customer association
            clients = self.db_session.execute(
                select(Client)
                .join(CustomerClientAssociation)
                .where(CustomerClientAssociation.customer_id == self.customer.id)
            ).scalars().all()
            
            client_list = []
            for client in clients:
                client_list.append({
                    "id": str(client.id),
                    "business_name": client.business_name,
                    "client_code": client.client_code,
                    "business_type": client.business_type.value if client.business_type else None,
                    "main_email": client.main_email,
                    "main_phone": client.main_phone
                })
            
            return client_list
            
        except Exception as e:
            print(f"❌ Error getting customer clients: {str(e)}")
            return []
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent messages from this customer.
        
        Args:
            limit: Number of recent messages to retrieve
            
        Returns:
            List of recent message information
        """
        try:
            # Get recent messages for this customer
            messages = self.db_session.execute(
                select(Message)
                .where(Message.customer_id == self.customer.id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            ).scalars().all()
            
            message_list = []
            for message in messages:
                message_list.append({
                    "id": str(message.id),
                    "body": message.body,
                    "direction": message.direction.value,
                    "status": message.status.value,
                    "created_at": message.created_at.isoformat(),
                    "message_type": message.message_type.value
                })
            
            return message_list
            
        except Exception as e:
            print(f"❌ Error getting recent messages: {str(e)}")
            return []
    
    def get_customer_info(self) -> Dict[str, Any]:
        """
        Get detailed information about the current customer.
        
        Returns:
            Customer information dictionary
        """
        try:
            customer_info = {
                "id": str(self.customer.id),
                "name": self.customer.name,
                "first_name": self.customer.first_name,
                "last_name": self.customer.last_name,
                "primary_email": self.customer.primary_email,
                "primary_phone": self.customer.primary_phone,
                "home_address": {
                    "line1": self.customer.home_address_line1,
                    "line2": self.customer.home_address_line2,
                    "city": self.customer.home_city,
                    "postcode": self.customer.home_postcode,
                    "country": self.customer.home_country
                },
                "employment_status": self.customer.employment_status,
                "employer_name": self.customer.employer_name,
                "notes": self.customer.notes
            }
            
            return customer_info
            
        except Exception as e:
            print(f"❌ Error getting customer info: {str(e)}")
            return {}
    
    def get_practice_info(self) -> Dict[str, Any]:
        """
        Get information about the practice.
        
        Returns:
            Practice information dictionary
        """
        try:
            practice_info = {
                "id": str(self.practice.id),
                "name": self.practice.name,
                "address": self.practice.address,
                "email": self.practice.email,
                "phone": self.practice.phone,
                "website": self.practice.website,
                "registration_number": self.practice.registration_number,
                "services": self.practice.services,
                "description": self.practice.description
            }
            
            return practice_info
            
        except Exception as e:
            print(f"❌ Error getting practice info: {str(e)}")
            return {}
    
    def get_customer_documents(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get documents associated with the current customer.
        
        Args:
            limit: Maximum number of documents to retrieve
            
        Returns:
            List of document information
        """
        try:
            # Get documents for this customer
            documents = self.db_session.execute(
                select(Document)
                .where(Document.customer_id == self.customer.id)
                .order_by(Document.created_at.desc())
                .limit(limit)
            ).scalars().all()
            
            document_list = []
            for doc in documents:
                document_list.append({
                    "id": str(doc.id),
                    "filename": doc.filename,
                    "original_filename": doc.original_filename,
                    "content_type": doc.content_type,
                    "size": doc.size,
                    "created_at": doc.created_at.isoformat(),
                    "document_type": doc.document_type.value if doc.document_type else None,
                    "extraction_status": doc.extraction_status.value if doc.extraction_status else None
                })
            
            return document_list
            
        except Exception as e:
            print(f"❌ Error getting customer documents: {str(e)}")
            return []

# Global variables to store context (set by create_whatsapp_tools)
_practice: Optional[Practice] = None
_customer: Optional[Customer] = None
_db_session: Optional[Session] = None

@tool
def send_whatsapp_message(message: str) -> Dict[str, Any]:
    """Send a WhatsApp message to the customer.
    
    Args:
        message: The message content to send to the customer
        
    Returns:
        Dict with success status and message_id
    """
    if not _practice or not _customer or not _db_session:
        return {"success": False, "error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _customer, _db_session)
    return tools.send_whatsapp_message(message)

@tool
def get_customer_info() -> Dict[str, Any]:
    """Get information about the current customer.
    
    Returns:
        Dict with customer details including name, contact info, and address
    """
    if not _practice or not _customer or not _db_session:
        return {"error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _customer, _db_session)
    return tools.get_customer_info()

@tool
def get_practice_info() -> Dict[str, Any]:
    """Get information about the practice.
    
    Returns:
        Dict with practice details including name, services, and contact info
    """
    if not _practice or not _customer or not _db_session:
        return {"error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _customer, _db_session)
    return tools.get_practice_info()

@tool
def get_recent_messages(limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent conversation messages for context.
    
    Args:
        limit: Number of recent messages to retrieve (default 10)
        
    Returns:
        List of recent messages with timestamps and content
    """
    if not _practice or not _customer or not _db_session:
        return []
    
    tools = WhatsAppTools(_practice, _customer, _db_session)
    return tools.get_recent_messages(limit)

def create_whatsapp_tools(practice: Practice, customer: Customer, db_session: Session) -> List:
    """Create WhatsApp tools with the given context."""
    global _practice, _customer, _db_session
    _practice = practice
    _customer = customer
    _db_session = db_session
    
    return [send_whatsapp_message, get_customer_info, get_practice_info, get_recent_messages] 