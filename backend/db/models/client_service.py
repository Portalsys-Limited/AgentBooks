from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, UniqueConstraint, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .base import Base

class ClientService(Base):
    __tablename__ = "client_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False, index=True)
    
    # Service assignment details
    is_enabled = Column(Boolean, default=False, nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=True, comment="Custom price for this client-service combination")
    
    # System fields
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="client_services")
    service = relationship("Service", back_populates="client_services")
    
    # Ensure unique combinations (one client can't have duplicate service assignments)
    __table_args__ = (
        UniqueConstraint('client_id', 'service_id', name='uq_client_service'),
        {"schema": None}
    ) 