from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from app.core.database import get_db_session
from app.modules.pricing import schemas, service

router = APIRouter()

@router.post("", response_model=schemas.PredictionResponse)
async def predict_price(data: schemas.PredictionRequest):
    return await service.predict_property_value(data)

@router.get("/india-rates")
async def get_india_rates(city: Optional[str] = Query("All"), locality: Optional[str] = Query("All")):
    return await service.get_india_rates(city, locality)

@router.post("/batch")
async def batch_predict(requests: List[schemas.PredictionRequest]):
    return [await service.predict_property_value(req) for req in requests]