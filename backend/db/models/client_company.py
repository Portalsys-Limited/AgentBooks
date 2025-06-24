from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Date, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for business type
class BusinessType(str, enum.Enum):
    sole_trader = "sole_trader"
    limited_company = "limited_company"
    partnership = "partnership"
    limited_partnership = "limited_partnership"
    llp = "llp"  # Limited Liability Partnership
    charity = "charity"
    community_interest_company = "community_interest_company"
    other = "other"

class ClientCompany(Base):
    __tablename__ = "client_companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Basic company information
    business_name = Column(String, nullable=False, index=True)
    trading_name = Column(String)  # If different from business name
    business_type = Column(SQLEnum(BusinessType), nullable=False)
    nature_of_business = Column(String)  # Description of what they do
    industry_sector = Column(String)  # SIC code or industry category
    
    # Registration details
    companies_house_number = Column(String, unique=True)
    date_of_incorporation = Column(Date)
    country_of_incorporation = Column(String, default="England and Wales")
    
    # Tax information
    corporation_tax_utr = Column(String, unique=True)
    vat_number = Column(String, unique=True)
    vat_registration_date = Column(Date)
    vat_scheme = Column(String)  # standard, flat_rate, etc.
    
    # PAYE information
    payroll_scheme_reference = Column(String)
    employer_reference_number = Column(String)
    construction_industry_scheme = Column(Boolean, default=False)
    
    # Addresses
    registered_address_line1 = Column(String)
    registered_address_line2 = Column(String)
    registered_city = Column(String)
    registered_county = Column(String)
    registered_postcode = Column(String)
    registered_country = Column(String, default="United Kingdom")
    
    trading_same_as_registered = Column(Boolean, default=True)
    trading_address_line1 = Column(String)
    trading_address_line2 = Column(String)
    trading_city = Column(String)
    trading_county = Column(String)
    trading_postcode = Column(String)
    trading_country = Column(String)
    
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
    
    # Companies House data (from API)
    companies_house_data = Column(JSONB)  # Raw data from Companies House API
    last_companies_house_update = Column(DateTime(timezone=True))
    
    # Professional services
    current_accountant = Column(String)
    previous_accountant = Column(String)
    solicitor = Column(String)
    bank_manager = Column(String)
    insurance_broker = Column(String)
    
    # Service requirements
    services_required = Column(JSONB)  # Array of services: bookkeeping, payroll, vat, etc.
    accounting_software = Column(String)  # Xero, QuickBooks, Sage, etc.
    
    # Additional information
    notes = Column(Text)
    risk_assessment = Column(Text)
    aml_status = Column(String)  # Anti-Money Laundering status
    due_diligence_completed = Column(Boolean, default=False)
    
    # System fields
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="client_companies") 