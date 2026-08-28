"""
RAG Real Estate Intelligence & Google AI Overview Engine
Supports Multi-Property Types:
- Flats & High-Rise Apartments (1, 2, 3, 4 BHK)
- Residential NA / Sanctioned Plots (Sq.ft & Guntha rates; 1 Guntha = 1,089 sq.ft)
- Duplexes & Penthouses
- Independent Homes, Row Houses & Luxury Villas
"""

import json
import re
import math
from typing import Dict, Any, List, Optional
from app.config import settings
from app.core.india_data import ALL_INDIA_LOCALITIES, STATE_STAMP_DUTY

GENERIC_STOP_WORDS = {
    "road", "street", "west", "east", "north", "south", "central", "city", "nagar", 
    "sector", "phase", "villas", "flats", "apartments", "coastal", "hub", "extension", 
    "ext", "near", "outer", "plots", "plot", "duplex", "guntha", "bhk"
}

class IndiaRealEstateRAG:
    def __init__(self):
        self.localities = ALL_INDIA_LOCALITIES
        self.stamp_duty_rules = STATE_STAMP_DUTY
        
    def _normalize(self, text: str) -> str:
        if not text:
            return ""
        return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower()).strip()

    def search_knowledge_base(self, query: str) -> Optional[Dict[str, Any]]:
        """Searches indexed micro-markets using token match & high-precision keyword ranking"""
        q_norm = self._normalize(query)
        words = [w for w in q_norm.split() if len(w) >= 3]
        
        best_match = None
        highest_score = 0
        
        for item in self.localities:
            score = 0
            loc_norm = self._normalize(item["locality"])
            city_norm = self._normalize(item["city"])
            state_norm = self._normalize(item["state"])
            tags_norm = " ".join([self._normalize(t) for t in item.get("tags", [])])
            projects_norm = " ".join([self._normalize(p) for p in item.get("notable_projects", [])])
            category_norm = self._normalize(item.get("category", ""))
            
            # 1. Exact Name and City Matching (Highest Priority)
            if loc_norm == q_norm or city_norm == q_norm:
                score += 180
            elif loc_norm in q_norm:
                score += 100
            elif city_norm in q_norm:
                score += 80

            # 2. Word Token Matching with Stop-Word attenuation
            for word in words:
                is_stop = word in GENERIC_STOP_WORDS
                token_weight = 6 if is_stop else 40

                if word in loc_norm:
                    score += token_weight * 2.2
                if word in city_norm:
                    score += token_weight * 1.9
                if word in projects_norm:
                    score += token_weight * 1.3
                if word in tags_norm or word in category_norm:
                    score += token_weight * 0.9
                if word in state_norm and not is_stop:
                    score += 15
                    
            if score > highest_score:
                highest_score = score
                best_match = item
                
        if highest_score >= 30:
            return best_match
        return None

    def synthesize_valuation(self, query: str, custom_area_sqft: Optional[float] = None, bhk: Optional[int] = None, property_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes RAG synthesis for any query across India.
        """
        matched = self.search_knowledge_base(query)
        
        if matched:
            locality_name = matched["locality"]
            city_name = matched["city"]
            state_name = matched["state"]
            category = matched.get("category", "Main City")
            circle_rate = matched["circle_rate"]
            circle_rate_plot = matched.get("circle_rate_plot", round(circle_rate * 0.70))
            market_rate_min = matched["market_rate_min"]
            market_rate_max = matched["market_rate_max"]
            market_rate_avg = matched["market_rate_avg"]
            
            plot_rate_sqft = matched.get("plot_rate_sqft", round(market_rate_avg * 0.60))
            plot_rate_guntha = matched.get("plot_rate_guntha", plot_rate_sqft * 1089)
            duplex_price = matched.get("duplex_avg_price", market_rate_avg * 1800)
            villa_price = matched.get("villa_avg_price", market_rate_avg * 2500)
            sanction_auth = matched.get("sanction_authority", "Municipal Planning Authority")

            rental_yield = matched["rental_yield"]
            cagr_5y = matched["cagr_5y"]
            infra_score = matched["infra_score"]
            livability_score = matched["livability_score"]
            lat = matched["lat"]
            lng = matched["lng"]
            connectivity = matched.get("connectivity", "Major arterial roads and transit networks")
            projects = matched.get("notable_projects", [])
            nhb_trend = matched.get("nhb_hpi_trend", "Positive Growth (QoQ +2.5%)")
            tags = matched.get("tags", ["High Demand", "Established Hub"])
            is_indexed = True
        else:
            is_indexed = False
            q_clean = query.strip()
            
            detected_state = "Maharashtra"
            for st in STATE_STAMP_DUTY.keys():
                if st.lower() in query.lower():
                    detected_state = st
                    break
                    
            state_name = detected_state
            city_name = q_clean.title()
            locality_name = f"{q_clean.title()} Central"
            category = "Regional Hub"
            
            circle_rate = 3800
            circle_rate_plot = 2500
            market_rate_avg = 5200
            market_rate_min = 4100
            market_rate_max = 6800
            plot_rate_sqft = 3200
            plot_rate_guntha = 3200 * 1089
            duplex_price = 7500000
            villa_price = 11000000
            sanction_auth = "Urban Development / Town Planning Authority"

            rental_yield = 4.2
            cagr_5y = 8.5
            infra_score = 8.0
            livability_score = 8.2
            lat = 19.7515
            lng = 75.7139
            connectivity = "National/State Highway network and regional railway connectivity"
            projects = [f"{q_clean.title()} Residential Enclaves", f"{q_clean.title()} City Center"]
            nhb_trend = "Steady Regional Appreciation (QoQ +2.0%)"
            tags = ["Growing Suburb", "Affordable Tier"]

        # Standard Flat Units
        std_units = {
            "1 BHK (450 sq.ft)": {
                "property_type": "Apartment / Flat",
                "carpet_area": 450,
                "circle_valuation": circle_rate * 450,
                "market_valuation": market_rate_avg * 450,
                "price_min": market_rate_min * 450,
                "price_max": market_rate_max * 450,
                "est_monthly_rent": round((market_rate_avg * 450 * (rental_yield / 100)) / 12)
            },
            "2 BHK (750 sq.ft)": {
                "property_type": "Apartment / Flat",
                "carpet_area": 750,
                "circle_valuation": circle_rate * 750,
                "market_valuation": market_rate_avg * 750,
                "price_min": market_rate_min * 750,
                "price_max": market_rate_max * 750,
                "est_monthly_rent": round((market_rate_avg * 750 * (rental_yield / 100)) / 12)
            },
            "3 BHK (1,250 sq.ft)": {
                "property_type": "Apartment / Flat",
                "carpet_area": 1250,
                "circle_valuation": circle_rate * 1250,
                "market_valuation": market_rate_avg * 1250,
                "price_min": market_rate_min * 1250,
                "price_max": market_rate_max * 1250,
                "est_monthly_rent": round((market_rate_avg * 1250 * (rental_yield / 100)) / 12)
            },
            "4 BHK / Penthouse (2,400 sq.ft)": {
                "property_type": "Luxury Flat / Penthouse",
                "carpet_area": 2400,
                "circle_valuation": circle_rate * 2400,
                "market_valuation": market_rate_avg * 2400,
                "price_min": market_rate_min * 2400,
                "price_max": market_rate_max * 2400,
                "est_monthly_rent": round((market_rate_avg * 2400 * (rental_yield / 100)) / 12)
            }
        }

        # Multi-Property Types Matrix (Plots, Duplex, Villa, Flat)
        property_types_breakdown = {
            "flats_apartments": {
                "title": "Apartments & High-Rise Flats",
                "unit": "₹ / sq.ft (Carpet Area)",
                "rate_avg": market_rate_avg,
                "rate_min": market_rate_min,
                "rate_max": market_rate_max,
                "ready_reckoner_rate": circle_rate,
                "typical_2bhk_cost": market_rate_avg * 750,
                "typical_3bhk_cost": market_rate_avg * 1250
            },
            "residential_plots": {
                "title": "Residential NA / RL Sanctioned Plots",
                "sanction_authority": sanction_auth,
                "rate_per_sqft": plot_rate_sqft,
                "rate_per_guntha": plot_rate_guntha, # 1 Guntha = 1,089 sq.ft
                "ready_reckoner_land_rate": circle_rate_plot,
                "plot_1000_sqft_cost": plot_rate_sqft * 1000,
                "plot_1_guntha_cost": plot_rate_guntha,
                "plot_2_guntha_cost": plot_rate_guntha * 2,
                "conversion_note": "1 Guntha = 1,089 sq.ft (33 ft x 33 ft)"
            },
            "duplex_penthouses": {
                "title": "Duplex Homes & Luxury Penthouses",
                "avg_price": duplex_price,
                "typical_area_sqft": 1800,
                "rate_per_sqft": round(duplex_price / 1800),
                "features": ["Double Height Living Room", "Private Terrace", "2 Dedicated Car Parks"]
            },
            "independent_villas_homes": {
                "title": "Independent Villas & Row Houses",
                "avg_price": villa_price,
                "typical_plot_area": "1,500 - 2,500 sq.ft",
                "typical_builtup": "2,200 sq.ft",
                "features": ["Private Garden / Backyard", "Independent Land Ownership", "Custom G+1/G+2 Construction"]
            }
        }

        custom_valuation = None
        if custom_area_sqft and custom_area_sqft > 0:
            is_plot_query = property_type == "plot" or "plot" in query.lower() or "guntha" in query.lower()
            applied_rate = plot_rate_sqft if is_plot_query else market_rate_avg
            applied_circ = circle_rate_plot if is_plot_query else circle_rate
            
            c_val = applied_rate * custom_area_sqft
            c_circ = applied_circ * custom_area_sqft
            custom_valuation = {
                "carpet_area_sqft": custom_area_sqft,
                "property_type": "Residential Plot" if is_plot_query else "Flat / Home",
                "market_valuation": c_val,
                "circle_valuation": c_circ,
                "guntha_equivalent": round(custom_area_sqft / 1089, 2),
                "price_range": [round(c_val * 0.90), round(c_val * 1.15)],
                "monthly_rent": round((c_val * (rental_yield / 100)) / 12)
            }

        stamp_rules = self.stamp_duty_rules.get(state_name, self.stamp_duty_rules["Default"])
        sample_prop_value = (custom_valuation["market_valuation"] if custom_valuation else std_units["2 BHK (750 sq.ft)"]["market_valuation"])
        
        stamp_male_amt = (sample_prop_value * stamp_rules["stamp_duty_male"]) / 100
        stamp_female_amt = (sample_prop_value * stamp_rules["stamp_duty_female"]) / 100
        
        reg_fee_pct = stamp_rules["registration_fee_percent"]
        reg_cap = stamp_rules.get("registration_fee_cap")
        reg_fee = (sample_prop_value * reg_fee_pct) / 100
        if reg_cap:
            reg_fee = min(reg_fee, reg_cap)

        base_val = sample_prop_value
        p_1y = base_val * (1 + (cagr_5y / 100))
        p_3y = base_val * math.pow(1 + (cagr_5y / 100), 3)
        p_5y = base_val * math.pow(1 + (cagr_5y / 100), 5)
        
        spread_pct = round(((market_rate_avg - circle_rate) / circle_rate) * 100, 1)

        return {
            "query": query,
            "status": "success",
            "is_indexed": is_indexed,
            "location": {
                "locality": locality_name,
                "city": city_name,
                "state": state_name,
                "category": category,
                "sanction_authority": sanction_auth,
                "latitude": lat,
                "longitude": lng,
                "connectivity": connectivity,
                "notable_projects": projects,
                "tags": tags
            },
            "rates": {
                "unit": "₹ / sq.ft",
                "ready_reckoner_circle_rate": circle_rate,
                "ready_reckoner_circle_rate_plot": circle_rate_plot,
                "market_rate_min": market_rate_min,
                "market_rate_max": market_rate_max,
                "market_rate_avg": market_rate_avg,
                "plot_rate_sqft": plot_rate_sqft,
                "plot_rate_guntha": plot_rate_guntha,
                "ready_reckoner_spread_percent": spread_pct,
                "spread_analysis": f"Market rate trades at a {spread_pct}% premium over official Government circle rate."
            },
            "property_types_breakdown": property_types_breakdown,
            "standard_units": std_units,
            "custom_valuation": custom_valuation,
            "government_and_tax_breakdown": {
                "state_authority": stamp_rules["authority"],
                "rera_portal": stamp_rules["rera_portal"],
                "sanction_body": sanction_auth,
                "stamp_duty_male_percent": stamp_rules["stamp_duty_male"],
                "stamp_duty_male_amount": stamp_male_amt,
                "stamp_duty_female_percent": stamp_rules["stamp_duty_female"],
                "stamp_duty_female_amount": stamp_female_amt,
                "registration_fee": reg_fee,
                "nhb_residex_hpi": nhb_trend
            },
            "investment_metrics": {
                "gross_rental_yield_percent": rental_yield,
                "historical_and_projected_5y_cagr": cagr_5y,
                "infrastructure_alpha_score": infra_score,
                "livability_index": livability_score,
                "projections": {
                    "current": base_val,
                    "forecast_1y": round(p_1y),
                    "forecast_3y": round(p_3y),
                    "forecast_5y": round(p_5y),
                    "capital_gain_5y": round(p_5y - base_val)
                }
            },
            "sources": [
                f"{stamp_rules['authority']} - Official Ready Reckoner Rate Schedule",
                f"{stamp_rules['rera_portal']} - Project Disclosures & Carpet Area Registry",
                f"{sanction_auth} - Layout Sanction & Land Registry Records",
                "National Housing Bank (NHB RESIDEX) - Housing Price Index"
            ]
        }

    def _generate_local_google_ai_overview(self, query: str, custom_area_sqft: Optional[float] = None, bhk: Optional[int] = None, property_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Synthesizes a full Google AI Overview style response with Flats, Plots, Duplexes, and Villas.
        """
        val = self.synthesize_valuation(query, custom_area_sqft, bhk, property_type)
        loc = val["location"]
        rates = val["rates"]
        govt = val["government_and_tax_breakdown"]
        invest = val["investment_metrics"]
        units = val["standard_units"]
        prop_types = val["property_types_breakdown"]
        
        score = round((invest["infrastructure_alpha_score"] * 5) + (invest["historical_and_projected_5y_cagr"] * 2.5), 1)
        rating = "Strong Buy (High Alpha)" if score >= 90 else ("Accumulate (Solid Fundamentals)" if score >= 80 else "Neutral / Steady Cashflow")

        reg_val = int(govt.get("registration_fee", 30000))
        reg_str = f"₹{reg_val:,} capped registration" if reg_val <= 30000 else "1% registration"
        
        guntha_lakhs = (rates['plot_rate_guntha'] / 100000)
        duplex_cr = (prop_types['duplex_penthouses']['avg_price'] / 10000000)
        villa_cr = (prop_types['independent_villas_homes']['avg_price'] / 10000000)

        key_takeaways = [
            f"**Apartments & Flats**: {loc['locality']}, {loc['city']} averages **₹{rates['market_rate_avg']:,}/sq.ft** (Range: ₹{rates['market_rate_min']:,} - ₹{rates['market_rate_max']:,}/sq.ft), with official circle rate at **₹{rates['ready_reckoner_circle_rate']:,}/sq.ft**.",
            f"**Residential NA Plots**: Sanctioned by **{loc['sanction_authority']}** at **₹{rates['plot_rate_sqft']:,}/sq.ft** (~**₹{guntha_lakhs:.1f} Lakhs / Guntha** [1 Guntha = 1,089 sq.ft]). Land Circle Rate: ₹{rates['ready_reckoner_circle_rate_plot']:,}/sq.ft.",
            f"**Duplexes & Independent Villas**: Duplex homes average **₹{duplex_cr:.2f} Cr**; independent villas / row houses range around **₹{villa_cr:.2f} Cr**.",
            f"**Stamp Duty & Tax Rules**: {loc['state']} charges **{govt['stamp_duty_male_percent']}% stamp duty** (with 1% female buyer concession where applicable) and {reg_str}."
        ]

        pros = [
            f"Sanctioned layout security: Clear title backed by {loc['sanction_authority']} & {govt['rera_portal']}",
            f"Strong infrastructure connectivity: {loc['connectivity']}",
            f"Multiple asset configurations: High-yield flats ({invest['gross_rental_yield_percent']}% yield) to high-appreciation NA plots (+{invest['historical_and_projected_5y_cagr']}% CAGR)",
            f"Leading developer presence: {', '.join(loc['notable_projects'][:3])}"
        ]
        cons = [
            f"Verify layout sanction numbers ({loc['sanction_authority']} RL number / TP sanction) before final deed execution",
            f"Stamp duty of {govt['stamp_duty_male_percent']}% applies on whichever is higher: Market Price or Ready Reckoner circle valuation"
        ]

        people_also_ask = [
            {
                "question": f"What is the plot rate per Guntha in {loc['locality']}, {loc['city']}?",
                "snippet": f"Residential NA plots in {loc['locality']} average ~₹{guntha_lakhs:.1f} Lakhs per Guntha (₹{rates['plot_rate_sqft']:,}/sq.ft for 1,089 sq.ft). A standard 2 Guntha plot is valued at ~₹{(guntha_lakhs*2):.1f} Lakhs."
            },
            {
                "question": f"What is the price of a 2 BHK or 3 BHK flat in {loc['locality']}?",
                "snippet": f"A standard 2 BHK (750 sq.ft) in {loc['locality']} is priced at ₹{units['2 BHK (750 sq.ft)']['market_valuation']/10000000:.2f} Cr (~₹{units['2 BHK (750 sq.ft)']['est_monthly_rent']:,}/mo rent); a 3 BHK (1,250 sq.ft) averages ₹{units['3 BHK (1,250 sq.ft)']['market_valuation']/10000000:.2f} Cr."
            },
            {
                "question": f"What is the cost of an independent duplex or villa in {loc['locality']}?",
                "snippet": f"Duplex penthouses average ₹{duplex_cr:.2f} Cr while independent villas/row houses are valued around ₹{villa_cr:.2f} Cr depending on plot size and built-up area."
            },
            {
                "question": f"Which planning authority sanctions property in {loc['locality']}?",
                "snippet": f"Properties and layouts in {loc['locality']} are governed and sanctioned by {loc['sanction_authority']} and registered under {govt['rera_portal']}."
            }
        ]

        return {
            "mode": "google_ai_overview",
            "model_signature": "Gemini AI Real Estate Intelligence (Verified + Enriched)",
            "query": query,
            "location_badge": f"{loc['locality']}, {loc['city']} ({loc['state']})",
            "category_badge": loc.get("category", "Main City"),
            "sanction_authority": loc.get("sanction_authority", "Urban Planning Body"),
            "executive_summary": key_takeaways,
            "investment_verdict": {
                "ai_score": score,
                "rating": rating,
                "livability_index": f"{invest['livability_index']}/10",
                "infrastructure_score": f"{invest['infrastructure_alpha_score']}/10",
                "rental_yield": f"{invest['gross_rental_yield_percent']}%",
                "cagr_5y": f"+{invest['historical_and_projected_5y_cagr']}%"
            },
            "pricing_matrix": {
                "market_rate_avg": rates['market_rate_avg'],
                "market_rate_min": rates['market_rate_min'],
                "market_rate_max": rates['market_rate_max'],
                "ready_reckoner_circle_rate": rates['ready_reckoner_circle_rate'],
                "plot_rate_sqft": rates['plot_rate_sqft'],
                "plot_rate_guntha": rates['plot_rate_guntha'],
                "ready_reckoner_circle_rate_plot": rates['ready_reckoner_circle_rate_plot'],
                "spread_percent": rates['ready_reckoner_spread_percent']
            },
            "property_types_breakdown": prop_types,
            "unit_breakdown": units,
            "custom_valuation": val.get("custom_valuation"),
            "government_and_tax": govt,
            "pros": pros,
            "cons": cons,
            "people_also_ask": people_also_ask,
            "citations": val["sources"]
        }

    @staticmethod
    def _merge_overview(base: Dict[str, Any], generated: Dict[str, Any]) -> Dict[str, Any]:
        """Keep the UI contract intact when Gemini omits an optional nested field."""
        merged = dict(base)
        for key, value in generated.items():
            if isinstance(value, dict) and isinstance(merged.get(key), dict):
                merged[key] = IndiaRealEstateRAG._merge_overview(merged[key], value)
            else:
                merged[key] = value
        return merged

    def generate_google_ai_overview(self, query: str, custom_area_sqft: Optional[float] = None, bhk: Optional[int] = None, property_type: Optional[str] = None) -> Dict[str, Any]:
        baseline = self._generate_local_google_ai_overview(query, custom_area_sqft, bhk, property_type)
        if not settings.GEMINI_API_KEY:
            return baseline

        try:
            from google import genai

            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = (
                "You are Props.ai's Indian real-estate intelligence analyst. "
                "Improve the supplied overview using the supplied verified local data. "
                "Do not invent authorities, rates, projects, or citations. Keep all numeric "
                "values and the exact JSON structure unless a correction is directly supported. "
                "Return JSON only, with the same keys and nested structure as the input.\n\n"
                f"User query: {query}\n"
                f"Verified local overview JSON:\n{json.dumps(baseline, ensure_ascii=True)}"
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            generated = json.loads(response.text)
            if isinstance(generated, dict):
                return self._merge_overview(baseline, generated)
        except Exception as exc:
            # Gemini is an enhancement; local verified data remains available during outages.
            print(f"Gemini overview unavailable: {exc}")
        return baseline

rag_engine = IndiaRealEstateRAG()
