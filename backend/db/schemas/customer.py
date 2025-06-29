from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal

from db.models.customer import MLRStatus, CustomerStatus
from db.schemas.individuals import IndividualCreateRequest

# Import related schemas for nested responses
from db.schemas.income import IncomeResponse
from db.schemas.customer_client_association import CustomerClientAssociationWithClient

# Property relationship summary for customer responses (to avoid circular imports)
class PropertyRelationshipSummary(BaseModel):
    id: UUID
    ownership_type: str
    ownership_percentage: Decimal
    is_primary_owner: bool
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    
    # Property summary
    property_id: UUID
    property_name: str
    property_type: str
    address_line_1: str
    town: str
    post_code: str
    current_value: Optional[Decimal] = None
    is_rental_property: bool = False
    monthly_rental_income: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

# User summary for relationships
class UserSummary(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    
    class Config:
        from_attributes = True

# Individual summary for customer responses
class IndividualSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    incomes: List[IncomeResponse] = []
    property_relationships: List[PropertyRelationshipSummary] = []
    
    class Config:
        from_attributes = True

# Client summary for SA client relation
class ClientSummary(BaseModel):
    id: UUID
    business_name: str
    trading_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Practice info for customer
class PracticeInfo(BaseModel):
    primary_accounting_contact_id: Optional[UUID] = None
    acting_from: Optional[date] = None

# MLR info for customer
class MLRInfo(BaseModel):
    status: Optional[MLRStatus] = MLRStatus.pending
    date_complete: Optional[date] = None
    passport_number: Optional[str] = None
    driving_license: Optional[str] = None
    uk_home_telephone: Optional[str] = None

# Customer creation request - supports both new individual or existing
class CustomerCreateRequest(BaseModel):
    # Individual - either create new or use existing
    individual_id: Optional[UUID] = None  # Use existing individual
    individual_data: Optional[IndividualCreateRequest] = None  # Create new individual
    
    # Basic customer info
    ni_number: Optional[str] = None
    personal_utr_number: Optional[str] = None
    status: Optional[CustomerStatus] = CustomerStatus.active
    do_they_own_sa: Optional[bool] = False
    sa_client_relation_id: Optional[UUID] = None
    
    # Practice info
    practice_info: Optional[PracticeInfo] = None
    
    # MLR info
    mlr_info: Optional[MLRInfo] = None
    
    # Additional info
    comments: Optional[str] = None
    notes: Optional[str] = None

# Customer update request
class CustomerUpdateRequest(BaseModel):
    # Basic customer info
    ni_number: Optional[str] = None
    personal_utr_number: Optional[str] = None
    status: Optional[CustomerStatus] = None
    do_they_own_sa: Optional[bool] = None
    sa_client_relation_id: Optional[UUID] = None
    
    # Practice info
    practice_info: Optional[PracticeInfo] = None
    
    # MLR info
    mlr_info: Optional[MLRInfo] = None
    
    # Additional info
    comments: Optional[str] = None
    notes: Optional[str] = None

# Customer list item (summary view)
class CustomerListItem(BaseModel):
    id: UUID
    individual: IndividualSummary
    status: CustomerStatus
    ni_number: Optional[str] = None
    personal_utr_number: Optional[str] = None
    mlr_status: MLRStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Full customer response with all related data
class CustomerResponse(BaseModel):
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
    sa_client_relation_id: Optional[UUID] = None
    sa_client_relation: Optional[ClientSummary] = None
    
    # Practice info
    primary_accounting_contact_id: Optional[UUID] = None
    primary_accounting_contact: Optional[UserSummary] = None
    acting_from: Optional[date] = None
    
    # MLR info
    mlr_status: MLRStatus
    mlr_date_complete: Optional[date] = None
    passport_number: Optional[str] = None
    driving_license: Optional[str] = None
    uk_home_telephone: Optional[str] = None
    
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
    
    # Related data - all customer relations
    client_associations: List[CustomerClientAssociationWithClient] = []
    
    class Config:
        from_attributes = True

# Base schemas for backward compatibility
class CustomerBase(BaseModel):
    individual_id: UUID
    status: CustomerStatus = CustomerStatus.active

class CustomerCreate(CustomerBase):
    practice_id: UUID

class Customer(CustomerBase):
    id: UUID
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 