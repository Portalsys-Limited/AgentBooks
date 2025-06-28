from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Date, Integer, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for business type
class BusinessType(str, enum.Enum):
    ltd = "LTD - Limited Company"
    llp = "LLP - Limited Liability Partnership"
    nti = "NTI - Non Trade Individual"
    ntj = "NTJ - Non Trade Joint Income"
    ntt = "NTT - Non Trading Trust"
    ptb = "PTB - Partnership Trading Business"
    stb = "STB - Sole Trading Business"
    tio = "TIO - Tax Income only"
    ttt = "TTT - Trading Trust"

# Enum for Client MLR Status  
class ClientMLRStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    complete = "complete"
    failed = "failed"
    expired = "expired"

# Enum for Accounting Software
class AccountingSoftware(str, enum.Enum):
    xero = "xero"
    quickbooks = "quickbooks"
    sage = "sage"
    odoo = "odoo"
    manual_excel = "manual_excel"
    other = "other"

# Enum for Billing Frequency
class BillingFrequency(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"
    one_time = "one_time"
    custom = "custom"

# Enum for Payment Method
class PaymentMethod(str, enum.Enum):
    direct_debit = "direct_debit"
    bank_transfer = "bank_transfer"
    cheque = "cheque"
    cash = "cash"
    card = "card"
    other = "other"

# Enum for Engagement Letter Status
class EngagementLetterStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    signed = "signed"
    expired = "expired"
    declined = "declined"

# Enum for Bookkeeping Format
class BookkeepingFormat(str, enum.Enum):
    online = "online"
    offline = "offline"

# Enum for Payroll Frequency
class PayrollFrequency(str, enum.Enum):
    weekly = "weekly"
    fortnightly = "fortnightly"
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"

# Enum for Payroll Type
class PayrollType(str, enum.Enum):
    full_service = "full_service"
    processing_only = "processing_only"
    admin_only = "admin_only"
    custom = "custom"

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Basic Info
    client_code = Column(String, nullable=False, unique=True, index=True)
    business_name = Column(String, nullable=False, index=True)
    business_type = Column(SQLEnum(BusinessType), nullable=False)
    nature_of_business = Column(String)
    
    # Company Data
    company_number = Column(String, unique=True, index=True)  # Companies House number
    date_of_incorporation = Column(Date)
    crn_authentication_code = Column(String)
    currently_incorporated = Column(Boolean, default=True)
    crn_statement_confirmed = Column(Boolean, default=False)
    registered_address_different_from_trading = Column(Boolean, default=False)
    
    # Business Address (Registered)
    registered_address_line1 = Column(String)
    registered_address_line2 = Column(String)
    registered_city = Column(String)
    registered_county = Column(String)
    registered_country = Column(String, default="United Kingdom")
    registered_postcode = Column(String, index=True)
    
    # Trading Address
    trading_address_line1 = Column(String)
    trading_address_line2 = Column(String)
    trading_city = Column(String)
    trading_county = Column(String)
    trading_country = Column(String, default="United Kingdom")
    trading_postcode = Column(String, index=True)
    
    # MLR
    mlr_status = Column(SQLEnum(ClientMLRStatus), default=ClientMLRStatus.pending)
    
    # Accounting Software
    accounting_software = Column(SQLEnum(AccountingSoftware))
    
    # Billing
    billing_frequency = Column(SQLEnum(BillingFrequency))
    payment_method = Column(SQLEnum(PaymentMethod))
    payment_terms = Column(String)  # e.g., "Net 30", "Due on receipt"
    debit_credit_account_line = Column(String)
    
    # Practice Info
    client_primary_contact_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    reference_manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payroll_manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    client_source = Column(String)  # How they found us
    
    # Engagement Letter
    engagement_letter_status = Column(SQLEnum(EngagementLetterStatus), default=EngagementLetterStatus.pending)
    engagement_letter_last_review = Column(Date)
    
    # Tax information
    corporation_tax_utr = Column(String, unique=True)
    vat_number = Column(String, unique=True)
    vat_registration_date = Column(Date)
    vat_scheme = Column(String)  # standard, flat_rate, etc.
    
    # PAYE information
    payroll_scheme_reference = Column(String)
    employer_reference_number = Column(String)
    construction_industry_scheme = Column(Boolean, default=False)
    
    # Contact information
    main_phone = Column(String)
    main_email = Column(String)
    website = Column(String)
    
    # Banking information
    business_bank_name = Column(String)
    business_bank_sort_code = Column(String)
    business_bank_account_number = Column(String)
    business_bank_account_name = Column(String)
    
    # Financial information
    year_end_date = Column(Date)
    annual_turnover = Column(String)  # Store as string to handle ranges
    number_of_employees = Column(Integer, default=0)
    company_status = Column(String, default="active")  # active, dormant, dissolved, etc.
    
    # Companies House RAW Data (comprehensive data from API)
    companies_house_data = Column(JSONB)  # Raw data from Companies House API
    last_companies_house_update = Column(DateTime(timezone=True))
    
    # Professional services
    current_accountant = Column(String)
    previous_accountant = Column(String)
    solicitor = Column(String)
    bank_manager = Column(String)
    insurance_broker = Column(String)
    
    # Service requirements (stored as JSONB for flexibility)
    services_required = Column(JSONB)  # Array of services: bookkeeping, payroll, vat, etc.
    
    # Additional information
    notes = Column(Text)
    risk_assessment = Column(Text)
    aml_status = Column(String)  # Anti-Money Laundering status
    due_diligence_completed = Column(Boolean, default=False)
    
    # ========== SERVICE SPECIFIC SECTIONS ==========
    
    # BOOKKEEPING
    bookkeeping_prepared_by_client = Column(Boolean, default=False)
    bookkeeping_format = Column(SQLEnum(BookkeepingFormat))
    bookkeeping_record = Column(Text)  # Additional bookkeeping record details
    
    # VAT
    vat_registration_required = Column(Boolean, default=False)
    vat_registration_applied = Column(Boolean, default=False)
    vat_registration_completed = Column(Boolean, default=False)
    vat_online_code = Column(String)
    vat_online_code_applied = Column(Boolean, default=False)
    vat_online_code_completed = Column(Boolean, default=False)
    vat_64_8_applied = Column(Boolean, default=False)  # VAT (64-8) authorizing your Agent
    vat_64_8_completed = Column(Boolean, default=False)
    
    # PAYE
    paye_registration_required = Column(Boolean, default=False)
    paye_registration_applied = Column(Boolean, default=False)
    paye_registration_completed = Column(Boolean, default=False)
    paye_online_code = Column(String)
    paye_online_code_applied = Column(Boolean, default=False)
    paye_online_code_completed = Column(Boolean, default=False)
    paye_64_8_applied = Column(Boolean, default=False)  # PAYE (64-8) authorizing your Agent
    paye_64_8_completed = Column(Boolean, default=False)
    payroll_run_by_client = Column(Boolean, default=False)
    payroll_frequency = Column(SQLEnum(PayrollFrequency))
    payroll_type = Column(SQLEnum(PayrollType))
    last_payroll_done_date = Column(Date)
    p32_report = Column(Text)  # P32 Report details
    auto_enrollment_staging_date = Column(Date)
    auto_enrollment_administration = Column(Boolean, default=False)
    details_of_ae_administration = Column(Text)
    p11d = Column(Boolean, default=False)
    eps_reports = Column(Boolean, default=False)
    responsible_for_p32_payments = Column(Boolean, default=False)
    payroll_ceased_date = Column(Date)
    
    # CIS (Construction Industry Scheme)
    cis_contractor_registration_required = Column(Boolean, default=False)
    cis_contractor_registration_applied = Column(Boolean, default=False)
    cis_contractor_registration_completed = Column(Boolean, default=False)
    cis_online_code = Column(String)
    cis_online_code_applied = Column(Boolean, default=False)
    cis_online_code_completed = Column(Boolean, default=False)
    cis_64_8_applied = Column(Boolean, default=False)  # CIS (64-8) authorizing your Agent
    cis_64_8_completed = Column(Boolean, default=False)
    cis_subcontractor_registered = Column(Boolean, default=False)
    responsible_for_cis_return = Column(Boolean, default=False)
    
    # Other fields
    setup_date = Column(DateTime(timezone=True), server_default=func.now())
    last_edited = Column(DateTime(timezone=True), onupdate=func.now())
    last_edited_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="clients")
    client_primary_contact = relationship("User", foreign_keys=[client_primary_contact_id])
    reference_manager = relationship("User", foreign_keys=[reference_manager_id])
    payroll_manager = relationship("User", foreign_keys=[payroll_manager_id])
    last_edited_by = relationship("User", foreign_keys=[last_edited_by_id])
    customer_associations = relationship("CustomerClientAssociation", back_populates="client")
    companies_house_profile = relationship("CompaniesHouseProfile", back_populates="client", uselist=False)
    client_services = relationship("ClientService", back_populates="client", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="client")
    
    def __repr__(self):
        return f"<Client(id={self.id}, business_name='{self.business_name}', client_code='{self.client_code}')>"
    
    @property
    def full_registered_address(self):
        """Return the full registered address"""
        parts = [self.registered_address_line1, self.registered_address_line2, 
                self.registered_city, self.registered_county, self.registered_postcode, self.registered_country]
        return ", ".join([part for part in parts if part])
    
    @property 
    def full_trading_address(self):
        """Return the full trading address"""
        parts = [self.trading_address_line1, self.trading_address_line2,
                self.trading_city, self.trading_county, self.trading_postcode, self.trading_country]
        return ", ".join([part for part in parts if part]) 