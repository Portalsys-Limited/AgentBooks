from pydantic import BaseModel, UUID4
from typing import Optional, Dict, Any, List
from datetime import datetime
from db.models.message import MessageType, MessageDirection, MessageStatus, MessageSender


# Message schemas
class MessageBase(BaseModel):
    message_type: MessageType
    body: str


class MessageCreate(MessageBase):
    practice_id: UUID4
    individual_id: UUID4
    user_id: Optional[UUID4] = None
    direction: MessageDirection
    status: MessageStatus = MessageStatus.pending
    sender: MessageSender = MessageSender.human
    from_address: str
    to_address: str
    twilio_sid: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None


class MessageSend(BaseModel):
    individual_id: UUID4
    message_type: MessageType
    body: str
    sender: MessageSender = MessageSender.human


class MessageUpdate(BaseModel):
    status: Optional[MessageStatus] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class Message(MessageBase):
    id: UUID4
    practice_id: UUID4
    individual_id: UUID4
    user_id: Optional[UUID4] = None
    direction: MessageDirection
    status: MessageStatus
    sender: MessageSender
    from_address: str
    to_address: str
    twilio_sid: Optional[str] = None
    error_message: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MessageListItem(BaseModel):
    id: UUID4
    message_type: MessageType
    direction: MessageDirection
    status: MessageStatus
    sender: MessageSender
    body: str
    created_at: datetime
    individual_name: Optional[str] = None
    individual_id: UUID4
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Message] = None


class ConversationResponse(BaseModel):
    individual_id: UUID4
    individual_name: str
    messages: List[MessageListItem]
    total_count: int 