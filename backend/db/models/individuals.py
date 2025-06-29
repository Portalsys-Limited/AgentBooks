from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for Gender
class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"

# Enum for Marital Status
class MaritalStatus(str, enum.Enum):
    single = "single"
    married = "married"
    divorced = "divorced"
    widowed = "widowed"
    separated = "separated"
    civil_partnership = "civil_partnership"
    dissolved_civil_partnership = "dissolved_civil_partnership"

class Individual(Base):
    __tablename__ = "individuals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Basic Info
    first_name = Column(String, nullable=False, index=True)
    title = Column(String)  # Mr, Mrs, Ms, Dr, etc.
    middle_name = Column(String)
    last_name = Column(String, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=True)
    deceased_date = Column(Date, nullable=True)
    marital_status = Column(SQLEnum(MaritalStatus), nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    nationality = Column(String)
    
    # Contact Info
    email = Column(String, index=True)
    secondary_email = Column(String)
    primary_mobile = Column(String)
    secondary_mobile = Column(String)
    
    # Personal Address
    address_line_1 = Column(String)
    address_line_2 = Column(String)
    town = Column(String)
    county = Column(String)
    country = Column(String, default="United Kingdom")
    post_code = Column(String)
    
    # System fields
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False, index=True)
    setup_date = Column(DateTime(timezone=True), server_default=func.now())
    last_edited = Column(DateTime(timezone=True), onupdate=func.now())
    last_edited_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="individuals")
    last_edited_by = relationship("User", foreign_keys=[last_edited_by_id])
    customers = relationship("Customer", back_populates="individual")
    messages = relationship("Message", back_populates="individual")
    documents = relationship("Document", back_populates="individual")
    incomes = relationship("Income", back_populates="individual", cascade="all, delete-orphan", lazy="selectin")
    properties = relationship("Property", back_populates="individual", cascade="all, delete-orphan", lazy="selectin")
    
    # Individual relationships
    relationships_from = relationship("IndividualRelationship", 
                                   foreign_keys="[IndividualRelationship.from_individual_id]",
                                   back_populates="from_individual",
                                   cascade="all, delete-orphan",
                                   lazy="selectin")
    relationships_to = relationship("IndividualRelationship",
                                 foreign_keys="[IndividualRelationship.to_individual_id]",
                                 back_populates="to_individual",
                                 cascade="all, delete-orphan",
                                 lazy="selectin")
    
    def __repr__(self):
        return f"<Individual(id={self.id}, name='{self.first_name} {self.last_name}', email='{self.email}')>"
    
    @property
    def full_name(self):
        """Return the full name of the individual"""
        parts = [self.title, self.first_name, self.middle_name, self.last_name]
        return " ".join([part for part in parts if part])
    
    @property
    def is_deceased(self):
        """Check if the individual is deceased"""
        return self.deceased_date is not None
    
    @property
    def all_relationships(self):
        """Get all relationships (both from and to) for this individual"""
        return self.relationships_from + self.relationships_to
