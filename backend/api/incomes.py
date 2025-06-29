from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from uuid import UUID

from config.database import get_db
from db.models.income import IncomeType
from db.schemas.user import User as UserSchema
from api.users import get_current_user

router = APIRouter()

@router.get("/enums", response_model=Dict[str, List[Dict[str, str]]])
async def get_income_enums():
    """Get all income-related enum values"""
    return {
        "income_types": [{"value": i.value, "label": i.value.replace("_", " ").title()} for i in IncomeType]
    }

@router.get("/enums/types", response_model=List[Dict[str, str]])
async def get_income_types():
    """Get all income type options"""
    return [{"value": i.value, "label": i.value.replace("_", " ").title()} for i in IncomeType] 