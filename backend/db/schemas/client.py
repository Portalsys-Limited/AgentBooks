from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal

from db.models import Gender, MaritalStatus, BusinessType


# Address schemas for input (nested structure)
class Address(BaseModel):
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None


# Personal Information schemas for input
class PersonalInfo(BaseModel):
    title: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    surname: Optional[str] = None
    preferred_name: Optional[str] = None


class ContactInfo(BaseModel):
    primary_email: Optional[EmailStr] = None
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
    number_of_children: Optional[int] = None
    children_details: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[EmergencyContact] = None


class EmploymentInfo(BaseModel):
    status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[Decimal] = None


class BankingInfo(BaseModel):
    bank_name: Optional[str] = None
    sort_code: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None


class DataProtection(BaseModel):
    communication_preferences: Optional[Dict[str, Any]] = None
    data_protection_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None


# Client Company summary for response
class ClientCompanySummary(BaseModel):
    id: UUID
    business_name: Optional[str] = None
    trading_name: Optional[str] = None
    business_type: Optional[BusinessType] = None
    nature_of_business: Optional[str] = None
    companies_house_number: Optional[str] = None
    vat_number: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Simplified client list response
class ClientListItem(BaseModel):
    id: UUID
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    primary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    client_companies: List[ClientCompanySummary] = []

    class Config:
        from_attributes = True


# Main client request schemas (for input)
class ClientCreateRequest(BaseModel):
    name: str = Field(..., description="Client display name")
    
    # Optional nested structures
    personal_info: Optional[PersonalInfo] = None
    contact_info: Optional[ContactInfo] = None
    home_address: Optional[Address] = None
    correspondence_same_as_home: Optional[bool] = None
    correspondence_address: Optional[Address] = None
    personal_details: Optional[PersonalDetails] = None
    government_identifiers: Optional[GovernmentIdentifiers] = None
    family_info: Optional[FamilyInfo] = None
    employment: Optional[EmploymentInfo] = None
    banking: Optional[BankingInfo] = None
    data_protection: Optional[DataProtection] = None
    notes: Optional[str] = None

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else None,
        }


class ClientUpdateRequest(BaseModel):
    name: Optional[str] = None
    
    # Optional nested structures - all optional for updates
    personal_info: Optional[PersonalInfo] = None
    contact_info: Optional[ContactInfo] = None
    home_address: Optional[Address] = None
    correspondence_same_as_home: Optional[bool] = None
    correspondence_address: Optional[Address] = None
    personal_details: Optional[PersonalDetails] = None
    government_identifiers: Optional[GovernmentIdentifiers] = None
    family_info: Optional[FamilyInfo] = None
    employment: Optional[EmploymentInfo] = None
    banking: Optional[BankingInfo] = None
    data_protection: Optional[DataProtection] = None
    notes: Optional[str] = None

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else None,
        }


# Flat response schema that matches the database model structure
class ClientResponse(BaseModel):
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
    
    # Contact information (flat structure)
    primary_email: Optional[str] = None
    secondary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    
    # Home address (flat structure matching DB fields)
    home_address_line1: Optional[str] = None
    home_address_line2: Optional[str] = None
    home_city: Optional[str] = None
    home_county: Optional[str] = None
    home_postcode: Optional[str] = None
    home_country: Optional[str] = None
    
    # Correspondence address (flat structure)
    correspondence_same_as_home: Optional[bool] = None
    correspondence_address_line1: Optional[str] = None
    correspondence_address_line2: Optional[str] = None
    correspondence_city: Optional[str] = None
    correspondence_county: Optional[str] = None
    correspondence_postcode: Optional[str] = None
    correspondence_country: Optional[str] = None
    
    # Personal details (flat structure)
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None
    
    # Government identifiers (flat structure)
    national_insurance_number: Optional[str] = None
    utr: Optional[str] = None
    passport_number: Optional[str] = None
    driving_license_number: Optional[str] = None
    
    # Family information (flat structure)
    number_of_children: Optional[int] = None
    children_details: Optional[Dict[str, Any]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Employment information (flat structure)
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[Decimal] = None
    
    # Banking information (flat structure)
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
    
    # Associated companies
    client_companies: List[ClientCompanySummary] = []

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else None,
            UUID: lambda v: str(v),
        } 