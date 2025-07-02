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
    is_primary_contact: Optional[bool] = False
    notes: Optional[str] = None


# Schema for creating a new association
class CustomerClientAssociationCreate(CustomerClientAssociationBase):
    client_id: UUID

# Schema for creating via customer endpoint (without customer_id in request body)
class CustomerClientAssociationCreateRequest(BaseModel):
    client_id: UUID
    relationship_type: str  # Accept string, will validate against enum in endpoint
    percentage_ownership: Optional[str] = None
    appointment_date: Optional[str] = None  # Accept ISO date string
    resignation_date: Optional[str] = None  # Accept ISO date string
    is_active: Optional[str] = "active"
    is_primary_contact: Optional[bool] = False
    notes: Optional[str] = None


# Schema for updating an association
class CustomerClientAssociationUpdate(BaseModel):
    relationship_type: Optional[RelationshipType] = None
    percentage_ownership: Optional[str] = None
    appointment_date: Optional[datetime] = None
    resignation_date: Optional[datetime] = None
    is_active: Optional[str] = None
    is_primary_contact: Optional[bool] = None
    notes: Optional[str] = None


# Summary schemas for nested responses
class CustomerSummary(BaseModel):
    id: UUID
    individual_id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None  # From individual
    primary_mobile: Optional[str] = None  # From individual
    
    @property
    def name(self) -> str:
        """Computed name from first_name and last_name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return "Unknown"
    
    class Config:
        from_attributes = True


class ClientSummary(BaseModel):
    id: UUID
    business_name: str
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
    is_primary_contact: bool
    created_at: datetime
    
    class Config:
        from_attributes = True 