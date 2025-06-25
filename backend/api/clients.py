from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid
import logging
from typing import Optional

from config.database import get_db
from db.models import Client, Customer, UserRole
from db.models.client import BusinessType
from db.models.companies_house_profile import CompaniesHouseProfile
from db.models.customer_client_association import CustomerClientAssociation
from db.schemas.user import User as UserSchema
from db.schemas.client import ClientCreateRequest, ClientUpdateRequest, ClientResponse, ClientListItem
from db.schemas.customer_client_association import (
    CustomerClientAssociationCreate, 
    CustomerClientAssociationUpdate,
    CustomerClientAssociationResponse,
    CustomerClientAssociationWithCustomer
)
from api.users import get_current_user
from services.companies_house_service import companies_house_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{client_id}")
async def get_client_details(
    client_id: uuid.UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a client business."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view client details"
        )
    
    # Get client with customer associations and Companies House profile
    result = await db.execute(
        select(Client)
        .options(
            selectinload(Client.customer_associations),
            selectinload(Client.companies_house_profile)
        )
        .where(Client.id == client_id)
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check if user has access to this client's practice
    if client.practice_id != current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this client"
        )
    
    # Prepare Companies House data (complete JSON for easy frontend consumption)
    companies_house_data = None
    if client.companies_house_profile:
        ch_profile = client.companies_house_profile
        
        # Start with the complete JSON data from Companies House API
        companies_house_data = ch_profile.companies_house_data.copy() if ch_profile.companies_house_data else {}
        
        # Add our metadata and computed fields for convenience
        companies_house_data.update({
            "_profile_metadata": {
                "profile_id": str(ch_profile.id),
                "last_synced": ch_profile.last_synced.isoformat() if ch_profile.last_synced else None,
                "sync_status": ch_profile.sync_status,
                "linking_status": ch_profile.get_linking_status(),
                "is_active": ch_profile.is_active,
                "is_filing_overdue": ch_profile.is_filing_overdue
            }
        })

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
        "customer_associations": [
            {
                "customer_id": str(assoc.customer_id),
                "relationship_type": assoc.relationship_type.value,
                "percentage_ownership": assoc.percentage_ownership,
                "is_active": assoc.is_active
            }
            for assoc in client.customer_associations
        ] if client.customer_associations else [],
        "companies_house_profile": companies_house_data
    }

