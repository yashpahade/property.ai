from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.property.models import PropertyModel
from app.modules.recommendation.schemas import RecommendationRequest

async def get_recommendations(db: AsyncSession, req: RecommendationRequest):
    query = select(PropertyModel).where(PropertyModel.city == req.city, PropertyModel.actual_price <= req.budget)
    if req.preferred_bhk: query = query.where(PropertyModel.bhk == req.preferred_bhk)
    if req.preferred_zone: query = query.where(PropertyModel.zone == req.preferred_zone)
    query = query.limit(10)
    res = await db.execute(query)
    return res.scalars().all()

async def get_top_localities(db: AsyncSession):
    # Mocking logic
    return [{"locality": "Andheri West", "score": 9.2, "avg_price": 25000000, "trend": "up"}]

async def get_similar_properties(db: AsyncSession, property_id: int):
    # Mocking
    res = await db.execute(select(PropertyModel).limit(5))
    return res.scalars().all()