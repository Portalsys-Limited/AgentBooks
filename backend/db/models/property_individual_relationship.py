from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Numeric, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for Ownership Type
class OwnershipType(str, enum.Enum):
    sole_owner = "sole_owner"
    joint_owner = "joint_owner"
    beneficial_owner = "beneficial_owner"
    trustee = "trustee"
    tenant = "tenant"
    other = "other"

class PropertyIndividualRelationship(Base):
    __tablename__ = "property_individual_relationships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relationship details
    ownership_type = Column(SQLEnum(OwnershipType), nullable=False)
    ownership_percentage = Column(Numeric(5, 2))  # e.g. 50.00 for 50%
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_primary_owner = Column(Boolean, default=False)
    
    # Additional details
    description = Column(Text)
    notes = Column(Text)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    property = relationship("Property", back_populates="individual_relationships")
    individual = relationship("Individual", back_populates="property_relationships")
    
    def __repr__(self):
        return f"<PropertyIndividualRelationship(id={self.id}, property_id={self.property_id}, individual_id={self.individual_id}, type='{self.ownership_type}')>" 