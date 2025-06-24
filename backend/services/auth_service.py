from datetime import datetime, timedelta
from typing import Union, Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from config.settings import settings
from db.models import User, UserRole
from db.schemas.user import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def get_password_hash(password: str) -> str:
    """Get password hash (alias for hash_password)."""
    return hash_password(password)

async def authenticate_user(db: AsyncSession, email: str, password: str):
    """Authenticate a user with email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def create_user_token(user: User) -> str:
    """Create a token for a user."""
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    
    # For now, don't include client_ids in token to avoid relationship loading issues
    # This can be added later if needed with proper async relationship loading
    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": user.role.value,
        "practice_id": str(user.practice_id) if user.practice_id else None,
        "client_ids": []  # Empty for now
    }
    
    access_token = create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    return access_token

def verify_token(token: str) -> TokenData:
    """Verify and decode a JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        role_str: str = payload.get("role")
        practice_id: str = payload.get("practice_id")
        client_ids: list = payload.get("client_ids", [])
        
        if email is None or user_id is None:
            raise credentials_exception
            
        # Convert role string back to enum
        role = UserRole(role_str) if role_str else None
        
        # Convert client IDs back to UUIDs
        client_uuids = [UUID(cid) for cid in client_ids if cid]
        practice_uuid = UUID(practice_id) if practice_id else None
        user_uuid = UUID(user_id)
        
        token_data = TokenData(
            email=email,
            user_id=user_uuid,
            role=role,
            practice_id=practice_uuid,
            client_ids=client_uuids
        )
    except JWTError:
        raise credentials_exception
    return token_data 