from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for document type
class DocumentType(str, enum.Enum):
    pdf = "pdf"
    image = "image"
    word_doc = "word_doc"
    excel = "excel"
    powerpoint = "powerpoint"
    text = "text"
    csv = "csv"
    other = "other"

# Enum for document source
class DocumentSource(str, enum.Enum):
    whatsapp = "whatsapp"
    client_portal_upload = "client_portal_upload"
    practice_portal_upload = "practice_portal_upload"
    email_attachment = "email_attachment"
    api_upload = "api_upload"
    manual_upload = "manual_upload"
    companies_house = "companies_house"
    hmrc = "hmrc"
    bank_feed = "bank_feed"
    other = "other"

# Enum for document agent processing state
class DocumentAgentState(str, enum.Enum):
    pending = "pending"                    # Document uploaded but not processed
    processing = "processing"              # Agent is currently processing
    processed = "processed"                # Successfully processed by agent
    failed = "failed"                      # Processing failed
    review_required = "review_required"    # Needs human review
    archived = "archived"                  # Document archived
    extracted = "extracted"                # Data extracted successfully
    categorized = "categorized"            # Document categorized
    validated = "validated"                # Data validated
    rejected = "rejected"                  # Document rejected

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Document basic information
    filename = Column(String, nullable=False)
    original_filename = Column(String)  # Original name when uploaded
    document_url = Column(String, nullable=False)  # URL/path to the stored document
    file_size = Column(String)  # File size in bytes (stored as string for large files)
    mime_type = Column(String)  # MIME type of the document
    
    # Document classification
    document_type = Column(SQLEnum(DocumentType), nullable=False, index=True)
    document_source = Column(SQLEnum(DocumentSource), nullable=False, index=True)
    document_category = Column(String)  # Business category (invoice, receipt, contract, etc.)
    document_subcategory = Column(String)  # More specific categorization
    
    # Document description and metadata
    title = Column(String)  # User-defined or auto-generated title
    description = Column(Text)  # Document description
    tags = Column(JSONB)  # Array of tags for easier searching
    
    # Relationships - every document must be assigned to a practice and customer, client assignment is optional
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True, index=True)
    
    # WhatsApp message relationship (optional - only for WhatsApp sourced documents)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True, index=True)
    
    # Agent processing information
    agent_state = Column(SQLEnum(DocumentAgentState), default=DocumentAgentState.pending, nullable=False, index=True)
    agent_processing_started_at = Column(DateTime(timezone=True))
    agent_processing_completed_at = Column(DateTime(timezone=True))
    agent_processing_notes = Column(Text)  # Notes from agent processing
    agent_confidence_score = Column(String)  # Confidence score from AI processing (0.0-1.0 as string)
    
    # Extracted data from document (AI/OCR results)
    extracted_data = Column(JSONB)  # Structured data extracted from document
    extracted_text = Column(Text)  # Raw text extracted from document
    
    # Document validation and review
    is_validated = Column(Boolean, default=False)
    validated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime(timezone=True))
    validation_notes = Column(Text)
    
    # Document access and security
    is_sensitive = Column(Boolean, default=False)  # Mark if document contains sensitive data
    access_level = Column(String, default="standard")  # standard, restricted, confidential
    encryption_key_id = Column(String)  # Reference to encryption key if encrypted
    
    # Document versioning and relationships
    parent_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)  # For document versions
    version_number = Column(String, default="1.0")
    is_current_version = Column(Boolean, default=True)
    
    # Document lifecycle
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    archived_at = Column(DateTime(timezone=True))
    archived_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Compliance and retention
    retention_date = Column(DateTime(timezone=True))  # When document can be deleted
    compliance_flags = Column(JSONB)  # Store compliance-related flags
    
    # Upload/creation information
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # User who uploaded (if any)
    upload_source_details = Column(JSONB)  # Additional details about the upload source
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="documents")
    customer = relationship("Customer", back_populates="documents")
    client = relationship("Client", back_populates="documents")
    message = relationship("Message", back_populates="documents")  # For WhatsApp documents
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_user_id], back_populates="uploaded_documents")
    validated_by = relationship("User", foreign_keys=[validated_by_user_id], back_populates="validated_documents")
    archived_by = relationship("User", foreign_keys=[archived_by_user_id], back_populates="archived_documents")
    
    # Self-referential relationship for document versions
    parent_document = relationship("Document", remote_side=[id], back_populates="child_documents")
    child_documents = relationship("Document", back_populates="parent_document")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', type='{self.document_type}', source='{self.document_source}')>"
