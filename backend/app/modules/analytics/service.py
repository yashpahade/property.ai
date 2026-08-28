from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.modules.property.models import PropertyModel, LocalityModel, LocalityAnalyticsModel, GovernmentProjectModel
from sqlalchemy.orm import selectinload

async def get_market_overview(db: AsyncSession):
    total = await db.scalar(select(func.count(PropertyModel.id)))
    avg_p = await db.scalar(select(func.avg(PropertyModel.actual_price)))
    return {"avg_price": avg_p or 0, "total_properties": total or 0, "active_listings": total or 0, "zones": {}}

async def get_locality_analytics(db: AsyncSession, locality_name: str):
    avg_p = await db.scalar(select(func.avg(PropertyModel.actual_price)).where(PropertyModel.locality == locality_name))
    return {"locality": locality_name, "avg_price": avg_p or 0, "price_range": "High", "demand_index": 85}

async def get_price_trends(db: AsyncSession, city: str, period: str):
    return [{"period": "2023-Q1", "avg_price": 10000000, "volume": 150}, {"period": "2023-Q2", "avg_price": 10500000, "volume": 180}]

async def get_city_summaries(db: AsyncSession):
    return [{"city": "Mumbai", "total_properties": 1000, "avg_price": 20000000}]

async def get_locality_comprehensive(db: AsyncSession, locality_id: int):
    stmt = (
        select(LocalityModel)
        .options(
            selectinload(LocalityModel.analytics),
            selectinload(LocalityModel.projects)
        )
        .where(LocalityModel.id == locality_id)
    )
    result = await db.execute(stmt)
    locality = result.scalar_one_or_none()
    
    if not locality:
        return None
    
    trends = await get_price_trends(db, locality.city, "quarterly")
    
    return {
        "id": locality.id,
        "name": locality.name,
        "city": locality.city,
        "analytics": locality.analytics,
        "projects": locality.projects,
        "price_trends": trends
    }