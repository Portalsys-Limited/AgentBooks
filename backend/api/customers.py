from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID
import logging

from config.database import get_db
from db.models import Customer, Individual, Income, Property, CustomerClientAssociation
from db.models.customer import CustomerStatus, MLRStatus
from db.schemas.customer import (
    CustomerCreateRequest, CustomerUpdateRequest,
    CustomerResponse, CustomerListItem
)
from db.schemas.income import IncomeCreateRequest, IncomeUpdateRequest, IncomeResponse
from db.schemas.property import PropertyCreateRequest, PropertyUpdateRequest, PropertyResponse
from db.schemas.customer_client_association import (
    CustomerClientAssociationCreate, CustomerClientAssociationUpdate, 
    CustomerClientAssociationWithClient
)
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter(tags=["customers"])

@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_customer_enums():
    """Get all customer-related enum values"""
    return {
        "customer_statuses": [{"value": c.value, "label": c.value.replace("_", " ").title()} for c in CustomerStatus],
        "mlr_statuses": [{"value": m.value, "label": m.value.replace("_", " ").title()} for m in MLRStatus]
    }

@router.get("/enums/statuses", response_model=List[Dict[str, str]])
async def get_customer_statuses():
    """Get all customer status options"""
    return [{"value": c.value, "label": c.value.replace("_", " ").title()} for c in CustomerStatus]

@router.get("/enums/mlr-statuses", response_model=List[Dict[str, str]])
async def get_mlr_statuses():
    """Get all MLR status options"""
    return [{"value": m.value, "label": m.value.replace("_", " ").title()} for m in MLRStatus]

@router.get("/", response_model=List[CustomerListItem])
async def get_customers(
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all customers for current user's practice"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Customer).options(
        selectinload(Customer.individual).selectinload(Individual.incomes),
        selectinload(Customer.individual).selectinload(Individual.properties)
    ).filter(Customer.practice_id == current_user.practice_id)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer by ID with all related data"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # First check if customer exists at all
    exists_query = select(Customer).filter(Customer.id == customer_id)
    exists_result = await db.execute(exists_query)
    customer_exists = exists_result.scalar_one_or_none()
    
    # Load all relationships in a single query with joined loading
    customer_query = (
        select(Customer)
        .options(
            selectinload(Customer.individual).selectinload(Individual.incomes),
            selectinload(Customer.individual).selectinload(Individual.properties),
            selectinload(Customer.client_associations).selectinload(CustomerClientAssociation.client),
            selectinload(Customer.primary_accounting_contact),
            selectinload(Customer.last_edited_by),
            selectinload(Customer.sa_client_relation)
        )
        .filter(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    
    customer_result = await db.execute(customer_query)
    customer = customer_result.unique().scalar_one_or_none()
    
    if not customer:
        # Create detailed debug message for the exception
        debug_info = {
            "customer_id": str(customer_id),
            "customer_exists": customer_exists is not None,
            "user_practice_id": str(current_user.practice_id) if current_user.practice_id else None,
            "customer_practice_id": str(customer_exists.practice_id) if customer_exists else None,
            "practice_match": customer_exists.practice_id == current_user.practice_id if customer_exists else False
        }
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Customer not found. Debug info: {debug_info}"
        )
    
    return customer


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    request: CustomerCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new customer with either new individual or existing individual"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    individual_id = None
    
    # Handle individual creation or selection
    if request.individual_data and request.individual_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either individual_id or individual_data, not both"
        )
    
    if request.individual_data:
        # Create new individual
        individual_data = {
            "practice_id": current_user.practice_id,
            **request.individual_data.personal_info.dict(),
            **(request.individual_data.contact_info.dict() if request.individual_data.contact_info else {}),
            **(request.individual_data.address.dict() if request.individual_data.address else {}),
            **(request.individual_data.personal_details.dict() if request.individual_data.personal_details else {})
        }
        individual = Individual(**individual_data)
        db.add(individual)
        await db.flush()
        individual_id = individual.id
    elif request.individual_id:
        # Use existing individual - verify it belongs to the same practice
        individual_query = select(Individual).filter(
            Individual.id == request.individual_id,
            Individual.practice_id == current_user.practice_id
        )
        individual_result = await db.execute(individual_query)
        individual = individual_result.scalars().first()
        if not individual:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Individual not found")
        individual_id = request.individual_id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Either individual_id or individual_data must be provided"
        )
    
    # Create customer data
    customer_data = {
        "individual_id": individual_id,
        "practice_id": current_user.practice_id,
        "ni_number": request.ni_number,
        "personal_utr_number": request.personal_utr_number,
        "status": request.status,
        "do_they_own_sa": request.do_they_own_sa,
        "sa_client_relation_id": request.sa_client_relation_id,
        "comments": request.comments,
        "notes": request.notes,
    }
    
    # Add practice info
    if request.practice_info:
        customer_data.update({
            "primary_accounting_contact_id": request.practice_info.primary_accounting_contact_id,
            "acting_from": request.practice_info.acting_from,
        })
    
    # Add MLR info
    if request.mlr_info:
        customer_data.update({
            "mlr_status": request.mlr_info.status,
            "mlr_date_complete": request.mlr_info.date_complete,
            "passport_number": request.mlr_info.passport_number,
            "driving_license": request.mlr_info.driving_license,
            "uk_home_telephone": request.mlr_info.uk_home_telephone,
        })
    
    customer = Customer(**{k: v for k, v in customer_data.items() if v is not None})
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    request: CustomerUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update customer (basic info only - use separate routes for relations)"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    customer_query = select(Customer).filter(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    customer_result = await db.execute(customer_query)
    customer = customer_result.scalars().first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Update basic fields
    update_data = {}
    basic_fields = ["ni_number", "personal_utr_number", "status", "do_they_own_sa", 
                   "sa_client_relation_id", "comments", "notes"]
    
    for field in basic_fields:
        value = getattr(request, field)
        if value is not None:
            update_data[field] = value
    
    # Update practice info
    if request.practice_info:
        if request.practice_info.primary_accounting_contact_id is not None:
            update_data["primary_accounting_contact_id"] = request.practice_info.primary_accounting_contact_id
        if request.practice_info.acting_from is not None:
            update_data["acting_from"] = request.practice_info.acting_from
    
    # Update MLR info
    if request.mlr_info:
        mlr_fields = {
            "status": "mlr_status",
            "date_complete": "mlr_date_complete", 
            "passport_number": "passport_number",
            "driving_license": "driving_license",
            "uk_home_telephone": "uk_home_telephone"
        }
        for req_field, db_field in mlr_fields.items():
            value = getattr(request.mlr_info, req_field)
            if value is not None:
                update_data[db_field] = value
    
    # Apply updates
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete customer"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    customer_query = select(Customer).filter(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    customer_result = await db.execute(customer_query)
    customer = customer_result.scalars().first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    await db.delete(customer)
    await db.commit()


