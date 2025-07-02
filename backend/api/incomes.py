from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID

from config.database import get_db
from db.models import Income, Individual
from db.models.income import IncomeType
from db.schemas.income import (
    IncomeCreateRequest, IncomeUpdateRequest, IncomeResponse, IncomeListItem
)
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_income_enums():
    """Get all income-related enum values"""
    return {
        "income_types": [{"value": i.value, "label": i.value.replace("_", " ").title()} for i in IncomeType]
    }

@router.get("/enums/types", response_model=List[Dict[str, str]])
async def get_income_types():
    """Get all income type options"""
    return [{"value": i.value, "label": i.value.replace("_", " ").title()} for i in IncomeType]

@router.get("/individuals/{individual_id}/incomes", response_model=List[IncomeResponse])
async def get_individual_incomes(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all incomes for an individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Verify individual exists and belongs to practice
    individual = await db.execute(
        select(Individual).where(
            Individual.id == individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    individual = individual.scalar_one_or_none()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    
    # Get incomes
    query = select(Income).where(Income.individual_id == individual_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/individuals/{individual_id}/incomes", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    individual_id: UUID,
    request: IncomeCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new income for an individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Verify individual exists and belongs to practice
    individual = await db.execute(
        select(Individual).where(
            Individual.id == individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    individual = individual.scalar_one_or_none()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    
    # Create income
    income = Income(
        individual_id=individual_id,
        income_type=request.income_type,
        income_amount=request.income_amount,
        description=request.description
    )
    
    db.add(income)
    await db.commit()
    await db.refresh(income)
    return income

@router.put("/incomes/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: UUID,
    request: IncomeUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing income"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get income and verify it belongs to an individual in the practice
    query = (
        select(Income)
        .join(Individual)
        .where(
            Income.id == income_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    result = await db.execute(query)
    income = result.scalar_one_or_none()
    
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    
    # Update fields that are provided
    if request.income_type is not None:
        income.income_type = request.income_type
    if request.income_amount is not None:
        income.income_amount = request.income_amount
    if request.description is not None:
        income.description = request.description
    
    await db.commit()
    await db.refresh(income)
    return income

@router.delete("/incomes/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an income"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get income and verify it belongs to an individual in the practice
    query = (
        select(Income)
        .join(Individual)
        .where(
            Income.id == income_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    result = await db.execute(query)
    income = result.scalar_one_or_none()
    
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    
    await db.delete(income)
    await db.commit() 