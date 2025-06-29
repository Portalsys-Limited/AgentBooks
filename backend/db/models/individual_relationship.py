from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

class IndividualRelationType(str, enum.Enum):
    spouse = "spouse"
    partner = "partner"
    parent = "parent"
    child = "child"
    sibling = "sibling"
    grandparent = "grandparent"
    grandchild = "grandchild"
    aunt_uncle = "aunt_uncle"
    niece_nephew = "niece_nephew"
    cousin = "cousin"
    friend = "friend"
    guardian = "guardian"
    dependent = "dependent"
    other = "other"

class IndividualRelationship(Base):
    __tablename__ = "individual_relationships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys for the relationship
    from_individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=False, index=True)
    to_individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=False, index=True)
    
    # Relationship details
    relationship_type = Column(SQLEnum(IndividualRelationType), nullable=False)
    description = Column(Text)  # Additional details about the relationship
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    from_individual = relationship("Individual", foreign_keys=[from_individual_id], back_populates="relationships_from")
    to_individual = relationship("Individual", foreign_keys=[to_individual_id], back_populates="relationships_to")
    practice = relationship("Practice")
    
    def __repr__(self):
        return f"<IndividualRelationship(from={self.from_individual_id}, to={self.to_individual_id}, type='{self.relationship_type}')>" 