from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.property.router import router as property_router
from app.modules.search.router import router as search_router
from app.modules.geospatial.router import router as geo_router
from app.modules.pricing.router import router as pricing_router
from app.modules.recommendation.router import router as rec_router
from app.modules.analytics.router import router as analytics_router
from app.modules.reports.router import router as reports_router
from app.core.api_gateway import api_gateway

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(property_router, prefix="/properties", tags=["properties"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(geo_router, prefix="/geo", tags=["geospatial"])
api_router.include_router(pricing_router, prefix="/predict", tags=["pricing"])
api_router.include_router(rec_router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])

@api_router.get("/gateway/stats", tags=["gateway"])
async def get_gateway_stats():
    """Returns live telemetry, cache hit ratio, and token savings metrics."""
    return api_gateway.get_gateway_telemetry()