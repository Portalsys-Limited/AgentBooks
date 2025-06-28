from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID

from db.models.client import (
    BusinessType, ClientMLRStatus, AccountingSoftware, BillingFrequency, 
    PaymentMethod, EngagementLetterStatus, BookkeepingFormat, PayrollFrequency, PayrollType
)


# User summary for relationships
class UserSummary(BaseModel):
    id: UUID
    email: str
    
    class Config:
        from_attributes = True





# Schema for updating client services
class ClientServiceUpdate(BaseModel):
    service_id: UUID
    is_enabled: bool
    price: Optional[float] = None


# Client creation request schema - comprehensive structure
class ClientCreateRequest(BaseModel):
    # Basic Info
    client_code: str
    business_name: str
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    
    # Company Data
    company_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    crn_authentication_code: Optional[str] = None
    currently_incorporated: Optional[bool] = True
    crn_statement_confirmed: Optional[bool] = False
    registered_address_different_from_trading: Optional[bool] = False
    
    # Business Address (Registered)
    registered_address_line1: Optional[str] = None
    registered_address_line2: Optional[str] = None
    registered_city: Optional[str] = None
    registered_county: Optional[str] = None
    registered_country: Optional[str] = "United Kingdom"
    registered_postcode: Optional[str] = None
    
    # Trading Address
    trading_address_line1: Optional[str] = None
    trading_address_line2: Optional[str] = None
    trading_city: Optional[str] = None
    trading_county: Optional[str] = None
    trading_country: Optional[str] = "United Kingdom"
    trading_postcode: Optional[str] = None
    
    # MLR
    mlr_status: Optional[ClientMLRStatus] = ClientMLRStatus.pending
    
    # Accounting Software
    accounting_software: Optional[AccountingSoftware] = None
    
    # Billing
    billing_frequency: Optional[BillingFrequency] = None
    payment_method: Optional[PaymentMethod] = None
    payment_terms: Optional[str] = None
    debit_credit_account_line: Optional[str] = None
    
    # Practice Info
    client_primary_contact_id: Optional[UUID] = None
    reference_manager_id: Optional[UUID] = None
    payroll_manager_id: Optional[UUID] = None
    client_source: Optional[str] = None
    
    # Engagement Letter
    engagement_letter_status: Optional[EngagementLetterStatus] = EngagementLetterStatus.pending
    engagement_letter_last_review: Optional[date] = None
    
    # Tax information
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None
    
    # PAYE information
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = False
    
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
    services_required: Optional[Dict[str, Any]] = None
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None
    aml_status: Optional[str] = None
    due_diligence_completed: Optional[bool] = False
    
    # Service Specific Sections
    
    # Bookkeeping
    bookkeeping_prepared_by_client: Optional[bool] = False
    bookkeeping_format: Optional[BookkeepingFormat] = None
    bookkeeping_record: Optional[str] = None
    
    # VAT
    vat_registration_required: Optional[bool] = False
    vat_registration_applied: Optional[bool] = False
    vat_registration_completed: Optional[bool] = False
    vat_online_code: Optional[str] = None
    vat_online_code_applied: Optional[bool] = False
    vat_online_code_completed: Optional[bool] = False
    vat_64_8_applied: Optional[bool] = False
    vat_64_8_completed: Optional[bool] = False
    
    # PAYE
    paye_registration_required: Optional[bool] = False
    paye_registration_applied: Optional[bool] = False
    paye_registration_completed: Optional[bool] = False
    paye_online_code: Optional[str] = None
    paye_online_code_applied: Optional[bool] = False
    paye_online_code_completed: Optional[bool] = False
    paye_64_8_applied: Optional[bool] = False
    paye_64_8_completed: Optional[bool] = False
    payroll_run_by_client: Optional[bool] = False
    payroll_frequency: Optional[PayrollFrequency] = None
    payroll_type: Optional[PayrollType] = None
    last_payroll_done_date: Optional[date] = None
    p32_report: Optional[str] = None
    auto_enrollment_staging_date: Optional[date] = None
    auto_enrollment_administration: Optional[bool] = False
    details_of_ae_administration: Optional[str] = None
    p11d: Optional[bool] = False
    eps_reports: Optional[bool] = False
    responsible_for_p32_payments: Optional[bool] = False
    payroll_ceased_date: Optional[date] = None
    
    # CIS
    cis_contractor_registration_required: Optional[bool] = False
    cis_contractor_registration_applied: Optional[bool] = False
    cis_contractor_registration_completed: Optional[bool] = False
    cis_online_code: Optional[str] = None
    cis_online_code_applied: Optional[bool] = False
    cis_online_code_completed: Optional[bool] = False
    cis_64_8_applied: Optional[bool] = False
    cis_64_8_completed: Optional[bool] = False
    cis_subcontractor_registered: Optional[bool] = False
    responsible_for_cis_return: Optional[bool] = False


