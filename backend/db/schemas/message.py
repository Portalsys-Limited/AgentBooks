from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from db.models.message import MessageType, MessageDirection, MessageStatus


# Message schemas
class MessageBase(BaseModel):
    message_type: MessageType
    direction: MessageDirection
    body: str
    subject: Optional[str] = None
    from_address: Optional[str] = None
    to_address: Optional[str] = None


class MessageCreate(MessageBase):
    customer_id: UUID
    practice_id: UUID


class MessageSend(BaseModel):
    customer_id: UUID
    message_type: MessageType
    body: str
    subject: Optional[str] = None  # For emails


class MessageUpdate(BaseModel):
    status: Optional[MessageStatus] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MessageListItem(BaseModel):
    id: UUID
    message_type: MessageType
    direction: MessageDirection
    status: MessageStatus
    body: str
    subject: Optional[str] = None
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Message(MessageBase):
    id: UUID
    status: MessageStatus
    customer_id: UUID
    practice_id: UUID
    twilio_sid: Optional[str] = None
    email_message_id: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Message] = None


class ConversationResponse(BaseModel):
    customer_id: UUID
    customer_name: str
    messages: List[MessageListItem]
    total_count: int 