from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from config.settings import settings
from db.models import User, UserRole
from db.schemas import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

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
        role: str = payload.get("role")
        practice_id: str = payload.get("practice_id")
        client_ids: List[str] = payload.get("client_ids", [])
        
        if email is None:
            raise credentials_exception
            
        token_data = TokenData(
            email=email,
            user_id=UUID(user_id) if user_id else None,
            role=UserRole(role) if role else None,
            practice_id=UUID(practice_id) if practice_id else None,
            client_ids=[UUID(cid) for cid in client_ids]
        )
        return token_data
    except JWTError:
        raise credentials_exception

def create_user_token(user: User) -> str:
    """Create a token for a specific user with their role and assignments."""
    # Get assigned client IDs for the user
    client_ids = [str(client.id) for client in user.assigned_clients]
    
    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": user.role.value,
        "practice_id": str(user.practice_id) if user.practice_id else None,
        "client_ids": client_ids
    }
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    return access_token 