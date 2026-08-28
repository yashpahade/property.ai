from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class PredictionRequest(BaseModel):
    bhk: int
    carpet_area_sqft: float
    city: str
    locality: str
    property_type: str = "flat"
    property_age_years: Optional[int] = 0

class PredictionResponse(BaseModel):
    predicted_price: float
    price_per_sqft: Optional[float] = None
    ready_reckoner_rate: Optional[float] = None
    confidence: float
    lower_bound: float
    upper_bound: float
    forecast_1y: Optional[float] = None
    forecast_3y: Optional[float] = None
    forecast_5y: Optional[float] = None
    investment_score: Optional[float] = None
    investment_rating: Optional[str] = None
    anomaly_status: Optional[str] = None
    rental_yield: Optional[float] = None
    government_data: Optional[Dict[str, Any]] = None
    sources: Optional[List[str]] = None
    model_config = {"extra": "allow"}