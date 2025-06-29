from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .base import Base

class Practice(Base):
    __tablename__ = "practices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    
    # Communication settings - each practice has their own numbers/emails
    whatsapp_number = Column(String)  # Format: whatsapp:+14155238886
    main_phone = Column(String)
    main_email = Column(String)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="practice")
    individuals = relationship("Individual", back_populates="practice")
    customers = relationship("Customer", back_populates="practice")
    clients = relationship("Client", back_populates="practice")
    messages = relationship("Message", back_populates="practice")
    services = relationship("Service", back_populates="practice", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="practice")
    invoices = relationship("Invoice", back_populates="practice")
    
    def __repr__(self):
        return f"<Practice(id={self.id}, name={self.name})>" 