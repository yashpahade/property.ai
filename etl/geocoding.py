import os
import requests
import time
import json
import logging
from typing import Dict, Any, Tuple, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CACHE_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "data", "geocode_cache.json"))
NOMINATIM_USER_AGENT = os.environ.get("NOMINATIM_USER_AGENT", "PropsAI_ETL_App/1.0 (contact@props.ai)")

class NominatimGeocoder:
    def __init__(self):
        self.cache = self._load_cache()
        self.headers = {
            'User-Agent': NOMINATIM_USER_AGENT
        }
        
    def _load_cache(self) -> Dict[str, Any]:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)
        return {}
        
    def _save_cache(self):
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, 'w') as f:
            json.dump(self.cache, f)
            
    def geocode(self, address: str) -> Optional[Tuple[float, float]]:
        if address in self.cache:
            return tuple(self.cache[address])
            
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': address,
            'format': 'json',
            'limit': 1
        }
        
        try:
            time.sleep(1) # Rate limiting 1 req/sec
            response = requests.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                self.cache[address] = [lat, lon]
                self._save_cache()
                return lat, lon
            return None
        except Exception as e:
            logger.error(f"Error geocoding {address}: {e}")
            return None
            
    def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        cache_key = f"{lat},{lon}"
        if cache_key in self.cache:
            return self.cache[cache_key]
            
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'json'
        }
        
        try:
            time.sleep(1) # Rate limiting 1 req/sec
            response = requests.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data and 'display_name' in data:
                address = data['display_name']
                self.cache[cache_key] = address
                self._save_cache()
                return address
            return None
        except Exception as e:
            logger.error(f"Error reverse geocoding {lat},{lon}: {e}")
            return None

if __name__ == "__main__":
    geocoder = NominatimGeocoder()
    print(geocoder.geocode("Mumbai, India"))
    print(geocoder.reverse_geocode(19.0760, 72.8777))
