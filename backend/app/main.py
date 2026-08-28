import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.core.redis_client import redis_client
from app.db.seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("props_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Props.ai Real Estate Intelligence Engine...")
    try:
        await seed_database()
        logger.info("Database & All-India Ready Reckoner baseline verified.")
    except Exception as e:
        logger.error(f"Startup initialization warning: {e}")
    yield
    # Graceful shutdown
    try:
        await redis_client.close()
    except Exception:
        pass
    logger.info("Props.ai Engine shut down cleanly.")

app = FastAPI(
    title="Props.ai — Real Estate Intelligence Platform",
    description="Bloomberg + Google Maps + Zillow + RAG AI for Indian Real Estate",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "platform": "Props.ai Real Estate Intelligence",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "rag_valuation": "/api/v1/search/rag-valuation?q=Bandra+Mumbai",
            "india_map_data": "/api/v1/geo/india-map-data",
            "properties": "/api/v1/properties",
            "docs": "/docs"
        }
    }

@app.get("/health")
@app.get("/api/v1/health")
async def health():
    return {"status": "healthy", "service": "props-ai-backend", "engine": "RAG + PostGIS + XGBoost"}