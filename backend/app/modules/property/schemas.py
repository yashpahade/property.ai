from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class PropertyBase(BaseModel):
    title: str
    address: str
    latitude: float
    longitude: float
    city: str
    zone: str
    locality: str
    property_type: str
    bhk: int
    carpet_area_sqft: float
    built_up_area_sqft: Optional[float] = None
    plot_area_sqft: Optional[float] = None
    property_age_years: Optional[int] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    parking: Optional[int] = None
    lift: Optional[int] = None
    facing: Optional[str] = None
    ready_reckoner_rate: Optional[float] = None
    actual_price: Optional[float] = None
    rental_price: Optional[float] = None
    registration_date: Optional[date] = None
    rera_id: Optional[str] = None
    source: Optional[str] = None

class PropertyCreateRequest(PropertyBase):
    pass

class BuilderResponse(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class LocalityResponse(BaseModel):
    id: int
    name: str
    city: str
    model_config = ConfigDict(from_attributes=True)

class PropertyResponse(PropertyBase):
    id: int
    created_at: datetime
    builder_rel: Optional[BuilderResponse] = None
    locality_rel: Optional[LocalityResponse] = None
    model_config = ConfigDict(from_attributes=True)

class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    size: int

class PropertyFilters(BaseModel):
    q: Optional[str] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    locality: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bhk: Optional[int] = None
    property_type: Optional[str] = None