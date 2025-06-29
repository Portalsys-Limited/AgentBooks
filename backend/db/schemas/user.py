from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from db.models import UserRole


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    practice_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserListItem(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    practice_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class User(UserBase):
    id: UUID
    practice_id: Optional[UUID] = None
    full_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(User):
    password_hash: str


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