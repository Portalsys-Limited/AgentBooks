import httpx
import base64
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
import logging

from config.settings import settings
from db.models.client import Client
from db.models.companies_house_profile import CompaniesHouseProfile

logger = logging.getLogger(__name__)


class CompaniesHouseService:
    """Simplified Companies House API service for search and auto-fill functionality."""
    
    BASE_URL = "https://api.company-information.service.gov.uk"
    
    def __init__(self):
        self.api_key = settings.companies_house_api_key
        self.timeout = httpx.Timeout(30.0)
        
        if not self.api_key:
            logger.error("Companies House API key not configured in settings!")
            raise ValueError("Companies House API key is required")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests."""
        encoded_auth = base64.b64encode(f"{self.api_key}:".encode()).decode()
        return {
            "Authorization": f"Basic {encoded_auth}",
            "Accept": "application/json",
            "User-Agent": "AgentBooks/1.0"
        }
    
    async def search_companies(
        self,
        query: str,
        items_per_page: int = 20,
        start_index: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        Search for companies using Companies House API.
        
        Args:
            query: Search term
            items_per_page: Number of results per page (max 100)
            start_index: Start index for pagination
            
        Returns:
            Search results
        """
        if not query:
            raise ValueError("Search query is required")
        
        items_per_page = min(items_per_page, 100)
        url = f"{self.BASE_URL}/search/companies"
        
        params = {
            "q": query,
            "items_per_page": items_per_page,
            "start_index": start_index
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 401:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Companies House API key"
                    )
                    
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Companies House API error: {response.status_code}"
                    )
                
                return response.json()
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Companies House API timeout"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to connect to Companies House API"
            )
    
    async def get_company_profile(self, company_number: str) -> Optional[Dict[str, Any]]:
        """
        Fetch company profile from Companies House API.
        
        Args:
            company_number: The company registration number
            
        Returns:
            Company profile data or None if not found
        """
        if not company_number:
            raise ValueError("Company number is required")
        
        company_number = company_number.replace(" ", "").upper()
        url = f"{self.BASE_URL}/company/{company_number}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers()
                )
                
                if response.status_code == 404:
                    return None
                    
                if response.status_code == 401:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Companies House API key"
                    )
                    
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Companies House API error: {response.status_code}"
                    )
                
                return response.json()
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Companies House API timeout"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to connect to Companies House API"
            )
    
    async def create_or_update_companies_house_profile(
        self,
        db: AsyncSession,
        client_id: UUID,
        company_number: str
    ) -> CompaniesHouseProfile:
        """
        Create or update Companies House profile for a client.
        
        This is the main auto-fill method that:
        1. Fetches company data from Companies House API
        2. Creates/updates CompaniesHouseProfile
        3. Updates basic client fields
        4. Maintains linking consistency
        
        Args:
            db: Database session
            client_id: Client ID
            company_number: Company registration number
            
        Returns:
            CompaniesHouseProfile record
        """
        # Get company data from Companies House
        company_data = await self.get_company_profile(company_number)
        if not company_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company {company_number} not found at Companies House"
            )
        
        # Check if client exists
        result = await db.execute(select(Client).where(Client.id == client_id))
        client = result.scalar_one_or_none()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        # Check if Companies House profile already exists
        result = await db.execute(
            select(CompaniesHouseProfile).where(CompaniesHouseProfile.client_id == client_id)
        )
        ch_profile = result.scalar_one_or_none()
        
        if ch_profile:
            # Update existing profile
            self._update_profile_fields(ch_profile, company_data)
        else:
            # Create new profile
            ch_profile = self._create_profile_from_data(client_id, company_data)
            db.add(ch_profile)
        
        # Update basic client fields
        self._update_client_fields(client, company_data)
        
        await db.commit()
        await db.refresh(ch_profile)
        
        return ch_profile
    
    def _create_profile_from_data(
        self,
        client_id: UUID,
        company_data: Dict[str, Any]
    ) -> CompaniesHouseProfile:
        """Create a new Companies House profile - simple JSON storage approach."""
        return CompaniesHouseProfile(
            client_id=client_id,
            company_number=company_data.get("company_number"),
            company_name=company_data.get("company_name"),
            company_status=company_data.get("company_status"),
            companies_house_data=company_data,  # Store everything as JSON
            sync_status="success"
        )
    
    def _update_profile_fields(
        self,
        ch_profile: CompaniesHouseProfile,
        company_data: Dict[str, Any]
    ):
        """Update existing profile with fresh API data - simple JSON storage approach."""
        ch_profile.company_name = company_data.get("company_name")
        ch_profile.company_status = company_data.get("company_status")
        ch_profile.companies_house_data = company_data  # Store everything as JSON
        ch_profile.last_synced = datetime.now()
        ch_profile.sync_status = "success"
        ch_profile.sync_error_message = None
    
    def _update_client_fields(
        self,
        client: Client,
        company_data: Dict[str, Any]
    ):
        """Update basic client fields with Companies House data."""
        # Business name
        if company_data.get("company_name"):
            client.business_name = company_data["company_name"]
        
        # Company number
        if company_data.get("company_number"):
            client.companies_house_number = company_data["company_number"].upper()
        
        # Business type
        if company_data.get("type"):
            ch_type = company_data["type"].lower()
            if "ltd" in ch_type or "limited" in ch_type:
                client.business_type = "LTD - Limited Company"
            elif "llp" in ch_type:
                client.business_type = "LLP - Limited Liability Partnership"
        
        # Incorporation date
        if company_data.get("date_of_creation"):
            try:
                client.date_of_incorporation = datetime.strptime(
                    company_data["date_of_creation"], "%Y-%m-%d"
                ).date()
            except ValueError:
                pass  # Skip if date format is invalid
        
        # Country
        if company_data.get("jurisdiction"):
            client.country_of_incorporation = company_data["jurisdiction"]
        
        # Status
        if company_data.get("company_status"):
            client.company_status = company_data["company_status"]
        
        # SIC code
        if company_data.get("sic_codes") and company_data["sic_codes"]:
            client.industry_sector = company_data["sic_codes"][0]
        
        # Registered address
        if company_data.get("registered_office_address"):
            address = company_data["registered_office_address"]
            client.registered_address_line1 = address.get("address_line_1")
            client.registered_address_line2 = address.get("address_line_2")
            client.registered_city = address.get("locality")
            client.registered_county = address.get("region")
            client.registered_postcode = address.get("postal_code")
            client.registered_country = address.get("country", "United Kingdom")
        
        # Year end date from accounts
        if company_data.get("accounts", {}).get("next_made_up_to"):
            try:
                from datetime import datetime
                client.year_end_date = datetime.strptime(
                    company_data["accounts"]["next_made_up_to"], "%Y-%m-%d"
                ).date()
            except ValueError:
                pass  # Skip if date format is invalid
        
        # Store raw data and update timestamp
        client.companies_house_data = company_data
        client.last_companies_house_update = datetime.now()
    



# Create singleton instance
companies_house_service = CompaniesHouseService()
