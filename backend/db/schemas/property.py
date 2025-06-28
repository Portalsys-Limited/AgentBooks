from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from db.models.property import PropertyType, PropertyStatus


# Base property schema
class PropertyBase(BaseModel):
    property_name: str
    property_type: PropertyType
    property_status: PropertyStatus = PropertyStatus.owned
    address_line_1: str
    address_line_2: Optional[str] = None
    town: str
    county: Optional[str] = None
    country: Optional[str] = "United Kingdom"
    post_code: str
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    monthly_rental_income: Optional[Decimal] = None
    annual_rental_income: Optional[Decimal] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    property_size: Optional[str] = None
    is_rental_property: Optional[bool] = False
    tenant_name: Optional[str] = None
    lease_start_date: Optional[datetime] = None
    lease_end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None


# Property creation schema
class PropertyCreateRequest(BaseModel):
    customer_id: UUID
    property_name: str
    property_type: PropertyType
    property_status: PropertyStatus = PropertyStatus.owned
    address_line_1: str
    address_line_2: Optional[str] = None
    town: str
    county: Optional[str] = None
    country: Optional[str] = "United Kingdom"
    post_code: str
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    monthly_rental_income: Optional[Decimal] = None
    annual_rental_income: Optional[Decimal] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    property_size: Optional[str] = None
    is_rental_property: Optional[bool] = False
    tenant_name: Optional[str] = None
    lease_start_date: Optional[datetime] = None
    lease_end_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None


# Property update schema
class PropertyUpdateRequest(BaseModel):
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


# Property response schema
class PropertyResponse(PropertyBase):
    id: UUID
    customer_id: UUID
    full_address: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Property list item schema
class PropertyListItem(BaseModel):
    id: UUID
    customer_id: UUID
    property_name: str
    property_type: PropertyType
    property_status: PropertyStatus
    full_address: str
    is_rental_property: bool
    monthly_rental_income: Optional[Decimal] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Base schemas for backward compatibility
class PropertyCreate(PropertyBase):
    customer_id: UUID


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
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 