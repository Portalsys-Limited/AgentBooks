from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from config.database import get_db
from db.models import Customer, ClientCompany, UserRole
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

class SearchResult:
    def __init__(self, id: str, name: str, type: str, email: Optional[str] = None, 
                 phone: Optional[str] = None, company_count: int = 0, business_type: Optional[str] = None):
        self.id = id
        self.name = name
        self.type = type  # 'customer' or 'client'
        self.email = email
        self.phone = phone
        self.company_count = company_count
        self.business_type = business_type

@router.get("/")
async def search_customers_and_clients(
    q: str = Query(..., description="Search query"),
    limit: int = Query(20, le=50, description="Maximum number of results"),
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search across customers (people) and clients (companies)."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to search customers and clients"
        )
    
    if not q or len(q.strip()) < 2:
        return {"customers": [], "clients": [], "total": 0}
    
    search_term = f"%{q.lower()}%"
    results = {"customers": [], "clients": [], "total": 0}
    
    # Search customers (people)
    customer_query = select(Customer).options(
        selectinload(Customer.client_companies)
    ).where(
        and_(
            Customer.practice_id == current_user.practice_id,
            or_(
                Customer.name.ilike(search_term),
                Customer.first_name.ilike(search_term),
                Customer.last_name.ilike(search_term),
                Customer.primary_email.ilike(search_term),
                Customer.secondary_email.ilike(search_term),
                Customer.primary_phone.ilike(search_term),
                Customer.secondary_phone.ilike(search_term),
                Customer.national_insurance_number.ilike(search_term),
                Customer.notes.ilike(search_term)
            )
        )
    ).limit(limit // 2)
    
    customer_result = await db.execute(customer_query)
    customers = customer_result.scalars().all()
    
    for customer in customers:
        results["customers"].append({
            "id": str(customer.id),
            "name": customer.name,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "email": customer.primary_email,
            "phone": customer.primary_phone,
            "type": "customer",
            "client_count": len(customer.client_companies),
            "created_at": customer.created_at.isoformat() if customer.created_at else None
        })
    
    # Search clients (companies)
    client_query = select(ClientCompany).options(
        selectinload(ClientCompany.customer)
    ).join(Customer).where(
        and_(
            Customer.practice_id == current_user.practice_id,
            or_(
                ClientCompany.business_name.ilike(search_term),
                ClientCompany.trading_name.ilike(search_term),
                ClientCompany.nature_of_business.ilike(search_term),
                ClientCompany.companies_house_number.ilike(search_term),
                ClientCompany.vat_number.ilike(search_term),
                ClientCompany.main_email.ilike(search_term),
                ClientCompany.main_phone.ilike(search_term),
                ClientCompany.notes.ilike(search_term)
            )
        )
    ).limit(limit // 2)
    
    client_result = await db.execute(client_query)
    clients = client_result.scalars().all()
    
    for client in clients:
        results["clients"].append({
            "id": str(client.id),
            "name": client.business_name,
            "trading_name": client.trading_name,
            "business_type": client.business_type.value if client.business_type else None,
            "email": client.main_email,
            "phone": client.main_phone,
            "type": "client",
            "customer_name": client.customer.name if client.customer else None,
            "customer_id": str(client.customer.id) if client.customer else None,
            "created_at": client.created_at.isoformat() if client.created_at else None
        })
    
    results["total"] = len(results["customers"]) + len(results["clients"])
    
    return results 