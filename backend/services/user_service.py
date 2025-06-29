from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID

from db.models import User, Practice
from db.schemas.user import UserCreate, User as UserSchema
from services.auth_service import get_password_hash

async def create_user(db: AsyncSession, user_data: UserCreate):
    """Create a new user."""
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate practice if provided
    if user_data.practice_id:
        practice = await get_user_by_id(db, user_data.practice_id)
        if not practice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Practice not found"
            )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        practice_id=user_data.practice_id,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user

async def get_user_by_email(db: AsyncSession, email: str):
    """Get user by email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str):
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def get_users_by_practice(db: AsyncSession, practice_id: str):
    """Get all users for a practice."""
    result = await db.execute(
        select(User).where(User.practice_id == practice_id)
    )
    return result.scalars().all()

async def update_user(db: AsyncSession, user_id: str, user_data: dict):
    """Update user information."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    for key, value in user_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user_id: str):
    """Delete a user."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.delete(user)
    await db.commit()
    return True 