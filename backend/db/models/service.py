from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .base import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign key to practice
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False, index=True)
    
    # Service details
    service_code = Column(String, nullable=False, index=True)  # e.g., "BOOK", "PAYROLL", "VAT"
    name = Column(String, nullable=False)  # e.g., "Bookkeeping", "Payroll Services", "VAT Returns"
    description = Column(Text)  # Optional detailed description
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="services")
    client_services = relationship("ClientService", back_populates="service", cascade="all, delete-orphan")
    
    # Ensure unique service codes per practice
    __table_args__ = (
        {"schema": None}
    ) 