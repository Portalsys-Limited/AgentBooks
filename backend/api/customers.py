from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
import uuid

from config.database import get_db
from db.models import Customer, Practice, User, UserRole
from db.schemas import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/practice/{practice_id}")
async def get_customers_by_practice(
    practice_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all customers for a specific practice."""
    
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
    customers = db.query(Customer).filter(Customer.practice_id == practice_uuid).all()
    
    # Format response
    response = []
    for customer in customers:
        response.append({
            "id": str(customer.id),
            "name": customer.name,
            "practice_id": str(customer.practice_id),
            "created_at": customer.created_at.isoformat(),
            "updated_at": customer.updated_at.isoformat() if customer.updated_at else None,
            "client_companies": [
                {
                    "id": str(company.id),
                    "name": company.name,
                    "created_at": company.created_at.isoformat(),
                    "updated_at": company.updated_at.isoformat() if company.updated_at else None
                }
                for company in customer.client_companies
            ]
        })
    
    return response

@router.post("/")
async def create_customer(
    customer_data: dict,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        name=customer_data["name"],
        practice_id=current_user.practice_id
    )
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    return {
        "id": str(customer.id),
        "name": customer.name,
        "practice_id": str(customer.practice_id),
        "created_at": customer.created_at.isoformat(),
        "updated_at": customer.updated_at.isoformat() if customer.updated_at else None
    }

@router.put("/{customer_id}")
async def update_customer(
    customer_id: str,
    customer_data: dict,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
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
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.practice_id == current_user.practice_id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Update customer
    if "name" in customer_data:
        customer.name = customer_data["name"]
    
    db.commit()
    db.refresh(customer)
    
    return {
        "id": str(customer.id),
        "name": customer.name,
        "practice_id": str(customer.practice_id),
        "created_at": customer.created_at.isoformat(),
        "updated_at": customer.updated_at.isoformat() if customer.updated_at else None
    }

@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
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
    customer = db.query(Customer).filter(
        Customer.id == customer_uuid,
        Customer.practice_id == current_user.practice_id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Delete customer
    db.delete(customer)
    db.commit()
    
    return {"message": "Customer deleted successfully"} 