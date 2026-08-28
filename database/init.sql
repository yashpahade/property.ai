CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS builders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    rera_id VARCHAR(100),
    completed_projects INT,
    rating FLOAT
);

CREATE TABLE IF NOT EXISTS localities (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100),
    zone VARCHAR(100),
    locality_name VARCHAR(255) UNIQUE,
    pin_code VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    location GEOMETRY(POINT, 4326),
    population INT,
    crime_index FLOAT,
    aqi FLOAT,
    growth_score FLOAT,
    gov_approval_authority VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS ready_reckoner (
    id SERIAL PRIMARY KEY,
    locality_id INT REFERENCES localities(id),
    year INT,
    rate_per_sqft FLOAT,
    property_type VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    location GEOMETRY(POINT, 4326),
    city VARCHAR(100),
    zone VARCHAR(100),
    locality VARCHAR(255),
    property_type VARCHAR(100),
    bhk INT,
    carpet_area_sqft FLOAT,
    built_up_area_sqft FLOAT,
    plot_area_sqft FLOAT,
    property_age_years INT,
    floor INT,
    total_floors INT,
    parking VARCHAR(100),
    lift INT,
    facing VARCHAR(50),
    builder_id INT REFERENCES builders(id),
    locality_id INT REFERENCES localities(id),
    ready_reckoner_rate FLOAT,
    actual_price FLOAT,
    rental_price FLOAT,
    registration_date DATE,
    rera_id VARCHAR(100),
    source VARCHAR(50) DEFAULT 'real',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id),
    sale_price FLOAT,
    registration_date DATE,
    buyer_type VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) UNIQUE,
    nearest_school_name VARCHAR(255),
    school_distance_km FLOAT,
    school_count INT,
    nearest_hospital_name VARCHAR(255),
    hospital_distance_km FLOAT,
    hospital_count INT,
    nearest_gym_name VARCHAR(255),
    gym_distance_km FLOAT,
    gym_count INT,
    metro_distance_km FLOAT,
    airport_distance_km FLOAT,
    restaurant_count INT,
    park_count INT,
    park_distance_km FLOAT
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) UNIQUE,
    estimated_value FLOAT,
    confidence FLOAT,
    lower_bound FLOAT,
    upper_bound FLOAT,
    future_1y FLOAT,
    future_3y FLOAT,
    future_5y FLOAT,
    investment_score FLOAT,
    investment_rating VARCHAR(50),
    anomaly_flag BOOLEAN,
    anomaly_type VARCHAR(100),
    predicted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    query TEXT,
    filters JSONB,
    results_count INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rera_projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255),
    builder_id INT REFERENCES builders(id),
    rera_number VARCHAR(100) UNIQUE,
    status VARCHAR(50),
    completion_date DATE,
    city VARCHAR(100)
);

-- GIST Indexes for Geometry Columns
CREATE INDEX idx_localities_location ON localities USING GIST (location);
CREATE INDEX idx_properties_location ON properties USING GIST (location);

-- B-tree Indexes for frequently queried columns
CREATE INDEX idx_properties_city ON properties (city);
CREATE INDEX idx_properties_zone ON properties (zone);
CREATE INDEX idx_properties_locality ON properties (locality);
CREATE INDEX idx_properties_actual_price ON properties (actual_price);
CREATE INDEX idx_properties_bhk ON properties (bhk);
CREATE INDEX idx_properties_property_type ON properties (property_type);

-- Full-text search index on properties
ALTER TABLE properties ADD COLUMN tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(address, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(locality, '')), 'C')
) STORED;

CREATE INDEX idx_properties_tsv ON properties USING GIN (tsv);
