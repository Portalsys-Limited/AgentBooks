from pydantic import BaseModel, constr
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from db.models.invoice import InvoiceStatus

# Base schema for invoice line items
class InvoiceLineItemBase(BaseModel):
    description: str
    quantity: int = 1
    unit_price: Decimal
    tax_rate: Decimal = Decimal('0.00')
    account_id: Optional[UUID] = None
    account_code: Optional[str] = None

class InvoiceLineItemCreate(InvoiceLineItemBase):
    pass

class InvoiceLineItemUpdate(InvoiceLineItemBase):
    description: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    account_id: Optional[UUID] = None
    account_code: Optional[str] = None

class InvoiceLineItem(InvoiceLineItemBase):
    id: UUID
    invoice_id: UUID
    tax_amount: Decimal
    subtotal: Decimal
    total: Decimal
    account_id: Optional[UUID] = None
    account_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Base schema for invoices
class InvoiceBase(BaseModel):
    invoice_number: constr(min_length=1)
    issue_date: datetime
    due_date: datetime

class InvoiceCreate(InvoiceBase):
    client_id: UUID
    document_id: Optional[UUID] = None
    line_items: List[InvoiceLineItemCreate]

class InvoiceUpdate(InvoiceBase):
    invoice_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[InvoiceStatus] = None
    line_items: Optional[List[InvoiceLineItemCreate]] = None

class Invoice(InvoiceBase):
    id: UUID
    practice_id: UUID
    client_id: UUID
    document_id: Optional[UUID] = None
    status: InvoiceStatus
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
    line_items: List[InvoiceLineItem]
    
    class Config:
        from_attributes = True

# Schema for invoice list responses
class InvoiceListItem(BaseModel):
    id: UUID
    invoice_number: str
    client_id: UUID
    status: InvoiceStatus
    issue_date: datetime
    due_date: datetime
    total_amount: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True 