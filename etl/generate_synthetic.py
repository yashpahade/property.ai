import os
import csv
import random
import logging
from datetime import datetime, timedelta
import psycopg2

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_USER = os.environ.get("DB_USER", "propsai")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "propsai_dev_2024")
DB_NAME = os.environ.get("DB_NAME", "propsai_db")

SYNTHETIC_CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "data", "synthetic", "synthetic_properties.csv"))

CITIES = {
    "Mumbai": {
        "zones": ["West", "East", "North", "South"],
        "localities": ["Andheri", "Bandra", "Borivali", "Powai", "Chembur", "Mira Road", "Worli"],
        "min_price": 8000,
        "max_price": 85000
    },
    "Pune": {
        "zones": ["West", "East", "North", "South"],
        "localities": ["Baner", "Balewadi", "Hinjewadi", "Kharadi", "Hadapsar", "Wagholi", "NIBM Road", "Pimpri"],
        "min_price": 4500,
        "max_price": 12000
    },
    "Nagpur": {
        "zones": ["West", "East", "North", "South", "Central"],
        "localities": ["Wardha Road", "Manish Nagar", "Besa", "Mihan", "Dabha", "Katol Road", "Wathoda", "Zingabai Takli", "Dharampeth"],
        "min_price": 2000,
        "max_price": 15000
    },
    "Nashik": {
        "zones": ["West", "East", "North", "South"],
        "localities": ["Gangapur Road", "Mahatma Nagar", "Pathardi Phata", "Indira Nagar", "Jail Road", "Panchvati"],
        "min_price": 2500,
        "max_price": 10500
    }
}

BUILDERS = [f"Builder {i}" for i in range(1, 51)]
FACINGS = ["North", "South", "East", "West", "North-East", "North-West"]
PARKING_TYPES = ["Covered", "Open"]

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )

def generate_record():
    city = random.choice(list(CITIES.keys()))
    city_data = CITIES[city]
    zone = random.choice(city_data["zones"])
    locality = random.choice(city_data["localities"])
    
    bhk = random.choices([1, 2, 3, 4], weights=[0.2, 0.4, 0.3, 0.1])[0]
    carpet_area = bhk * random.randint(400, 600)
    built_up_area = carpet_area * 1.3
    plot_area = 0
    property_type = "Apartment"
    
    if random.random() < 0.05:
        property_type = "Villa/Row House"
        plot_area = built_up_area * random.uniform(1.2, 2.0)
    elif random.random() < 0.05:
        property_type = "Plot"
        plot_area = random.randint(1000, 5000)
        carpet_area = 0
        built_up_area = 0
        bhk = 0
        
    price_rate = random.uniform(city_data["min_price"], city_data["max_price"])
    actual_price = price_rate * built_up_area if built_up_area > 0 else price_rate * plot_area
    rental_price = (actual_price * random.uniform(0.02, 0.04)) / 12 if built_up_area > 0 else 0
    
    age = random.randint(0, 20)
    total_floors = random.randint(3, 40) if property_type == "Apartment" else random.randint(1, 3)
    floor = random.randint(1, total_floors) if property_type == "Apartment" else 0
    
    parking = f"{random.randint(0, 3)} {random.choice(PARKING_TYPES)}"
    lift = random.randint(1, 4) if property_type == "Apartment" else 0
    facing = random.choice(FACINGS)
    
    builder = random.choice(BUILDERS)
    rera_id = f"P{random.randint(1000000000, 9999999999)}" if random.random() > 0.3 else "NA"
    
    reg_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 900))
    
    lat = random.uniform(18.0, 22.0)
    lon = random.uniform(72.0, 80.0)
    
    return {
        "City": city,
        "City_Zone": zone,
        "Locality": locality,
        "Latitude_Longitude": f"{lat:.4f}_{lon:.4f}",
        "Exact_Address": f"Synthetic Address, {locality}, {city}",
        "Property_Type": property_type,
        "BHK": bhk,
        "Carpet_Area_sqft": carpet_area,
        "Built_up_Area_sqft": built_up_area,
        "Plot_Area_sqft": plot_area,
        "Property_Age_Years": age,
        "Floor_Total_Floors": f"{floor}/{total_floors}",
        "Parking": parking,
        "Lift": lift,
        "Facing": facing,
        "Actual_Transaction_Price_INR": actual_price,
        "Rental_Price_INR": rental_price,
        "Builder": builder,
        "RERA_ID": rera_id,
        "Registration_Date": reg_date.strftime("%Y-%m-%d"),
        "Metro_Highway_Distance_km": round(random.uniform(0.5, 10.0), 1),
        "Nearby_Schools_Hospitals": f"{random.randint(1,5)} Schools / {random.randint(1,5)} Hospitals"
    }

def main():
    os.makedirs(os.path.dirname(SYNTHETIC_CSV_PATH), exist_ok=True)
    num_records = 10000
    
    logger.info(f"Generating {num_records} synthetic records...")
    records = [generate_record() for _ in range(num_records)]
    
    keys = records[0].keys()
    with open(SYNTHETIC_CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(records)
        
    logger.info(f"Saved synthetic data to {SYNTHETIC_CSV_PATH}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    logger.info("Inserting synthetic data into database...")
    for row in records:
        # Locality
        cursor.execute("SELECT id FROM localities WHERE locality_name = %s", (row["Locality"],))
        res = cursor.fetchone()
        if res:
            locality_id = res[0]
        else:
            cursor.execute(
                "INSERT INTO localities (city, zone, locality_name) VALUES (%s, %s, %s) RETURNING id",
                (row["City"], row["City_Zone"], row["Locality"])
            )
            locality_id = cursor.fetchone()[0]
            
        # Builder
        cursor.execute("SELECT id FROM builders WHERE name = %s", (row["Builder"],))
        res = cursor.fetchone()
        if res:
            builder_id = res[0]
        else:
            cursor.execute(
                "INSERT INTO builders (name, rera_id) VALUES (%s, %s) RETURNING id",
                (row["Builder"], row["RERA_ID"])
            )
            builder_id = cursor.fetchone()[0]
            
        lat, lon = map(float, row["Latitude_Longitude"].split('_'))
        floor, total_floors = map(int, row["Floor_Total_Floors"].split('/'))
        
        cursor.execute(
            """
            INSERT INTO properties (
                title, address, latitude, longitude, location,
                city, zone, locality, property_type, bhk,
                carpet_area_sqft, built_up_area_sqft, plot_area_sqft,
                property_age_years, floor, total_floors, parking, lift, facing,
                builder_id, locality_id, actual_price, rental_price,
                registration_date, rera_id, source
            ) VALUES (
                %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, 'synthetic'
            )
            """,
            (
                row["Exact_Address"], row["Exact_Address"], lat, lon, lon, lat,
                row["City"], row["City_Zone"], row["Locality"], row["Property_Type"], row["BHK"],
                row["Carpet_Area_sqft"], row["Built_up_Area_sqft"], row["Plot_Area_sqft"],
                row["Property_Age_Years"], floor, total_floors, row["Parking"], row["Lift"], row["Facing"],
                builder_id, locality_id, row["Actual_Transaction_Price_INR"], row["Rental_Price_INR"],
                row["Registration_Date"], row["RERA_ID"]
            )
        )
        
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("Done.")

if __name__ == "__main__":
    main()
