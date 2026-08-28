import os
import urllib.request
import json

api_key = os.environ.get("GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

prompt = """You are Google Gemini 2.5 Real Estate Intelligence Engine for India.
Analyze location: 'Rui village near Baramati Pune Maharashtra'.
Provide realistic real estate valuation, nearby connected places with exact km distances, Guntha plot rates (1 Guntha = 1089 sqft), flat rates, circle rates, planning authority, and 7/12 land title guidance.
Output pure JSON with keys: location_name, location_type, taluka, district, state, planning_authority, nearby_connected_locations (array of objects with name, distance_km, type), rates (market_rate_avg_sqft, market_rate_min_sqft, market_rate_max_sqft, ready_reckoner_circle_rate_sqft, plot_rate_per_sqft, plot_rate_per_guntha_lakhs, agricultural_land_rate_per_acre_lakhs), property_types (typical_2bhk_cost_lakhs, typical_1_guntha_plot_cost_lakhs, typical_duplex_home_cost_lakhs, typical_independent_villa_cost_lakhs), connectivity_and_infra, legal_and_title_guidance, growth_catalysts (array of strings), investment_score_out_of_100, gross_rental_yield_percent, cagr_5y_percent."""

payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {
        "temperature": 0.2,
        "responseMimeType": "application/json"
    }
}

req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(raw_text)
    print("SUCCESS FROM GEMINI 2.5 LIVE API:")
    print(json.dumps(parsed, indent=2))
