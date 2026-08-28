from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import asyncio
from app.core.database import get_db_session
from app.modules.search import schemas, service
from app.modules.search.rag_engine import rag_engine
from app.core.gemini_engine import gemini_engine

router = APIRouter()

@router.get("", response_model=schemas.SearchResponse)
async def search(
    q: str = "",
    city: Optional[str] = None,
    zone: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bhk: Optional[int] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    return await service.full_text_search(db, q, city, zone, min_price, max_price, bhk, page, size)

from app.core.api_gateway import api_gateway

@router.get("/gemini-location")
async def get_gemini_location_intelligence(
    q: str = Query(..., description="Query for ANY Indian location: area, town, city, village, gram panchayat, society, or state")
) -> Dict[str, Any]:
    """Google Gemini AI Engine: Deep real estate intelligence with API Gateway caching and token optimization."""
    # 1. API Gateway Cache Check (0 Tokens Consumed)
    cached = api_gateway.get_cached_response(q)
    if cached:
        return cached

    # 2. Live Evaluation & Gateway Store
    result = await asyncio.to_thread(gemini_engine.evaluate_any_location, q)
    api_gateway.store_cached_response(q, result)
    return result

@router.get("/google-ai-overview")
async def get_google_ai_overview(
    q: str = Query(..., description="Query for any city, town, apartment, locality, or state in India"),
    carpet_area_sqft: Optional[float] = Query(None, description="Optional carpet area in sq.ft"),
    bhk: Optional[int] = Query(None, description="Optional BHK count"),
    property_type: Optional[str] = Query(None, description="flat | plot | duplex | villa")
) -> Dict[str, Any]:
    """Google AI Overview Mode with API Gateway Token Optimization."""
    cached = api_gateway.get_cached_response(q)
    if cached:
        return cached
    result = await asyncio.to_thread(gemini_engine.evaluate_any_location, q)
    api_gateway.store_cached_response(q, result)
    return result

@router.post("/google-ai-overview")
async def post_google_ai_overview(data: schemas.RAGValuationRequest) -> Dict[str, Any]:
    """Google AI Overview Mode via POST."""
    return await asyncio.to_thread(gemini_engine.evaluate_any_location, data.query)

@router.get("/rag-valuation")
async def get_rag_valuation(
    q: str = Query(..., description="Query for any city, town, apartment, locality, or state in India"),
    carpet_area_sqft: Optional[float] = Query(None, description="Optional carpet area in sq.ft"),
    bhk: Optional[int] = Query(None, description="Optional BHK count")
) -> Dict[str, Any]:
    """Retrieves verified government Ready Reckoner / Circle rates, prevailing market pricing, and RAG analysis."""
    return await service.rag_valuation_search(q, carpet_area_sqft, bhk)

@router.post("/rag-valuation")
async def post_rag_valuation(data: schemas.RAGValuationRequest) -> Dict[str, Any]:
    """Retrieves verified government Ready Reckoner / Circle rates, prevailing market pricing, and RAG analysis."""
    return await service.rag_valuation_search(data.query, data.carpet_area_sqft, data.bhk)

@router.get("/suggestions", response_model=List[schemas.SearchSuggestion])
async def suggestions(q: str, db: AsyncSession = Depends(get_db_session)):
    return await service.get_suggestions(db, q)

@router.get("/autocomplete", response_model=schemas.AutocompleteResponse)
async def autocomplete(q: str, db: AsyncSession = Depends(get_db_session)):
    return await service.get_autocomplete(db, q)