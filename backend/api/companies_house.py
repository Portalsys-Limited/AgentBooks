from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Dict, Any
from uuid import UUID

from config.database import get_db
from services.companies_house_service import companies_house_service
from api.users import get_current_user
from db.models import User, Client
from db.models.companies_house_profile import CompaniesHouseProfile
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/search")
async def search_companies(
    q: str = Query(..., description="Search query for company name or number"),
    items_per_page: int = Query(20, ge=1, le=100, description="Number of results per page"),
    start_index: int = Query(0, ge=0, description="Start index for pagination"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    🔍 Search for companies using Companies House search service.
    
    Use this to find companies by name, number, or other criteria before auto-filling client details.
    
    Args:
        q: Search query (company name, number, etc.)
        items_per_page: Number of results per page (max 100)
        start_index: Start index for pagination
        current_user: Authenticated user
        
    Returns:
        List of matching companies with basic details
    """
    try:
        search_results = await companies_house_service.search_companies(
            query=q,
            items_per_page=items_per_page,
            start_index=start_index
        )
        
        return {
            "success": True,
            "results": search_results,
            "query": q,
            "pagination": {
                "items_per_page": items_per_page,
                "start_index": start_index,
                "total_results": search_results.get("total_results") if search_results else 0
            }
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/clients/{client_id}/auto-fill")
async def auto_fill_client_details(
    client_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    🤖 Auto-fill client details using Companies House data.
    
    This endpoint:
    1. Reads the client's companies_house_number field
    2. Fetches company details from Companies House API
    3. Creates/updates the CompaniesHouseProfile
    4. Links the profile to the client
    5. Updates basic client fields with CH data
    
    The client must have a companies_house_number set before calling this endpoint.
    
    Args:
        client_id: Client ID to auto-fill
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Auto-filled client data and Companies House profile
    """
    try:
        # Get the client first
        result = await db.execute(select(Client).where(Client.id == client_id))
        client = result.scalar_one_or_none()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        # Check if client has a companies_house_number
        if not client.companies_house_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client must have a companies_house_number set before auto-filling. Please set the companies_house_number field first."
            )
        
        # Auto-fill using the client's companies_house_number
        ch_profile = await companies_house_service.create_or_update_companies_house_profile(
            db=db,
            client_id=client_id,
            company_number=client.companies_house_number
        )
        
        # Refresh client to get updated data
        await db.refresh(client)
        
        return {
            "success": True,
            "message": f"Client auto-filled with Companies House data for company {ch_profile.company_number}",
            "client": {
                "id": str(client.id),
                "business_name": client.business_name,
                "companies_house_number": client.companies_house_number,
                "last_updated": client.last_companies_house_update.isoformat() if client.last_companies_house_update else None
            },
            "companies_house_profile": {
                "id": str(ch_profile.id),
                "company_name": ch_profile.company_name,
                "company_number": ch_profile.company_number,
                "company_status": ch_profile.company_status,
                "company_type": ch_profile.company_type,
                "is_active": ch_profile.is_active,
                "registered_office_address": ch_profile.get_current_registered_address(),
                "sic_codes": ch_profile.get_sic_code_descriptions(),
                "last_synced": ch_profile.last_synced.isoformat(),
                "linking_status": ch_profile.get_linking_status()
            }
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to auto-fill client details: {str(e)}"
        )

# That's it! Just two simple, clean endpoints. 
# All the complexity is handled automatically in the background. 