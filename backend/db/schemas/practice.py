from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


# Practice schemas
class PracticeBase(BaseModel):
    name: str


class PracticeCreate(PracticeBase):
    pass


class Practice(PracticeBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 