@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreateRequest,
    auto_fill_companies_house: bool = False,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    📋 Create a new client business.
    
    This endpoint allows you to:
    1. Create a client manually with provided details
    2. Create a client with auto-fill from Companies House (if companies_house_number provided and auto_fill_companies_house=True)
    
    Args:
        client_data: Client information
        auto_fill_companies_house: Whether to auto-fill from Companies House after creation
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created client with full details
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create clients"
        )
    
    try:
        # Create a unique client code if not provided
        client_code = f"CLI-{uuid.uuid4().hex[:8].upper()}"
        
        # Create the client instance
        client = Client(
            client_code=client_code,
            practice_id=current_user.practice_id,
            customer_id=uuid.uuid4(),  # Legacy field - temporary UUID
            
            # Basic business information
            business_name=client_data.business_name,
            trading_name=client_data.trading_name,
            business_type=client_data.business_type,
            nature_of_business=client_data.nature_of_business,
            industry_sector=client_data.industry_sector,
        )
        
        # Registration details
        client.companies_house_number = client_data.companies_house_number
        client.date_of_incorporation = client_data.date_of_incorporation
        client.country_of_incorporation = client_data.country_of_incorporation
        
        # Tax information
        client.corporation_tax_utr = client_data.corporation_tax_utr
        client.vat_number = client_data.vat_number
        client.vat_registration_date = client_data.vat_registration_date
        client.vat_scheme = client_data.vat_scheme
        
        # PAYE information
        client.payroll_scheme_reference = client_data.payroll_scheme_reference
        client.employer_reference_number = client_data.employer_reference_number
        client.construction_industry_scheme = client_data.construction_industry_scheme
        
        # Registered address
        client.registered_address_line1 = client_data.registered_address_line1
        client.registered_address_line2 = client_data.registered_address_line2
        client.registered_city = client_data.registered_city
        client.registered_county = client_data.registered_county
        client.registered_postcode = client_data.registered_postcode
        client.registered_country = client_data.registered_country
        
        # Trading address
        client.trading_same_as_registered = client_data.trading_same_as_registered
        client.trading_address_line1 = client_data.trading_address_line1
        client.trading_address_line2 = client_data.trading_address_line2
        client.trading_city = client_data.trading_city
        client.trading_county = client_data.trading_county
        client.trading_postcode = client_data.trading_postcode
        client.trading_country = client_data.trading_country
        
        # Contact information
        client.main_phone = client_data.main_phone
        client.main_email = client_data.main_email
        client.website = client_data.website
        
        # Banking information
        client.business_bank_name = client_data.business_bank_name
        client.business_bank_sort_code = client_data.business_bank_sort_code
        client.business_bank_account_number = client_data.business_bank_account_number
        client.business_bank_account_name = client_data.business_bank_account_name
        
        # Financial information
        client.year_end_date = client_data.year_end_date
        client.annual_turnover = client_data.annual_turnover
        client.number_of_employees = client_data.number_of_employees
        client.company_status = client_data.company_status
        
        # Professional services
        client.current_accountant = client_data.current_accountant
        client.previous_accountant = client_data.previous_accountant
        client.solicitor = client_data.solicitor
        client.bank_manager = client_data.bank_manager
        client.insurance_broker = client_data.insurance_broker
        
        # Service requirements
        client.services_required = {
            "services": client_data.services_required or []
        }
        client.accounting_software = client_data.accounting_software
        
        # Additional information
        client.notes = client_data.notes
        client.risk_assessment = client_data.risk_assessment
        
        # Save to database
        db.add(client)
        await db.commit()
        await db.refresh(client)
        
        # Auto-fill from Companies House if requested and company number provided
        if auto_fill_companies_house and client.companies_house_number:
            try:
                await companies_house_service.create_or_update_companies_house_profile(
                    db=db,
                    client_id=client.id,
                    company_number=client.companies_house_number
                )
                await db.refresh(client)
            except Exception as e:
                # Log the error but don't fail the client creation
                logger.warning(f"Failed to auto-fill client {client.id} from Companies House: {str(e)}")
        
        # Load relationships for response
        result = await db.execute(
            select(Client)
            .options(selectinload(Client.companies_house_profile))
            .where(Client.id == client.id)
        )
        client_with_relations = result.scalar_one()
        
        return ClientResponse.model_validate(client_with_relations)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create client: {str(e)}"
        )

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: uuid.UUID,
    client_data: ClientUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ✏️ Update an existing client business.
    
    This endpoint allows you to update any fields of an existing client.
    Only provided fields will be updated (partial updates supported).
    
    Args:
        client_id: Client ID to update
        client_data: Updated client information
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Updated client with full details
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update clients"
        )
    
    try:
        # Get existing client
        result = await db.execute(select(Client).where(Client.id == client_id))
        client = result.scalar_one_or_none()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        # Check if user has access to this client's practice
        if client.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this client"
            )
        
        # Update basic business information
        if client_data.business_name is not None:
            client.business_name = client_data.business_name
        if client_data.trading_name is not None:
            client.trading_name = client_data.trading_name
        if client_data.business_type is not None:
            client.business_type = client_data.business_type
        if client_data.nature_of_business is not None:
            client.nature_of_business = client_data.nature_of_business
        if client_data.industry_sector is not None:
            client.industry_sector = client_data.industry_sector
        
        # Update registration details
        if client_data.companies_house_number is not None:
            client.companies_house_number = client_data.companies_house_number
        if client_data.date_of_incorporation is not None:
            client.date_of_incorporation = client_data.date_of_incorporation
        if client_data.country_of_incorporation is not None:
            client.country_of_incorporation = client_data.country_of_incorporation
        
        # Update tax information
        if client_data.corporation_tax_utr is not None:
            client.corporation_tax_utr = client_data.corporation_tax_utr
        if client_data.vat_number is not None:
            client.vat_number = client_data.vat_number
        if client_data.vat_registration_date is not None:
            client.vat_registration_date = client_data.vat_registration_date
        if client_data.vat_scheme is not None:
            client.vat_scheme = client_data.vat_scheme
        
        # Update PAYE information
        if client_data.payroll_scheme_reference is not None:
            client.payroll_scheme_reference = client_data.payroll_scheme_reference
        if client_data.employer_reference_number is not None:
            client.employer_reference_number = client_data.employer_reference_number
        if client_data.construction_industry_scheme is not None:
            client.construction_industry_scheme = client_data.construction_industry_scheme
        
        # Update registered address
        if client_data.registered_address_line1 is not None:
            client.registered_address_line1 = client_data.registered_address_line1
        if client_data.registered_address_line2 is not None:
            client.registered_address_line2 = client_data.registered_address_line2
        if client_data.registered_city is not None:
            client.registered_city = client_data.registered_city
        if client_data.registered_county is not None:
            client.registered_county = client_data.registered_county
        if client_data.registered_postcode is not None:
            client.registered_postcode = client_data.registered_postcode
        if client_data.registered_country is not None:
            client.registered_country = client_data.registered_country
        
        # Update trading address setting
        if client_data.trading_same_as_registered is not None:
            client.trading_same_as_registered = client_data.trading_same_as_registered
        
        # Update trading address
        if client_data.trading_address_line1 is not None:
            client.trading_address_line1 = client_data.trading_address_line1
        if client_data.trading_address_line2 is not None:
            client.trading_address_line2 = client_data.trading_address_line2
        if client_data.trading_city is not None:
            client.trading_city = client_data.trading_city
        if client_data.trading_county is not None:
            client.trading_county = client_data.trading_county
        if client_data.trading_postcode is not None:
            client.trading_postcode = client_data.trading_postcode
        if client_data.trading_country is not None:
            client.trading_country = client_data.trading_country
        
        # Update contact information
        if client_data.main_phone is not None:
            client.main_phone = client_data.main_phone
        if client_data.main_email is not None:
            client.main_email = client_data.main_email
        if client_data.website is not None:
            client.website = client_data.website
        
        # Update banking information
        if client_data.business_bank_name is not None:
            client.business_bank_name = client_data.business_bank_name
        if client_data.business_bank_sort_code is not None:
            client.business_bank_sort_code = client_data.business_bank_sort_code
        if client_data.business_bank_account_number is not None:
            client.business_bank_account_number = client_data.business_bank_account_number
        if client_data.business_bank_account_name is not None:
            client.business_bank_account_name = client_data.business_bank_account_name
        
        # Update financial information
        if client_data.year_end_date is not None:
            client.year_end_date = client_data.year_end_date
        if client_data.annual_turnover is not None:
            client.annual_turnover = client_data.annual_turnover
        if client_data.number_of_employees is not None:
            client.number_of_employees = client_data.number_of_employees
        if client_data.company_status is not None:
            client.company_status = client_data.company_status
        
        # Update professional services
        if client_data.current_accountant is not None:
            client.current_accountant = client_data.current_accountant
        if client_data.previous_accountant is not None:
            client.previous_accountant = client_data.previous_accountant
        if client_data.solicitor is not None:
            client.solicitor = client_data.solicitor
        if client_data.bank_manager is not None:
            client.bank_manager = client_data.bank_manager
        if client_data.insurance_broker is not None:
            client.insurance_broker = client_data.insurance_broker
        
        # Update service requirements
        if client_data.services_required is not None:
            client.services_required = {
                "services": client_data.services_required
            }
        if client_data.accounting_software is not None:
            client.accounting_software = client_data.accounting_software
        
        # Update additional information
        if client_data.notes is not None:
            client.notes = client_data.notes
        if client_data.risk_assessment is not None:
            client.risk_assessment = client_data.risk_assessment
        
        # Save changes
        await db.commit()
        await db.refresh(client)
        
        # Load relationships for response
        result = await db.execute(
            select(Client)
            .options(selectinload(Client.companies_house_profile))
            .where(Client.id == client.id)
        )
        client_with_relations = result.scalar_one()
        
        return ClientResponse.model_validate(client_with_relations)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update client: {str(e)}"
        )