# Client update request schema - all fields optional for partial updates
class ClientUpdateRequest(BaseModel):
    # Basic Info
    client_code: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[BusinessType] = None
    nature_of_business: Optional[str] = None
    
    # Company Data
    company_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    crn_authentication_code: Optional[str] = None
    currently_incorporated: Optional[bool] = None
    crn_statement_confirmed: Optional[bool] = None
    registered_address_different_from_trading: Optional[bool] = None
    
    # Business Address (Registered)
    registered_address_line1: Optional[str] = None
    registered_address_line2: Optional[str] = None
    registered_city: Optional[str] = None
    registered_county: Optional[str] = None
    registered_country: Optional[str] = None
    registered_postcode: Optional[str] = None
    
    # Trading Address
    trading_address_line1: Optional[str] = None
    trading_address_line2: Optional[str] = None
    trading_city: Optional[str] = None
    trading_county: Optional[str] = None
    trading_country: Optional[str] = None
    trading_postcode: Optional[str] = None
    
    # MLR
    mlr_status: Optional[ClientMLRStatus] = None
    
    # Accounting Software
    accounting_software: Optional[AccountingSoftware] = None
    
    # Billing
    billing_frequency: Optional[BillingFrequency] = None
    payment_method: Optional[PaymentMethod] = None
    payment_terms: Optional[str] = None
    debit_credit_account_line: Optional[str] = None
    
    # Practice Info
    client_primary_contact_id: Optional[UUID] = None
    reference_manager_id: Optional[UUID] = None
    payroll_manager_id: Optional[UUID] = None
    client_source: Optional[str] = None
    
    # Engagement Letter
    engagement_letter_status: Optional[EngagementLetterStatus] = None
    engagement_letter_last_review: Optional[date] = None
    
    # Tax information
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None
    
    # PAYE information
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = None
    
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
    services_required: Optional[Dict[str, Any]] = None
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None
    aml_status: Optional[str] = None
    due_diligence_completed: Optional[bool] = None
    
    # Service Specific Sections
    
    # Bookkeeping
    bookkeeping_prepared_by_client: Optional[bool] = None
    bookkeeping_format: Optional[BookkeepingFormat] = None
    bookkeeping_record: Optional[str] = None
    
    # VAT
    vat_registration_required: Optional[bool] = None
    vat_registration_applied: Optional[bool] = None
    vat_registration_completed: Optional[bool] = None
    vat_online_code: Optional[str] = None
    vat_online_code_applied: Optional[bool] = None
    vat_online_code_completed: Optional[bool] = None
    vat_64_8_applied: Optional[bool] = None
    vat_64_8_completed: Optional[bool] = None
    
    # PAYE
    paye_registration_required: Optional[bool] = None
    paye_registration_applied: Optional[bool] = None
    paye_registration_completed: Optional[bool] = None
    paye_online_code: Optional[str] = None
    paye_online_code_applied: Optional[bool] = None
    paye_online_code_completed: Optional[bool] = None
    paye_64_8_applied: Optional[bool] = None
    paye_64_8_completed: Optional[bool] = None
    payroll_run_by_client: Optional[bool] = None
    payroll_frequency: Optional[PayrollFrequency] = None
    payroll_type: Optional[PayrollType] = None
    last_payroll_done_date: Optional[date] = None
    p32_report: Optional[str] = None
    auto_enrollment_staging_date: Optional[date] = None
    auto_enrollment_administration: Optional[bool] = None
    details_of_ae_administration: Optional[str] = None
    p11d: Optional[bool] = None
    eps_reports: Optional[bool] = None
    responsible_for_p32_payments: Optional[bool] = None
    payroll_ceased_date: Optional[date] = None
    
    # CIS
    cis_contractor_registration_required: Optional[bool] = None
    cis_contractor_registration_applied: Optional[bool] = None
    cis_contractor_registration_completed: Optional[bool] = None
    cis_online_code: Optional[str] = None
    cis_online_code_applied: Optional[bool] = None
    cis_online_code_completed: Optional[bool] = None
    cis_64_8_applied: Optional[bool] = None
    cis_64_8_completed: Optional[bool] = None
    cis_subcontractor_registered: Optional[bool] = None
    responsible_for_cis_return: Optional[bool] = None
    
    # Services assignment updates
    services: Optional[List[ClientServiceUpdate]] = None


