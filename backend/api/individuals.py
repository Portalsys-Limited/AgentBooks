from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from config.database import get_db
from db.models import Individual
from db.schemas import (
    IndividualCreateRequest, IndividualUpdateRequest, 
    IndividualResponse, IndividualListItem
)
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter(tags=["individuals"])


@router.get("/", response_model=List[IndividualListItem])
async def get_individuals(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all individuals for current user's practice"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Individual).filter(Individual.practice_id == current_user.practice_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{individual_id}", response_model=IndividualResponse)
async def get_individual(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get individual by ID"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Individual).filter(
        Individual.id == individual_id,
        Individual.practice_id == current_user.practice_id
    )
    result = await db.execute(query)
    individual = result.scalars().first()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    return individual


@router.post("/", response_model=IndividualResponse, status_code=status.HTTP_201_CREATED)
async def create_individual(
    request: IndividualCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Flatten nested request data
    individual_data = {
        "practice_id": current_user.practice_id,
        **request.personal_info.dict(),
        **(request.contact_info.dict() if request.contact_info else {}),
        **(request.address.dict() if request.address else {}),
        **(request.personal_details.dict() if request.personal_details else {})
    }
    
    individual = Individual(**individual_data)
    db.add(individual)
    await db.commit()
    await db.refresh(individual)
    return individual


@router.put("/{individual_id}", response_model=IndividualResponse)
async def update_individual(
    individual_id: UUID,
    request: IndividualUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Individual).filter(
        Individual.id == individual_id,
        Individual.practice_id == current_user.practice_id
    )
    result = await db.execute(query)
    individual = result.scalars().first()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    
    # Update only provided fields
    update_data = {}
    if request.personal_info:
        update_data.update(request.personal_info.dict(exclude_unset=True))
    if request.contact_info:
        update_data.update(request.contact_info.dict(exclude_unset=True))
    if request.address:
        update_data.update(request.address.dict(exclude_unset=True))
    if request.personal_details:
        update_data.update(request.personal_details.dict(exclude_unset=True))
    
    for field, value in update_data.items():
        setattr(individual, field, value)
    
    await db.commit()
    await db.refresh(individual)
    return individual


@router.delete("/{individual_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_individual(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Individual).filter(
        Individual.id == individual_id,
        Individual.practice_id == current_user.practice_id
    )
    result = await db.execute(query)
    individual = result.scalars().first()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    
    await db.delete(individual)
    await db.commit() 