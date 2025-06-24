from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid

from config.database import get_db
from db.models import ClientCompany, Customer, UserRole
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/{client_id}")
async def get_client_details(
    client_id: uuid.UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a client company."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view client details"
        )
    
    # Get client company with customer relationship
    result = await db.execute(
        select(ClientCompany)
        .options(selectinload(ClientCompany.customer))
        .where(ClientCompany.id == client_id)
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check if user has access to this client's practice
    if client.customer.practice_id != current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this client"
        )
    
    return {
        "id": str(client.id),
        "business_name": client.business_name,
        "trading_name": client.trading_name,
        "business_type": client.business_type.value if client.business_type else None,
        "companies_house_number": client.companies_house_number,
        "vat_number": client.vat_number,
        "corporation_tax_utr": client.corporation_tax_utr,
        "paye_reference": client.payroll_scheme_reference,
        "nature_of_business": client.nature_of_business,
        "sic_code": client.industry_sector,
        "incorporation_date": client.date_of_incorporation.isoformat() if client.date_of_incorporation else None,
        "accounting_period_end": client.year_end_date.isoformat() if client.year_end_date else None,
        "main_email": client.main_email,
        "main_phone": client.main_phone,
        "registered_address": {
            "line_1": client.registered_address_line1,
            "line_2": client.registered_address_line2,
            "city": client.registered_city,
            "county": client.registered_county,
            "postcode": client.registered_postcode,
            "country": client.registered_country
        },
        "trading_address": {
            "line_1": client.trading_address_line1,
            "line_2": client.trading_address_line2,
            "city": client.trading_city,
            "county": client.trading_county,
            "postcode": client.trading_postcode,
            "country": client.trading_country
        },
        "banking": {
            "name": client.business_bank_name,
            "sort_code": client.business_bank_sort_code,
            "account_number": client.business_bank_account_number,
            "account_name": client.business_bank_account_name
        },
        "notes": client.notes,
        "created_at": client.created_at.isoformat() if client.created_at else None,
        "updated_at": client.updated_at.isoformat() if client.updated_at else None,
        "customer": {
            "id": str(client.customer.id),
            "name": client.customer.name,
            "first_name": client.customer.first_name,
            "last_name": client.customer.last_name,
            "email": client.customer.primary_email
        } if client.customer else None
    }
