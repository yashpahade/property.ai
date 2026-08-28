import os
import requests
import logging
import time
import json
import math
from typing import Dict, Any, List
import psycopg2
import argparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_USER = os.environ.get("DB_USER", "propsai")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "propsai_dev_2024")
DB_NAME = os.environ.get("DB_NAME", "propsai_db")
OVERPASS_API_URL = os.environ.get("OVERPASS_API_URL", "http://overpass-api.de/api/interpreter")

CACHE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "data", "osm_cache"))

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_osm_data(lat: float, lon: float, radius: int = 2000) -> Dict[str, Any]:
    cache_file = os.path.join(CACHE_DIR, f"osm_{lat:.4f}_{lon:.4f}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
            
    query = f"""
    [out:json];
    (
      node["amenity"~"school|hospital|gym|restaurant|park"](around:{radius},{lat},{lon});
      node["railway"="station"](around:{radius},{lat},{lon});
    );
    out body;
    """
    
    try:
        time.sleep(1) # Rate limiting
        response = requests.post(OVERPASS_API_URL, data={'data': query})
        response.raise_for_status()
        data = response.json()
        
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(cache_file, 'w') as f:
            json.dump(data, f)
            
        return data
    except Exception as e:
        logger.error(f"Error querying OSM for {lat},{lon}: {e}")
        return {}

def enrich_property(cursor, prop_id: int, lat: float, lon: float, dry_run: bool):
    data = get_osm_data(lat, lon)
    if not data or 'elements' not in data:
        return
        
    schools = []
    hospitals = []
    gyms = []
    metro = []
    restaurants = []
    parks = []
    
    for el in data.get('elements', []):
        el_lat = el.get('lat')
        el_lon = el.get('lon')
        if not el_lat or not el_lon:
            continue
            
        dist = haversine(lat, lon, el_lat, el_lon)
        tags = el.get('tags', {})
        name = tags.get('name', 'Unknown')
        
        if tags.get('amenity') == 'school':
            schools.append((dist, name))
        elif tags.get('amenity') == 'hospital':
            hospitals.append((dist, name))
        elif tags.get('amenity') == 'gym':
            gyms.append((dist, name))
        elif tags.get('amenity') == 'restaurant':
            restaurants.append((dist, name))
        elif tags.get('amenity') == 'park':
            parks.append((dist, name))
        elif tags.get('railway') == 'station':
            metro.append((dist, name))
            
    schools.sort()
    hospitals.sort()
    gyms.sort()
    metro.sort()
    parks.sort()
    
    update_data = {
        'nearest_school_name': schools[0][1] if schools else None,
        'school_distance_km': schools[0][0] if schools else None,
        'school_count': len(schools),
        
        'nearest_hospital_name': hospitals[0][1] if hospitals else None,
        'hospital_distance_km': hospitals[0][0] if hospitals else None,
        'hospital_count': len(hospitals),
        
        'nearest_gym_name': gyms[0][1] if gyms else None,
        'gym_distance_km': gyms[0][0] if gyms else None,
        'gym_count': len(gyms),
        
        'metro_distance_km': metro[0][0] if metro else None,
        
        'restaurant_count': len(restaurants),
        'park_count': len(parks),
        'park_distance_km': parks[0][0] if parks else None
    }
    
    if not dry_run:
        cursor.execute(
            """
            INSERT INTO amenities (
                property_id, nearest_school_name, school_distance_km, school_count,
                nearest_hospital_name, hospital_distance_km, hospital_count,
                nearest_gym_name, gym_distance_km, gym_count,
                metro_distance_km, restaurant_count, park_count, park_distance_km
            ) VALUES (
                %(prop_id)s, %(nearest_school_name)s, %(school_distance_km)s, %(school_count)s,
                %(nearest_hospital_name)s, %(hospital_distance_km)s, %(hospital_count)s,
                %(nearest_gym_name)s, %(gym_distance_km)s, %(gym_count)s,
                %(metro_distance_km)s, %(restaurant_count)s, %(park_count)s, %(park_distance_km)s
            ) ON CONFLICT (property_id) DO UPDATE SET
                nearest_school_name = EXCLUDED.nearest_school_name,
                school_distance_km = EXCLUDED.school_distance_km,
                school_count = EXCLUDED.school_count,
                nearest_hospital_name = EXCLUDED.nearest_hospital_name,
                hospital_distance_km = EXCLUDED.hospital_distance_km,
                hospital_count = EXCLUDED.hospital_count,
                nearest_gym_name = EXCLUDED.nearest_gym_name,
                gym_distance_km = EXCLUDED.gym_distance_km,
                gym_count = EXCLUDED.gym_count,
                metro_distance_km = EXCLUDED.metro_distance_km,
                restaurant_count = EXCLUDED.restaurant_count,
                park_count = EXCLUDED.park_count,
                park_distance_km = EXCLUDED.park_distance_km
            """,
            {**update_data, 'prop_id': prop_id}
        )
    logger.info(f"Processed property {prop_id}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT id, latitude, longitude FROM properties WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
    if args.limit:
        query += f" LIMIT {args.limit}"
        
    cursor.execute(query)
    properties = cursor.fetchall()
    
    logger.info(f"Found {len(properties)} properties to enrich")
    
    for prop in properties:
        enrich_property(cursor, prop[0], prop[1], prop[2], args.dry_run)
        
    if not args.dry_run:
        conn.commit()
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
