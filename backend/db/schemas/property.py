from pydantic import BaseModel, computed_field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from db.models.property import PropertyType, PropertyStatus

# Individual summary for relationship responses (to avoid circular imports)
class IndividualSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

# Individual relationship summary for property responses (to avoid circular imports)
class IndividualRelationshipSummary(BaseModel):
    id: UUID
    ownership_type: str
    ownership_percentage: Decimal
    is_primary_owner: bool
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    
    # Individual summary
    individual_id: UUID
    individual: IndividualSummary
    
    class Config:
        from_attributes = True

# Base property schema without relationships
class PropertyBase(BaseModel):
    property_name: str
    property_type: PropertyType
    property_status: PropertyStatus = PropertyStatus.owned
    
    # Address
    address_line_1: str
    address_line_2: Optional[str] = None
    town: str
    county: Optional[str] = None
    country: Optional[str] = "United Kingdom"
    post_code: str
    
    # Financial information
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    monthly_rental_income: Optional[Decimal] = None
    annual_rental_income: Optional[Decimal] = None
    
    # Property details
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    property_size: Optional[str] = None
    
    # Rental information
    is_rental_property: bool = False
    tenant_name: Optional[str] = None
    lease_start_date: Optional[datetime] = None
    lease_end_date: Optional[datetime] = None
    
    # Additional information
    description: Optional[str] = None
    notes: Optional[str] = None

    @computed_field
    def full_address(self) -> str:
        """Compute the full address string"""
        parts = [
            self.address_line_1,
            self.address_line_2,
            self.town,
            self.county,
            self.post_code,
            self.country
        ]
        return ", ".join([p for p in parts if p])

# Property create request
class PropertyCreateRequest(PropertyBase):
    pass

# Property update request
class PropertyUpdateRequest(BaseModel):
    property_name: Optional[str] = None
    property_type: Optional[PropertyType] = None
    property_status: Optional[PropertyStatus] = None
    
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    town: Optional[str] = None
    county: Optional[str] = None
    country: Optional[str] = None
    post_code: Optional[str] = None
    
    # Financial information
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    monthly_rental_income: Optional[Decimal] = None
    annual_rental_income: Optional[Decimal] = None
    
    # Property details
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    property_size: Optional[str] = None
    
    # Rental information
    is_rental_property: Optional[bool] = None
    tenant_name: Optional[str] = None
    lease_start_date: Optional[datetime] = None
    lease_end_date: Optional[datetime] = None
    
    # Additional information
    description: Optional[str] = None
    notes: Optional[str] = None

# Property list item (summary view)
class PropertyListItem(PropertyBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Full property response with relationships
class PropertyResponse(PropertyBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Relationships
    individual_relationships: List[IndividualRelationshipSummary] = []
    
    class Config:
        from_attributes = True


# Base schemas for backward compatibility
class PropertyCreate(PropertyBase):
    individual_id: UUID


class PropertyUpdate(BaseModel):
    property_name: Optional[str] = None
    property_type: Optional[PropertyType] = None
    property_status: Optional[PropertyStatus] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    town: Optional[str] = None
    county: Optional[str] = None
    country: Optional[str] = None
    post_code: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    monthly_rental_income: Optional[Decimal] = None
    annual_rental_income: Optional[Decimal] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    property_size: Optional[str] = None
    is_rental_property: Optional[bool] = None
    tenant_name: Optional[str] = None
    lease_start_date: Optional[datetime] = None
    lease_end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None


class Property(PropertyBase):
    id: UUID
    individual_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 