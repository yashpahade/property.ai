from pydantic import BaseModel
from typing import List, Dict, Any

class MarketOverview(BaseModel):
    avg_price: float
    total_properties: int
    active_listings: int
    zones: Dict[str, Any]

class LocalityAnalytics(BaseModel):
    locality: str
    avg_price: float
    price_range: str
    demand_index: int

class TrendData(BaseModel):
    period: str
    avg_price: float
    volume: int

class LocalityAnalyticsData(BaseModel):
    population: int | None = None
    growth_rate: float | None = None
    demand_score: float | None = None
    supply_score: float | None = None
    crime_score: float | None = None
    aqi: float | None = None
    livability_score: float | None = None
    infra_score: float | None = None
    traffic_score: float | None = None
    flood_risk: str | None = None
    model_config = {"from_attributes": True}

class GovernmentProject(BaseModel):
    id: int
    name: str
    type: str
    status: str
    completion_year: int | None = None
    model_config = {"from_attributes": True}

class LocalityComprehensive(BaseModel):
    id: int
    name: str
    city: str
    analytics: LocalityAnalyticsData | None = None
    projects: List[GovernmentProject] = []
    price_trends: List[TrendData] = []
    model_config = {"from_attributes": True}