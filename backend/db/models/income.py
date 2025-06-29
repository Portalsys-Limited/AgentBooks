from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for Income Types
class IncomeType(str, enum.Enum):
    self_employment = "self_employment"
    employment = "employment"
    rental = "rental"
    dividend = "dividend"
    interest = "interest"
    foreign_income = "foreign_income"
    pension = "pension"
    child_benefit = "child_benefit"
    tax_universal_credits = "tax_universal_credits"
    other = "other"

class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign key to individual
    individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=False, index=True)
    
    # Income details
    income_type = Column(SQLEnum(IncomeType), nullable=False, index=True)
    income_amount = Column(Numeric(12, 2), nullable=False)  # Using Numeric for precise monetary values
    description = Column(String)  # Optional description
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    individual = relationship("Individual", back_populates="incomes")
    
    def __repr__(self):
        return f"<Income(id={self.id}, individual_id={self.individual_id}, type='{self.income_type}', amount={self.income_amount})>" 