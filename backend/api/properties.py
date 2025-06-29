from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID
from decimal import Decimal

from config.database import get_db
from db.models import Property, Individual, PropertyIndividualRelationship
from db.models.property import PropertyType, PropertyStatus
from db.models.property_individual_relationship import OwnershipType
from db.schemas.property import (
    PropertyCreateRequest,
    PropertyUpdateRequest,
    PropertyResponse,
    PropertyListItem
)
from db.schemas.property_individual_relationship import (
    PropertyIndividualRelationshipCreate,
    PropertyIndividualRelationshipUpdate,
    PropertyIndividualRelationshipResponse,
    PropertyIndividualRelationshipWithProperty,
    PropertyIndividualRelationshipWithIndividual
)
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_property_enums():
    """Get all property-related enum values"""
    return {
        "property_types": [{"value": p.value, "label": p.value.replace("_", " ").title()} for p in PropertyType],
        "property_statuses": [{"value": s.value, "label": s.value.replace("_", " ").title()} for s in PropertyStatus],
        "ownership_types": [{"value": t.value, "label": t.value.replace("_", " ").title()} for t in OwnershipType]
    }

@router.get("/enums/types", response_model=List[Dict[str, str]])
async def get_property_types():
    """Get all property type options"""
    return [{"value": p.value, "label": p.value.replace("_", " ").title()} for p in PropertyType]

@router.get("/enums/statuses", response_model=List[Dict[str, str]])
async def get_property_statuses():
    """Get all property status options"""
    return [{"value": s.value, "label": s.value.replace("_", " ").title()} for s in PropertyStatus]

@router.get("/enums/ownership-types", response_model=List[Dict[str, str]])
async def get_ownership_types():
    """Get all ownership type options"""
    return [{"value": t.value, "label": t.value.replace("_", " ").title()} for t in OwnershipType]

