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
from db.schemas.customer import (
    CustomerListItem, CustomerCreate, CustomerCreateRequest, 
    CustomerUpdateRequest, CustomerResponse
)
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
    
    # Get customer with client companies
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.client_associations))
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
        "practice_id": str(customer.practice_id),
        "name": customer.name,
        "first_name": customer.first_name,
        "middle_name": customer.middle_name,
        "last_name": customer.last_name,
        "surname": customer.surname,
        "preferred_name": customer.preferred_name,
        "primary_email": customer.primary_email,
        "secondary_email": customer.secondary_email,
        "primary_phone": customer.primary_phone,
        "secondary_phone": customer.secondary_phone,
        "home_address_line1": customer.home_address_line1,
        "home_address_line2": customer.home_address_line2,
        "home_city": customer.home_city,
        "home_county": customer.home_county,
        "home_postcode": customer.home_postcode,
        "home_country": customer.home_country,
        "correspondence_same_as_home": customer.correspondence_same_as_home,
        "correspondence_address_line1": customer.correspondence_address_line1,
        "correspondence_address_line2": customer.correspondence_address_line2,
        "correspondence_city": customer.correspondence_city,
        "correspondence_county": customer.correspondence_county,
        "correspondence_postcode": customer.correspondence_postcode,
        "correspondence_country": customer.correspondence_country,
        "date_of_birth": customer.date_of_birth.isoformat() if customer.date_of_birth else None,
        "gender": customer.gender.value if customer.gender else None,
        "marital_status": customer.marital_status.value if customer.marital_status else None,
        "nationality": customer.nationality,
        "national_insurance_number": customer.national_insurance_number,
        "utr": customer.utr,
        "passport_number": customer.passport_number,
        "driving_license_number": customer.driving_license_number,
        "number_of_children": customer.number_of_children,
        "children_details": customer.children_details,
        "emergency_contact_name": customer.emergency_contact_name,
        "emergency_contact_phone": customer.emergency_contact_phone,
        "emergency_contact_relationship": customer.emergency_contact_relationship,
        "employment_status": customer.employment_status,
        "employer_name": customer.employer_name,
        "job_title": customer.job_title,
        "annual_income": float(customer.annual_income) if customer.annual_income else None,
        "bank_name": customer.bank_name,
        "bank_sort_code": customer.bank_sort_code,
        "bank_account_number": customer.bank_account_number,
        "bank_account_name": customer.bank_account_name,
        "notes": customer.notes,
        "communication_preferences": customer.communication_preferences,
        "data_protection_consent": customer.data_protection_consent,
        "marketing_consent": customer.marketing_consent,
        "created_at": customer.created_at.isoformat() if customer.created_at else None,
        "updated_at": customer.updated_at.isoformat() if customer.updated_at else None,
        "client_associations": [
            {
                "client_id": str(assoc.client_id),
                "relationship_type": assoc.relationship_type.value,
                "percentage_ownership": assoc.percentage_ownership,
                "is_active": assoc.is_active,
                "appointment_date": assoc.appointment_date.isoformat() if assoc.appointment_date else None,
                "resignation_date": assoc.resignation_date.isoformat() if assoc.resignation_date else None,
                "notes": assoc.notes
            }
            for assoc in customer.client_associations
        ] if customer.client_associations else [],
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
        .options(selectinload(Customer.client_associations))
        .where(Customer.practice_id == practice_uuid)
        .offset(skip)
        .limit(limit)
    )
    customers = result.scalars().all()
    return customers

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    👤 Create a new customer with complete information.
    
    This endpoint creates a new customer with all personal details, addresses, and other information.
    
    Args:
        customer_data: Complete customer information
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created customer with full details
    """
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create customers"
        )
    
    try:
        # Create the customer instance
        customer = Customer(
            practice_id=current_user.practice_id,
            name=customer_data.name,
        )
        
        # Personal information
        if customer_data.personal_info:
            customer.title = customer_data.personal_info.title
            customer.first_name = customer_data.personal_info.first_name
            customer.middle_name = customer_data.personal_info.middle_name
            customer.last_name = customer_data.personal_info.last_name
            customer.surname = customer_data.personal_info.surname
            customer.preferred_name = customer_data.personal_info.preferred_name
        
        # Contact information
        if customer_data.contact_info:
            customer.primary_email = customer_data.contact_info.primary_email
            customer.secondary_email = customer_data.contact_info.secondary_email
            customer.primary_phone = customer_data.contact_info.primary_phone
            customer.secondary_phone = customer_data.contact_info.secondary_phone
        
        # Home address
        if customer_data.home_address:
            customer.home_address_line1 = customer_data.home_address.line1
            customer.home_address_line2 = customer_data.home_address.line2
            customer.home_city = customer_data.home_address.city
            customer.home_county = customer_data.home_address.county
            customer.home_postcode = customer_data.home_address.postcode
            customer.home_country = customer_data.home_address.country
        
        # Correspondence address
        if customer_data.correspondence_same_as_home is not None:
            customer.correspondence_same_as_home = customer_data.correspondence_same_as_home
        
        if customer_data.correspondence_address and not customer_data.correspondence_same_as_home:
            customer.correspondence_address_line1 = customer_data.correspondence_address.line1
            customer.correspondence_address_line2 = customer_data.correspondence_address.line2
            customer.correspondence_city = customer_data.correspondence_address.city
            customer.correspondence_county = customer_data.correspondence_address.county
            customer.correspondence_postcode = customer_data.correspondence_address.postcode
            customer.correspondence_country = customer_data.correspondence_address.country
        
        # Personal details
        if customer_data.personal_details:
            customer.date_of_birth = customer_data.personal_details.date_of_birth
            customer.gender = customer_data.personal_details.gender
            customer.marital_status = customer_data.personal_details.marital_status
            customer.nationality = customer_data.personal_details.nationality
        
        # Government identifiers
        if customer_data.government_identifiers:
            customer.national_insurance_number = customer_data.government_identifiers.national_insurance_number
            customer.utr = customer_data.government_identifiers.utr
            customer.passport_number = customer_data.government_identifiers.passport_number
            customer.driving_license_number = customer_data.government_identifiers.driving_license_number
        
        # Family information
        if customer_data.family_info:
            customer.number_of_children = customer_data.family_info.number_of_children
            customer.children_details = customer_data.family_info.children_details
            customer.emergency_contact_name = customer_data.family_info.emergency_contact_name
            customer.emergency_contact_phone = customer_data.family_info.emergency_contact_phone
            customer.emergency_contact_relationship = customer_data.family_info.emergency_contact_relationship
        
        # Employment information
        if customer_data.employment:
            customer.employment_status = customer_data.employment.employment_status
            customer.employer_name = customer_data.employment.employer_name
            customer.job_title = customer_data.employment.job_title
            customer.annual_income = customer_data.employment.annual_income
        
        # Banking information
        if customer_data.banking:
            customer.bank_name = customer_data.banking.bank_name
            customer.bank_sort_code = customer_data.banking.bank_sort_code
            customer.bank_account_number = customer_data.banking.bank_account_number
            customer.bank_account_name = customer_data.banking.bank_account_name
        
        # Additional information
        customer.notes = customer_data.notes
        customer.communication_preferences = customer_data.communication_preferences
        customer.data_protection_consent = customer_data.data_protection_consent
        customer.marketing_consent = customer_data.marketing_consent
        
        # Save to database
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
        
        # Load relationships for response
        result = await db.execute(
            select(Customer)
            .options(selectinload(Customer.client_associations))
            .where(Customer.id == customer.id)
        )
        customer_with_relations = result.scalar_one()
        
        return CustomerResponse.model_validate(customer_with_relations)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create customer: {str(e)}"
        )

@router.put("/{customer_id}", response_model=CustomerResponse, status_code=status.HTTP_200_OK)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ✏️ Update an existing customer with complete information.
    
    This endpoint allows you to update any fields of an existing customer.
    Only provided fields will be updated (partial updates supported).
    
    Args:
        customer_id: Customer ID to update
        customer_data: Updated customer information
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Updated customer with full details
    """
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
    
    try:
        # Get existing customer
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
        
        # Update basic information
        if customer_data.name is not None:
            customer.name = customer_data.name
        
        # Update personal information
        if customer_data.personal_info:
            if customer_data.personal_info.title is not None:
                customer.title = customer_data.personal_info.title
            if customer_data.personal_info.first_name is not None:
                customer.first_name = customer_data.personal_info.first_name
            if customer_data.personal_info.middle_name is not None:
                customer.middle_name = customer_data.personal_info.middle_name
            if customer_data.personal_info.last_name is not None:
                customer.last_name = customer_data.personal_info.last_name
            if customer_data.personal_info.surname is not None:
                customer.surname = customer_data.personal_info.surname
            if customer_data.personal_info.preferred_name is not None:
                customer.preferred_name = customer_data.personal_info.preferred_name
        
        # Update contact information
        if customer_data.contact_info:
            if customer_data.contact_info.primary_email is not None:
                customer.primary_email = customer_data.contact_info.primary_email
            if customer_data.contact_info.secondary_email is not None:
                customer.secondary_email = customer_data.contact_info.secondary_email
            if customer_data.contact_info.primary_phone is not None:
                customer.primary_phone = customer_data.contact_info.primary_phone
            if customer_data.contact_info.secondary_phone is not None:
                customer.secondary_phone = customer_data.contact_info.secondary_phone
        
        # Update home address
        if customer_data.home_address:
            if customer_data.home_address.line1 is not None:
                customer.home_address_line1 = customer_data.home_address.line1
            if customer_data.home_address.line2 is not None:
                customer.home_address_line2 = customer_data.home_address.line2
            if customer_data.home_address.city is not None:
                customer.home_city = customer_data.home_address.city
            if customer_data.home_address.county is not None:
                customer.home_county = customer_data.home_address.county
            if customer_data.home_address.postcode is not None:
                customer.home_postcode = customer_data.home_address.postcode
            if customer_data.home_address.country is not None:
                customer.home_country = customer_data.home_address.country
        
        # Update correspondence address setting
        if customer_data.correspondence_same_as_home is not None:
            customer.correspondence_same_as_home = customer_data.correspondence_same_as_home
        
        # Update correspondence address
        if customer_data.correspondence_address:
            if customer_data.correspondence_address.line1 is not None:
                customer.correspondence_address_line1 = customer_data.correspondence_address.line1
            if customer_data.correspondence_address.line2 is not None:
                customer.correspondence_address_line2 = customer_data.correspondence_address.line2
            if customer_data.correspondence_address.city is not None:
                customer.correspondence_city = customer_data.correspondence_address.city
            if customer_data.correspondence_address.county is not None:
                customer.correspondence_county = customer_data.correspondence_address.county
            if customer_data.correspondence_address.postcode is not None:
                customer.correspondence_postcode = customer_data.correspondence_address.postcode
            if customer_data.correspondence_address.country is not None:
                customer.correspondence_country = customer_data.correspondence_address.country
        
        # Update personal details
        if customer_data.personal_details:
            if customer_data.personal_details.date_of_birth is not None:
                customer.date_of_birth = customer_data.personal_details.date_of_birth
            if customer_data.personal_details.gender is not None:
                customer.gender = customer_data.personal_details.gender
            if customer_data.personal_details.marital_status is not None:
                customer.marital_status = customer_data.personal_details.marital_status
            if customer_data.personal_details.nationality is not None:
                customer.nationality = customer_data.personal_details.nationality
        
        # Update government identifiers
        if customer_data.government_identifiers:
            if customer_data.government_identifiers.national_insurance_number is not None:
                customer.national_insurance_number = customer_data.government_identifiers.national_insurance_number
            if customer_data.government_identifiers.utr is not None:
                customer.utr = customer_data.government_identifiers.utr
            if customer_data.government_identifiers.passport_number is not None:
                customer.passport_number = customer_data.government_identifiers.passport_number
            if customer_data.government_identifiers.driving_license_number is not None:
                customer.driving_license_number = customer_data.government_identifiers.driving_license_number
        
        # Update family information
        if customer_data.family_info:
            if customer_data.family_info.number_of_children is not None:
                customer.number_of_children = customer_data.family_info.number_of_children
            if customer_data.family_info.children_details is not None:
                customer.children_details = customer_data.family_info.children_details
            if customer_data.family_info.emergency_contact_name is not None:
                customer.emergency_contact_name = customer_data.family_info.emergency_contact_name
            if customer_data.family_info.emergency_contact_phone is not None:
                customer.emergency_contact_phone = customer_data.family_info.emergency_contact_phone
            if customer_data.family_info.emergency_contact_relationship is not None:
                customer.emergency_contact_relationship = customer_data.family_info.emergency_contact_relationship
        
        # Update employment information
        if customer_data.employment:
            if customer_data.employment.employment_status is not None:
                customer.employment_status = customer_data.employment.employment_status
            if customer_data.employment.employer_name is not None:
                customer.employer_name = customer_data.employment.employer_name
            if customer_data.employment.job_title is not None:
                customer.job_title = customer_data.employment.job_title
            if customer_data.employment.annual_income is not None:
                customer.annual_income = customer_data.employment.annual_income
        
        # Update banking information
        if customer_data.banking:
            if customer_data.banking.bank_name is not None:
                customer.bank_name = customer_data.banking.bank_name
            if customer_data.banking.bank_sort_code is not None:
                customer.bank_sort_code = customer_data.banking.bank_sort_code
            if customer_data.banking.bank_account_number is not None:
                customer.bank_account_number = customer_data.banking.bank_account_number
            if customer_data.banking.bank_account_name is not None:
                customer.bank_account_name = customer_data.banking.bank_account_name
        
        # Update additional information
        if customer_data.notes is not None:
            customer.notes = customer_data.notes
        if customer_data.communication_preferences is not None:
            customer.communication_preferences = customer_data.communication_preferences
        if customer_data.data_protection_consent is not None:
            customer.data_protection_consent = customer_data.data_protection_consent
        if customer_data.marketing_consent is not None:
            customer.marketing_consent = customer_data.marketing_consent
        
        # Save changes
        await db.commit()
        await db.refresh(customer)
        
        # Load relationships for response
        result = await db.execute(
            select(Customer)
            .options(selectinload(Customer.client_associations))
            .where(Customer.id == customer.id)
        )
        customer_with_relations = result.scalar_one()
        
        return CustomerResponse.model_validate(customer_with_relations)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update customer: {str(e)}"
        )

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