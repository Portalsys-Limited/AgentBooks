from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from config.database import get_db
from db.schemas.user import User, TokenData, UserListItem, UserCreate
from db.models import User as UserModel, UserRole
from services.auth_service import verify_token
from services.user_service import get_user_by_id

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    token_data = verify_token(token)
    user = await get_user_by_id(db, token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.get("/me", response_model=User, status_code=status.HTTP_200_OK)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

@router.get("/me/token-data", status_code=status.HTTP_200_OK)
async def get_token_data(token: str = Depends(oauth2_scheme)):
    """Get decoded token data for debugging/frontend use."""
    token_data = verify_token(token)
    return {
        "user_id": str(token_data.user_id),
        "email": token_data.email,
        "role": token_data.role.value if token_data.role else None,
        "practice_id": str(token_data.practice_id) if token_data.practice_id else None,
        "client_ids": [str(cid) for cid in token_data.client_ids]
    }

@router.get("/", response_model=List[UserListItem], status_code=status.HTTP_200_OK)
async def get_users_for_current_practice(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all users for the current user's practice (Practice Owner only) with pagination."""
    
    # Check permissions - only practice owners can view all users
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access practice users"
        )
    
    if not current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a practice"
        )
    
    # Get users for the practice
    result = await db.execute(
        select(UserModel)
        .where(UserModel.practice_id == current_user.practice_id)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return users

@router.get("/practice/{practice_id}", response_model=List[UserListItem], status_code=status.HTTP_200_OK)
async def get_users_by_practice(
    practice_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all users for a specific practice (Practice Owner only) with pagination."""
    
    # Parse UUID
    try:
        practice_uuid = uuid.UUID(practice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid practice ID format"
        )
    
    # Check permissions - only practice owners can view all users
    if (current_user.role != UserRole.practice_owner or 
        current_user.practice_id != practice_uuid):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this practice's users"
        )
    
    # Get users for the practice
    result = await db.execute(
        select(UserModel)
        .where(UserModel.practice_id == practice_uuid)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return users

@router.post("/", response_model=UserListItem, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create users"
        )
    
    # Check if email already exists
    result = await db.execute(
        select(UserModel).where(UserModel.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with default password (should be changed on first login)
    from services.auth_service import hash_password
    
    user = UserModel(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        practice_id=current_user.practice_id
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@router.put("/{user_id}", response_model=UserListItem, status_code=status.HTTP_200_OK)
async def update_user(
    user_id: str,
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update users"
        )
    
    # Parse UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Get user
    result = await db.execute(
        select(UserModel).where(
            UserModel.id == user_uuid,
            UserModel.practice_id == current_user.practice_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    user.role = user_data.role
    user.email = user_data.email
    user.first_name = user_data.first_name
    user.last_name = user_data.last_name
    
    # Update password if provided
    if user_data.password:
        from services.auth_service import hash_password
        user.password_hash = hash_password(user_data.password)
    
    await db.commit()
    await db.refresh(user)
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete users"
        )
    
    # Parse UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Get user
    result = await db.execute(
        select(UserModel).where(
            UserModel.id == user_uuid,
            UserModel.practice_id == current_user.practice_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    await db.delete(user)
    await db.commit()
    
    return None 