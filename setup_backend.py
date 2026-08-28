import os

base_dir = r"c:\Users\omkar\Desktop\props.ai\backend"
files = {
    "requirements.txt": """fastapi>=0.110.0
uvicorn[standard]>=0.28.0
sqlalchemy[asyncio]>=2.0.25
asyncpg>=0.29.0
geoalchemy2>=0.14.0
redis>=5.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic-settings>=2.1.0
httpx>=0.26.0
python-multipart>=0.0.6
alembic>=1.13.0""",
    "Dockerfile": """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]""",
    "app/__init__.py": "",
    "app/config.py": """from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://propsai:propsai_dev_2024@localhost:5432/propsai_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET_KEY: str = "supersecretkey_change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ML_MODELS_PATH: str = "../ml/models/registry/production"
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()""",
    "app/core/__init__.py": "",
    "app/core/database.py": """from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncAttrs, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(AsyncAttrs, DeclarativeBase):
    pass

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

async def get_db_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise""",
    "app/core/redis_client.py": """import redis.asyncio as redis
import json
from app.config import settings

class RedisCacheService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return cls._instance

    async def get(self, key: str):
        data = await self.client.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: dict, ttl: int = 3600):
        await self.client.set(key, json.dumps(value), ex=ttl)

    async def delete(self, key: str):
        await self.client.delete(key)
        
    async def delete_by_pattern(self, pattern: str):
        keys = await self.client.keys(pattern)
        if keys:
            await self.client.delete(*keys)

redis_client = RedisCacheService()""",
    "app/core/security.py": """from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return {}""",
    "app/core/middleware.py": """import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("props.ai")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Duration: {process_time:.4f}s")
        return response""",
    "app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.middleware import RequestLoggingMiddleware
from app.api.v1.router import api_router
from app.core.redis_client import redis_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup if necessary
    yield
    # Cleanup on shutdown
    await redis_client.client.close()

app = FastAPI(title="Props.ai API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"name": "Props.ai API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}""",
    "app/api/__init__.py": "",
    "app/api/v1/__init__.py": "",
    "app/api/v1/router.py": """from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.property.router import router as property_router
from app.modules.search.router import router as search_router
from app.modules.geospatial.router import router as geo_router
from app.modules.pricing.router import router as pricing_router
from app.modules.recommendation.router import router as rec_router
from app.modules.analytics.router import router as analytics_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(property_router, prefix="/properties", tags=["properties"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(geo_router, prefix="/geo", tags=["geospatial"])
api_router.include_router(pricing_router, prefix="/predict", tags=["pricing"])
api_router.include_router(rec_router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])""",
    "app/modules/__init__.py": "",
    "app/modules/auth/__init__.py": "",
    "app/modules/auth/models.py": """from sqlalchemy import Column, Integer, String
from app.core.database import Base, TimestampMixin

class UserModel(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    role = Column(String, default="user")""",
    "app/modules/auth/schemas.py": """from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)""",
    "app/modules/auth/dependencies.py": """from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.security import verify_token
from app.modules.auth.models import UserModel
from app.modules.auth.service import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception
    user = await get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user

def require_role(role: str):
    async def role_checker(current_user: UserModel = Depends(get_current_user)):
        if current_user.role != role and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return current_user
    return role_checker""",
    "app/modules/auth/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.auth.models import UserModel
from app.modules.auth.schemas import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from fastapi import HTTPException

async def get_user_by_email(db: AsyncSession, email: str) -> UserModel:
    result = await db.execute(select(UserModel).where(UserModel.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> UserModel:
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    return result.scalars().first()

async def register_user(db: AsyncSession, data: RegisterRequest):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = UserModel(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)})
    }

async def authenticate_user(db: AsyncSession, data: LoginRequest):
    user = await get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)})
    }""",
    "app/modules/auth/router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.modules.auth import schemas, service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import UserModel

router = APIRouter()

@router.post("/register", response_model=schemas.TokenResponse)
async def register(data: schemas.RegisterRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.register_user(db, data)

@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.LoginRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.authenticate_user(db, data)

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user""",
    "app/modules/property/__init__.py": "",
    "app/modules/property/models.py": """from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base, TimestampMixin

class LocalityModel(Base):
    __tablename__ = "localities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    city = Column(String)

class BuilderModel(Base):
    __tablename__ = "builders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class AmenityModel(Base):
    __tablename__ = "amenities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class PredictionModel(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    predicted_price = Column(Float)
    confidence = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)

class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    price = Column(Float)
    date = Column(Date)

class PropertyModel(Base, TimestampMixin):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    city = Column(String)
    zone = Column(String)
    locality = Column(String)
    property_type = Column(String)
    bhk = Column(Integer)
    carpet_area_sqft = Column(Float)
    built_up_area_sqft = Column(Float)
    plot_area_sqft = Column(Float)
    property_age_years = Column(Integer)
    floor = Column(Integer)
    total_floors = Column(Integer)
    parking = Column(Integer)
    lift = Column(Integer)
    facing = Column(String)
    builder_id = Column(Integer, ForeignKey("builders.id"), nullable=True)
    locality_id = Column(Integer, ForeignKey("localities.id"), nullable=True)
    ready_reckoner_rate = Column(Float)
    actual_price = Column(Float)
    rental_price = Column(Float)
    registration_date = Column(Date)
    rera_id = Column(String)
    source = Column(String)
    
    geom = Column(Geometry('POINT', srid=4326))
    
    builder_rel = relationship("BuilderModel", lazy="joined")
    locality_rel = relationship("LocalityModel", lazy="joined")
    prediction_rel = relationship("PredictionModel", uselist=False, lazy="joined")""",
    "app/modules/property/schemas.py": """from pydantic import BaseModel, ConfigDict
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
    city: Optional[str] = None
    zone: Optional[str] = None
    locality: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bhk: Optional[int] = None
    property_type: Optional[str] = None""",
    "app/modules/property/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.modules.property.models import PropertyModel
from app.modules.property.schemas import PropertyFilters, PropertyCreateRequest
from geoalchemy2.functions import ST_DWithin
from geoalchemy2.elements import WKTElement

async def get_properties(db: AsyncSession, filters: PropertyFilters, page: int, size: int, sort_by: str = None):
    query = select(PropertyModel)
    if filters.city: query = query.where(PropertyModel.city == filters.city)
    if filters.zone: query = query.where(PropertyModel.zone == filters.zone)
    if filters.locality: query = query.where(PropertyModel.locality == filters.locality)
    if filters.min_price: query = query.where(PropertyModel.actual_price >= filters.min_price)
    if filters.max_price: query = query.where(PropertyModel.actual_price <= filters.max_price)
    if filters.bhk: query = query.where(PropertyModel.bhk == filters.bhk)
    if filters.property_type: query = query.where(PropertyModel.property_type == filters.property_type)
    
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()
    return {"items": items, "total": total or 0, "page": page, "size": size}

async def get_property_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(PropertyModel).where(PropertyModel.id == id))
    return result.scalars().first()

async def create_property(db: AsyncSession, data: PropertyCreateRequest):
    geom = WKTElement(f'POINT({data.longitude} {data.latitude})', srid=4326)
    db_item = PropertyModel(**data.model_dump(), geom=geom)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def get_nearby_properties(db: AsyncSession, lat: float, lon: float, radius_km: float):
    pt = WKTElement(f'POINT({lon} {lat})', srid=4326)
    query = select(PropertyModel).where(ST_DWithin(PropertyModel.geom, pt, radius_km * 1000, use_spheroid=True))
    result = await db.execute(query)
    return result.scalars().all()

async def get_property_stats(db: AsyncSession):
    query = select(PropertyModel.city, func.count(PropertyModel.id).label('count'), func.avg(PropertyModel.actual_price).label('avg_price')).group_by(PropertyModel.city)
    res = await db.execute(query)
    return [{"city": r.city, "count": r.count, "avg_price": r.avg_price} for r in res.all()]""",
    "app/modules/property/router.py": """from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db_session
from app.modules.property import schemas, service
from app.modules.auth.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=schemas.PropertyListResponse)
async def list_properties(
    city: Optional[str] = None, zone: Optional[str] = None, locality: Optional[str] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    bhk: Optional[int] = None, property_type: Optional[str] = None, sort_by: Optional[str] = None,
    page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    filters = schemas.PropertyFilters(
        city=city, zone=zone, locality=locality, min_price=min_price, max_price=max_price,
        bhk=bhk, property_type=property_type
    )
    return await service.get_properties(db, filters, page, size, sort_by)

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db_session)):
    return await service.get_property_stats(db)

@router.get("/nearby", response_model=List[schemas.PropertyResponse])
async def nearby_properties(lat: float, lon: float, radius_km: float = 5.0, db: AsyncSession = Depends(get_db_session)):
    return await service.get_nearby_properties(db, lat, lon, radius_km)

@router.get("/{id}", response_model=schemas.PropertyResponse)
async def get_property(id: int, db: AsyncSession = Depends(get_db_session)):
    p = await service.get_property_by_id(db, id)
    if not p:
        raise HTTPException(status_code=404, detail="Property not found")
    return p

@router.post("", response_model=schemas.PropertyResponse)
async def add_property(data: schemas.PropertyCreateRequest, db: AsyncSession = Depends(get_db_session), user=Depends(get_current_user)):
    return await service.create_property(db, data)""",
    "app/modules/search/__init__.py": "",
    "app/modules/search/schemas.py": """from pydantic import BaseModel
from typing import List, Optional
from app.modules.property.schemas import PropertyResponse

class SearchRequest(BaseModel):
    q: str

class SearchSuggestion(BaseModel):
    text: str
    type: str

class SearchResponse(BaseModel):
    items: List[PropertyResponse]
    total: int""",
    "app/modules/search/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from app.modules.property.models import PropertyModel

async def full_text_search(db: AsyncSession, q: str, city: str = None, zone: str = None, min_price: float = None, max_price: float = None, bhk: int = None, page: int = 1, size: int = 10):
    query = select(PropertyModel).where(
        or_(
            PropertyModel.title.ilike(f"%{q}%"),
            PropertyModel.address.ilike(f"%{q}%"),
            PropertyModel.locality.ilike(f"%{q}%")
        )
    )
    if city: query = query.where(PropertyModel.city == city)
    if zone: query = query.where(PropertyModel.zone == zone)
    if min_price: query = query.where(PropertyModel.actual_price >= min_price)
    if max_price: query = query.where(PropertyModel.actual_price <= max_price)
    if bhk: query = query.where(PropertyModel.bhk == bhk)
    
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset((page - 1) * size).limit(size)
    res = await db.execute(query)
    return {"items": res.scalars().all(), "total": total or 0}

async def get_suggestions(db: AsyncSession, q: str):
    query = select(PropertyModel.locality).where(PropertyModel.locality.ilike(f"%{q}%")).distinct().limit(5)
    res = await db.execute(query)
    return [{"text": r, "type": "locality"} for r in res.scalars().all()]""",
    "app/modules/search/router.py": """from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db_session
from app.modules.search import schemas, service

router = APIRouter()

@router.get("", response_model=schemas.SearchResponse)
async def search(
    q: str, city: Optional[str] = None, zone: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, bhk: Optional[int] = None,
    sort_by: Optional[str] = None, page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100), db: AsyncSession = Depends(get_db_session)
):
    return await service.full_text_search(db, q, city, zone, min_price, max_price, bhk, page, size)

@router.get("/suggestions", response_model=List[schemas.SearchSuggestion])
async def suggestions(q: str, db: AsyncSession = Depends(get_db_session)):
    return await service.get_suggestions(db, q)""",
    "app/modules/geospatial/__init__.py": "",
    "app/modules/geospatial/schemas.py": """from pydantic import BaseModel
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
    formatted_address: str""",
    "app/modules/geospatial/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.property.models import PropertyModel

async def get_nearby_amenities(lat: float, lon: float, radius_m: float, types: str):
    # Mocking Overpass API for now
    return [{"name": "Mock Park", "type": "park", "distance_m": 120.5, "lat": lat + 0.001, "lon": lon + 0.001}]

async def get_heatmap_data(db: AsyncSession, city: str, metric: str):
    query = select(PropertyModel.latitude, PropertyModel.longitude, PropertyModel.actual_price).where(PropertyModel.city == city)
    res = await db.execute(query)
    data = res.all()
    return [{"lat": r.latitude, "lon": r.longitude, "weight": float(r.actual_price or 1)} for r in data]

async def geocode_address(address: str):
    # Mocking Nominatim
    return {"lat": 19.0760, "lon": 72.8777, "formatted_address": address}""",
    "app/modules/geospatial/router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db_session
from app.modules.geospatial import schemas, service

router = APIRouter()

@router.get("/amenities", response_model=List[schemas.AmenityResponse])
async def get_amenities(lat: float, lon: float, radius_m: float = 1000, types: str = "school,hospital"):
    return await service.get_nearby_amenities(lat, lon, radius_m, types)

@router.get("/heatmap", response_model=List[schemas.HeatmapPoint])
async def get_heatmap(city: str, metric: str = "price", db: AsyncSession = Depends(get_db_session)):
    return await service.get_heatmap_data(db, city, metric)

@router.get("/geocode", response_model=schemas.GeocodeResponse)
async def geocode(address: str):
    return await service.geocode_address(address)""",
    "app/modules/pricing/__init__.py": "",
    "app/modules/pricing/schemas.py": """from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    bhk: int
    carpet_area_sqft: float
    city: str
    locality: str
    property_type: str
    property_age_years: Optional[int] = 0

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence: float
    lower_bound: float
    upper_bound: float
    forecast_1y: Optional[float] = None
    forecast_3y: Optional[float] = None
    forecast_5y: Optional[float] = None
    investment_score: Optional[float] = None
    investment_rating: Optional[str] = None
    anomaly_status: Optional[str] = None""",
    "app/modules/pricing/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.property.models import PredictionModel
from app.modules.pricing.schemas import PredictionRequest
import random

async def predict_property_value(data: PredictionRequest):
    # Mock ML prediction / fallback to estimation
    base = data.carpet_area_sqft * 15000 if data.city.lower() == "mumbai" else data.carpet_area_sqft * 5000
    return {
        "predicted_price": base,
        "confidence": 0.85,
        "lower_bound": base * 0.9,
        "upper_bound": base * 1.1,
        "forecast_1y": base * 1.05,
        "forecast_3y": base * 1.15,
        "forecast_5y": base * 1.25,
        "investment_score": 8.5,
        "investment_rating": "Excellent",
        "anomaly_status": "normal"
    }

async def get_prediction_by_id(db: AsyncSession, property_id: int):
    res = await db.execute(select(PredictionModel).where(PredictionModel.property_id == property_id))
    pred = res.scalars().first()
    if pred:
        return {
            "predicted_price": pred.predicted_price,
            "confidence": pred.confidence,
            "lower_bound": pred.lower_bound,
            "upper_bound": pred.upper_bound,
            "investment_score": 7.0,
            "investment_rating": "Good",
            "anomaly_status": "normal"
        }
    return await predict_property_value(PredictionRequest(bhk=2, carpet_area_sqft=1000, city="Unknown", locality="Unknown", property_type="Apartment"))

async def batch_predict(requests: list[PredictionRequest]):
    return [await predict_property_value(req) for req in requests]""",
    "app/modules/pricing/router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db_session
from app.modules.pricing import schemas, service

router = APIRouter()

@router.post("", response_model=schemas.PredictionResponse)
async def predict(data: schemas.PredictionRequest):
    return await service.predict_property_value(data)

@router.get("/{property_id}", response_model=schemas.PredictionResponse)
async def get_prediction(property_id: int, db: AsyncSession = Depends(get_db_session)):
    return await service.get_prediction_by_id(db, property_id)

@router.post("/batch", response_model=List[schemas.PredictionResponse])
async def batch_predict(data: List[schemas.PredictionRequest]):
    return await service.batch_predict(data)""",
    "app/modules/recommendation/__init__.py": "",
    "app/modules/recommendation/schemas.py": """from pydantic import BaseModel
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
    trend: str""",
    "app/modules/recommendation/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.property.models import PropertyModel
from app.modules.recommendation.schemas import RecommendationRequest

async def get_recommendations(db: AsyncSession, req: RecommendationRequest):
    query = select(PropertyModel).where(PropertyModel.city == req.city, PropertyModel.actual_price <= req.budget)
    if req.preferred_bhk: query = query.where(PropertyModel.bhk == req.preferred_bhk)
    if req.preferred_zone: query = query.where(PropertyModel.zone == req.preferred_zone)
    query = query.limit(10)
    res = await db.execute(query)
    return res.scalars().all()

async def get_top_localities(db: AsyncSession):
    # Mocking logic
    return [{"locality": "Andheri West", "score": 9.2, "avg_price": 25000000, "trend": "up"}]

async def get_similar_properties(db: AsyncSession, property_id: int):
    # Mocking
    res = await db.execute(select(PropertyModel).limit(5))
    return res.scalars().all()""",
    "app/modules/recommendation/router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db_session
from app.modules.recommendation import schemas, service
from app.modules.property.schemas import PropertyResponse

router = APIRouter()

@router.post("", response_model=List[PropertyResponse])
async def recommendations(data: schemas.RecommendationRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.get_recommendations(db, data)

@router.get("/top-localities", response_model=List[schemas.LocalityScore])
async def top_localities(db: AsyncSession = Depends(get_db_session)):
    return await service.get_top_localities(db)

@router.get("/similar/{property_id}", response_model=List[PropertyResponse])
async def similar_properties(property_id: int, db: AsyncSession = Depends(get_db_session)):
    return await service.get_similar_properties(db, property_id)""",
    "app/modules/analytics/__init__.py": "",
    "app/modules/analytics/schemas.py": """from pydantic import BaseModel
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
    volume: int""",
    "app/modules/analytics/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.modules.property.models import PropertyModel

async def get_market_overview(db: AsyncSession):
    total = await db.scalar(select(func.count(PropertyModel.id)))
    avg_p = await db.scalar(select(func.avg(PropertyModel.actual_price)))
    return {"avg_price": avg_p or 0, "total_properties": total or 0, "active_listings": total or 0, "zones": {}}

async def get_locality_analytics(db: AsyncSession, locality_name: str):
    avg_p = await db.scalar(select(func.avg(PropertyModel.actual_price)).where(PropertyModel.locality == locality_name))
    return {"locality": locality_name, "avg_price": avg_p or 0, "price_range": "High", "demand_index": 85}

async def get_price_trends(db: AsyncSession, city: str, period: str):
    return [{"period": "2023-Q1", "avg_price": 10000000, "volume": 150}, {"period": "2023-Q2", "avg_price": 10500000, "volume": 180}]

async def get_city_summaries(db: AsyncSession):
    return [{"city": "Mumbai", "total_properties": 1000, "avg_price": 20000000}]""",
    "app/modules/analytics/router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.core.database import get_db_session
from app.modules.analytics import schemas, service

router = APIRouter()

@router.get("/market", response_model=schemas.MarketOverview)
async def market_overview(db: AsyncSession = Depends(get_db_session)):
    return await service.get_market_overview(db)

@router.get("/locality/{locality_name}", response_model=schemas.LocalityAnalytics)
async def locality_analytics(locality_name: str, db: AsyncSession = Depends(get_db_session)):
    return await service.get_locality_analytics(db, locality_name)

@router.get("/trends", response_model=List[schemas.TrendData])
async def price_trends(city: str, period: str = "quarterly", db: AsyncSession = Depends(get_db_session)):
    return await service.get_price_trends(db, city, period)

@router.get("/cities")
async def city_summaries(db: AsyncSession = Depends(get_db_session)):
    return await service.get_city_summaries(db)"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Generated {len(files)} files successfully.")
