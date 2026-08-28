from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from typing import List, Optional, Dict, Any
from app.modules.property.models import PropertyModel, LocalityModel, BuilderModel
from app.modules.search.rag_engine import rag_engine
from app.core.india_data import ALL_INDIA_LOCALITIES

async def rag_valuation_search(q: str, area_sqft: Optional[float] = None, bhk: Optional[int] = None) -> Dict[str, Any]:
    """Invokes RAG engine to retrieve verified government benchmarks and market rate valuations."""
    return rag_engine.synthesize_valuation(query=q, custom_area_sqft=area_sqft, bhk=bhk)

async def full_text_search(
    db: AsyncSession, q: str, city: str = None, zone: str = None,
    min_price: float = None, max_price: float = None, bhk: int = None,
    page: int = 1, size: int = 20
):
    query = select(PropertyModel)
    
    if q and q.strip():
        q_term = f"%{q.strip()}%"
        query = query.where(
            or_(
                PropertyModel.title.ilike(q_term),
                PropertyModel.address.ilike(q_term),
                PropertyModel.locality.ilike(q_term),
                PropertyModel.city.ilike(q_term),
                PropertyModel.state.ilike(q_term)
            )
        )
        
    if city and city != "All":
        query = query.where(PropertyModel.city.ilike(f"%{city}%"))
    if zone and zone != "All":
        query = query.where(PropertyModel.zone == zone)
    if min_price:
        query = query.where(PropertyModel.actual_price >= min_price)
    if max_price:
        query = query.where(PropertyModel.actual_price <= max_price)
    if bhk:
        query = query.where(PropertyModel.bhk == bhk)
    
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset((page - 1) * size).limit(size)
    res = await db.execute(query)
    items = res.scalars().all()
    return {"items": items, "total": total or 0}

async def get_suggestions(db: AsyncSession, q: str):
    results = []
    q_lower = q.lower().strip()
    
    # 1. Search in-memory All-India benchmark knowledge base first
    for loc in ALL_INDIA_LOCALITIES:
        if q_lower in loc["locality"].lower() or q_lower in loc["city"].lower() or q_lower in loc["state"].lower():
            results.append({
                "text": f"{loc['locality']}, {loc['city']}",
                "type": "locality",
                "city": loc["city"],
                "state": loc["state"],
                "circle_rate": loc["circle_rate"],
                "market_rate": loc["market_rate_avg"]
            })
            if len(results) >= 8:
                break
                
    # 2. Search database properties if more needed
    if len(results) < 8:
        db_query = select(PropertyModel.locality, PropertyModel.city, PropertyModel.state).where(
            or_(PropertyModel.locality.ilike(f"%{q}%"), PropertyModel.city.ilike(f"%{q}%"))
        ).distinct().limit(5)
        res = await db.execute(db_query)
        for row in res.all():
            text = f"{row.locality}, {row.city}"
            if not any(r["text"] == text for r in results):
                results.append({
                    "text": text,
                    "type": "locality",
                    "city": row.city,
                    "state": row.state or "Maharashtra"
                })
                
    return results

async def get_autocomplete(db: AsyncSession, q: str):
    results = []
    q_lower = q.lower().strip()
    
    # Check All-India localities
    for idx, loc in enumerate(ALL_INDIA_LOCALITIES):
        if q_lower in loc["locality"].lower() or q_lower in loc["city"].lower() or q_lower in loc["state"].lower():
            results.append({
                "id": 1000 + idx,
                "name": loc["locality"],
                "type": "locality",
                "subtitle": f"{loc['city']}, {loc['state']} • RR: ₹{loc['circle_rate']:,}/sq.ft",
                "circle_rate": loc["circle_rate"],
                "market_rate": loc["market_rate_avg"]
            })
            if len(results) >= 6:
                break
                
    # Search Database Localities
    loc_query = select(LocalityModel).where(LocalityModel.name.ilike(f"%{q}%")).limit(4)
    loc_res = await db.execute(loc_query)
    for loc in loc_res.scalars():
        if not any(r["name"] == loc.name for r in results):
            results.append({
                "id": loc.id,
                "name": loc.name,
                "type": "locality",
                "subtitle": f"{loc.city}, {loc.state or 'Maharashtra'}",
                "circle_rate": loc.circle_rate,
                "market_rate": loc.avg_price_per_sqft
            })
        
    # Search Properties
    prop_query = select(PropertyModel).where(
        or_(PropertyModel.title.ilike(f"%{q}%"), PropertyModel.locality.ilike(f"%{q}%"))
    ).limit(4)
    prop_res = await db.execute(prop_query)
    for prop in prop_res.scalars():
        results.append({
            "id": prop.id,
            "name": prop.title,
            "type": "property",
            "subtitle": f"{prop.locality}, {prop.city} • ₹{prop.actual_price/100000:.1f} Lakhs",
            "market_rate": prop.price_per_sqft
        })
        
    return {"results": results}