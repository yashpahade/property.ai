from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.modules.property.schemas import PropertyResponse

class SearchRequest(BaseModel):
    q: str
    city: Optional[str] = None
    state: Optional[str] = None

class RAGValuationRequest(BaseModel):
    query: str
    carpet_area_sqft: Optional[float] = None
    bhk: Optional[int] = None
    property_type: Optional[str] = "flat"

class SearchSuggestion(BaseModel):
    text: str
    type: str
    city: Optional[str] = None
    state: Optional[str] = None
    circle_rate: Optional[float] = None
    market_rate: Optional[float] = None

class SearchResponse(BaseModel):
    items: List[PropertyResponse]
    total: int

class AutocompleteItem(BaseModel):
    id: Optional[int] = None
    name: str
    type: str # 'locality', 'city', 'state', 'builder', 'property'
    subtitle: Optional[str] = None
    circle_rate: Optional[float] = None
    market_rate: Optional[float] = None
    model_config = {"from_attributes": True}

class AutocompleteResponse(BaseModel):
    results: List[AutocompleteItem]