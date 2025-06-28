from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional, Dict, Any
import uuid
from urllib.parse import unquote

from config.database import get_db
from db.models import User, UserRole, Message, MessageType, Document, DocumentType, DocumentSource, DocumentAgentState, Practice, Individual
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
    """Send a message (WhatsApp or email) to an individual."""
    
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

@router.get("/individual/{individual_id}", response_model=ConversationResponse)
async def get_individual_messages(
    individual_id: str,
    message_type: Optional[MessageType] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all messages for a specific individual with pagination."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view messages"
        )
    
    # Parse UUID
    try:
        individual_uuid = uuid.UUID(individual_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid individual ID format"
        )
    
    try:
        # Get individual info
        individual_result = await db.execute(
            select(Individual).where(Individual.id == individual_uuid)
        )
        individual = individual_result.scalar_one_or_none()
        
        if not individual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Individual not found"
            )

        # Build base query for messages
        base_query = select(Message).where(
            and_(
                Message.individual_id == individual_uuid,
                Message.practice_id == current_user.practice_id
            )
        )

        # Add message type filter if specified
        if message_type:
            base_query = base_query.where(Message.message_type == message_type)

        # Get total count efficiently using COUNT
        count_query = select(func.count()).select_from(base_query)
        total_count = await db.scalar(count_query) or 0

        # Get paginated messages
        messages_query = base_query.order_by(Message.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(messages_query)
        messages = result.scalars().all()
        
        return ConversationResponse(
            individual_id=individual_uuid,
            individual_name=individual.full_name,
            messages=messages,
            total_count=total_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving messages: {str(e)}"
        )

@router.get("/individual/{individual_id}/whatsapp", response_model=List[MessageListItem])
async def get_individual_whatsapp_messages(
    individual_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get WhatsApp messages for a specific individual."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view messages"
        )
    
    # Parse UUID
    try:
        individual_uuid = uuid.UUID(individual_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid individual ID format"
        )
    
    try:
        messages = await message_service.get_messages_for_individual(
            db=db,
            individual_id=individual_uuid,
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
        
        # Extract media items if any
        num_media = int(form_data.get("NumMedia", "0"))
        media_items = []
        for i in range(num_media):
            media_url = form_data.get(f"MediaUrl{i}")
            media_content_type = form_data.get(f"MediaContentType{i}")
            if media_url:
                media_items.append({
                    "url": media_url,
                    "content_type": media_content_type,
                    "index": i
                })
        
        # Process the webhook through message service
        result = await message_service.process_twilio_webhook(
            db=db,
            message_sid=message_sid,
            message_status=message_status,
            from_phone=from_phone,
            to_phone=to_phone,
            body=body,
            media_items=media_items,
            webhook_data=dict(form_data),
            received_at=str(request.headers.get("Date", ""))
        )
        
        return result
        
    except Exception as e:
        print(f"❌ Error processing Twilio webhook: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {"status": "error", "message": f"Webhook processing error: {str(e)}"} 