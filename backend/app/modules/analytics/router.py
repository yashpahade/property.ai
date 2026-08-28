from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.core.database import get_db_session
from app.modules.analytics import schemas, service

router = APIRouter()

@router.get("/market", response_model=schemas.MarketOverview)
async def market_overview(db: AsyncSession = Depends(get_db_session)):
    return await service.get_market_overview(db)

@router.get("/locality/{locality_name}", response_model=schemas.LocalityAnalytics)
async def locality_analytics(locality_name: str, db: AsyncSession = Depends(get_db_session)):
    return await service.get_locality_analytics(db, locality_name)

@router.get("/trends", response_model=List[schemas.TrendData])
async def price_trends(city: str, period: str = "quarterly", db: AsyncSession = Depends(get_db_session)):
    return await service.get_price_trends(db, city, period)

@router.get("/cities")
async def city_summaries(db: AsyncSession = Depends(get_db_session)):
    return await service.get_city_summaries(db)

@router.get("/locality/{id}/comprehensive", response_model=schemas.LocalityComprehensive)
async def locality_comprehensive(id: int, db: AsyncSession = Depends(get_db_session)):
    from fastapi import HTTPException
    result = await service.get_locality_comprehensive(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Locality not found")
    return result