from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base

class DocumentType(str, enum.Enum):
    pdf = "pdf"
    image = "image"
    word_doc = "word_doc"
    excel = "excel"
    powerpoint = "powerpoint"
    text = "text"
    csv = "csv"
    other = "other"

class DocumentSource(str, enum.Enum):
    whatsapp = "whatsapp"
    email = "email"
    upload = "upload"
    scan = "scan"
    other = "other"

class DocumentAgentState(str, enum.Enum):
    """State of document processing by the agent."""
    pending = "pending"
    processing = "processing"
    processed = "processed"
    failed = "failed"
    rejected = "rejected"  # When individual is not a customer
    awaiting_client_selection = "awaiting_client_selection"  # When waiting for client selection via WhatsApp

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    individual_id = Column(UUID(as_uuid=True), ForeignKey("individuals.id"), nullable=True)  # Optional, for documents from individuals
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)  # Optional, for customer-specific documents
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)  # Optional, for client-specific documents
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True)  # Optional, for documents from messages
    
    # User associations
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    archived_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Document metadata
    filename = Column(String, nullable=False)
    original_filename = Column(String)
    document_url = Column(String, nullable=False)  # Could be local path or cloud storage URL
    file_size = Column(String)  # Store as string to handle large sizes
    mime_type = Column(String)
    
    # Document classification
    document_type = Column(Enum(DocumentType), nullable=False)
    document_source = Column(Enum(DocumentSource), nullable=False)
    document_category = Column(String)  # e.g., "invoice", "receipt", "bank_statement"
    
    # Document details
    title = Column(String)
    description = Column(Text)
    tags = Column(JSON)  # Array of strings
    
    # OCR and processing
    raw_extracted_text = Column(Text, nullable=True)  # Raw OCR extracted text
    
    # Processing state
    agent_state = Column(Enum(DocumentAgentState), default=DocumentAgentState.pending)
    agent_metadata = Column(JSON)  # Store agent processing results
    upload_source_details = Column(JSON)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    practice = relationship("Practice", back_populates="documents")
    individual = relationship("Individual", back_populates="documents")
    customer = relationship("Customer", back_populates="documents")
    client = relationship("Client", back_populates="documents")
    message = relationship("Message", back_populates="documents")
    
    # User relationships
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_user_id], back_populates="uploaded_documents")
    validated_by = relationship("User", foreign_keys=[validated_by_user_id], back_populates="validated_documents")
    archived_by = relationship("User", foreign_keys=[archived_by_user_id], back_populates="archived_documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', type={self.document_type})>" 