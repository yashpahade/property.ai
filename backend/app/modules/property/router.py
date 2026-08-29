from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db_session
from app.modules.property import schemas, service
from app.modules.auth.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=schemas.PropertyListResponse)
async def list_properties(
    q: Optional[str] = None,
    city: Optional[str] = None, zone: Optional[str] = None, locality: Optional[str] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    bhk: Optional[int] = None, property_type: Optional[str] = None, sort_by: Optional[str] = None,
    page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    filters = schemas.PropertyFilters(
        q=q, city=city, zone=zone, locality=locality, min_price=min_price, max_price=max_price,
        bhk=bhk, property_type=property_type
    )
    return await service.get_properties(db, filters, page, size, sort_by)

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db_session)):
    return await service.get_property_stats(db)

@router.get("/nearby", response_model=List[schemas.PropertyResponse])
async def nearby_properties(lat: float, lon: float, radius_km: float = 5.0, db: AsyncSession = Depends(get_db_session)):
    return await service.get_nearby_properties(db, lat, lon, radius_km)

@router.get("/{id}", response_model=schemas.PropertyResponse)
async def get_property(id: int, db: AsyncSession = Depends(get_db_session)):
    p = await service.get_property_by_id(db, id)
    if not p:
        raise HTTPException(status_code=404, detail="Property not found")
    return p

@router.post("", response_model=schemas.PropertyResponse)
async def add_property(data: schemas.PropertyCreateRequest, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    return await service.create_property(db, data)