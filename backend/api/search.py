from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from config.database import get_db
from db.models import Customer, Client, Individual, UserRole
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
    search_customers: bool = Query(True, description="Include customers in search results"),
    search_clients: bool = Query(True, description="Include clients in search results"),
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search across customers (people) and clients (companies) with optional filtering.
    
    Args:
        q: Search query string (minimum 2 characters)
        limit: Maximum number of results to return (max 50)
        search_customers: Include customers in search results (default: True)
        search_clients: Include clients in search results (default: True)
        
    Returns:
        Dictionary with 'customers', 'clients' arrays and 'total' count
        
    Examples:
        - GET /search/?q=john&search_customers=true&search_clients=false (customers only)
        - GET /search/?q=ltd&search_customers=false&search_clients=true (clients only)
        - GET /search/?q=patel (both customers and clients - default)
    """
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to search customers and clients"
        )
    
    # Validate search parameters
    if not search_customers and not search_clients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of search_customers or search_clients must be true"
        )
    
    if not q or len(q.strip()) < 2:
        return {"customers": [], "clients": [], "total": 0}
    
    search_term = f"%{q.lower()}%"
    results = {"customers": [], "clients": [], "total": 0}
    
    # Determine limits based on what's being searched
    customer_limit = limit if search_customers and not search_clients else (limit // 2 if search_customers else 0)
    client_limit = limit if search_clients and not search_customers else (limit // 2 if search_clients else 0)
    
    # Search customers (people) if enabled
    if search_customers:
        customer_query = select(Customer).options(
            selectinload(Customer.individual),
            selectinload(Customer.client_associations)
        ).join(Individual, Customer.individual_id == Individual.id).where(
            and_(
                Customer.practice_id == current_user.practice_id,
                or_(
                    Individual.first_name.ilike(search_term),
                    Individual.middle_name.ilike(search_term),
                    Individual.last_name.ilike(search_term),
                    Individual.email.ilike(search_term),
                    Individual.secondary_email.ilike(search_term),
                    Individual.primary_mobile.ilike(search_term),
                    Individual.secondary_mobile.ilike(search_term),
                    Customer.ni_number.ilike(search_term),
                    Customer.personal_utr_number.ilike(search_term),
                    Customer.notes.ilike(search_term),
                    Customer.comments.ilike(search_term)
                )
            )
        ).limit(customer_limit)
        
        customer_result = await db.execute(customer_query)
        customers = customer_result.scalars().all()
        
        for customer in customers:
            results["customers"].append({
                "id": str(customer.id),
                "name": customer.individual.full_name if customer.individual else "",
                "first_name": customer.individual.first_name if customer.individual else "",
                "last_name": customer.individual.last_name if customer.individual else "",
                "email": customer.individual.email if customer.individual else None,
                "phone": customer.individual.primary_mobile if customer.individual else None,
                "type": "customer",
                "client_count": len(customer.client_associations),
                "ni_number": customer.ni_number,
                "status": customer.status.value if customer.status else None,
                "created_at": customer.created_at.isoformat() if customer.created_at else None
            })
    
    # Search clients (companies) if enabled
    if search_clients:
        client_query = select(Client).where(
            and_(
                Client.practice_id == current_user.practice_id,
                or_(
                    Client.business_name.ilike(search_term),
                    Client.nature_of_business.ilike(search_term),
                    Client.company_number.ilike(search_term),
                    Client.vat_number.ilike(search_term),
                    Client.main_email.ilike(search_term),
                    Client.main_phone.ilike(search_term),
                    Client.notes.ilike(search_term),
                    Client.client_code.ilike(search_term)
                )
            )
        ).limit(client_limit)
        
        client_result = await db.execute(client_query)
        clients = client_result.scalars().all()
        
        for client in clients:
            results["clients"].append({
                "id": str(client.id),
                "name": client.business_name,
                "client_code": client.client_code,
                "business_type": client.business_type.value if client.business_type else None,
                "email": client.main_email,
                "phone": client.main_phone,
                "company_number": client.company_number,
                "vat_number": client.vat_number,
                "type": "client",
                "created_at": client.created_at.isoformat() if client.created_at else None
            })
    
    results["total"] = len(results["customers"]) + len(results["clients"])
    
    return results 