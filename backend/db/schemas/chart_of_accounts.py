"""Chart of Accounts schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from ..models.chart_of_accounts import AccountType, AccountSource, SyncStatus


class ChartOfAccountBase(BaseModel):
    """Base schema for Chart of Accounts."""
    code: str = Field(..., description="Account code")
    name: str = Field(..., description="Account name")
    account_type: AccountType = Field(..., description="Account type")
    is_active: bool = Field(default=True, description="Whether the account is active")


class ChartOfAccountCreate(ChartOfAccountBase):
    """Schema for creating a Chart of Account."""
    client_id: UUID = Field(..., description="ID of the client this account belongs to")
    external_id: Optional[str] = Field(None, description="External system identifier")
    source: Optional[AccountSource] = Field(None, description="Source system (XERO, QUICKBOOKS, ODOO, etc.)")


class ChartOfAccountUpdate(BaseModel):
    """Schema for updating a Chart of Account."""
    code: Optional[str] = Field(None, description="Account code")
    name: Optional[str] = Field(None, description="Account name")
    account_type: Optional[AccountType] = Field(None, description="Account type")
    external_id: Optional[str] = Field(None, description="External system identifier")
    source: Optional[AccountSource] = Field(None, description="Source system")
    is_active: Optional[bool] = Field(None, description="Whether the account is active")
    sync_status: Optional[SyncStatus] = Field(None, description="Sync status with external system")


class ChartOfAccountResponse(ChartOfAccountBase):
    """Schema for Chart of Account response."""
    id: UUID = Field(..., description="Account ID")
    client_id: UUID = Field(..., description="ID of the client this account belongs to")
    external_id: Optional[str] = Field(None, description="External system identifier")
    source: Optional[AccountSource] = Field(None, description="Source system")
    sync_status: SyncStatus = Field(..., description="Sync status with external system")
    last_synced_at: datetime = Field(..., description="Last sync timestamp")

    class Config:
        """Pydantic config."""
        from_attributes = True 