from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for relationship types between customers and clients
class RelationshipType(str, enum.Enum):
    director = "director"
    shareholder = "shareholder"
    partner = "partner"
    son = "son"
    daughter = "daughter"
    spouse = "spouse"
    parent = "parent"
    sibling = "sibling"
    investor = "investor"
    employee = "employee"
    consultant = "consultant"
    secretary = "secretary"
    accountant = "accountant"
    solicitor = "solicitor"
    beneficial_owner = "beneficial_owner"
    trustee = "trustee"
    guarantor = "guarantor"
    other = "other"

class CustomerClientAssociation(Base):
    __tablename__ = "customer_client_associations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    
    # Relationship details
    relationship_type = Column(SQLEnum(RelationshipType), nullable=False, index=True)
    percentage_ownership = Column(String)  # For shareholders/partners
    appointment_date = Column(DateTime(timezone=True))
    resignation_date = Column(DateTime(timezone=True))
    is_active = Column(String, default="active")  # active, resigned, removed
    
    # Additional details
    notes = Column(Text)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="client_associations")
    client = relationship("Client", back_populates="customer_associations")
    
    # Ensure unique combinations (one customer can't have duplicate relationship types with same client)
    __table_args__ = (
        {"schema": None}  # You can add unique constraints here if needed
    ) 