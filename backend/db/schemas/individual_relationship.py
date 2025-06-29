from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

from db.models.individual_relationship import IndividualRelationType

# Base schema for relationship
class IndividualRelationshipBase(BaseModel):
    relationship_type: IndividualRelationType
    description: Optional[str] = None

# Schema for creating a relationship
class IndividualRelationshipCreate(IndividualRelationshipBase):
    to_individual_id: UUID

# Schema for updating a relationship
class IndividualRelationshipUpdate(IndividualRelationshipBase):
    pass

# Schema for individual summary in relationship responses
class RelatedIndividualSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

# Full relationship response schema
class IndividualRelationshipResponse(IndividualRelationshipBase):
    id: UUID
    from_individual_id: UUID
    to_individual_id: UUID
    from_individual: RelatedIndividualSummary
    to_individual: RelatedIndividualSummary
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 