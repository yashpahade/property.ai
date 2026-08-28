from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base, TimestampMixin

class LocalityModel(Base):
    __tablename__ = "localities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String, index=True)
    state = Column(String, default="Maharashtra")
    zone = Column(String, nullable=True)
    circle_rate = Column(Float, nullable=True)
    avg_price_per_sqft = Column(Float, nullable=True)
    rental_yield = Column(Float, nullable=True)
    cagr_5y = Column(Float, nullable=True)
    ai_score = Column(Float, default=80.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    connectivity = Column(Text, nullable=True)
    
    analytics = relationship("LocalityAnalyticsModel", back_populates="locality", uselist=False)
    projects = relationship("GovernmentProjectModel", back_populates="locality")
    properties = relationship("PropertyModel", back_populates="locality_rel")

class BuilderModel(Base):
    __tablename__ = "builders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    experience_years = Column(Integer, default=10)
    total_projects = Column(Integer, default=5)

class AmenityModel(Base):
    __tablename__ = "amenities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class PredictionModel(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    predicted_price = Column(Float)
    confidence = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    forecast_1y = Column(Float, nullable=True)
    forecast_3y = Column(Float, nullable=True)
    forecast_5y = Column(Float, nullable=True)
    investment_score = Column(Float, default=8.0)

class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    price = Column(Float)
    date = Column(Date)

class PropertyModel(Base, TimestampMixin):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    city = Column(String, index=True)
    state = Column(String, default="Maharashtra", index=True)
    zone = Column(String, nullable=True)
    locality = Column(String, index=True)
    property_type = Column(String, default="flat") # flat, villa, plot, penthouse, rowhouse
    bhk = Column(Integer, default=2)
    carpet_area_sqft = Column(Float, default=1000.0)
    built_up_area_sqft = Column(Float, nullable=True)
    plot_area_sqft = Column(Float, nullable=True)
    property_age_years = Column(Integer, default=0)
    floor = Column(Integer, default=1)
    total_floors = Column(Integer, default=10)
    parking = Column(Integer, default=1)
    lift = Column(Integer, default=1)
    facing = Column(String, default="East")
    builder_id = Column(Integer, ForeignKey("builders.id"), nullable=True)
    locality_id = Column(Integer, ForeignKey("localities.id"), nullable=True)
    ready_reckoner_rate = Column(Float, nullable=True)
    actual_price = Column(Float, index=True)
    price_per_sqft = Column(Float, nullable=True)
    rental_price = Column(Float, nullable=True)
    registration_date = Column(Date, nullable=True)
    rera_id = Column(String, nullable=True)
    source = Column(String, default="Government Registry & MLS")
    ai_score = Column(Float, default=85.0)
    amenities = Column(Text, nullable=True) # JSON list
    description = Column(Text, nullable=True)
    
    builder_rel = relationship("BuilderModel", lazy="joined")
    locality_rel = relationship("LocalityModel", back_populates="properties", lazy="joined")
    prediction_rel = relationship("PredictionModel", uselist=False, lazy="joined")

class LocalityAnalyticsModel(Base):
    __tablename__ = "locality_analytics"
    id = Column(Integer, primary_key=True, index=True)
    locality_id = Column(Integer, ForeignKey("localities.id"), unique=True)
    population = Column(Integer, default=50000)
    growth_rate = Column(Float, default=10.5)
    demand_score = Column(Float, default=85.0)
    supply_score = Column(Float, default=70.0)
    crime_score = Column(Float, default=15.0)
    aqi = Column(Float, default=75.0)
    livability_score = Column(Float, default=9.0)
    infra_score = Column(Float, default=9.2)
    traffic_score = Column(Float, default=6.5)
    flood_risk = Column(String, default="Low")
    
    locality = relationship("LocalityModel", back_populates="analytics")

class GovernmentProjectModel(Base):
    __tablename__ = "government_projects"
    id = Column(Integer, primary_key=True, index=True)
    locality_id = Column(Integer, ForeignKey("localities.id"), nullable=True)
    locality_name = Column(String, nullable=True)
    city = Column(String, default="Mumbai")
    name = Column(String)
    type = Column(String)  # 'Metro', 'Highway', 'Airport', 'Bridge', 'Smart City'
    status = Column(String, default="Under Construction") # 'Operational', 'Under Construction', 'Proposed'
    completion_year = Column(Integer, default=2026)
    budget_cr = Column(Float, default=5000.0)
    impact_radius_km = Column(Float, default=5.0)
    
    locality = relationship("LocalityModel", back_populates="projects")