@router.post("/{client_id}/auto-fill")
async def trigger_companies_house_auto_fill(
    client_id: uuid.UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    🤖 Trigger Companies House auto-fill for an existing client.
    
    This is a convenience endpoint that calls the existing Companies House auto-fill functionality.
    The client must have a companies_house_number set before calling this endpoint.
    
    Args:
        client_id: Client ID to auto-fill
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Auto-filled client data and Companies House profile
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to auto-fill clients"
        )
    
    # Get the client first to verify it exists and user has access
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check if user has access to this client's practice
    if client.practice_id != current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this client"
        )
    
    # Check if client has a companies_house_number
    if not client.companies_house_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client must have a companies_house_number set before auto-filling. Please set the companies_house_number field first."
        )
    
    try:
        # Auto-fill using the client's companies_house_number
        ch_profile = await companies_house_service.create_or_update_companies_house_profile(
            db=db,
            client_id=client_id,
            company_number=client.companies_house_number
        )
        
        # Refresh client to get updated data
        await db.refresh(client)
        
        return {
            "success": True,
            "message": f"Client auto-filled with Companies House data for company {ch_profile.company_number}",
            "client": {
                "id": str(client.id),
                "business_name": client.business_name,
                "companies_house_number": client.companies_house_number,
                "last_updated": client.last_companies_house_update.isoformat() if client.last_companies_house_update else None
            },
            "companies_house_profile": {
                "id": str(ch_profile.id),
                "company_name": ch_profile.company_name,
                "company_number": ch_profile.company_number,
                "company_status": ch_profile.company_status,
                "company_type": ch_profile.company_type,
                "is_active": ch_profile.is_active,
                "registered_office_address": ch_profile.get_current_registered_address(),
                "sic_codes": ch_profile.get_sic_code_descriptions(),
                "last_synced": ch_profile.last_synced.isoformat(),
                "linking_status": ch_profile.get_linking_status()
            }
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to auto-fill client details: {str(e)}"
        )

