from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Date, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for gender
class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"

# Enum for marital status
class MaritalStatus(str, enum.Enum):
    single = "single"
    married = "married"
    divorced = "divorced"
    widowed = "widowed"
    separated = "separated"
    civil_partnership = "civil_partnership"

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Basic info (legacy field - now used as display name)
    name = Column(String, nullable=False, index=True)
    
    # Personal information
    title = Column(String)  # Mr, Mrs, Ms, Dr, etc.
    first_name = Column(String, nullable=False)
    middle_name = Column(String)
    last_name = Column(String, nullable=False)
    surname = Column(String)  # Family name if different from last_name
    preferred_name = Column(String)  # What they like to be called
    
    # Contact information
    primary_email = Column(String, nullable=False, index=True)
    secondary_email = Column(String)
    primary_phone = Column(String)
    secondary_phone = Column(String)
    
    # Address information
    home_address_line1 = Column(String)
    home_address_line2 = Column(String)
    home_city = Column(String)
    home_county = Column(String)
    home_postcode = Column(String)
    home_country = Column(String, default="United Kingdom")
    
    # Correspondence address (if different)
    correspondence_same_as_home = Column(Boolean, default=True)
    correspondence_address_line1 = Column(String)
    correspondence_address_line2 = Column(String)
    correspondence_city = Column(String)
    correspondence_county = Column(String)
    correspondence_postcode = Column(String)
    correspondence_country = Column(String)
    
    # Personal details
    date_of_birth = Column(Date)
    gender = Column(SQLEnum(Gender))
    marital_status = Column(SQLEnum(MaritalStatus))
    nationality = Column(String)
    
    # Government identifiers
    national_insurance_number = Column(String, unique=True)
    utr = Column(String, unique=True)  # Unique Taxpayer Reference
    passport_number = Column(String)
    driving_license_number = Column(String)
    
    # Family information
    number_of_children = Column(Integer, default=0)
    children_details = Column(JSONB)  # Array of {name, dob, age} objects
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    emergency_contact_relationship = Column(String)
    
    # Employment information
    employment_status = Column(String)  # employed, self_employed, unemployed, retired, etc.
    employer_name = Column(String)
    job_title = Column(String)
    annual_income = Column(String)  # Store as string to handle ranges
    
    # Banking information
    bank_name = Column(String)
    bank_sort_code = Column(String)
    bank_account_number = Column(String)
    bank_account_name = Column(String)
    
    # Additional notes and preferences
    notes = Column(Text)
    communication_preferences = Column(JSONB)  # email, phone, post preferences
    data_protection_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="customers")
    assigned_users = relationship("User", secondary="user_client_assignments", back_populates="assigned_clients")
    messages = relationship("Message", back_populates="customer")
    client_associations = relationship("CustomerClientAssociation", back_populates="customer") 