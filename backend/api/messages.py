from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import uuid
from urllib.parse import unquote

from config.database import get_db
from db.models import User, UserRole, Message, MessageType
from db.schemas.user import User as UserSchema
from db.schemas.message import (
    MessageSend, MessageListItem, Message as MessageSchema, 
    MessageResponse, ConversationResponse
)
from api.users import get_current_user
from services.message_service import message_service
from services.twilio_service import twilio_service

router = APIRouter()

@router.post("/send", response_model=MessageResponse)
async def send_message(
    message_data: MessageSend,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message (WhatsApp or email) to a customer."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to send messages"
        )
    
    try:
        if message_data.message_type == MessageType.whatsapp:
            result = await message_service.send_whatsapp_message(
                db=db,
                message_data=message_data,
                practice_id=current_user.practice_id,
                user_id=current_user.id
            )
        else:
            # For email, you would implement email service here
            return MessageResponse(
                success=False,
                message="Email messaging not yet implemented",
                data=None
            )
        
        if result["success"]:
            return MessageResponse(
                success=True,
                message="Message sent successfully",
                data=result["message"]
            )
        else:
            return MessageResponse(
                success=False,
                message=result.get("error", "Failed to send message"),
                data=None
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}"
        )

@router.get("/customer/{customer_id}", response_model=ConversationResponse)
async def get_customer_messages(
    customer_id: str,
    message_type: Optional[MessageType] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all messages for a specific customer."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view messages"
        )
    
    # Parse UUID
    try:
        customer_uuid = uuid.UUID(customer_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID format"
        )
    
    try:
        # Get conversation data
        conversation_data = await message_service.get_conversation_with_customer(
            db=db,
            customer_id=customer_uuid,
            practice_id=current_user.practice_id,
            limit=limit,
            offset=offset
        )
        
        if not conversation_data["customer"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Filter by message type if specified
        messages = conversation_data["messages"]
        if message_type:
            messages = [msg for msg in messages if msg.message_type == message_type]
        
        return ConversationResponse(
            customer_id=customer_uuid,
            customer_name=conversation_data["customer"].name,
            messages=messages,
            total_count=len(messages)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving messages: {str(e)}"
        )

@router.get("/customer/{customer_id}/whatsapp", response_model=List[MessageListItem])
async def get_customer_whatsapp_messages(
    customer_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get WhatsApp messages for a specific customer."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view messages"
        )
    
    # Parse UUID
    try:
        customer_uuid = uuid.UUID(customer_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID format"
        )
    
    try:
        messages = await message_service.get_messages_for_customer(
            db=db,
            customer_id=customer_uuid,
            practice_id=current_user.practice_id,
            message_type=MessageType.whatsapp,
            limit=limit,
            offset=offset
        )
        
        return messages
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving WhatsApp messages: {str(e)}"
        )

@router.get("/{message_id}", response_model=MessageSchema)
async def get_message(
    message_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific message by ID."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view messages"
        )
    
    # Parse UUID
    try:
        message_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid message ID format"
        )
    
    try:
        message = await message_service.get_message_by_id(db=db, message_id=message_uuid)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        # Check if user has access to this message's practice
        if message.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this message"
            )
        
        return message
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving message: {str(e)}"
        )

