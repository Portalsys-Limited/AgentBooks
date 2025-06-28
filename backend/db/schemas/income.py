from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from db.models.income import IncomeType


# Base income schema
class IncomeBase(BaseModel):
    income_type: IncomeType
    income_amount: Decimal
    description: Optional[str] = None


# Income creation schema
class IncomeCreateRequest(BaseModel):
    customer_id: UUID
    income_type: IncomeType
    income_amount: Decimal
    description: Optional[str] = None


# Income update schema
class IncomeUpdateRequest(BaseModel):
    income_type: Optional[IncomeType] = None
    income_amount: Optional[Decimal] = None
    description: Optional[str] = None


# Income response schema
class IncomeResponse(IncomeBase):
    id: UUID
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Income list item schema
class IncomeListItem(BaseModel):
    id: UUID
    customer_id: UUID
    income_type: IncomeType
    income_amount: Decimal
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Base schemas for backward compatibility
class IncomeCreate(IncomeBase):
    customer_id: UUID


class IncomeUpdate(BaseModel):
    income_type: Optional[IncomeType] = None
    income_amount: Optional[Decimal] = None
    description: Optional[str] = None


class Income(IncomeBase):
    id: UUID
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 