from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID

from db.models.client import BusinessType


# Schema for updating client services
class ClientServiceUpdate(BaseModel):
    service_id: UUID
    is_enabled: bool
    price: Optional[float] = None


# Client creation request schema - flat structure
class ClientCreateRequest(BaseModel):
    # Basic business information
    business_name: str
    trading_name: Optional[str] = None
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    industry_sector: Optional[str] = None
    
    # Registration details
    companies_house_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    country_of_incorporation: Optional[str] = "England and Wales"
    
    # Tax information
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None
    
    # PAYE information
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = False
    
    # Registered address
    registered_address_line1: Optional[str] = None
    registered_address_line2: Optional[str] = None
    registered_city: Optional[str] = None
    registered_county: Optional[str] = None
    registered_postcode: Optional[str] = None
    registered_country: Optional[str] = "United Kingdom"
    
    # Trading address
    trading_same_as_registered: Optional[bool] = True
    trading_address_line1: Optional[str] = None
    trading_address_line2: Optional[str] = None
    trading_city: Optional[str] = None
    trading_county: Optional[str] = None
    trading_postcode: Optional[str] = None
    trading_country: Optional[str] = None
    
    # Contact information
    main_phone: Optional[str] = None
    main_email: Optional[EmailStr] = None
    website: Optional[str] = None
    
    # Banking information
    business_bank_name: Optional[str] = None
    business_bank_sort_code: Optional[str] = None
    business_bank_account_number: Optional[str] = None
    business_bank_account_name: Optional[str] = None
    
    # Financial information
    year_end_date: Optional[date] = None
    annual_turnover: Optional[str] = None
    number_of_employees: Optional[int] = 0
    company_status: Optional[str] = "active"
    
    # Professional services
    current_accountant: Optional[str] = None
    previous_accountant: Optional[str] = None
    solicitor: Optional[str] = None
    bank_manager: Optional[str] = None
    insurance_broker: Optional[str] = None
    
    # Service requirements
    services_required: Optional[List[str]] = None
    accounting_software: Optional[str] = None
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None


# Client update request schema - all fields optional for partial updates
class ClientUpdateRequest(BaseModel):
    # Basic business information
    business_name: Optional[str] = None
    trading_name: Optional[str] = None
    business_type: Optional[BusinessType] = None
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
    main_email: Optional[EmailStr] = None
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
    
    # Professional services
    current_accountant: Optional[str] = None
    previous_accountant: Optional[str] = None
    solicitor: Optional[str] = None
    bank_manager: Optional[str] = None
    insurance_broker: Optional[str] = None
    
    # Service requirements
    services_required: Optional[List[str]] = None
    accounting_software: Optional[str] = None
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None
    
    # Services assignment updates
    services: Optional[List[ClientServiceUpdate]] = None


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