# Client list item (summary view)
class ClientListItem(BaseModel):
    id: UUID
    client_code: str
    business_name: str
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    company_status: Optional[str] = None
    mlr_status: ClientMLRStatus
    engagement_letter_status: EngagementLetterStatus
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Full client response schema (comprehensive structure)
class ClientResponse(BaseModel):
    id: UUID
    practice_id: UUID
    
    # Basic Info
    client_code: str
    business_name: str
    business_type: BusinessType
    nature_of_business: Optional[str] = None
    
    # Company Data
    company_number: Optional[str] = None
    date_of_incorporation: Optional[date] = None
    crn_authentication_code: Optional[str] = None
    currently_incorporated: Optional[bool] = None
    crn_statement_confirmed: Optional[bool] = None
    registered_address_different_from_trading: Optional[bool] = None
    full_registered_address: Optional[str] = None  # computed property
    full_trading_address: Optional[str] = None  # computed property
    
    # Business Address (Registered)
    registered_address_line1: Optional[str] = None
    registered_address_line2: Optional[str] = None
    registered_city: Optional[str] = None
    registered_county: Optional[str] = None
    registered_country: Optional[str] = None
    registered_postcode: Optional[str] = None
    
    # Trading Address
    trading_address_line1: Optional[str] = None
    trading_address_line2: Optional[str] = None
    trading_city: Optional[str] = None
    trading_county: Optional[str] = None
    trading_country: Optional[str] = None
    trading_postcode: Optional[str] = None
    
    # MLR
    mlr_status: ClientMLRStatus
    
    # Accounting Software
    accounting_software: Optional[AccountingSoftware] = None
    
    # Billing
    billing_frequency: Optional[BillingFrequency] = None
    payment_method: Optional[PaymentMethod] = None
    payment_terms: Optional[str] = None
    debit_credit_account_line: Optional[str] = None
    
    # Practice Info
    client_primary_contact_id: Optional[UUID] = None
    client_primary_contact: Optional[UserSummary] = None
    reference_manager_id: Optional[UUID] = None
    reference_manager: Optional[UserSummary] = None
    payroll_manager_id: Optional[UUID] = None
    payroll_manager: Optional[UserSummary] = None
    client_source: Optional[str] = None
    
    # Engagement Letter
    engagement_letter_status: EngagementLetterStatus
    engagement_letter_last_review: Optional[date] = None
    
    # Tax information
    corporation_tax_utr: Optional[str] = None
    vat_number: Optional[str] = None
    vat_registration_date: Optional[date] = None
    vat_scheme: Optional[str] = None
    
    # PAYE information
    payroll_scheme_reference: Optional[str] = None
    employer_reference_number: Optional[str] = None
    construction_industry_scheme: Optional[bool] = None
    
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
    
    # Companies House RAW Data
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
    
    # Additional information
    notes: Optional[str] = None
    risk_assessment: Optional[str] = None
    aml_status: Optional[str] = None
    due_diligence_completed: Optional[bool] = None
    
    # Service Specific Sections
    
    # Bookkeeping
    bookkeeping_prepared_by_client: Optional[bool] = None
    bookkeeping_format: Optional[BookkeepingFormat] = None
    bookkeeping_record: Optional[str] = None
    
    # VAT
    vat_registration_required: Optional[bool] = None
    vat_registration_applied: Optional[bool] = None
    vat_registration_completed: Optional[bool] = None
    vat_online_code: Optional[str] = None
    vat_online_code_applied: Optional[bool] = None
    vat_online_code_completed: Optional[bool] = None
    vat_64_8_applied: Optional[bool] = None
    vat_64_8_completed: Optional[bool] = None
    
    # PAYE
    paye_registration_required: Optional[bool] = None
    paye_registration_applied: Optional[bool] = None
    paye_registration_completed: Optional[bool] = None
    paye_online_code: Optional[str] = None
    paye_online_code_applied: Optional[bool] = None
    paye_online_code_completed: Optional[bool] = None
    paye_64_8_applied: Optional[bool] = None
    paye_64_8_completed: Optional[bool] = None
    payroll_run_by_client: Optional[bool] = None
    payroll_frequency: Optional[PayrollFrequency] = None
    payroll_type: Optional[PayrollType] = None
    last_payroll_done_date: Optional[date] = None
    p32_report: Optional[str] = None
    auto_enrollment_staging_date: Optional[date] = None
    auto_enrollment_administration: Optional[bool] = None
    details_of_ae_administration: Optional[str] = None
    p11d: Optional[bool] = None
    eps_reports: Optional[bool] = None
    responsible_for_p32_payments: Optional[bool] = None
    payroll_ceased_date: Optional[date] = None
    
    # CIS
    cis_contractor_registration_required: Optional[bool] = None
    cis_contractor_registration_applied: Optional[bool] = None
    cis_contractor_registration_completed: Optional[bool] = None
    cis_online_code: Optional[str] = None
    cis_online_code_applied: Optional[bool] = None
    cis_online_code_completed: Optional[bool] = None
    cis_64_8_applied: Optional[bool] = None
    cis_64_8_completed: Optional[bool] = None
    cis_subcontractor_registered: Optional[bool] = None
    responsible_for_cis_return: Optional[bool] = None
    
    # Other fields
    setup_date: Optional[datetime] = None
    last_edited: Optional[datetime] = None
    last_edited_by_id: Optional[UUID] = None
    last_edited_by: Optional[UserSummary] = None
    
    # System fields
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 