from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Date, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for MLR Status
class MLRStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    complete = "complete"
    not_required = "not_required"

# Enum for Customer Status
class CustomerStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    archived = "archived"

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Relations - Each customer must be assigned to an individual
    individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=False, index=True)
    
    # Basic Info
    ni_number = Column(String, unique=True, index=True)  # National Insurance Number
    personal_utr_number = Column(String, unique=True, index=True)  # Personal UTR Number
    status = Column(SQLEnum(CustomerStatus), nullable=False, default=CustomerStatus.active)
    do_they_own_sa = Column(Boolean, default=False)  # Do they own SA?
    sa_client_relation_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True, index=True)  # SA client relation
    
    # Practice Info
    primary_accounting_contact_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acting_from = Column(Date)  # Acting From date
    
    # MLR (Money Laundering Regulations)
    mlr_status = Column(SQLEnum(MLRStatus), default=MLRStatus.pending)
    mlr_date_complete = Column(Date)
    passport_number = Column(String)
    driving_license = Column(String)
    uk_home_telephone = Column(String)
    
    # Other
    comments = Column(Text)
    notes = Column(Text)
    setup_date = Column(DateTime(timezone=True), server_default=func.now())
    last_edited = Column(DateTime(timezone=True), onupdate=func.now())
    last_edited_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    individual = relationship("Individual", back_populates="customers")
    practice = relationship("Practice", back_populates="customers")
    primary_accounting_contact = relationship("User", foreign_keys=[primary_accounting_contact_id])
    last_edited_by = relationship("User", foreign_keys=[last_edited_by_id])
    sa_client_relation = relationship("Client", foreign_keys=[sa_client_relation_id])
    incomes = relationship("Income", back_populates="customer", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="customer", cascade="all, delete-orphan")
    client_associations = relationship("CustomerClientAssociation", back_populates="customer")
    documents = relationship("Document", back_populates="customer")
    
    def __repr__(self):
        return f"<Customer(id={self.id}, individual_id={self.individual_id}, status='{self.status}')>" 