@router.post("/{client_id}/associations", response_model=CustomerClientAssociationResponse)
async def create_client_customer_association(
    client_id: uuid.UUID,
    association_data: CustomerClientAssociationCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    🔗 Create an association between a client and customer.
    
    This endpoint creates a relationship between a client business and a customer (e.g., director, shareholder, etc.).
    
    Args:
        client_id: Client ID from URL path
        association_data: Association details including customer_id and relationship_type
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created association with full details
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create client-customer associations"
        )
    
    try:
        # Verify the client exists and user has access
        result = await db.execute(select(Client).where(Client.id == client_id))
        client = result.scalar_one_or_none()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        if client.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this client"
            )
        
        # Verify the customer exists and user has access
        result = await db.execute(select(Customer).where(Customer.id == association_data.customer_id))
        customer = result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        if customer.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this customer"
            )
        
        # Ensure client_id in URL matches client_id in request body
        if association_data.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client ID in URL must match client_id in request body"
            )
        
        # Check if association already exists
        existing_result = await db.execute(
            select(CustomerClientAssociation).where(
                CustomerClientAssociation.customer_id == association_data.customer_id,
                CustomerClientAssociation.client_id == client_id,
                CustomerClientAssociation.relationship_type == association_data.relationship_type
            )
        )
        existing_association = existing_result.scalar_one_or_none()
        
        if existing_association:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Association between this customer and client with relationship type '{association_data.relationship_type}' already exists"
            )
        
        # Create the association
        association = CustomerClientAssociation(
            customer_id=association_data.customer_id,
            client_id=association_data.client_id,
            relationship_type=association_data.relationship_type,
            percentage_ownership=association_data.percentage_ownership,
            appointment_date=association_data.appointment_date,
            resignation_date=association_data.resignation_date,
            is_active=association_data.is_active,
            notes=association_data.notes
        )
        
        db.add(association)
        await db.commit()
        await db.refresh(association)
        
        # Load the association with related customer and client data
        result = await db.execute(
            select(CustomerClientAssociation)
            .options(
                selectinload(CustomerClientAssociation.customer),
                selectinload(CustomerClientAssociation.client)
            )
            .where(CustomerClientAssociation.id == association.id)
        )
        association_with_relations = result.scalar_one()
        
        return CustomerClientAssociationResponse.model_validate(association_with_relations)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create association: {str(e)}"
        )

