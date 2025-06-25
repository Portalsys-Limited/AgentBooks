from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class CompaniesHouseAddress(BaseModel):
    """Companies House address schema."""
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    locality: Optional[str] = None
    region: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

class CompaniesHouseAccounts(BaseModel):
    """Companies House accounts information schema."""
    next_made_up_to: Optional[str] = None
    next_due: Optional[str] = None
    overdue: Optional[bool] = None
    accounting_reference_date: Optional[Dict[str, Any]] = None

class CompaniesHouseConfirmationStatement(BaseModel):
    """Companies House confirmation statement schema."""
    next_made_up_to: Optional[str] = None
    next_due: Optional[str] = None
    overdue: Optional[bool] = None

class CompaniesHouseLinks(BaseModel):
    """Companies House links schema."""
    self: Optional[str] = None
    filing_history: Optional[str] = None
    officers: Optional[str] = None
    charges: Optional[str] = None
    persons_with_significant_control: Optional[str] = None

class CompaniesHouseCompanyProfile(BaseModel):
    """Companies House company profile schema."""
    company_name: str
    company_number: str
    company_status: str
    company_status_detail: Optional[str] = None
    date_of_creation: str
    date_of_cessation: Optional[str] = None
    type: str
    jurisdiction: str
    registered_office_address: CompaniesHouseAddress
    accounts: Optional[CompaniesHouseAccounts] = None
    confirmation_statement: Optional[CompaniesHouseConfirmationStatement] = None
    sic_codes: Optional[List[str]] = None
    has_been_liquidated: Optional[bool] = None
    has_charges: Optional[bool] = None
    has_insolvency_history: Optional[bool] = None
    links: Optional[CompaniesHouseLinks] = None
    can_file: Optional[bool] = None
    etag: Optional[str] = None

class CompaniesHouseSearchItem(BaseModel):
    """Companies House search result item schema."""
    company_name: str
    company_number: str
    company_status: str
    company_type: str
    date_of_creation: Optional[str] = None
    date_of_cessation: Optional[str] = None
    registered_office_address: Optional[CompaniesHouseAddress] = None
    links: Optional[CompaniesHouseLinks] = None
    description: Optional[str] = None
    description_identifier: Optional[List[str]] = None

class CompaniesHouseSearchResults(BaseModel):
    """Companies House search results schema."""
    total_results: int
    items_per_page: int
    start_index: int
    items: List[CompaniesHouseSearchItem]
    kind: str = "search#companies"

class CompaniesHouseApiResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None

class ClientCompaniesHouseUpdate(BaseModel):
    """Schema for updating client with Companies House data."""
    client_id: str
    company_number: str
    last_updated: Optional[datetime] = None

class CompaniesHouseSearchRequest(BaseModel):
    """Schema for Companies House search request."""
    query: str = Field(..., min_length=1, description="Search query")
    items_per_page: int = Field(20, ge=1, le=100, description="Number of results per page")
    start_index: int = Field(0, ge=0, description="Start index for pagination")

class CompaniesHouseCompanyRequest(BaseModel):
    """Schema for Companies House company lookup request."""
    company_number: str = Field(..., min_length=1, description="Company registration number") 