from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import joinedload
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from db.models.message import Message, MessageType, MessageDirection, MessageStatus
from db.models.customer import Customer
from db.models.practice import Practice
from db.schemas.message import MessageCreate, MessageUpdate, MessageSend
from services.twilio_service import twilio_service


class MessageService:
    
    @staticmethod
    async def create_message(db: AsyncSession, message_data: MessageCreate) -> Message:
        """Create a new message in the database"""
        db_message = Message(**message_data.model_dump())
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        return db_message
    
    @staticmethod
    async def get_message_by_id(db: AsyncSession, message_id: UUID) -> Optional[Message]:
        """Get a message by its ID"""
        result = await db.execute(
            select(Message).where(Message.id == message_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_messages_for_customer(
        db: AsyncSession, 
        customer_id: UUID, 
        practice_id: UUID,
        message_type: Optional[MessageType] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        """Get messages for a specific customer"""
        query = select(Message).where(
            and_(
                Message.customer_id == customer_id,
                Message.practice_id == practice_id
            )
        ).order_by(desc(Message.created_at))
        
        if message_type:
            query = query.where(Message.message_type == message_type)
        
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_conversation_with_customer(
        db: AsyncSession,
        customer_id: UUID,
        practice_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get conversation history with a customer including customer details"""
        # Get customer info
        customer_result = await db.execute(
            select(Customer).where(
                and_(
                    Customer.id == customer_id,
                    Customer.practice_id == practice_id
                )
            )
        )
        customer = customer_result.scalar_one_or_none()
        
        if not customer:
            return {"customer": None, "messages": [], "total_count": 0}
        
        # Get messages
        messages = await MessageService.get_messages_for_customer(
            db, customer_id, practice_id, limit=limit, offset=offset
        )
        
        # Get total count
        count_result = await db.execute(
            select(Message).where(
                and_(
                    Message.customer_id == customer_id,
                    Message.practice_id == practice_id
                )
            )
        )
        total_count = len(count_result.scalars().all())
        
        return {
            "customer": customer,
            "messages": messages,
            "total_count": total_count
        }
    
    @staticmethod
    async def send_whatsapp_message(
        db: AsyncSession,
        message_data: MessageSend,
        practice_id: UUID,
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Send a WhatsApp message and save to database"""
        try:
            # Get customer details
            customer_result = await db.execute(
                select(Customer).where(
                    and_(
                        Customer.id == message_data.customer_id,
                        Customer.practice_id == practice_id
                    )
                )
            )
            customer = customer_result.scalar_one_or_none()
            
            if not customer:
                return {"success": False, "error": "Customer not found"}
            
            if not customer.primary_phone:
                return {"success": False, "error": "Customer has no phone number"}
            
            # Validate phone number
            if not await twilio_service.validate_phone_number(customer.primary_phone):
                return {"success": False, "error": "Invalid phone number format"}
            
            # Get practice's whatsapp_number
            practice_result = await db.execute(
                select(Practice).where(Practice.id == practice_id)
            )
            practice = practice_result.scalar_one_or_none()
            
            if not practice or not practice.whatsapp_number:
                return {"success": False, "error": "Practice has no whatsapp_number"}
            
            # Send message via Twilio
            twilio_response = await twilio_service.send_whatsapp_message(
                customer.primary_phone,
                message_data.body,
                practice.whatsapp_number
            )
            
            # Create message record in database
            message_create = MessageCreate(
                message_type=MessageType.whatsapp,
                direction=MessageDirection.outgoing,
                body=message_data.body,
                customer_id=message_data.customer_id,
                practice_id=practice_id,
                from_address=practice.whatsapp_number,
                to_address=f"whatsapp:{customer.primary_phone}"
            )
            
            db_message = await MessageService.create_message(db, message_create)
            
            # Update message with Twilio response
            if twilio_response["success"]:
                db_message.twilio_sid = twilio_response["sid"]
                db_message.status = MessageStatus.sent
                db_message.message_metadata = {
                    "twilio_status": twilio_response["status"],
                    "sent_at": datetime.utcnow().isoformat()
                }
            else:
                db_message.status = MessageStatus.failed
                db_message.error_message = twilio_response.get("error", "Unknown error")
                db_message.message_metadata = {
                    "error_code": twilio_response.get("error_code"),
                    "error_message": twilio_response.get("error_message")
                }
            
            await db.commit()
            await db.refresh(db_message)
            
            return {
                "success": twilio_response["success"],
                "message": db_message,
                "twilio_response": twilio_response
            }
            
        except Exception as e:
            await db.rollback()
            return {"success": False, "error": f"Unexpected error: {str(e)}"}
    
    @staticmethod
    async def update_message_status(
        db: AsyncSession,
        message_id: UUID,
        status_update: MessageUpdate
    ) -> Optional[Message]:
        """Update message status (typically called by webhooks)"""
        message = await MessageService.get_message_by_id(db, message_id)
        if not message:
            return None
        
        if status_update.status:
            message.status = status_update.status
        
        if status_update.error_message:
            message.error_message = status_update.error_message
        
        if status_update.metadata:
            if message.message_metadata:
                message.message_metadata.update(status_update.metadata)
            else:
                message.message_metadata = status_update.metadata
        
        message.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(message)
        return message
    
    @staticmethod
    async def process_incoming_message(
        db: AsyncSession,
        from_phone: str,
        to_phone: str,
        body: str,
        twilio_sid: str,
        practice_id: UUID,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process an incoming WhatsApp message"""
        try:
            # Clean phone number (remove whatsapp: prefix if present)
            clean_phone = from_phone.replace("whatsapp:", "")
            
            # Find customer by phone number
            customer_result = await db.execute(
                select(Customer).where(
                    and_(
                        Customer.primary_phone == clean_phone,
                        Customer.practice_id == practice_id
                    )
                )
            )
            customer = customer_result.scalar_one_or_none()
            
            if not customer:
                # Optionally create a new customer or return error
                return {
                    "success": False, 
                    "error": f"No customer found with phone number {clean_phone}"
                }
            
            # Create incoming message record
            message_create = MessageCreate(
                message_type=MessageType.whatsapp,
                direction=MessageDirection.incoming,
                body=body,
                customer_id=customer.id,
                practice_id=practice_id,
                from_address=from_phone,
                to_address=to_phone
            )
            
            db_message = await MessageService.create_message(db, message_create)
            
            # Update with Twilio data
            db_message.twilio_sid = twilio_sid
            db_message.status = MessageStatus.delivered
            db_message.message_metadata = metadata or {}
            
            await db.commit()
            await db.refresh(db_message)
            
            return {
                "success": True,
                "message": db_message,
                "customer": customer
            }
            
        except Exception as e:
            await db.rollback()
            return {"success": False, "error": f"Error processing incoming message: {str(e)}"}

# Service instance
message_service = MessageService() 