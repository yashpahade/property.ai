from pydantic import BaseModel
from typing import List

class AmenityResponse(BaseModel):
    name: str
    type: str
    distance_m: float
    lat: float
    lon: float

class HeatmapPoint(BaseModel):
    lat: float
    lon: float
    weight: float

class GeocodeResponse(BaseModel):
    lat: float
    lon: float
    formatted_address: str

class MapCluster(BaseModel):
    lat: float
    lon: float
    count: int
    avg_price: float | None = None
    min_lat: float | None = None
    min_lon: float | None = None
    max_lat: float | None = None
    max_lon: float | None = None
    model_config = {"from_attributes": True}

class MapClusterResponse(BaseModel):
    clusters: List[MapCluster]