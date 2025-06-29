"""Chart of Accounts model."""

from enum import Enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLAlchemyEnum, ForeignKey, UniqueConstraint, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class AccountType(str, Enum):
    """Type of account in the chart of accounts."""
    ASSET = "Asset"
    LIABILITY = "Liability"
    EQUITY = "Equity"
    REVENUE = "Revenue"
    EXPENSE = "Expense"


class AccountSource(str, Enum):
    """Source of the account."""
    XERO = "XERO"
    QUICKBOOKS = "QUICKBOOKS"
    ODOO = "ODOO"
    MANUAL = "MANUAL"


class SyncStatus(str, Enum):
    """Sync status of the account."""
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"
    CONFLICT = "CONFLICT"


class ChartOfAccount(Base):
    """Chart of Accounts model."""
    __tablename__ = "chart_of_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    code = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    account_type = Column(SQLAlchemyEnum(AccountType), nullable=False)

    # External system fields
    external_id = Column(String, nullable=True)
    source = Column(SQLAlchemyEnum(AccountSource), nullable=True)

    # Sync status
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    sync_status = Column(SQLAlchemyEnum(SyncStatus), default=SyncStatus.PENDING)

    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="chart_of_accounts")

    # Ensure code is unique per client
    __table_args__ = (
        UniqueConstraint('client_id', 'code', name='uq_client_coa_code'),
    )

    def __repr__(self):
        return f"<ChartOfAccount(id={self.id}, client_id={self.client_id}, code='{self.code}', name='{self.name}', type={self.account_type})>" 