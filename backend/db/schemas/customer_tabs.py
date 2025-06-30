from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

from db.models.customer import MLRStatus, CustomerStatus
from db.models.documents import DocumentType, DocumentSource, DocumentAgentState
from db.schemas.income import IncomeResponse
from db.schemas.customer_client_association import CustomerClientAssociationWithClient
from db.schemas.individual_relationship import IndividualRelationshipResponse
from db.schemas.property_individual_relationship import PropertyIndividualRelationshipWithProperty

# User summary for relationships
class UserSummary(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    
    class Config:
        from_attributes = True

# Individual summary for tab responses (simplified to avoid circular imports)
class IndividualSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    incomes: List[IncomeResponse] = []
    property_relationships: List[PropertyIndividualRelationshipWithProperty] = []
    
    class Config:
        from_attributes = True

# Document schema for responses
class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    original_filename: Optional[str] = None
    document_url: str
    file_size: Optional[str] = None
    mime_type: Optional[str] = None
    document_type: DocumentType
    document_source: DocumentSource
    document_category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    agent_state: DocumentAgentState
    created_at: datetime
    updated_at: Optional[datetime] = None
    uploaded_by_user_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True

# Info Tab Response
class CustomerInfoTabResponse(BaseModel):
    id: UUID
    practice_id: UUID
    
    # Individual relationship
    individual_id: UUID
    individual: IndividualSummary
    
    # Basic info
    ni_number: Optional[str] = None
    personal_utr_number: Optional[str] = None
    status: CustomerStatus
    do_they_own_sa: bool
    
    # Practice info
    primary_accounting_contact_id: Optional[UUID] = None
    primary_accounting_contact: Optional[UserSummary] = None
    acting_from: Optional[date] = None
    
    # Additional info
    comments: Optional[str] = None
    notes: Optional[str] = None
    setup_date: Optional[datetime] = None
    last_edited: Optional[datetime] = None
    last_edited_by_id: Optional[UUID] = None
    last_edited_by: Optional[UserSummary] = None
    
    # System fields
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# MLR Tab Response
class CustomerMLRTabResponse(BaseModel):
    id: UUID
    
    mlr_status: MLRStatus
    mlr_date_complete: Optional[date] = None
    passport_number: Optional[str] = None
    driving_license: Optional[str] = None
    uk_home_telephone: Optional[str] = None
    
    last_edited: Optional[datetime] = None
    last_edited_by_id: Optional[UUID] = None
    last_edited_by: Optional[UserSummary] = None
    
    class Config:
        from_attributes = True

# Relationships Tab Response
class CustomerRelationshipsTabResponse(BaseModel):
    id: UUID
    
    # Client relationships
    client_associations: List[CustomerClientAssociationWithClient] = []
    
    # Individual relationships
    individual_relationships: List[IndividualRelationshipResponse] = []
    
    class Config:
        from_attributes = True

# Documents Tab Response
class CustomerDocumentsTabResponse(BaseModel):
    id: UUID
    
    # Document list
    documents: List[DocumentResponse] = []
    
    class Config:
        from_attributes = True 