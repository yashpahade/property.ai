# Props.ai — Real Estate Intelligence Platform

> Bloomberg + Google Maps + Zillow + AI for Indian Real Estate

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![XGBoost](https://img.shields.io/badge/XGBoost-337AB7?style=flat-square)](https://xgboost.readthedocs.io)

## Architecture

```
                          Users
                            │
              ┌─────────────┴─────────────┐
              │                           │
         Next.js 14                  Flutter (future)
              │                           │
              └─────────────┬─────────────┘
                            │
                     API Gateway
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
     Auth Service    Property API       Search API
          │                 │                 │
          └────────────┬────┴─────────────────┘
                       │
               FastAPI Backend
                       │
     ┌────────────┬────┴────┬──────────────┐
     │            │         │              │
  Pricing    Geospatial   Recommend   Analytics
     │            │         │              │
     └────────────┴────┬────┴──────────────┘
                       │
              AI Prediction Engine
              (XGBoost + LightGBM + CatBoost)
                       │
              ┌────────┴────────┐
              │                 │
         PostgreSQL          Redis
         + PostGIS           Cache
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Recharts, Leaflet |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **AI/ML** | XGBoost, LightGBM, CatBoost (Ensemble) |
| **Database** | PostgreSQL 16 + PostGIS 3.4 |
| **Cache** | Redis 7 |
| **Maps** | OpenStreetMap + Overpass API |
| **Auth** | JWT (HS256) + RBAC |
| **Container** | Docker Compose |

## Features

### 🏠 Property Intelligence
- 10,000+ properties across Mumbai, Pune, Nagpur, Nashik
- Normalized database with 10 tables
- Full-text search with PostgreSQL tsvector
- Spatial queries with PostGIS

### 🧠 AI-Powered Valuation
- **Price Prediction**: Ensemble of XGBoost + LightGBM + CatBoost
- **Future Forecasting**: 1Y, 3Y, 5Y price projections
- **Investment Scoring**: 4-factor composite score (0-100)
- **Fraud Detection**: Isolation Forest anomaly detection
- **Confidence Intervals**: Prediction variance across folds

### 🗺️ Geospatial Intelligence
- OpenStreetMap integration
- Nearby amenities (schools, hospitals, gyms, metro)
- Heatmap visualization
- Distance calculations via Haversine

### 📊 Market Analytics
- City/zone/locality comparisons
- Price trend analysis
- Rental yield calculations
- Growth score tracking

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 with PostGIS
- Redis 7

### Gemini AI Setup
Copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY` to your
Google AI Studio key. The key is read only by the FastAPI backend and is never
sent to the browser. `GEMINI_MODEL` defaults to `gemini-2.5-flash`.

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Initialize Database
```bash
psql -h localhost -U propsai -d propsai_db -f database/init.sql
```

### 3. Run ETL Pipeline
```bash
cd etl
pip install -r requirements.txt
python ingest_csv.py          # Ingest 30 real records
python generate_synthetic.py  # Generate ~10,000 synthetic records
python osm_enrichment.py --limit 50  # Enrich with OSM data
```

### 4. Train ML Models
```bash
cd ml
pip install -r requirements.txt
python -m training.train_ensemble
python -m training.train_anomaly
python -m training.evaluate
```

### 5. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 6. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Open the Platform
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user profile |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/properties` | List with filters |
| GET | `/api/v1/properties/{id}` | Property detail |
| GET | `/api/v1/properties/nearby` | Spatial search |
| GET | `/api/v1/properties/stats` | Market stats |

### AI Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict` | AI price prediction |
| POST | `/api/v1/predict/batch` | Batch predictions |

### Search & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Full-text search |
| GET | `/api/v1/analytics/market` | Market overview |
| GET | `/api/v1/analytics/trends` | Price trends |

## Project Structure

```
props.ai/
├── frontend/          # Next.js 14 + TypeScript
├── backend/           # FastAPI modular monolith
│   └── app/
│       ├── core/      # Database, Redis, Security
│       ├── api/v1/    # Version 1 routes
│       └── modules/   # Domain modules
│           ├── auth/
│           ├── property/
│           ├── search/
│           ├── geospatial/
│           ├── pricing/
│           ├── recommendation/
│           └── analytics/
├── ml/                # Machine Learning pipeline
│   ├── training/      # Feature eng, model training
│   ├── inference/     # Production inference
│   └── models/        # Model registry
├── etl/               # Data pipeline
├── database/          # SQL schemas
└── docker-compose.yml
```

## Data Pipeline

```
Government Sources     Property Listings     OpenStreetMap
       │                      │                    │
       └──────────┬───────────┘                    │
                  │                                │
            ETL Pipeline                    Overpass API
                  │                                │
            ┌─────┴─────┐                         │
            │           │                         │
        Cleaning   Validation                     │
            │           │                         │
            └─────┬─────┘                         │
                  │                                │
           Normalization ──────────────────────────┘
                  │
           Master Database
                  │
           Feature Store
                  │
           Model Training
                  │
         Prediction API
```

## License

MIT
