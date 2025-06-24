from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from db.models import UserRole

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str
    practice_id: Optional[UUID] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: UUID
    practice_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserInDB(User):
    password_hash: str

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

# Customer schemas
class CustomerBase(BaseModel):
    name: str

class CustomerCreate(CustomerBase):
    practice_id: UUID

class Customer(CustomerBase):
    id: UUID
    practice_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

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

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[UUID] = None
    role: Optional[UserRole] = None
    practice_id: Optional[UUID] = None
    client_ids: List[UUID] = [] 