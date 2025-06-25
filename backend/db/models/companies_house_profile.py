from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .base import Base

class CompaniesHouseProfile(Base):
    """
    Simplified Companies House profile storing complete API data as JSON.
    
    This approach is much simpler and more maintainable than individual columns.
    PostgreSQL JSONB provides excellent performance and flexibility.
    """
    __tablename__ = "companies_house_profiles"
    
    # Primary key and relationship
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), unique=True, nullable=False, index=True)
    
    # Essential fields for indexing and linking
    company_number = Column(String, unique=True, nullable=False, index=True)
    company_name = Column(String, index=True)  # For quick reference
    company_status = Column(String, index=True)  # For filtering active companies
    
    # Complete Companies House API response
    companies_house_data = Column(JSONB, nullable=False, comment="Complete Companies House API response")
    
    # Sync tracking
    last_synced = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    sync_status = Column(String, default="success")  # success, error, partial
    sync_error_message = Column(Text)
    
    # System fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="companies_house_profile", uselist=False)
    

    
    def __repr__(self):
        return f"<CompaniesHouseProfile(company_number='{self.company_number}', company_name='{self.company_name}')>"
    
    # Helper properties to access common data from JSON
    
    @property
    def is_active(self) -> bool:
        """Check if company is in active status."""
        return self.company_status == "active"
    
    @property
    def is_filing_overdue(self) -> bool:
        """Check if any filings are overdue."""
        data = self.companies_house_data or {}
        accounts = data.get("accounts", {})
        confirmation = data.get("confirmation_statement", {})
        
        accounts_overdue = accounts.get("next_accounts", {}).get("overdue", False)
        confirmation_overdue = confirmation.get("overdue", False)
        
        return accounts_overdue or confirmation_overdue
    
    @property
    def registered_office_address(self) -> dict:
        """Get the registered office address from JSON data."""
        return self.companies_house_data.get("registered_office_address", {})
    
    @property
    def sic_codes(self) -> list:
        """Get SIC codes from JSON data."""
        return self.companies_house_data.get("sic_codes", [])
    
    @property
    def accounts(self) -> dict:
        """Get accounts information from JSON data."""
        return self.companies_house_data.get("accounts", {})
    
    @property
    def confirmation_statement(self) -> dict:
        """Get confirmation statement from JSON data."""
        return self.companies_house_data.get("confirmation_statement", {})
    
    @property
    def links(self) -> dict:
        """Get related links from JSON data."""
        return self.companies_house_data.get("links", {})
    
    def get_current_registered_address(self) -> dict:
        """Get the current registered office address as a formatted dict."""
        address = self.registered_office_address
        if not address:
            return {}
        
        return {
            "line1": address.get("address_line_1"),
            "line2": address.get("address_line_2"),
            "locality": address.get("locality"),
            "region": address.get("region"),
            "postal_code": address.get("postal_code"),
            "country": address.get("country"),
            "premises": address.get("premises"),
            "care_of": address.get("care_of"),
            "po_box": address.get("po_box")
        }
    
    def get_sic_code_descriptions(self) -> list:
        """Get SIC codes as a list for easier processing."""
        return self.sic_codes
    
    def is_linked_to_client(self) -> bool:
        """
        Check if this profile is properly linked to its client.
        
        Verifies that the client's companies_house_number matches this profile's company_number.
        """
        if not self.client:
            return False
        return self.client.companies_house_number == self.company_number
    
    def get_linking_status(self) -> dict:
        """
        Get detailed status of the linking between Client and CompaniesHouseProfile.
        
        Returns:
            Dict with linking status and any discrepancies
        """
        if not self.client:
            return {
                "status": "error",
                "message": "No client relationship found",
                "client_company_number": None,
                "profile_company_number": self.company_number
            }
        
        client_number = self.client.companies_house_number
        profile_number = self.company_number
        
        if client_number == profile_number:
            return {
                "status": "linked",
                "message": "Client and profile company numbers match",
                "client_company_number": client_number,
                "profile_company_number": profile_number
            }
        else:
            return {
                "status": "mismatch",
                "message": f"Company numbers don't match: Client='{client_number}', Profile='{profile_number}'",
                "client_company_number": client_number,
                "profile_company_number": profile_number
            } 