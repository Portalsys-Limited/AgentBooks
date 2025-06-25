from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

from db.models.customer_client_association import RelationshipType


# Base schema for customer-client associations
class CustomerClientAssociationBase(BaseModel):
    relationship_type: RelationshipType
    percentage_ownership: Optional[str] = None
    appointment_date: Optional[datetime] = None
    resignation_date: Optional[datetime] = None
    is_active: Optional[str] = "active"
    notes: Optional[str] = None


# Schema for creating a new association
class CustomerClientAssociationCreate(CustomerClientAssociationBase):
    customer_id: UUID
    client_id: UUID


# Schema for updating an association
class CustomerClientAssociationUpdate(BaseModel):
    relationship_type: Optional[RelationshipType] = None
    percentage_ownership: Optional[str] = None
    appointment_date: Optional[datetime] = None
    resignation_date: Optional[datetime] = None
    is_active: Optional[str] = None
    notes: Optional[str] = None


# Summary schemas for nested responses
class CustomerSummary(BaseModel):
    id: UUID
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    primary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    
    class Config:
        from_attributes = True


class ClientSummary(BaseModel):
    id: UUID
    business_name: str
    trading_name: Optional[str] = None
    business_type: Optional[str] = None
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    
    class Config:
        from_attributes = True


# Association with customer details (for client view)
class CustomerClientAssociationWithCustomer(CustomerClientAssociationBase):
    id: UUID
    customer_id: UUID
    client_id: UUID
    customer: CustomerSummary
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Association with client details (for customer view)
class CustomerClientAssociationWithClient(CustomerClientAssociationBase):
    id: UUID
    customer_id: UUID
    client_id: UUID
    client: ClientSummary
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Full association response with both customer and client details
class CustomerClientAssociationResponse(CustomerClientAssociationBase):
    id: UUID
    customer_id: UUID
    client_id: UUID
    customer: CustomerSummary
    client: ClientSummary
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# List item for association listings
class CustomerClientAssociationListItem(BaseModel):
    id: UUID
    customer_id: UUID
    client_id: UUID
    relationship_type: RelationshipType
    percentage_ownership: Optional[str] = None
    is_active: str
    created_at: datetime
    
    class Config:
        from_attributes = True 