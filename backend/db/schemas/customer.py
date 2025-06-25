from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID

from db.models.customer import Gender, MaritalStatus


# Address schemas for customer addresses
class CustomerAddress(BaseModel):
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = "United Kingdom"


# Personal information schemas
class PersonalInfo(BaseModel):
    title: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    surname: Optional[str] = None
    preferred_name: Optional[str] = None


class ContactInfo(BaseModel):
    primary_email: EmailStr
    secondary_email: Optional[EmailStr] = None
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None


class PersonalDetails(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None


class GovernmentIdentifiers(BaseModel):
    national_insurance_number: Optional[str] = None
    utr: Optional[str] = None
    passport_number: Optional[str] = None
    driving_license_number: Optional[str] = None


class EmergencyContact(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None


class FamilyInfo(BaseModel):
    number_of_children: Optional[int] = 0
    children_details: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[EmergencyContact] = None


class EmploymentInfo(BaseModel):
    status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[str] = None


class CustomerBankingInfo(BaseModel):
    bank_name: Optional[str] = None
    bank_sort_code: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None


# Customer creation request schema
class CustomerCreateRequest(BaseModel):
    name: str
    personal_info: PersonalInfo
    contact_info: ContactInfo
    home_address: Optional[CustomerAddress] = None
    correspondence_same_as_home: Optional[bool] = True
    correspondence_address: Optional[CustomerAddress] = None
    personal_details: Optional[PersonalDetails] = None
    government_identifiers: Optional[GovernmentIdentifiers] = None
    family_info: Optional[FamilyInfo] = None
    employment: Optional[EmploymentInfo] = None
    banking: Optional[CustomerBankingInfo] = None
    notes: Optional[str] = None
    communication_preferences: Optional[Dict[str, Any]] = None
    data_protection_consent: Optional[bool] = False
    marketing_consent: Optional[bool] = False


# Customer update request schema  
class CustomerUpdateRequest(BaseModel):
    name: Optional[str] = None
    personal_info: Optional[PersonalInfo] = None
    contact_info: Optional[ContactInfo] = None
    home_address: Optional[CustomerAddress] = None
    correspondence_same_as_home: Optional[bool] = None
    correspondence_address: Optional[CustomerAddress] = None
    personal_details: Optional[PersonalDetails] = None
    government_identifiers: Optional[GovernmentIdentifiers] = None
    family_info: Optional[FamilyInfo] = None
    employment: Optional[EmploymentInfo] = None
    banking: Optional[CustomerBankingInfo] = None
    notes: Optional[str] = None
    communication_preferences: Optional[Dict[str, Any]] = None
    data_protection_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None


# Customer list item (summary view)
class CustomerListItem(BaseModel):
    id: UUID
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    primary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Import client association schemas for nested responses
# Note: Imported here to avoid circular imports
from db.schemas.customer_client_association import CustomerClientAssociationWithClient


# Full customer response schema (flat structure matching DB)
class CustomerResponse(BaseModel):
    id: UUID
    practice_id: UUID
    
    # Basic info
    name: str
    
    # Personal information (flat structure matching DB)
    title: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    surname: Optional[str] = None
    preferred_name: Optional[str] = None
    
    # Contact information
    primary_email: Optional[str] = None
    secondary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    
    # Home address
    home_address_line1: Optional[str] = None
    home_address_line2: Optional[str] = None
    home_city: Optional[str] = None
    home_county: Optional[str] = None
    home_postcode: Optional[str] = None
    home_country: Optional[str] = None
    
    # Correspondence address
    correspondence_same_as_home: Optional[bool] = None
    correspondence_address_line1: Optional[str] = None
    correspondence_address_line2: Optional[str] = None
    correspondence_city: Optional[str] = None
    correspondence_county: Optional[str] = None
    correspondence_postcode: Optional[str] = None
    correspondence_country: Optional[str] = None
    
    # Personal details
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None
    
    # Government identifiers
    national_insurance_number: Optional[str] = None
    utr: Optional[str] = None
    passport_number: Optional[str] = None
    driving_license_number: Optional[str] = None
    
    # Family information
    number_of_children: Optional[int] = None
    children_details: Optional[Dict[str, Any]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Employment information
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[str] = None
    
    # Banking information
    bank_name: Optional[str] = None
    bank_sort_code: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None
    
    # Additional information
    notes: Optional[str] = None
    communication_preferences: Optional[Dict[str, Any]] = None
    data_protection_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None
    
    # System fields
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Associated clients (through associations)
    client_associations: List[CustomerClientAssociationWithClient] = []
    
    class Config:
        from_attributes = True


# Backward compatibility schemas
class CustomerBase(BaseModel):
    name: str


class CustomerCreate(CustomerBase):
    practice_id: UUID


class Customer(CustomerBase):
    id: UUID
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 