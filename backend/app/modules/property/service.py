import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from app.modules.property.models import PropertyModel, LocalityModel, BuilderModel
from app.modules.property.schemas import PropertyFilters, PropertyCreateRequest

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance in kilometers between two lat/lng coordinates."""
    r = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

async def get_properties(db: AsyncSession, filters: PropertyFilters, page: int = 1, size: int = 20, sort_by: str = None):
    query = select(PropertyModel)
    
    if filters.city and filters.city != "All":
        query = query.where(PropertyModel.city.ilike(f"%{filters.city}%"))
    if filters.zone and filters.zone != "All":
        query = query.where(PropertyModel.zone == filters.zone)
    if filters.locality and filters.locality != "All":
        query = query.where(PropertyModel.locality.ilike(f"%{filters.locality}%"))
    if filters.min_price:
        query = query.where(PropertyModel.actual_price >= filters.min_price)
    if filters.max_price:
        query = query.where(PropertyModel.actual_price <= filters.max_price)
    if filters.bhk:
        query = query.where(PropertyModel.bhk == filters.bhk)
    if filters.property_type and filters.property_type != "All":
        query = query.where(PropertyModel.property_type.ilike(f"%{filters.property_type}%"))
    
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(PropertyModel.actual_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(PropertyModel.actual_price.desc())
    elif sort_by == "score":
        query = query.order_by(PropertyModel.ai_score.desc())
    else:
        query = query.order_by(PropertyModel.id.asc())
        
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {"items": items, "total": total or 0, "page": page, "size": size}

async def get_property_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(PropertyModel).where(PropertyModel.id == id))
    return result.scalars().first()

async def create_property(db: AsyncSession, data: PropertyCreateRequest):
    data_dict = data.model_dump()
    if not data_dict.get("price_per_sqft") and data_dict.get("actual_price") and data_dict.get("carpet_area_sqft"):
        data_dict["price_per_sqft"] = round(data_dict["actual_price"] / data_dict["carpet_area_sqft"])
    db_item = PropertyModel(**data_dict)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def get_nearby_properties(db: AsyncSession, lat: float, lon: float, radius_km: float = 10.0):
    # Fetch properties within a bounding box first for speed
    lat_deg_delta = radius_km / 111.0
    lon_deg_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    
    query = select(PropertyModel).where(
        PropertyModel.latitude.between(lat - lat_deg_delta, lat + lat_deg_delta),
        PropertyModel.longitude.between(lon - lon_deg_delta, lon + lon_deg_delta)
    )
    result = await db.execute(query)
    all_candidates = result.scalars().all()
    
    # Filter by exact Haversine distance
    matching = []
    for prop in all_candidates:
        dist = haversine_distance(lat, lon, prop.latitude, prop.longitude)
        if dist <= radius_km:
            matching.append(prop)
            
    return matching

async def get_property_stats(db: AsyncSession):
    query = select(
        PropertyModel.city,
        func.count(PropertyModel.id).label('count'),
        func.avg(PropertyModel.actual_price).label('avg_price'),
        func.avg(PropertyModel.price_per_sqft).label('avg_rate')
    ).group_by(PropertyModel.city)
    res = await db.execute(query)
    return [{"city": r.city, "count": r.count, "avg_price": round(r.avg_price or 0), "avg_rate": round(r.avg_rate or 0)} for r in res.all()]