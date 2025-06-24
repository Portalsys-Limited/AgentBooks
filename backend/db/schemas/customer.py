from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Customer schemas
class CustomerBase(BaseModel):
    name: str


class CustomerCreate(CustomerBase):
    practice_id: UUID


class CustomerListItem(BaseModel):
    id: UUID
    name: str
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Customer(CustomerBase):
    id: UUID
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 