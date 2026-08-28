from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db_session
from app.modules.recommendation import schemas, service
from app.modules.property.schemas import PropertyResponse

router = APIRouter()

@router.post("", response_model=List[PropertyResponse])
async def recommendations(data: schemas.RecommendationRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.get_recommendations(db, data)

@router.get("/top-localities", response_model=List[schemas.LocalityScore])
async def top_localities(db: AsyncSession = Depends(get_db_session)):
    return await service.get_top_localities(db)

@router.get("/similar/{property_id}", response_model=List[PropertyResponse])
async def similar_properties(property_id: int, db: AsyncSession = Depends(get_db_session)):
    return await service.get_similar_properties(db, property_id)