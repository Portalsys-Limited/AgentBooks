from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for message type
class MessageType(str, enum.Enum):
    email = "email"
    whatsapp = "whatsapp"

# Enum for message direction
class MessageDirection(str, enum.Enum):
    incoming = "incoming"
    outgoing = "outgoing"

# Enum for message status
class MessageStatus(str, enum.Enum):
    sent = "sent"
    delivered = "delivered"
    read = "read"
    failed = "failed"
    pending = "pending"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Message metadata
    message_type = Column(SQLEnum(MessageType), nullable=False, index=True)
    direction = Column(SQLEnum(MessageDirection), nullable=False, index=True)
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.pending, index=True)
    
    # Message content
    subject = Column(String)  # For emails, null for WhatsApp
    body = Column(Text, nullable=False)
    
    # Contact information
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    
    # Communication details
    from_address = Column(String)  # Email address or phone number
    to_address = Column(String)    # Email address or phone number
    
    # External service identifiers
    twilio_sid = Column(String, unique=True)  # Twilio message SID for WhatsApp
    email_message_id = Column(String)         # Email message ID if using email service
    
    # Additional metadata
    message_metadata = Column(JSONB)  # Store additional service-specific data
    error_message = Column(Text)  # Store error details if message failed
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="messages")
    practice = relationship("Practice", back_populates="messages") 