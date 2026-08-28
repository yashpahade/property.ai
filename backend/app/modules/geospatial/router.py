from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from app.core.database import get_db_session
from app.modules.geospatial import service

router = APIRouter()

@router.get("/india-map-data")
async def get_india_map_data(
    city: Optional[str] = Query("All", description="Filter by city name"),
    state: Optional[str] = Query("All", description="Filter by state name")
):
    """Returns geospatial datasets of Indian micro-markets with verified circle rates and prices."""
    return await service.get_india_map_data(city, state)

@router.get("/cities")
async def get_cities():
    """Returns all available states and cities."""
    return await service.get_available_cities()

@router.get("/amenities")
async def get_amenities(lat: float, lon: float, radius_m: float = 2000, types: str = "all"):
    return await service.get_nearby_amenities(lat, lon, radius_m, types)

@router.get("/heatmap")
async def get_heatmap(city: str = "All", metric: str = "price", db: AsyncSession = Depends(get_db_session)):
    return await service.get_heatmap_data(db, city, metric)