# === CUSTOMER RELATIONS MANAGEMENT ===

@router.get("/{customer_id}/incomes", response_model=List[IncomeResponse])
async def get_customer_incomes(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all incomes for a customer's individual"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    result = await db.execute(
        select(Income).where(Income.individual_id == customer.individual_id)
    )
    return result.scalars().all()


@router.post("/{customer_id}/incomes", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_income(
    customer_id: UUID,
    request: IncomeCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add income to customer's individual"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Override individual_id from customer's individual
    income_data = request.dict()
    income_data["individual_id"] = customer.individual_id
    
    income = Income(**income_data)
    db.add(income)
    await db.commit()
    await db.refresh(income)
    return income


@router.get("/{customer_id}/properties", response_model=List[PropertyResponse])
async def get_customer_properties(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all properties for a customer's individual"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    result = await db.execute(
        select(Property).where(Property.individual_id == customer.individual_id)
    )
    return result.scalars().all()


@router.post("/{customer_id}/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_property(
    customer_id: UUID,
    request: PropertyCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add property to customer's individual"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Override individual_id from customer's individual
    property_data = request.dict()
    property_data["individual_id"] = customer.individual_id
    
    property_obj = Property(**property_data)
    db.add(property_obj)
    await db.commit()
    await db.refresh(property_obj)
    return property_obj


@router.get("/{customer_id}/client-associations", response_model=List[CustomerClientAssociationWithClient])
async def get_customer_client_associations(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all client associations for a customer"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Load associations with joined client data
    stmt = (
        select(CustomerClientAssociation)
        .options(selectinload(CustomerClientAssociation.client))
        .where(CustomerClientAssociation.customer_id == customer_id)
    )
    result = await db.execute(stmt)
    associations = result.unique().scalars().all()
    
    return associations


@router.post("/{customer_id}/client-associations", response_model=CustomerClientAssociationWithClient, status_code=status.HTTP_201_CREATED)
async def create_customer_client_association(
    customer_id: UUID,
    request: CustomerClientAssociationCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add client association to customer"""
    # Verify customer exists and belongs to practice
    customer = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = customer.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Override customer_id from URL
    association_data = request.dict()
    association_data["customer_id"] = customer_id
    
    association = CustomerClientAssociation(**association_data)
    db.add(association)
    await db.commit()
    await db.refresh(association)
    return association 