from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import date, datetime
from uuid import UUID

from db.models.individuals import Gender, MaritalStatus


# Address schema for individual addresses
class IndividualAddress(BaseModel):
    line_1: Optional[str] = None
    line_2: Optional[str] = None
    town: Optional[str] = None
    county: Optional[str] = None
    country: Optional[str] = "United Kingdom"
    post_code: Optional[str] = None


# Personal information schemas
class PersonalInfo(BaseModel):
    first_name: str
    title: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: str


class ContactInfo(BaseModel):
    email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None
    primary_mobile: Optional[str] = None
    secondary_mobile: Optional[str] = None


class PersonalDetails(BaseModel):
    date_of_birth: Optional[date] = None
    deceased_date: Optional[date] = None
    marital_status: Optional[MaritalStatus] = None
    gender: Optional[Gender] = None
    nationality: Optional[str] = None


# Individual creation request schema
class IndividualCreateRequest(BaseModel):
    personal_info: PersonalInfo
    contact_info: Optional[ContactInfo] = None
    address: Optional[IndividualAddress] = None
    personal_details: Optional[PersonalDetails] = None


# Individual update request schema
class IndividualUpdateRequest(BaseModel):
    personal_info: Optional[PersonalInfo] = None
    contact_info: Optional[ContactInfo] = None
    address: Optional[IndividualAddress] = None
    personal_details: Optional[PersonalDetails] = None


# Individual list item (summary view)
class IndividualListItem(BaseModel):
    id: UUID
    practice_id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    primary_mobile: Optional[str] = None
    is_deceased: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Minimal user info for last_edited_by relationship
class UserInfo(BaseModel):
    id: UUID
    email: str
    
    class Config:
        from_attributes = True


# Full individual response schema (flat structure matching DB)
class IndividualResponse(BaseModel):
    id: UUID
    
    # Basic info
    first_name: str
    title: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: str
    full_name: str  # computed property
    
    # Personal details
    date_of_birth: Optional[date] = None
    deceased_date: Optional[date] = None
    is_deceased: bool  # computed property
    marital_status: Optional[MaritalStatus] = None
    gender: Optional[Gender] = None
    nationality: Optional[str] = None
    
    # Contact information
    email: Optional[str] = None
    secondary_email: Optional[str] = None
    primary_mobile: Optional[str] = None
    secondary_mobile: Optional[str] = None
    
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    town: Optional[str] = None
    county: Optional[str] = None
    country: Optional[str] = None
    post_code: Optional[str] = None
    
    # System fields
    practice_id: UUID
    setup_date: Optional[datetime] = None
    last_edited: Optional[datetime] = None
    last_edited_by_id: Optional[UUID] = None
    last_edited_by: Optional[UserInfo] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Base schemas for backward compatibility (if needed)
class IndividualBase(BaseModel):
    first_name: str
    last_name: str


class IndividualCreate(IndividualBase):
    title: Optional[str] = None
    middle_name: Optional[str] = None
    email: Optional[EmailStr] = None


class Individual(IndividualBase):
    id: UUID
    title: Optional[str] = None
    middle_name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