@router.put("/{client_id}/associations/{association_id}", response_model=CustomerClientAssociationResponse)
async def update_client_customer_association(
    client_id: uuid.UUID,
    association_id: uuid.UUID,
    association_data: CustomerClientAssociationUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ✏️ Update an existing client-customer association.
    
    This endpoint allows you to update the relationship details between a client and customer.
    Only provided fields will be updated (partial updates supported).
    
    Args:
        client_id: Client ID from URL path
        association_id: Association ID to update
        association_data: Updated association information
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Updated association with full details
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update client-customer associations"
        )
    
    try:
        # Get the association with related data
        result = await db.execute(
            select(CustomerClientAssociation)
            .options(
                selectinload(CustomerClientAssociation.customer),
                selectinload(CustomerClientAssociation.client)
            )
            .where(CustomerClientAssociation.id == association_id)
        )
        association = result.scalar_one_or_none()
        
        if not association:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Association not found"
            )
        
        # Verify the association belongs to the specified client
        if association.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Association does not belong to the specified client"
            )
        
        # Check if user has access to the client's practice
        if association.client.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this association"
            )
        
        # Update fields that are provided
        if association_data.relationship_type is not None:
            association.relationship_type = association_data.relationship_type
        if association_data.percentage_ownership is not None:
            association.percentage_ownership = association_data.percentage_ownership
        if association_data.appointment_date is not None:
            association.appointment_date = association_data.appointment_date
        if association_data.resignation_date is not None:
            association.resignation_date = association_data.resignation_date
        if association_data.is_active is not None:
            association.is_active = association_data.is_active
        if association_data.notes is not None:
            association.notes = association_data.notes
        
        await db.commit()
        await db.refresh(association)
        
        return CustomerClientAssociationResponse.model_validate(association)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update association: {str(e)}"
        )

@router.delete("/{client_id}/associations/{association_id}")
async def delete_client_customer_association(
    client_id: uuid.UUID,
    association_id: uuid.UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    🗑️ Delete a client-customer association.
    
    This endpoint removes the relationship between a client and customer.
    
    Args:
        client_id: Client ID from URL path
        association_id: Association ID to delete
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete client-customer associations"
        )
    
    try:
        # Get the association with related data
        result = await db.execute(
            select(CustomerClientAssociation)
            .options(selectinload(CustomerClientAssociation.client))
            .where(CustomerClientAssociation.id == association_id)
        )
        association = result.scalar_one_or_none()
        
        if not association:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Association not found"
            )
        
        # Verify the association belongs to the specified client
        if association.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Association does not belong to the specified client"
            )
        
        # Check if user has access to the client's practice
        if association.client.practice_id != current_user.practice_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this association"
            )
        
        # Delete the association
        await db.delete(association)
        await db.commit()
        
        return {
            "success": True,
            "message": f"Association {association_id} deleted successfully"
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete association: {str(e)}"
        )

@router.get("/{client_id}/associations")
async def get_client_associations(
    client_id: uuid.UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    📋 Get all associations for a client.
    
    This endpoint returns all customer associations for the specified client.
    
    Args:
        client_id: Client ID
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of client-customer associations
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view client associations"
        )
    
    # Verify the client exists and user has access
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    if client.practice_id != current_user.practice_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this client"
        )
    
    # Get all associations for this client
    result = await db.execute(
        select(CustomerClientAssociation)
        .options(selectinload(CustomerClientAssociation.customer))
        .where(CustomerClientAssociation.client_id == client_id)
    )
    associations = result.scalars().all()
    
    return [
        {
            "id": str(assoc.id),
            "customer_id": str(assoc.customer_id),
            "client_id": str(assoc.client_id),
            "relationship_type": assoc.relationship_type.value,
            "percentage_ownership": assoc.percentage_ownership,
            "appointment_date": assoc.appointment_date.isoformat() if assoc.appointment_date else None,
            "resignation_date": assoc.resignation_date.isoformat() if assoc.resignation_date else None,
            "is_active": assoc.is_active,
            "notes": assoc.notes,
            "created_at": assoc.created_at.isoformat(),
            "updated_at": assoc.updated_at.isoformat() if assoc.updated_at else None,
            "customer": {
                "id": str(assoc.customer.id),
                "name": assoc.customer.name,
                "first_name": assoc.customer.first_name,
                "last_name": assoc.customer.last_name,
                "primary_email": assoc.customer.primary_email,
                "primary_phone": assoc.customer.primary_phone
            }
        }
        for assoc in associations
    ]