@router.get("/{property_id}/relationships", response_model=List[PropertyIndividualRelationshipWithIndividual])
async def get_property_relationships(
    property_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all relationships for a property"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get relationships with individuals
    query = select(PropertyIndividualRelationship).where(
        PropertyIndividualRelationship.property_id == property_id
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/individuals/{individual_id}/relationships", response_model=List[PropertyIndividualRelationshipWithProperty])
async def get_individual_property_relationships(
    individual_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all property relationships for an individual"""
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
    
    # Get relationships with properties
    query = select(PropertyIndividualRelationship).where(
        PropertyIndividualRelationship.individual_id == individual_id
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{property_id}/relationships", response_model=PropertyIndividualRelationshipResponse)
async def create_property_relationship(
    property_id: UUID,
    relationship_data: PropertyIndividualRelationshipCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new relationship between a property and an individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Verify individual exists and belongs to practice
    individual = await db.execute(
        select(Individual).where(
            Individual.id == relationship_data.individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    individual = individual.scalar_one_or_none()
    if not individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
    
    # Check if relationship already exists
    existing_result = await db.execute(
        select(PropertyIndividualRelationship).where(
            PropertyIndividualRelationship.property_id == property_id,
            PropertyIndividualRelationship.individual_id == relationship_data.individual_id,
            PropertyIndividualRelationship.ownership_type == relationship_data.ownership_type
        )
    )
    existing_relationship = existing_result.scalar_one_or_none()
    if existing_relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Relationship between this property and individual with ownership type '{relationship_data.ownership_type}' already exists"
        )
    
    # Check if trying to set as primary owner and another primary owner already exists
    if relationship_data.is_primary_owner:
        existing_primary_result = await db.execute(
            select(PropertyIndividualRelationship).where(
                PropertyIndividualRelationship.property_id == property_id,
                PropertyIndividualRelationship.is_primary_owner == True
            )
        )
        existing_primary = existing_primary_result.scalar_one_or_none()
        if existing_primary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This property already has a primary owner. Please remove the existing primary owner designation first."
            )
    
    # Create the relationship
    relationship = PropertyIndividualRelationship(
        property_id=property_id,
        individual_id=relationship_data.individual_id,
        ownership_type=relationship_data.ownership_type,
        ownership_percentage=relationship_data.ownership_percentage,
        start_date=relationship_data.start_date,
        end_date=relationship_data.end_date,
        is_primary_owner=relationship_data.is_primary_owner or False,
        description=relationship_data.description,
        notes=relationship_data.notes
    )
    
    db.add(relationship)
    await db.commit()
    await db.refresh(relationship)
    return relationship

@router.put("/{property_id}/relationships/{relationship_id}", response_model=PropertyIndividualRelationshipResponse)
async def update_property_relationship(
    property_id: UUID,
    relationship_id: UUID,
    relationship_data: PropertyIndividualRelationshipUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing property-individual relationship"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get the relationship
    relationship = await db.execute(
        select(PropertyIndividualRelationship).where(
            PropertyIndividualRelationship.id == relationship_id,
            PropertyIndividualRelationship.property_id == property_id
        )
    )
    relationship = relationship.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    # Check if trying to set as primary owner and another primary owner already exists
    if relationship_data.is_primary_owner is not None and relationship_data.is_primary_owner:
        existing_primary_result = await db.execute(
            select(PropertyIndividualRelationship).where(
                PropertyIndividualRelationship.property_id == property_id,
                PropertyIndividualRelationship.is_primary_owner == True,
                PropertyIndividualRelationship.id != relationship_id
            )
        )
        existing_primary = existing_primary_result.scalar_one_or_none()
        if existing_primary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This property already has a primary owner. Please remove the existing primary owner designation first."
            )
    
    # Update fields that are provided
    if relationship_data.ownership_type is not None:
        relationship.ownership_type = relationship_data.ownership_type
    if relationship_data.ownership_percentage is not None:
        relationship.ownership_percentage = relationship_data.ownership_percentage
    if relationship_data.start_date is not None:
        relationship.start_date = relationship_data.start_date
    if relationship_data.end_date is not None:
        relationship.end_date = relationship_data.end_date
    if relationship_data.is_primary_owner is not None:
        relationship.is_primary_owner = relationship_data.is_primary_owner
    if relationship_data.description is not None:
        relationship.description = relationship_data.description
    if relationship_data.notes is not None:
        relationship.notes = relationship_data.notes
    
    await db.commit()
    await db.refresh(relationship)
    return relationship

@router.delete("/{property_id}/relationships/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property_relationship(
    property_id: UUID,
    relationship_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a property-individual relationship"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get the relationship
    relationship = await db.execute(
        select(PropertyIndividualRelationship).where(
            PropertyIndividualRelationship.id == relationship_id,
            PropertyIndividualRelationship.property_id == property_id
        )
    )
    relationship = relationship.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    await db.delete(relationship)
    await db.commit()

@router.get("/", response_model=List[PropertyListItem])
async def get_properties(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all properties"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get properties that belong to individuals in the user's practice
    query = (
        select(Property)
        .join(PropertyIndividualRelationship)
        .join(Individual)
        .where(Individual.practice_id == current_user.practice_id)
        .distinct()
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get property by ID"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get property with relationships
    query = (
        select(Property)
        .join(PropertyIndividualRelationship)
        .join(Individual)
        .where(
            Property.id == property_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    result = await db.execute(query)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    
    return property

@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    request: PropertyCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new property"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Create property
    property_data = request.dict()
    property = Property(**property_data)
    db.add(property)
    await db.commit()
    await db.refresh(property)
    return property

@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    request: PropertyUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a property"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get property and verify it belongs to the practice through individual
    property_query = (
        select(Property)
        .join(PropertyIndividualRelationship)
        .join(Individual)
        .where(
            Property.id == property_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    result = await db.execute(property_query)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    
    # Update fields that are provided
    for field, value in request.dict(exclude_unset=True).items():
        setattr(property, field, value)
    
    await db.commit()
    await db.refresh(property)
    return property

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a property"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get property and verify it belongs to the practice through individual relationship
    property_query = (
        select(Property)
        .join(PropertyIndividualRelationship)
        .join(Individual)
        .where(
            Property.id == property_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    result = await db.execute(property_query)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    
    await db.delete(property)
    await db.commit() 