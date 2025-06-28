from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base

class MessageType(str, enum.Enum):
    whatsapp = "whatsapp"
    email = "email"
    sms = "sms"

class MessageDirection(str, enum.Enum):
    incoming = "incoming"
    outgoing = "outgoing"

class MessageStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    delivered = "delivered"
    read = "read"
    failed = "failed"

class MessageSender(str, enum.Enum):
    human = "human"
    ai = "ai"
    client = "client"  # For messages received from clients/individuals
    system = "system"  # For system messages
    

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # The staff member who sent the message
    
    message_type = Column(Enum(MessageType), nullable=False)
    direction = Column(Enum(MessageDirection), nullable=False)
    status = Column(Enum(MessageStatus), nullable=False, default=MessageStatus.pending)
    sender = Column(Enum(MessageSender), nullable=False, default=MessageSender.human)
    
    body = Column(Text, nullable=False)
    from_address = Column(String, nullable=False)  # Phone number or email
    to_address = Column(String, nullable=False)    # Phone number or email
    
    twilio_sid = Column(String, nullable=True)     # For WhatsApp/SMS messages
    error_message = Column(String, nullable=True)
    message_metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    practice = relationship("Practice", back_populates="messages")
    individual = relationship("Individual", back_populates="messages")
    user = relationship("User", back_populates="messages")
    documents = relationship("Document", back_populates="message")

    def __repr__(self):
        return f"<Message(id={self.id}, type={self.message_type}, direction={self.direction}, status={self.status}, sender={self.sender})>" 