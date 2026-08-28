import os
import csv
import logging
from typing import Dict, Any, Tuple
import psycopg2
from psycopg2.extras import DictCursor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_USER = os.environ.get("DB_USER", "propsai")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "propsai_dev_2024")
DB_NAME = os.environ.get("DB_NAME", "propsai_db")

CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "data", "raw", "properties.csv"))

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )

def parse_lat_lon(lat_lon_str: str) -> Tuple[float, float]:
    if not lat_lon_str or lat_lon_str == "NA":
        return 0.0, 0.0
    parts = lat_lon_str.split('_')
    if len(parts) == 2:
        try:
            return float(parts[0]), float(parts[1])
        except ValueError:
            pass
    return 0.0, 0.0

def parse_floor(floor_str: str) -> Tuple[int, int]:
    if not floor_str or floor_str == "NA":
        return 0, 0
    if floor_str == "0/0":
        return 0, 0
    
    floor_str = floor_str.replace("G", "0").replace("Ground", "0")
    if "+" in floor_str and "/" in floor_str:
        try:
            parts = floor_str.split('/')
            floor_part = parts[0]
            if '+' in floor_part:
                floor = sum(int(x) for x in floor_part.split('+'))
            else:
                floor = int(floor_part)
            total = int(parts[1])
            return floor, total
        except Exception:
            return 0, 0
    elif "/" in floor_str:
        try:
            parts = floor_str.split('/')
            return int(parts[0]), int(parts[1])
        except Exception:
            return 0, 0
    return 0, 0

def parse_parking(parking_str: str) -> Tuple[str, int]:
    if not parking_str or parking_str == "NA" or parking_str == "0":
        return "None", 0
    parts = parking_str.split(" ", 1)
    if len(parts) == 2:
        try:
            return parts[1], int(parts[0])
        except ValueError:
            return parking_str, 0
    return parking_str, 0

def parse_schools_hospitals(sh_str: str) -> Tuple[int, int]:
    if not sh_str or sh_str == "NA":
        return 0, 0
    schools = 0
    hospitals = 0
    parts = sh_str.split("/")
    for part in parts:
        part = part.strip().lower()
        if "school" in part:
            try:
                schools = int(part.split()[0])
            except ValueError:
                pass
        elif "hospital" in part:
            try:
                hospitals = int(part.split()[0])
            except ValueError:
                pass
    return schools, hospitals

def float_or_none(val: str) -> float:
    try:
        return float(val) if val and val != "NA" else None
    except ValueError:
        return None

def int_or_none(val: str) -> int:
    try:
        return int(float(val)) if val and val != "NA" else None
    except ValueError:
        return None

def str_or_none(val: str) -> str:
    return val if val and val != "NA" else None

def main():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    logger.info(f"Reading CSV from {CSV_PATH}")
    
    if not os.path.exists(CSV_PATH):
        logger.error(f"CSV file not found at {CSV_PATH}")
        return

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        records_processed = 0
        
        for row in reader:
            # 1. Builders
            builder_name = str_or_none(row.get("Builder"))
            builder_id = None
            if builder_name:
                cursor.execute("SELECT id FROM builders WHERE name = %s", (builder_name,))
                res = cursor.fetchone()
                if res:
                    builder_id = res[0]
                else:
                    cursor.execute(
                        "INSERT INTO builders (name, rera_id) VALUES (%s, %s) RETURNING id",
                        (builder_name, str_or_none(row.get("RERA_ID")))
                    )
                    builder_id = cursor.fetchone()[0]

            # 2. Localities
            city = str_or_none(row.get("City"))
            zone = str_or_none(row.get("City_Zone"))
            locality_name = str_or_none(row.get("Locality"))
            
            locality_id = None
            if locality_name:
                cursor.execute("SELECT id FROM localities WHERE locality_name = %s", (locality_name,))
                res = cursor.fetchone()
                if res:
                    locality_id = res[0]
                else:
                    cursor.execute(
                        """
                        INSERT INTO localities (city, zone, locality_name, pin_code, gov_approval_authority)
                        VALUES (%s, %s, %s, %s, %s) RETURNING id
                        """,
                        (city, zone, locality_name, str_or_none(row.get("PIN_Code")), str_or_none(row.get("Gov_Approval_Authority")))
                    )
                    locality_id = cursor.fetchone()[0]

            # 3. Properties
            lat, lon = parse_lat_lon(row.get("Latitude_Longitude"))
            floor, total_floors = parse_floor(row.get("Floor_Total_Floors"))
            parking_type, parking_count = parse_parking(row.get("Parking"))
            
            bhk = int_or_none(row.get("BHK"))
            plot_area = float_or_none(row.get("Plot_Area_sqft"))
            built_up_area = float_or_none(row.get("Built_up_Area_sqft"))
            carpet_area = float_or_none(row.get("Carpet_Area_sqft"))
            
            property_type = "Apartment"
            if plot_area and (plot_area > 0) and ((not built_up_area) or built_up_area == 0) and (not bhk or bhk == 0):
                property_type = "Plot"
            elif "Row House" in str(row.get("Exact_Address")):
                property_type = "Villa/Row House"
                
            cursor.execute(
                """
                INSERT INTO properties (
                    title, address, latitude, longitude, location,
                    city, zone, locality, property_type, bhk,
                    carpet_area_sqft, built_up_area_sqft, plot_area_sqft,
                    property_age_years, floor, total_floors, parking, lift, facing,
                    builder_id, locality_id, ready_reckoner_rate, actual_price, rental_price,
                    registration_date, rera_id, source
                ) VALUES (
                    %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, 'real'
                ) RETURNING id
                """,
                (
                    row.get("Exact_Address"), row.get("Exact_Address"), lat, lon, lon, lat,
                    city, zone, locality_name, property_type, bhk,
                    carpet_area, built_up_area, plot_area,
                    int_or_none(row.get("Property_Age_Years")), floor, total_floors, parking_type, int_or_none(row.get("Lift")), str_or_none(row.get("Facing")),
                    builder_id, locality_id, float_or_none(row.get("Ready_Reckoner_Rate_INR")), float_or_none(row.get("Actual_Transaction_Price_INR")), float_or_none(row.get("Rental_Price_INR")),
                    str_or_none(row.get("Registration_Date")), str_or_none(row.get("RERA_ID"))
                )
            )
            property_id = cursor.fetchone()[0]

            # 4. Amenities
            schools, hospitals = parse_schools_hospitals(row.get("Nearby_Schools_Hospitals"))
            metro_dist = float_or_none(row.get("Metro_Highway_Distance_km"))
            
            cursor.execute(
                """
                INSERT INTO amenities (
                    property_id, school_count, hospital_count, metro_distance_km
                ) VALUES (%s, %s, %s, %s)
                """,
                (property_id, schools, hospitals, metro_dist)
            )
            
            # 5. Transactions
            if float_or_none(row.get("Actual_Transaction_Price_INR")):
                cursor.execute(
                    """
                    INSERT INTO transactions (
                        property_id, sale_price, registration_date
                    ) VALUES (%s, %s, %s)
                    """,
                    (property_id, float_or_none(row.get("Actual_Transaction_Price_INR")), str_or_none(row.get("Registration_Date")))
                )
                
            records_processed += 1
            
        conn.commit()
        logger.info(f"Successfully ingested {records_processed} records.")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
