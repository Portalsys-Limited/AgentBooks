import os
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from twilio.rest import Client as TwilioClient
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from db.models import Individual, Practice, Message, Document
from db.models.message import MessageDirection, MessageStatus, MessageType, MessageSender

class SendMessageInput(BaseModel):
    """Input for sending WhatsApp messages."""
    message: str = Field(description="Message content to send")
    
class IndividualInfoInput(BaseModel):
    """Input for getting individual information."""
    individual_id: Optional[str] = Field(None, description="Optional individual ID to filter by")

class WhatsAppTools:
    """Synchronous tools for WhatsApp agents to interact with Twilio and database."""
    
    def __init__(self, practice: Practice, individual: Individual, db_session: Session):
        self.practice = practice
        self.individual = individual
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
        Send a WhatsApp message to the individual via Twilio and record in database.
        
        Args:
            message_content: The text message to send
            
        Returns:
            Dict with success status and message details
        """
        try:
            if not self.twilio_client:
                print(f"⚠️ Twilio client not available - simulating message to {self.individual.full_name}")
                return {
                    "success": True,
                    "message_sid": "SIMULATED_MESSAGE_ID",
                    "content": message_content,
                    "recipient": self.individual.primary_mobile,
                    "simulated": True
                }
            
            # Create WhatsApp message using Twilio
            twilio_message = self.twilio_client.messages.create(
                body=message_content,
                from_=os.getenv('TWILIO_WHATSAPP_FROM'),
                to=f"whatsapp:{self.individual.primary_mobile}"
            )
            
            print(f"✅ WhatsApp message sent via Twilio to {self.individual.full_name}: {twilio_message.sid}")
            
            # Create message record in database with correct enum values
            try:
                msg = Message(
                    body=message_content,
                    message_type=MessageType.whatsapp,
                    direction=MessageDirection.outgoing,
                    status=MessageStatus.sent,
                    sender=MessageSender.ai,
                    individual_id=self.individual.id,
                    practice_id=self.practice.id,
                    twilio_sid=twilio_message.sid,
                    from_address=os.getenv('TWILIO_WHATSAPP_FROM'),
                    to_address=f"whatsapp:{self.individual.primary_mobile}"
                )
                
                self.db_session.add(msg)
                self.db_session.commit()
                print(f"✅ Message record created in database: {msg.id}")
                
                return {
                    "success": True,
                    "message_sid": twilio_message.sid,
                    "message_id": str(msg.id),
                    "content": message_content,
                    "recipient": self.individual.primary_mobile
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
                    "recipient": self.individual.primary_mobile,
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
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent messages from this individual.
        
        Args:
            limit: Number of recent messages to retrieve
            
        Returns:
            List of recent message information
        """
        try:
            # Get recent messages for this individual
            messages = self.db_session.execute(
                select(Message)
                .where(Message.individual_id == self.individual.id)
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
    
    def get_individual_info(self) -> Dict[str, Any]:
        """
        Get detailed information about the current individual.
        
        Returns:
            Individual information dictionary
        """
        try:
            individual_info = {
                "id": str(self.individual.id),
                "first_name": self.individual.first_name,
                "last_name": self.individual.last_name,
                "full_name": self.individual.full_name,
                "email": self.individual.email,
                "primary_mobile": self.individual.primary_mobile,
                "address": {
                    "line1": self.individual.address_line_1,
                    "line2": self.individual.address_line_2,
                    "town": self.individual.town,
                    "post_code": self.individual.post_code,
                    "country": self.individual.country
                }
            }
            
            return individual_info
            
        except Exception as e:
            print(f"❌ Error getting individual info: {str(e)}")
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
                "whatsapp_number": self.practice.whatsapp_number,
                "main_phone": self.practice.main_phone,
                "main_email": self.practice.main_email,
                "created_at": self.practice.created_at.isoformat() if self.practice.created_at else None,
                "updated_at": self.practice.updated_at.isoformat() if self.practice.updated_at else None
            }
            
            return practice_info
            
        except Exception as e:
            print(f"❌ Error getting practice info: {str(e)}")
            return {}
    
    def get_individual_documents(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get documents associated with the current individual.
        
        Args:
            limit: Maximum number of documents to retrieve
            
        Returns:
            List of document information
        """
        try:
            # Get documents for this individual
            documents = self.db_session.execute(
                select(Document)
                .where(Document.individual_id == self.individual.id)
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
            print(f"❌ Error getting individual documents: {str(e)}")
            return []

# Global variables to store context (set by create_whatsapp_tools)
_practice: Optional[Practice] = None
_individual: Optional[Individual] = None
_db_session: Optional[Session] = None

@tool
def send_whatsapp_message(message: str) -> Dict[str, Any]:
    """Send a WhatsApp message to the individual.
    
    Args:
        message: The message content to send to the individual
        
    Returns:
        Dict with success status and message_id
    """
    if not _practice or not _individual or not _db_session:
        return {"success": False, "error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _individual, _db_session)
    return tools.send_whatsapp_message(message)

@tool
def get_individual_info() -> Dict[str, Any]:
    """Get information about the current individual.
    
    Returns:
        Dict with individual details including name, contact info, and address
    """
    if not _practice or not _individual or not _db_session:
        return {"error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _individual, _db_session)
    return tools.get_individual_info()

@tool
def get_practice_info() -> Dict[str, Any]:
    """Get information about the practice.
    
    Returns:
        Dict with practice details including name, contact info, and services
    """
    if not _practice or not _individual or not _db_session:
        return {"error": "Tools not properly initialized"}
    
    tools = WhatsAppTools(_practice, _individual, _db_session)
    return tools.get_practice_info()

@tool
def get_recent_messages(limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent conversation messages for context.
    
    Args:
        limit: Number of recent messages to retrieve (default 10)
        
    Returns:
        List of recent messages with timestamps and content
    """
    if not _practice or not _individual or not _db_session:
        return []
    
    tools = WhatsAppTools(_practice, _individual, _db_session)
    return tools.get_recent_messages(limit)

def create_whatsapp_tools(practice: Practice, individual: Individual, db_session: Session) -> List:
    """Create WhatsApp tools with the given context."""
    global _practice, _individual, _db_session
    _practice = practice
    _individual = individual
    _db_session = db_session
    
    return [send_whatsapp_message, get_individual_info, get_practice_info, get_recent_messages] 