from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from config.database import get_db
from db.models import Customer, Practice, User, UserRole
from db.schemas.user import User as UserSchema
from db.schemas.customer import CustomerListItem, CustomerCreate
from api.users import get_current_user

router = APIRouter()

@router.get("/{customer_id}")
async def get_customer_details(
    customer_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a customer."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view customer details"
        )
    
    # Parse UUID
    try:
        customer_uuid = uuid.UUID(customer_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID format"
        )
    
    # Get customer with client companies relationship
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.client_companies))
        .where(Customer.id == customer_uuid)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check if user has access to this customer's practice
    if customer.practice_id != current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this customer"
        )
    
    return {
        "id": str(customer.id),
        "name": customer.name,
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "primary_email": customer.primary_email,
        "secondary_email": customer.secondary_email,
        "primary_phone": customer.primary_phone,
        "secondary_phone": customer.secondary_phone,
        "date_of_birth": customer.date_of_birth.isoformat() if customer.date_of_birth else None,
        "gender": customer.gender.value if customer.gender else None,
        "marital_status": customer.marital_status.value if customer.marital_status else None,
        "national_insurance_number": customer.national_insurance_number,
        "utr": customer.utr,
        "home_address": {
            "line_1": customer.home_address_line1,
            "line_2": customer.home_address_line2,
            "city": customer.home_city,
            "county": customer.home_county,
            "postcode": customer.home_postcode,
            "country": customer.home_country
        },
        "correspondence_address": {
            "line_1": customer.correspondence_address_line1,
            "line_2": customer.correspondence_address_line2,
            "city": customer.correspondence_city,
            "county": customer.correspondence_county,
            "postcode": customer.correspondence_postcode,
            "country": customer.correspondence_country
        },
        "banking": {
            "name": customer.bank_name,
            "sort_code": customer.bank_sort_code,
            "account_number": customer.bank_account_number,
            "account_name": customer.bank_account_name
        },
        "employment": {
            "employer_name": customer.employer_name,
            "job_title": customer.job_title,
            "employment_status": customer.employment_status
        },
        "emergency_contact": {
            "name": customer.emergency_contact_name,
            "relationship": customer.emergency_contact_relationship,
            "phone": customer.emergency_contact_phone,
            "email": None  # Not in model
        },
        "notes": customer.notes,
        "client_companies": [
            {
                "id": str(company.id),
                "business_name": company.business_name,
                "business_type": company.business_type.value if company.business_type else None
            }
            for company in customer.client_companies
        ] if customer.client_companies else [],
        "created_at": customer.created_at.isoformat() if customer.created_at else None,
        "updated_at": customer.updated_at.isoformat() if customer.updated_at else None
    }

@router.get("/practice/{practice_id}", response_model=List[CustomerListItem], status_code=status.HTTP_200_OK)
async def get_customers_by_practice(
    practice_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all customers for a specific practice with pagination."""
    
    # Parse UUID
    try:
        practice_uuid = uuid.UUID(practice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid practice ID format"
        )
    
    # Check if user belongs to this practice or is practice owner
    if (current_user.practice_id != practice_uuid and 
        current_user.role != UserRole.practice_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this practice's customers"
        )
    
    # Get customers for the practice
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.client_companies))
        .where(Customer.practice_id == practice_uuid)
        .offset(skip)
        .limit(limit)
    )
    customers = result.scalars().all()
    return customers

@router.post("/", response_model=CustomerListItem, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new customer (Practice Owner and Accountant only)."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create customers"
        )
    
    # Create customer
    customer = Customer(
        name=customer_data.name,
        practice_id=current_user.practice_id
    )
    
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    
    return customer

@router.put("/{customer_id}", response_model=CustomerListItem, status_code=status.HTTP_200_OK)
async def update_customer(
    customer_id: str,
    customer_data: CustomerCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a customer (Practice Owner and Accountant only)."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update customers"
        )
    
    # Parse UUID
    try:
        customer_uuid = uuid.UUID(customer_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID format"
        )
    
    # Get customer
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_uuid,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Update customer
    customer.name = customer_data.name
    
    await db.commit()
    await db.refresh(customer)
    
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a customer (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete customers"
        )
    
    # Parse UUID
    try:
        customer_uuid = uuid.UUID(customer_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid customer ID format"
        )
    
    # Get customer
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_uuid,
            Customer.practice_id == current_user.practice_id
        )
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Delete customer
    await db.delete(customer)
    await db.commit()
    
    return None 