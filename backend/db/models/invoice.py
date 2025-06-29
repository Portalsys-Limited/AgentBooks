from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Integer, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base

class InvoiceStatus(str, enum.Enum):
    """Status of an invoice."""
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"
    void = "void"

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)  # Optional, for invoice document
    
    # Invoice details
    invoice_number = Column(String, nullable=False, index=True)  # Practice-specific invoice number
    status = Column(Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.draft)
    issue_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    
    # Amount details
    subtotal = Column(Numeric(10, 2), nullable=False)  # Before tax
    tax_amount = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)  # After tax
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    document = relationship("Document", back_populates="invoice")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, number='{self.invoice_number}', status={self.status})>"

class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    
    # Line item details
    description = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="line_items")
    
    def __repr__(self):
        return f"<InvoiceLineItem(id={self.id}, description='{self.description}', total={self.total})>" 