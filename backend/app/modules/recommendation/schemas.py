from pydantic import BaseModel
from typing import Optional

class RecommendationRequest(BaseModel):
    budget: float
    city: str
    preferred_bhk: Optional[int] = None
    preferred_zone: Optional[str] = None

class LocalityScore(BaseModel):
    locality: str
    score: float
    avg_price: float
    trend: str