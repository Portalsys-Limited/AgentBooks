from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Dict
from uuid import UUID
from datetime import datetime
import logging

from config.database import get_db
from db.models import Customer, Individual, Income, Property, CustomerClientAssociation, Document
from db.models.customer_client_association import RelationshipType
from db.models.property_individual_relationship import PropertyIndividualRelationship
from db.models.customer import CustomerStatus, MLRStatus
from db.models.individual_relationship import IndividualRelationship
from db.schemas.customer import (
    CustomerCreateRequest, CustomerUpdateRequest,
    CustomerResponse, CustomerListItem, CustomerAccountingInfoUpdate, CustomerMLRInfoUpdate
)
from db.schemas.customer_tabs import (
    CustomerInfoTabResponse,
    CustomerMLRTabResponse,
    CustomerRelationshipsTabResponse,
    CustomerDocumentsTabResponse
)
from db.schemas.income import IncomeCreateRequest, IncomeUpdateRequest, IncomeResponse
from db.schemas.property import PropertyCreateRequest, PropertyUpdateRequest, PropertyResponse
from db.schemas.customer_client_association import (
    CustomerClientAssociationCreate, CustomerClientAssociationCreateRequest, CustomerClientAssociationUpdate, 
    CustomerClientAssociationWithClient, CustomerClientAssociationResponse
)
from db.schemas.individual_relationship import (
    IndividualRelationshipResponse, IndividualRelationshipCreate, IndividualRelationshipUpdate
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

@router.get("/enums/client-relationship-types", response_model=List[Dict[str, str]])
async def get_client_relationship_types():
    """Get all client relationship type options"""
    from db.models.customer_client_association import RelationshipType
    return [{"value": r.value, "label": r.value.replace("_", " ").title()} for r in RelationshipType]

@router.get("/enums/individual-relationship-types", response_model=List[Dict[str, str]])
async def get_individual_relationship_types():
    """Get all individual relationship type options"""
    from db.models.individual_relationship import IndividualRelationType
    return [{"value": r.value, "label": r.value.replace("_", " ").title()} for r in IndividualRelationType]

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

 

# Tab-specific endpoints
@router.get("/{customer_id}/info", response_model=CustomerInfoTabResponse)
async def get_customer_info(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer info tab data"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    query = select(Customer).options(
        selectinload(Customer.individual).selectinload(Individual.incomes),
        selectinload(Customer.individual).selectinload(Individual.property_relationships).selectinload(PropertyIndividualRelationship.property),
        selectinload(Customer.primary_accounting_contact),
        selectinload(Customer.last_edited_by)
    ).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    
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
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Check if customer exists and get MLR data
    query = select(Customer).options(
        selectinload(Customer.last_edited_by)
    ).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create response manually without using from_orm to avoid relationship loading issues
    return CustomerMLRTabResponse(
        id=customer.id,
        mlr_status=customer.mlr_status,
        mlr_date_complete=customer.mlr_date_complete,
        passport_number=customer.passport_number,
        driving_license=customer.driving_license,
        uk_home_telephone=customer.uk_home_telephone,
        last_edited=customer.last_edited,
        last_edited_by_id=customer.last_edited_by_id,
        last_edited_by=customer.last_edited_by
    )

@router.get("/{customer_id}/relationships", response_model=CustomerRelationshipsTabResponse)
async def get_customer_relationships(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer relationships tab data"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Check if customer exists and get relationship data
    query = select(Customer).options(
        selectinload(Customer.client_associations).selectinload(CustomerClientAssociation.client)
    ).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get individual relationships with related individuals loaded, filtered by practice
    try:
        individual_relationships_query = select(IndividualRelationship).options(
            selectinload(IndividualRelationship.from_individual),
            selectinload(IndividualRelationship.to_individual)
        ).where(
            IndividualRelationship.practice_id == current_user.practice_id,
            (IndividualRelationship.from_individual_id == customer.individual_id) |
            (IndividualRelationship.to_individual_id == customer.individual_id)
        )
        individual_relationships_result = await db.execute(individual_relationships_query)
        individual_relationships = individual_relationships_result.scalars().all()
    except Exception as e:
        logging.error(f"Error loading individual relationships: {e}")
        individual_relationships = []
    
    # Create response manually by converting SQLAlchemy objects to dicts
    try:
        # Convert client associations to response format
        client_associations_data = []
        for assoc in customer.client_associations:
            client_associations_data.append({
                "id": assoc.id,
                "customer_id": assoc.customer_id,
                "client_id": assoc.client_id,
                "relationship_type": assoc.relationship_type.value if assoc.relationship_type else None,
                "percentage_ownership": assoc.percentage_ownership,
                "appointment_date": assoc.appointment_date.isoformat() if assoc.appointment_date else None,
                "resignation_date": assoc.resignation_date.isoformat() if assoc.resignation_date else None,
                "is_active": assoc.is_active,
                "is_primary_contact": assoc.is_primary_contact,
                "notes": assoc.notes,
                "created_at": assoc.created_at.isoformat() if assoc.created_at else None,
                "updated_at": assoc.updated_at.isoformat() if assoc.updated_at else None,
                "client": {
                    "id": assoc.client.id,
                    "business_name": assoc.client.business_name,
                    "business_type": assoc.client.business_type.value if assoc.client.business_type else None,
                    "main_phone": assoc.client.main_phone,
                    "main_email": assoc.client.main_email
                }
            })
        
        # Convert individual relationships to response format
        individual_relationships_data = []
        for rel in individual_relationships:
            individual_relationships_data.append({
                "id": rel.id,
                "from_individual_id": rel.from_individual_id,
                "to_individual_id": rel.to_individual_id,
                "relationship_type": rel.relationship_type.value if rel.relationship_type else None,
                "description": rel.description,
                "from_individual": {
                    "id": rel.from_individual.id,
                    "first_name": rel.from_individual.first_name,
                    "last_name": rel.from_individual.last_name,
                    "full_name": rel.from_individual.full_name,
                    "email": rel.from_individual.email
                } if rel.from_individual else None,
                "to_individual": {
                    "id": rel.to_individual.id,
                    "first_name": rel.to_individual.first_name,
                    "last_name": rel.to_individual.last_name,
                    "full_name": rel.to_individual.full_name,
                    "email": rel.to_individual.email
                } if rel.to_individual else None,
                "created_at": rel.created_at.isoformat() if rel.created_at else None,
                "updated_at": rel.updated_at.isoformat() if rel.updated_at else None
            })
        
        return CustomerRelationshipsTabResponse(
            id=customer.id,
            client_associations=client_associations_data,
            individual_relationships=individual_relationships_data
        )
    except Exception as e:
        logging.error(f"Error creating response: {e}")
        # Return a minimal response in case of serialization issues
        return CustomerRelationshipsTabResponse(
            id=customer.id,
            client_associations=[],
            individual_relationships=[]
        )

@router.get("/{customer_id}/documents", response_model=CustomerDocumentsTabResponse)
async def get_customer_documents(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get customer documents tab data"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Check if customer exists
    customer_query = select(Customer).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    customer_result = await db.execute(customer_query)
    customer = customer_result.scalar_one_or_none()
    
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
    
    # Create response manually without using from_orm to avoid relationship loading issues
    return CustomerDocumentsTabResponse(
        id=customer.id,
        documents=documents
    )

@router.put("/{customer_id}/accounting-info", response_model=CustomerInfoTabResponse)
async def update_customer_accounting_info(
    customer_id: UUID,
    request: CustomerAccountingInfoUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update customer accounting and additional information"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get customer
    query = select(Customer).options(
        selectinload(Customer.individual).selectinload(Individual.incomes),
        selectinload(Customer.individual).selectinload(Individual.property_relationships).selectinload(PropertyIndividualRelationship.property),
        selectinload(Customer.primary_accounting_contact),
        selectinload(Customer.last_edited_by)
    ).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update fields
    if request.ni_number is not None:
        customer.ni_number = request.ni_number
    if request.personal_utr_number is not None:
        customer.personal_utr_number = request.personal_utr_number
    if request.do_they_own_sa is not None:
        customer.do_they_own_sa = request.do_they_own_sa
    if request.comments is not None:
        customer.comments = request.comments
    if request.notes is not None:
        customer.notes = request.notes
    
    # Update last edited
    customer.last_edited = func.now()
    customer.last_edited_by_id = current_user.id
    
    try:
        await db.commit()
        await db.refresh(customer)
        return customer
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# CUSTOMER-CLIENT ASSOCIATION ENDPOINTS
# ==========================================

@router.post("/{customer_id}/client-associations", response_model=CustomerClientAssociationResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_client_association(
    customer_id: UUID,
    request: CustomerClientAssociationCreateRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new customer-client association"""
    logging.info(f"Creating client association for customer {customer_id} with data: {request.dict()}")
    
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
    
    # Verify client exists and belongs to practice
    from db.models import Client
    client = await db.execute(
        select(Client).where(
            Client.id == request.client_id,
            Client.practice_id == current_user.practice_id
        )
    )
    client = client.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Check if association already exists
    existing = await db.execute(
        select(CustomerClientAssociation).where(
            CustomerClientAssociation.customer_id == customer_id,
            CustomerClientAssociation.client_id == request.client_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Association already exists")
    
    # Create association
    try:
        # Convert request data to model format
        association_data = {
            'customer_id': customer_id,
            'client_id': request.client_id,
            'relationship_type': RelationshipType(request.relationship_type),  # Validate enum
            'percentage_ownership': request.percentage_ownership,
            'is_active': request.is_active,
            'is_primary_contact': request.is_primary_contact,
            'notes': request.notes
        }
        
        # Convert date strings to datetime objects if provided
        if request.appointment_date:
            association_data['appointment_date'] = datetime.fromisoformat(request.appointment_date)
        if request.resignation_date:
            association_data['resignation_date'] = datetime.fromisoformat(request.resignation_date)
        
        logging.info(f"Association data before creation: {association_data}")
        association = CustomerClientAssociation(**association_data)
        
        db.add(association)
        await db.commit()
        await db.refresh(association)
    except ValueError as e:
        await db.rollback()
        logging.error(f"Validation error creating client association: {str(e)}")
        logging.error(f"Association data: {association_data}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid data: {str(e)}")
    except Exception as e:
        await db.rollback()
        logging.error(f"Error creating client association: {str(e)}")
        logging.error(f"Association data: {association_data}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create association: {str(e)}")
    
    # Load relationships for response with individual data
    association_with_relations = await db.execute(
        select(CustomerClientAssociation)
        .options(
            selectinload(CustomerClientAssociation.customer).selectinload(Customer.individual),
            selectinload(CustomerClientAssociation.client)
        )
        .where(CustomerClientAssociation.id == association.id)
    )
    loaded_association = association_with_relations.scalar_one()
    
    # Map individual fields to customer for response
    if loaded_association.customer and loaded_association.customer.individual:
        individual = loaded_association.customer.individual
        loaded_association.customer.first_name = individual.first_name
        loaded_association.customer.last_name = individual.last_name
        loaded_association.customer.email = individual.email
        loaded_association.customer.primary_mobile = individual.primary_mobile
        loaded_association.customer.individual_id = individual.id
    
    return loaded_association

@router.put("/{customer_id}/client-associations/{association_id}", response_model=CustomerClientAssociationResponse)
async def update_customer_client_association(
    customer_id: UUID,
    association_id: UUID,
    request: CustomerClientAssociationUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a customer-client association"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get association and verify it belongs to customer
    association = await db.execute(
        select(CustomerClientAssociation)
        .join(Customer)
        .where(
            CustomerClientAssociation.id == association_id,
            CustomerClientAssociation.customer_id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    association = association.scalar_one_or_none()
    if not association:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Association not found")
    
    # Update fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(association, field, value)
    
    await db.commit()
    await db.refresh(association)
    
    # Load relationships for response with individual data
    association_with_relations = await db.execute(
        select(CustomerClientAssociation)
        .options(
            selectinload(CustomerClientAssociation.customer).selectinload(Customer.individual),
            selectinload(CustomerClientAssociation.client)
        )
        .where(CustomerClientAssociation.id == association.id)
    )
    loaded_association = association_with_relations.scalar_one()
    
    # Map individual fields to customer for response
    if loaded_association.customer and loaded_association.customer.individual:
        individual = loaded_association.customer.individual
        loaded_association.customer.first_name = individual.first_name
        loaded_association.customer.last_name = individual.last_name
        loaded_association.customer.email = individual.email
        loaded_association.customer.primary_mobile = individual.primary_mobile
        loaded_association.customer.individual_id = individual.id
    
    return loaded_association

@router.delete("/{customer_id}/client-associations/{association_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer_client_association(
    customer_id: UUID,
    association_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a customer-client association"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get association and verify it belongs to customer
    association = await db.execute(
        select(CustomerClientAssociation)
        .join(Customer)
        .where(
            CustomerClientAssociation.id == association_id,
            CustomerClientAssociation.customer_id == customer_id,
            Customer.practice_id == current_user.practice_id
        )
    )
    association = association.scalar_one_or_none()
    if not association:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Association not found")
    
    await db.delete(association)
    await db.commit()

# ==========================================
# INDIVIDUAL RELATIONSHIP ENDPOINTS
# ==========================================

@router.post("/{customer_id}/individual-relationships", response_model=IndividualRelationshipResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_individual_relationship(
    customer_id: UUID,
    request: IndividualRelationshipCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new individual relationship for a customer"""
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
    
    # Verify target individual exists and belongs to practice
    target_individual = await db.execute(
        select(Individual).where(
            Individual.id == request.to_individual_id,
            Individual.practice_id == current_user.practice_id
        )
    )
    target_individual = target_individual.scalar_one_or_none()
    if not target_individual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target individual not found")
    
    # Check if relationship already exists
    existing = await db.execute(
        select(IndividualRelationship).where(
            IndividualRelationship.from_individual_id == customer.individual_id,
            IndividualRelationship.to_individual_id == request.to_individual_id,
            IndividualRelationship.relationship_type == request.relationship_type
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Relationship already exists")
    
    # Create relationship
    relationship_data = request.dict()
    relationship_data['from_individual_id'] = customer.individual_id
    relationship_data['practice_id'] = current_user.practice_id
    relationship = IndividualRelationship(**relationship_data)
    
    db.add(relationship)
    await db.commit()
    await db.refresh(relationship)
    
    # Load relationships for response
    relationship_with_relations = await db.execute(
        select(IndividualRelationship)
        .options(
            selectinload(IndividualRelationship.from_individual),
            selectinload(IndividualRelationship.to_individual)
        )
        .where(IndividualRelationship.id == relationship.id)
    )
    return relationship_with_relations.scalar_one()

@router.put("/{customer_id}/individual-relationships/{relationship_id}", response_model=IndividualRelationshipResponse)
async def update_customer_individual_relationship(
    customer_id: UUID,
    relationship_id: UUID,
    request: IndividualRelationshipUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an individual relationship for a customer"""
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
    
    # Get relationship and verify it belongs to customer
    relationship = await db.execute(
        select(IndividualRelationship).where(
            IndividualRelationship.id == relationship_id,
            IndividualRelationship.from_individual_id == customer.individual_id,
            IndividualRelationship.practice_id == current_user.practice_id
        )
    )
    relationship = relationship.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    # Update fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(relationship, field, value)
    
    await db.commit()
    await db.refresh(relationship)
    
    # Load relationships for response
    relationship_with_relations = await db.execute(
        select(IndividualRelationship)
        .options(
            selectinload(IndividualRelationship.from_individual),
            selectinload(IndividualRelationship.to_individual)
        )
        .where(IndividualRelationship.id == relationship.id)
    )
    return relationship_with_relations.scalar_one()

@router.delete("/{customer_id}/individual-relationships/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer_individual_relationship(
    customer_id: UUID,
    relationship_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an individual relationship for a customer"""
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
    
    # Get relationship and verify it belongs to customer
    relationship = await db.execute(
        select(IndividualRelationship).where(
            IndividualRelationship.id == relationship_id,
            IndividualRelationship.from_individual_id == customer.individual_id,
            IndividualRelationship.practice_id == current_user.practice_id
        )
    )
    relationship = relationship.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relationship not found")
    
    await db.delete(relationship)
    await db.commit()

# ==========================================
# HELPER ENDPOINTS FOR DROPDOWNS
# ==========================================

@router.get("/{customer_id}/available-clients")
async def get_available_clients_for_customer(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get available clients for customer association"""
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
    
    # Get all clients in practice excluding those already associated
    from db.models import Client
    existing_associations = await db.execute(
        select(CustomerClientAssociation.client_id).where(
            CustomerClientAssociation.customer_id == customer_id
        )
    )
    existing_client_ids = [row[0] for row in existing_associations.fetchall()]
    
    available_clients_query = select(Client).where(
        Client.practice_id == current_user.practice_id
    )
    if existing_client_ids:
        available_clients_query = available_clients_query.where(
            Client.id.notin_(existing_client_ids)
        )
    
    result = await db.execute(available_clients_query)
    clients = result.scalars().all()
    
    return [
        {
            "id": str(client.id),
            "business_name": client.business_name,
            "business_type": client.business_type.value if client.business_type else None,
            "main_email": client.main_email,
            "main_phone": client.main_phone
        }
        for client in clients
    ]

@router.get("/{customer_id}/available-individuals")
async def get_available_individuals_for_customer(
    customer_id: UUID,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get available individuals for relationship"""
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
    
    # Get all individuals in practice excluding the customer themselves and those already related
    existing_relationships = await db.execute(
        select(IndividualRelationship.to_individual_id).where(
            IndividualRelationship.from_individual_id == customer.individual_id
        )
    )
    existing_individual_ids = [row[0] for row in existing_relationships.fetchall()]
    
    # Also exclude the customer's own individual
    excluded_ids = existing_individual_ids + [customer.individual_id]
    
    available_individuals_query = select(Individual).where(
        Individual.practice_id == current_user.practice_id,
        Individual.id.notin_(excluded_ids)
    )
    
    result = await db.execute(available_individuals_query)
    individuals = result.scalars().all()
    
    return [
        {
            "id": str(individual.id),
            "first_name": individual.first_name,
            "last_name": individual.last_name,
            "full_name": individual.full_name,
            "email": individual.email
        }
        for individual in individuals
    ]

@router.put("/{customer_id}/mlr-info", response_model=CustomerMLRTabResponse)
async def update_customer_mlr_info(
    customer_id: UUID,
    request: CustomerMLRInfoUpdate,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update customer MLR information"""
    if not current_user.practice_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be assigned to a practice")
    
    # Get customer
    query = select(Customer).options(
        selectinload(Customer.last_edited_by)
    ).where(
        Customer.id == customer_id,
        Customer.practice_id == current_user.practice_id
    )
    
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update fields
    if request.mlr_status is not None:
        customer.mlr_status = request.mlr_status
    if request.mlr_date_complete is not None:
        customer.mlr_date_complete = request.mlr_date_complete
    if request.passport_number is not None:
        customer.passport_number = request.passport_number
    if request.driving_license is not None:
        customer.driving_license = request.driving_license
    if request.uk_home_telephone is not None:
        customer.uk_home_telephone = request.uk_home_telephone
    
    # Update last edited
    customer.last_edited = func.now()
    customer.last_edited_by_id = current_user.id
    
    try:
        await db.commit()
        await db.refresh(customer)
        
        # Return updated MLR data
        return CustomerMLRTabResponse(
            id=customer.id,
            mlr_status=customer.mlr_status,
            mlr_date_complete=customer.mlr_date_complete,
            passport_number=customer.passport_number,
            driving_license=customer.driving_license,
            uk_home_telephone=customer.uk_home_telephone,
            last_edited=customer.last_edited,
            last_edited_by_id=customer.last_edited_by_id,
            last_edited_by=customer.last_edited_by
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))