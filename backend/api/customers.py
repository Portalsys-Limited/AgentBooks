from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID
import logging

from config.database import get_db
from db.models import Customer, Individual, Income, PropertyIndividualRelationship, CustomerClientAssociation, Document
from db.models.customer import CustomerStatus, MLRStatus
from db.models.individual_relationship import IndividualRelationship
from db.schemas.customer import (
    CustomerCreateRequest, CustomerUpdateRequest,
    CustomerResponse, CustomerListItem
)
from db.schemas.customer_tabs import (
    CustomerInfoTabResponse,
    CustomerMLRTabResponse,
    CustomerRelationshipsTabResponse,
    CustomerDocumentsTabResponse
)
from db.schemas.income import IncomeCreateRequest, IncomeUpdateRequest, IncomeResponse
from db.schemas.customer_client_association import (
    CustomerClientAssociationCreate, CustomerClientAssociationUpdate, 
    CustomerClientAssociationWithClient, CustomerClientAssociationResponse
)
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

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
        selectinload(Customer.individual).selectinload(Individual.property_relationships).selectinload(PropertyIndividualRelationship.property)
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
            selectinload(Customer.individual).selectinload(Individual.property_relationships).selectinload(PropertyIndividualRelationship.property),
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

 

# Tab-specific endpoints
@router.get("/{customer_id}/info", response_model=CustomerInfoTabResponse)
async def get_customer_info(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer info tab data"""
    query = select(Customer).options(
        selectinload(Customer.individual),
        selectinload(Customer.primary_accounting_contact),
        selectinload(Customer.last_edited_by)
    ).where(Customer.id == customer_id)
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return customer

@router.get("/{customer_id}/mlr", response_model=CustomerMLRTabResponse)
async def get_customer_mlr(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer MLR tab data"""
    query = select(Customer).options(
        selectinload(Customer.individual),
        selectinload(Customer.last_edited_by)
    ).where(Customer.id == customer_id)
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return customer

@router.get("/{customer_id}/relationships", response_model=CustomerRelationshipsTabResponse)
async def get_customer_relationships(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer relationships tab data"""
    query = select(Customer).options(
        selectinload(Customer.individual),
        selectinload(Customer.client_associations).selectinload(CustomerClientAssociation.client)
    ).where(Customer.id == customer_id)
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get individual relationships
    individual_relationships_query = select(IndividualRelationship).where(
        (IndividualRelationship.from_individual_id == customer.individual_id) |
        (IndividualRelationship.to_individual_id == customer.individual_id)
    )
    individual_relationships_result = await db.execute(individual_relationships_query)
    individual_relationships = individual_relationships_result.scalars().all()
    
    # Add individual relationships to the response
    response = CustomerRelationshipsTabResponse.from_orm(customer)
    response.individual_relationships = individual_relationships
    
    return response

@router.get("/{customer_id}/documents", response_model=CustomerDocumentsTabResponse)
async def get_customer_documents(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer documents tab data"""
    # Get customer with individual relationship
    query = select(Customer).options(
        selectinload(Customer.individual)
    ).where(Customer.id == customer_id)
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get all documents associated with either the customer directly or their individual
    documents_query = select(Document).where(
        or_(
            Document.customer_id == customer_id,
            Document.individual_id == customer.individual_id
        )
    ).order_by(Document.created_at.desc())
    
    documents_result = await db.execute(documents_query)
    documents = documents_result.scalars().all()
    
    # Create response
    response = CustomerDocumentsTabResponse.from_orm(customer)
    response.documents = documents
    
    return response

@router.post("/{customer_id}/associations", response_model=CustomerClientAssociationResponse)
async def create_customer_client_association(
    customer_id: UUID,
    association_data: CustomerClientAssociationCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new association between a customer and a client"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
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
    
    # Check if association already exists
    existing_result = await db.execute(
        select(CustomerClientAssociation).where(
            CustomerClientAssociation.customer_id == customer_id,
            CustomerClientAssociation.client_id == association_data.client_id,
            CustomerClientAssociation.relationship_type == association_data.relationship_type
        )
    )
    existing_association = existing_result.scalar_one_or_none()
    
    if existing_association:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Association between this customer and client with relationship type '{association_data.relationship_type}' already exists"
        )
    
    # Check if trying to set as primary contact and another primary contact already exists
    if association_data.is_primary_contact:
        existing_primary_result = await db.execute(
            select(CustomerClientAssociation).where(
                CustomerClientAssociation.client_id == association_data.client_id,
                CustomerClientAssociation.is_primary_contact == True
            )
        )
        existing_primary = existing_primary_result.scalar_one_or_none()
        
        if existing_primary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This client already has a primary contact. Please remove the existing primary contact designation first or set this association to not be primary."
            )
    
    # Create the association
    association = CustomerClientAssociation(
        customer_id=customer_id,
        client_id=association_data.client_id,
        relationship_type=association_data.relationship_type,
        percentage_ownership=association_data.percentage_ownership,
        appointment_date=association_data.appointment_date,
        resignation_date=association_data.resignation_date,
        is_active=association_data.is_active,
        is_primary_contact=association_data.is_primary_contact or False,
        notes=association_data.notes
    )
    
    db.add(association)
    await db.commit()
    await db.refresh(association)
    return association


@router.put("/{customer_id}/associations/{association_id}", response_model=CustomerClientAssociationResponse)
async def update_customer_client_association(
    customer_id: UUID,
    association_id: UUID,
    association_data: CustomerClientAssociationUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing customer-client association"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
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
    
    # Get the association
    association = await db.execute(
        select(CustomerClientAssociation).where(
            CustomerClientAssociation.id == association_id,
            CustomerClientAssociation.customer_id == customer_id
        )
    )
    association = association.scalar_one_or_none()
    if not association:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Association not found")
    
    # Check if trying to set as primary contact and another primary contact already exists
    if association_data.is_primary_contact is not None and association_data.is_primary_contact:
        existing_primary_result = await db.execute(
            select(CustomerClientAssociation).where(
                CustomerClientAssociation.client_id == association.client_id,
                CustomerClientAssociation.is_primary_contact == True,
                CustomerClientAssociation.id != association_id
            )
        )
        existing_primary = existing_primary_result.scalar_one_or_none()
        
        if existing_primary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This client already has a primary contact. Please remove the existing primary contact designation first."
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
    if association_data.is_primary_contact is not None:
        association.is_primary_contact = association_data.is_primary_contact
    if association_data.notes is not None:
        association.notes = association_data.notes
    
    await db.commit()
    await db.refresh(association)
    return association


@router.delete("/{customer_id}/associations/{association_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer_client_association(
    customer_id: UUID,
    association_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a customer-client association"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
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
    
    # Get the association
    association = await db.execute(
        select(CustomerClientAssociation).where(
            CustomerClientAssociation.id == association_id,
            CustomerClientAssociation.customer_id == customer_id
        )
    )
    association = association.scalar_one_or_none()
    if not association:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Association not found")
    
    await db.delete(association)
    await db.commit() 