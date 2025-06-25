from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID

from db.models.client import BusinessType


# Address schemas for business addresses
class BusinessAddress(BaseModel):
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = "United Kingdom"


# Basic business information
class BusinessInfo(BaseModel):
    business_name: str
    trading_name: Optional[str] = None
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    industry_sector: Optional[str] = None


# Registration details
class RegistrationDetails(BaseModel):
    companies_house_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    country_of_incorporation: Optional[str] = "England and Wales"


# Tax information
class TaxInfo(BaseModel):
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None


# PAYE information
class PayeInfo(BaseModel):
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = False


# Contact information
class BusinessContactInfo(BaseModel):
    main_phone: Optional[str] = None
    main_email: Optional[EmailStr] = None
    website: Optional[str] = None


# Banking information
class BusinessBankingInfo(BaseModel):
    business_bank_name: Optional[str] = None
    business_bank_sort_code: Optional[str] = None
    business_bank_account_number: Optional[str] = None
    business_bank_account_name: Optional[str] = None


# Financial information
class FinancialInfo(BaseModel):
    year_end_date: Optional[date] = None
    annual_turnover: Optional[str] = None
    number_of_employees: Optional[int] = 0
    company_status: Optional[str] = "active"


# Professional services
class ProfessionalServices(BaseModel):
    current_accountant: Optional[str] = None
    previous_accountant: Optional[str] = None
    solicitor: Optional[str] = None
    bank_manager: Optional[str] = None
    insurance_broker: Optional[str] = None


# Service requirements
class ServiceRequirements(BaseModel):
    services_required: Optional[List[str]] = None
    accounting_software: Optional[str] = None


# Client creation request schema
class ClientCreateRequest(BaseModel):
    business_info: BusinessInfo
    registered_address: Optional[BusinessAddress] = None
    trading_same_as_registered: Optional[bool] = True
    trading_address: Optional[BusinessAddress] = None
    registration_details: Optional[RegistrationDetails] = None
    tax_info: Optional[TaxInfo] = None
    paye_info: Optional[PayeInfo] = None
    contact_info: Optional[BusinessContactInfo] = None
    banking_info: Optional[BusinessBankingInfo] = None
    financial_info: Optional[FinancialInfo] = None
    professional_services: Optional[ProfessionalServices] = None
    service_requirements: Optional[ServiceRequirements] = None
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None


# Client update request schema
class ClientUpdateRequest(BaseModel):
    business_info: Optional[BusinessInfo] = None
    registered_address: Optional[BusinessAddress] = None
    trading_same_as_registered: Optional[bool] = None
    trading_address: Optional[BusinessAddress] = None
    registration_details: Optional[RegistrationDetails] = None
    tax_info: Optional[TaxInfo] = None
    paye_info: Optional[PayeInfo] = None
    contact_info: Optional[BusinessContactInfo] = None
    banking_info: Optional[BusinessBankingInfo] = None
    financial_info: Optional[FinancialInfo] = None
    professional_services: Optional[ProfessionalServices] = None
    service_requirements: Optional[ServiceRequirements] = None
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None


# Client list item (summary view)
class ClientListItem(BaseModel):
    id: UUID
    business_name: str
    trading_name: Optional[str] = None
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    company_status: Optional[str] = None
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Full client response schema (flat structure matching DB)
class ClientResponse(BaseModel):
    id: UUID
    practice_id: UUID
    
    # Basic business information
    business_name: str
    trading_name: Optional[str] = None
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    industry_sector: Optional[str] = None
    
    # Registration details
    companies_house_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    country_of_incorporation: Optional[str] = None
    
    # Tax information
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None
    
    # PAYE information
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = None
    
    # Registered address
    registered_address_line1: Optional[str] = None
    registered_address_line2: Optional[str] = None
    registered_city: Optional[str] = None
    registered_county: Optional[str] = None
    registered_postcode: Optional[str] = None
    registered_country: Optional[str] = None
    
    # Trading address
    trading_same_as_registered: Optional[bool] = None
    trading_address_line1: Optional[str] = None
    trading_address_line2: Optional[str] = None
    trading_city: Optional[str] = None
    trading_county: Optional[str] = None
    trading_postcode: Optional[str] = None
    trading_country: Optional[str] = None
    
    # Contact information
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    website: Optional[str] = None
    
    # Banking information
    business_bank_name: Optional[str] = None
    business_bank_sort_code: Optional[str] = None
    business_bank_account_number: Optional[str] = None
    business_bank_account_name: Optional[str] = None
    
    # Financial information
    year_end_date: Optional[date] = None
    annual_turnover: Optional[str] = None
    number_of_employees: Optional[int] = None
    company_status: Optional[str] = None
    
    # Companies House data
    companies_house_data: Optional[Dict[str, Any]] = None
    last_companies_house_update: Optional[datetime] = None
    
    # Professional services
    current_accountant: Optional[str] = None
    previous_accountant: Optional[str] = None
    solicitor: Optional[str] = None
    bank_manager: Optional[str] = None
    insurance_broker: Optional[str] = None
    
    # Service requirements
    services_required: Optional[Dict[str, Any]] = None
    accounting_software: Optional[str] = None
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None
    aml_status: Optional[str] = None
    due_diligence_completed: Optional[bool] = None
    
    # Legacy field
    customer_id: Optional[UUID] = None
    
    # System fields
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 