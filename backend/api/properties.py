from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from uuid import UUID

from config.database import get_db
from db.models.property import PropertyType
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter(tags=["properties"])

@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_property_enums():
    """Get all property-related enum values"""
    return {
        "property_types": [{"value": p.value, "label": p.value.replace("_", " ").title()} for p in PropertyType]
    }

@router.get("/enums/types", response_model=List[Dict[str, str]])
async def get_property_types():
    """Get all property type options"""
    return [{"value": p.value, "label": p.value.replace("_", " ").title()} for p in PropertyType] 