@router.post("/webhook/twilio")
async def twilio_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Webhook endpoint for Twilio to send incoming messages and status updates."""
    
    try:
        # Get form data from Twilio webhook
        form_data = await request.form()
        
        # Extract webhook data
        message_sid = form_data.get("MessageSid")
        message_status = form_data.get("MessageStatus")
        from_phone = form_data.get("From")
        to_phone = form_data.get("To")
        body = form_data.get("Body", "")
        
        # Determine if this is an incoming message or status update
        webhook_type = "incoming" if body else "status_update"
        
        if webhook_type == "incoming":
            # Process incoming message
            # First, find the customer and their practice by phone number
            from sqlalchemy import select
            from db.models.customer import Customer
            
            # Clean phone number (remove whatsapp: prefix if present)
            clean_phone = from_phone.replace("whatsapp:", "")
            
            # Find customer by phone number to get practice_id
            customer_result = await db.execute(
                select(Customer).where(Customer.primary_phone == clean_phone)
            )
            customer = customer_result.scalar_one_or_none()
            
            if not customer:
                return {
                    "status": "error", 
                    "message": f"No customer found with phone number {clean_phone}"
                }
            
            result = await message_service.process_incoming_message(
                db=db,
                from_phone=from_phone,
                to_phone=to_phone,
                body=body,
                twilio_sid=message_sid,
                practice_id=customer.practice_id,  # Use the customer's actual practice_id
                metadata={
                    "webhook_data": dict(form_data),
                    "received_at": str(request.headers.get("Date", ""))
                }
            )
            
            if result["success"]:
                return {"status": "success", "message": "Incoming message processed"}
            else:
                return {"status": "error", "message": result["error"]}
        
        else:
            # Process status update
            # Find message by Twilio SID and update status
            from db.models.message import MessageStatus
            from db.schemas.message import MessageUpdate
            
            # Map Twilio status to our status enum
            status_mapping = {
                "sent": MessageStatus.sent,
                "delivered": MessageStatus.delivered,
                "read": MessageStatus.read,
                "failed": MessageStatus.failed,
                "undelivered": MessageStatus.failed
            }
            
            new_status = status_mapping.get(message_status.lower())
            if new_status:
                # Find message by Twilio SID
                from sqlalchemy import select
                result = await db.execute(
                    select(Message).where(Message.twilio_sid == message_sid)
                )
                message = result.scalar_one_or_none()
                
                if message:
                    status_update = MessageUpdate(
                        status=new_status,
                        metadata={
                            "status_update": {
                                "twilio_status": message_status,
                                "updated_at": str(request.headers.get("Date", "")),
                                "webhook_data": dict(form_data)
                            }
                        }
                    )
                    
                    await message_service.update_message_status(
                        db=db,
                        message_id=message.id,
                        status_update=status_update
                    )
                    
                    return {"status": "success", "message": "Status updated"}
                else:
                    return {"status": "error", "message": "Message not found"}
            
            return {"status": "success", "message": "Status update processed"}
        
    except Exception as e:
        return {"status": "error", "message": f"Webhook processing error: {str(e)}"}

@router.get("/practice/stats")
async def get_messaging_stats(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messaging statistics for the practice."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view statistics"
        )
    
    try:
        from sqlalchemy import select, func, and_
        from datetime import datetime, timedelta
        
        # Get message counts by type and status
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Total messages
        total_result = await db.execute(
            select(func.count(Message.id))
            .where(Message.practice_id == current_user.practice_id)
        )
        total_messages = total_result.scalar()
        
        # Messages this week
        week_result = await db.execute(
            select(func.count(Message.id))
            .where(and_(
                Message.practice_id == current_user.practice_id,
                Message.created_at >= week_ago
            ))
        )
        weekly_messages = week_result.scalar()
        
        # WhatsApp vs Email breakdown
        whatsapp_result = await db.execute(
            select(func.count(Message.id))
            .where(and_(
                Message.practice_id == current_user.practice_id,
                Message.message_type == MessageType.whatsapp
            ))
        )
        whatsapp_count = whatsapp_result.scalar()
        
        return {
            "total_messages": total_messages,
            "weekly_messages": weekly_messages,
            "whatsapp_messages": whatsapp_count,
            "email_messages": total_messages - whatsapp_count,
            "period": {
                "week_start": week_ago.isoformat(),
                "today": today.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving statistics: {str(e)}"
        )

@router.get("/twilio/sandbox/qr")
async def get_twilio_sandbox_qr(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the QR code for Twilio WhatsApp Sandbox (for testing only).
    
    This endpoint is useful for development and testing when using Twilio's sandbox environment.
    Users can scan the QR code to connect their WhatsApp to the sandbox for testing.
    
    Note: This is only for development/testing. Production WhatsApp Business accounts 
    don't use sandbox QR codes.
    """
    
    # Check permissions - only practice owners and accountants can access sandbox features
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access sandbox features"
        )
    
    try:
        result = await twilio_service.get_sandbox_qr_code()
        
        if result["success"]:
            return {
                "success": True,
                "data": {
                    "qr_image_url": result.get("qr_image_url"),
                    "sandbox_number": result.get("sandbox_number"),
                    "instructions": result.get("instructions"),
                    "note": "This QR code is for testing purposes only. Scan with WhatsApp to connect to the sandbox."
                }
            }
        else:
            # Return error information but don't raise HTTP exception for better UX
            return {
                "success": False,
                "error": result.get("error"),
                "suggestion": result.get("suggestion"),
                "status_code": result.get("status_code")
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching Twilio sandbox QR code: {str(e)}"
        )

@router.get("/twilio/sandbox/participants")
async def get_twilio_sandbox_participants(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of phone numbers authorized to use the WhatsApp sandbox.
    
    This shows which phone numbers have been authorized to send/receive 
    messages through the Twilio WhatsApp sandbox.
    """
    
    # Check permissions - only practice owners and accountants can access sandbox features
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access sandbox features"
        )
    
    try:
        result = await twilio_service.get_sandbox_participants()
        
        if result["success"]:
            return {
                "success": True,
                "data": {
                    "participants": result.get("participants", []),
                    "total_count": result.get("total_count", 0),
                    "note": "These phone numbers are authorized to use the WhatsApp sandbox for testing."
                }
            }
        else:
            return {
                "success": False,
                "error": result.get("error"),
                "status_code": result.get("status_code")
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching Twilio sandbox participants: {str(e)}"
        )

@router.post("/twilio/validate-phone")
async def validate_phone_number(
    phone_data: dict,  # Expected format: {"phone_number": "+1234567890"}
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate if a phone number is properly formatted for WhatsApp messaging.
    
    Useful for validating customer phone numbers before sending messages.
    """
    
    # Check permissions - staff members can validate phone numbers
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to validate phone numbers"
        )
    
    phone_number = phone_data.get("phone_number")
    if not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="phone_number is required"
        )
    
    try:
        is_valid = await twilio_service.validate_phone_number(phone_number)
        
        return {
            "success": True,
            "data": {
                "phone_number": phone_number,
                "is_valid": is_valid,
                "formatted_for_whatsapp": f"whatsapp:{phone_number}" if is_valid else None
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating phone number: {str(e)}"
        ) 