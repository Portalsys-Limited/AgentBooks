from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import uuid

from config.database import get_db
from db.models import User, UserRole, Document, DocumentType, DocumentSource, DocumentAgentState
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/")
async def list_documents(
    client_id: Optional[str] = None,
    document_source: Optional[DocumentSource] = None,
    document_type: Optional[DocumentType] = None,
    agent_state: Optional[DocumentAgentState] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List documents with optional filtering."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view documents"
        )
    
    try:
        # Build query
        query = select(Document).where(Document.practice_id == current_user.practice_id)
        
        # Apply filters
        if client_id:
            try:
                client_uuid = uuid.UUID(client_id)
                query = query.where(Document.client_id == client_uuid)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid client ID format"
                )
        
        if document_source:
            query = query.where(Document.document_source == document_source)
        
        if document_type:
            query = query.where(Document.document_type == document_type)
        
        if agent_state:
            query = query.where(Document.agent_state == agent_state)
        
        # Add ordering and pagination
        query = query.order_by(Document.created_at.desc()).offset(offset).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        documents = result.scalars().all()
        
        # Convert to dict format for response
        documents_data = []
        for doc in documents:
            documents_data.append({
                "id": str(doc.id),
                "filename": doc.filename,
                "original_filename": doc.original_filename,
                "document_url": doc.document_url,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "document_type": doc.document_type,
                "document_source": doc.document_source,
                "document_category": doc.document_category,
                "title": doc.title,
                "description": doc.description,
                "tags": doc.tags,
                "practice_id": str(doc.practice_id),
                "customer_id": str(doc.customer_id) if doc.customer_id else None,
                "client_id": str(doc.client_id) if doc.client_id else None,
                "message_id": str(doc.message_id) if doc.message_id else None,
                "agent_state": doc.agent_state,
                "agent_processing_started_at": doc.agent_processing_started_at.isoformat() if doc.agent_processing_started_at else None,
                "agent_processing_completed_at": doc.agent_processing_completed_at.isoformat() if doc.agent_processing_completed_at else None,
                "agent_confidence_score": doc.agent_confidence_score,
                "is_validated": doc.is_validated,
                "is_sensitive": doc.is_sensitive,
                "access_level": doc.access_level,
                "is_active": doc.is_active,
                "is_archived": doc.is_archived,
                "upload_source_details": doc.upload_source_details,
                "created_at": doc.created_at.isoformat(),
                "updated_at": doc.updated_at.isoformat() if doc.updated_at else None
            })
        
        return {
            "documents": documents_data,
            "total_count": len(documents_data),
            "limit": limit,
            "offset": offset
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving documents: {str(e)}"
        )

@router.get("/whatsapp")
async def list_whatsapp_documents(
    client_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List documents received via WhatsApp."""
    
    return await list_documents(
        client_id=client_id,
        document_source=DocumentSource.whatsapp,
        limit=limit,
        offset=offset,
        current_user=current_user,
        db=db
    )

@router.get("/pending")
async def list_pending_documents(
    client_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List documents that are pending agent processing."""
    
    return await list_documents(
        client_id=client_id,
        agent_state=DocumentAgentState.pending,
        limit=limit,
        offset=offset,
        current_user=current_user,
        db=db
    )

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific document by ID."""
    
    # Check permissions
    if current_user.role not in [UserRole.practice_owner, UserRole.accountant, UserRole.bookkeeper]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view documents"
        )
    
    # Parse UUID
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID format"
        )
    
    try:
        # Get document
        result = await db.execute(
            select(Document).where(
                and_(
                    Document.id == doc_uuid,
                    Document.practice_id == current_user.practice_id
                )
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return {
            "id": str(document.id),
            "filename": document.filename,
            "original_filename": document.original_filename,
            "document_url": document.document_url,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "document_type": document.document_type,
            "document_source": document.document_source,
            "document_category": document.document_category,
            "title": document.title,
            "description": document.description,
            "tags": document.tags,
            "practice_id": str(document.practice_id),
            "customer_id": str(document.customer_id) if document.customer_id else None,
            "client_id": str(document.client_id) if document.client_id else None,
            "message_id": str(document.message_id) if document.message_id else None,
            "agent_state": document.agent_state,
            "agent_processing_notes": document.agent_processing_notes,
            "agent_confidence_score": document.agent_confidence_score,
            "extracted_data": document.extracted_data,
            "extracted_text": document.extracted_text,
            "is_validated": document.is_validated,
            "is_sensitive": document.is_sensitive,
            "access_level": document.access_level,
            "is_active": document.is_active,
            "is_archived": document.is_archived,
            "upload_source_details": document.upload_source_details,
            "created_at": document.created_at.isoformat(),
            "updated_at": document.updated_at.isoformat() if document.updated_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving document: {str(e)}"
        ) 