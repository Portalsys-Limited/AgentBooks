from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Numeric, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for Property Types
class PropertyType(str, enum.Enum):
    residential = "residential"
    commercial = "commercial"
    industrial = "industrial"
    land = "land"
    mixed_use = "mixed_use"
    other = "other"

# Enum for Property Status
class PropertyStatus(str, enum.Enum):
    owned = "owned"
    leased = "leased"
    rented_out = "rented_out"
    vacant = "vacant"
    under_renovation = "under_renovation"
    for_sale = "for_sale"
    sold = "sold"

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Property details
    property_name = Column(String, nullable=False, index=True)  # Name or identifier
    property_type = Column(SQLEnum(PropertyType), nullable=False)
    property_status = Column(SQLEnum(PropertyStatus), nullable=False, default=PropertyStatus.owned)
    
    # Address
    address_line_1 = Column(String, nullable=False)
    address_line_2 = Column(String)
    town = Column(String, nullable=False)
    county = Column(String)
    country = Column(String, default="United Kingdom")
    post_code = Column(String, nullable=False, index=True)
    
    # Financial information
    purchase_price = Column(Numeric(12, 2))
    current_value = Column(Numeric(12, 2))
    monthly_rental_income = Column(Numeric(10, 2))
    annual_rental_income = Column(Numeric(12, 2))
    
    # Property details
    bedrooms = Column(String)
    bathrooms = Column(String)
    property_size = Column(String)  # Square footage or size description
    
    # Rental information
    is_rental_property = Column(Boolean, default=False)
    tenant_name = Column(String)
    lease_start_date = Column(DateTime(timezone=True))
    lease_end_date = Column(DateTime(timezone=True))
    
    # Additional information
    description = Column(Text)
    notes = Column(Text)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    individual_relationships = relationship("PropertyIndividualRelationship", 
                                         back_populates="property",
                                         cascade="all, delete-orphan",
                                         lazy="selectin")
    
    def __repr__(self):
        return f"<Property(id={self.id}, name='{self.property_name}', type='{self.property_type}')>"
    
    @property
    def full_address(self):
        """Return the full address of the property"""
        parts = [self.address_line_1, self.address_line_2, self.town, self.county, self.post_code, self.country]
        return ", ".join([part for part in parts if part]) 