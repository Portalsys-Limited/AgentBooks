from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from db.models.property_individual_relationship import OwnershipType

# Base schema for property-individual relationship
class PropertyIndividualRelationshipBase(BaseModel):
    ownership_type: OwnershipType
    ownership_percentage: Decimal
    is_primary_owner: bool = False
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None

# Create request schema
class PropertyIndividualRelationshipCreate(PropertyIndividualRelationshipBase):
    individual_id: UUID

# Simplified create request schema for when individual_id is in URL
class PropertyIndividualRelationshipCreateSimple(BaseModel):
    ownership_type: OwnershipType
    ownership_percentage: Decimal
    is_primary_owner: bool = False
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None

# Update request schema
class PropertyIndividualRelationshipUpdate(BaseModel):
    ownership_type: Optional[OwnershipType] = None
    ownership_percentage: Optional[Decimal] = None
    is_primary_owner: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None

# Basic response schema without nested objects
class PropertyIndividualRelationshipResponse(PropertyIndividualRelationshipBase):
    id: UUID
    property_id: UUID
    individual_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Property summary for relationship responses (to avoid circular imports)
class PropertySummary(BaseModel):
    id: UUID
    property_name: str
    property_type: str
    property_status: str
    address_line_1: str
    address_line_2: Optional[str] = None
    town: str
    county: Optional[str] = None
    country: Optional[str] = None
    post_code: str
    current_value: Optional[Decimal] = None
    is_rental_property: bool = False
    monthly_rental_income: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

# Individual summary for relationship responses (to avoid circular imports)
class IndividualSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

# Response schema with property details
class PropertyIndividualRelationshipWithProperty(PropertyIndividualRelationshipBase):
    id: UUID
    property_id: UUID
    individual_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    property: Optional[PropertySummary] = None

    class Config:
        from_attributes = True

# Response schema with individual details
class PropertyIndividualRelationshipWithIndividual(PropertyIndividualRelationshipBase):
    id: UUID
    property_id: UUID
    individual_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    individual: Optional[IndividualSummary] = None

    class Config:
        from_attributes = True 