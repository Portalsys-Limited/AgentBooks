from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID

from config.database import get_db
from db.models import Individual, Income, PropertyIndividualRelationship
from db.models.individuals import Gender, MaritalStatus
from db.models.individual_relationship import IndividualRelationship, IndividualRelationType
from db.schemas import (
    IndividualCreateRequest, IndividualUpdateRequest, 
    IndividualResponse, IndividualListItem
)
from db.schemas.income import IncomeCreateRequest, IncomeResponse, IncomeUpdateRequest
from db.schemas.individual_relationship import (
    IndividualRelationshipCreate, IndividualRelationshipUpdate,
    IndividualRelationshipResponse
)
from db.schemas.property_individual_relationship import PropertyIndividualRelationshipWithProperty
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()


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
        # Map address fields to database fields
        address_data = request.address.dict(exclude_unset=True)
        if 'line_1' in address_data:
            address_data['address_line_1'] = address_data.pop('line_1')
        if 'line_2' in address_data:
            address_data['address_line_2'] = address_data.pop('line_2')
        update_data.update(address_data)
    if request.personal_details:
        update_data.update(request.personal_details.dict(exclude_unset=True))
    
    # Log the update data
    print(f"Updating individual {individual_id} with data: {update_data}")
    
    for field, value in update_data.items():
        setattr(individual, field, value)
    
    try:
        await db.commit()
        await db.refresh(individual)
        print(f"Successfully updated individual {individual_id}")
        return individual
    except Exception as e:
        print(f"Error updating individual {individual_id}: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


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


@router.get("/{individual_id}/incomes", response_model=List[IncomeResponse])
async def get_individual_incomes(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all incomes for an individual"""
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
    
    result = await db.execute(
        select(Income).where(Income.individual_id == individual_id)
    )
    return result.scalars().all()


@router.post("/{individual_id}/incomes", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_individual_income(
    individual_id: UUID,
    request: IncomeCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add income to individual"""
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
    
    # Override individual_id from URL
    income_data = request.dict()
    income_data["individual_id"] = individual_id
    
    income = Income(**income_data)
    db.add(income)
    await db.commit()
    await db.refresh(income)
    return income


@router.get("/{individual_id}/properties", response_model=List[PropertyIndividualRelationshipWithProperty])
async def get_individual_properties(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all property relationships for an individual"""
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
    
    # Get property relationships with property details
    result = await db.execute(
        select(PropertyIndividualRelationship)
        .options(selectinload(PropertyIndividualRelationship.property))
        .where(PropertyIndividualRelationship.individual_id == individual_id)
    )
    return result.scalars().all()


@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_individual_enums():
    """Get all individual-related enum values"""
    return {
        "genders": [{"value": g.value, "label": g.value} for g in Gender],
        "marital_statuses": [{"value": m.value, "label": m.value.replace("_", " ").title()} for m in MaritalStatus]
    }


@router.get("/enums/genders", response_model=List[Dict[str, str]])
async def get_genders():
    """Get all gender options"""
    return [{"value": g.value, "label": g.value} for g in Gender]


@router.get("/enums/marital-statuses", response_model=List[Dict[str, str]])
async def get_marital_statuses():
    """Get all marital status options"""
    return [{"value": m.value, "label": m.value.replace("_", " ").title()} for m in MaritalStatus]


@router.get("/{individual_id}/relationships", response_model=List[IndividualRelationshipResponse])
async def get_individual_relationships(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all relationships for an individual (both from and to)"""
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
    
    # Get relationships where individual is either the from or to person
    query = select(IndividualRelationship).where(
        (IndividualRelationship.from_individual_id == individual_id) |
        (IndividualRelationship.to_individual_id == individual_id)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{individual_id}/relationships", response_model=IndividualRelationshipResponse)
async def create_individual_relationship(
    individual_id: UUID,
    request: IndividualRelationshipCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new relationship from this individual to another"""
    # Verify both individuals exist and belong to practice
    from_individual = await db.execute(
        select(Individual).where(
            Individual.id == individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    from_individual = from_individual.scalar_one_or_none()
    if not from_individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="From individual not found")
    
    to_individual = await db.execute(
        select(Individual).where(
            Individual.id == request.to_individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    to_individual = to_individual.scalar_one_or_none()
    if not to_individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="To individual not found")
    
    # Create relationship
    relationship = IndividualRelationship(
        from_individual_id=individual_id,
        to_individual_id=request.to_individual_id,
        relationship_type=request.relationship_type,
        description=request.description,
        practice_id=current_user.practice_id
    )
    db.add(relationship)
    await db.commit()
    await db.refresh(relationship)
    return relationship


@router.put("/{individual_id}/relationships/{relationship_id}", response_model=IndividualRelationshipResponse)
async def update_individual_relationship(
    individual_id: UUID,
    relationship_id: UUID,
    request: IndividualRelationshipUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing relationship"""
    # Verify relationship exists and belongs to the individual
    query = select(IndividualRelationship).where(
        IndividualRelationship.id == relationship_id,
        IndividualRelationship.practice_id == current_user.practice_id,
        (
            (IndividualRelationship.from_individual_id == individual_id) |
            (IndividualRelationship.to_individual_id == individual_id)
        )
    )
    result = await db.execute(query)
    relationship = result.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    # Update relationship
    relationship.relationship_type = request.relationship_type
    relationship.description = request.description
    
    await db.commit()
    await db.refresh(relationship)
    return relationship


@router.delete("/{individual_id}/relationships/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_individual_relationship(
    individual_id: UUID,
    relationship_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a relationship"""
    # Verify relationship exists and belongs to the individual
    query = select(IndividualRelationship).where(
        IndividualRelationship.id == relationship_id,
        IndividualRelationship.practice_id == current_user.practice_id,
        (
            (IndividualRelationship.from_individual_id == individual_id) |
            (IndividualRelationship.to_individual_id == individual_id)
        )
    )
    result = await db.execute(query)
    relationship = result.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    await db.delete(relationship)
    await db.commit()


@router.get("/enums/relationship-types", response_model=List[Dict[str, str]])
async def get_relationship_types():
    """Get all relationship type options"""
    return [{"value": r.value, "label": r.value.replace("_", " ").title()} for r in IndividualRelationType]


@router.put("/{individual_id}/incomes/{income_id}", response_model=IncomeResponse)
async def update_individual_income(
    individual_id: UUID,
    income_id: UUID,
    request: IncomeUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an income record for an individual"""
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
    
    # Get the income record
    income = await db.execute(
        select(Income).where(
            Income.id == income_id,
            Income.individual_id == individual_id
        )
    )
    income = income.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
    
    # Update income fields
    for field, value in request.dict(exclude_unset=True).items():
        setattr(income, field, value)
    
    await db.commit()
    await db.refresh(income)
    return income


@router.delete("/{individual_id}/incomes/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_individual_income(
    individual_id: UUID,
    income_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an income record for an individual"""
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
    
    # Get the income record
    income = await db.execute(
        select(Income).where(
            Income.id == income_id,
            Income.individual_id == individual_id
        )
    )
    income = income.scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
    
    # Delete the income record
    await db.delete(income)
    await db.commit() 