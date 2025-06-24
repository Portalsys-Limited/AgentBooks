from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


# Client Company schemas
class ClientCompanyBase(BaseModel):
    name: str


class ClientCompanyCreate(ClientCompanyBase):
    customer_id: UUID


class ClientCompany(ClientCompanyBase):
    id: UUID
    customer_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 