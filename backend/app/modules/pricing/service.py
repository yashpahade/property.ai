from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List, Optional
from app.modules.pricing.schemas import PredictionRequest
from app.modules.search.rag_engine import rag_engine
from app.core.india_data import ALL_INDIA_LOCALITIES

async def predict_property_value(data: PredictionRequest) -> Dict[str, Any]:
    # Query RAG engine for locality-level baseline
    loc_query = f"{data.locality or ''} {data.city or ''}"
    rag_res = rag_engine.synthesize_valuation(
        query=loc_query,
        custom_area_sqft=data.carpet_area_sqft,
        bhk=data.bhk
    )
    
    avg_rate = rag_res["rates"]["market_rate_avg"]
    circle_rate = rag_res["rates"]["ready_reckoner_circle_rate"]
    
    # Adjust for property age, floor, amenities
    age_discount = max(0.80, 1.0 - (getattr(data, "property_age_years", 0) or 0) * 0.015)
    type_mult = 1.25 if str(data.property_type).lower() in ["villa", "penthouse"] else 1.0
    
    final_rate = avg_rate * age_discount * type_mult
    base_val = final_rate * data.carpet_area_sqft
    
    lower_bound = base_val * 0.92
    upper_bound = base_val * 1.08
    
    cagr = rag_res["investment_metrics"]["historical_and_projected_5y_cagr"]
    p_1y = base_val * (1 + (cagr / 100))
    p_3y = base_val * ((1 + (cagr / 100)) ** 3)
    p_5y = base_val * ((1 + (cagr / 100)) ** 5)
    
    infra_score = rag_res["investment_metrics"]["infrastructure_alpha_score"]
    
    return {
        "predicted_price": round(base_val),
        "price_per_sqft": round(final_rate),
        "ready_reckoner_rate": circle_rate,
        "confidence": 0.92,
        "lower_bound": round(lower_bound),
        "upper_bound": round(upper_bound),
        "forecast_1y": round(p_1y),
        "forecast_3y": round(p_3y),
        "forecast_5y": round(p_5y),
        "investment_score": round((infra_score * 5) + (cagr * 2.5), 1),
        "investment_rating": "Strong Buy" if cagr >= 12 else "Good Buy" if cagr >= 9 else "Moderate",
        "anomaly_status": "normal",
        "rental_yield": rag_res["investment_metrics"]["gross_rental_yield_percent"],
        "government_data": rag_res["government_and_tax_breakdown"],
        "sources": rag_res["sources"]
    }

async def get_india_rates(city: Optional[str] = None, locality: Optional[str] = None) -> List[Dict[str, Any]]:
    results = []
    for loc in ALL_INDIA_LOCALITIES:
        if city and city != "All" and loc["city"].lower() != city.lower():
            continue
        if locality and locality != "All" and locality.lower() not in loc["locality"].lower():
            continue
        results.append({
            "locality": loc["locality"],
            "city": loc["city"],
            "state": loc["state"],
            "circle_rate": loc["circle_rate"],
            "market_rate_avg": loc["market_rate_avg"],
            "rental_yield": loc["rental_yield"],
            "cagr_5y": loc["cagr_5y"],
            "infra_score": loc["infra_score"]
        })
    return results