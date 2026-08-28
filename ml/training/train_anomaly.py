import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from training.feature_engineering import RealEstateFeatureEngineer

def train_anomaly_detector(data_path, model_path):
    print("Training Anomaly Detector (Isolation Forest)...")
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    # Simple feature engineering for anomaly detection
    fe = RealEstateFeatureEngineer()
    
    target = 'actual_transaction_price'
    if target in df.columns:
        X = fe.fit_transform(df.drop(columns=[target]))
    else:
        X = fe.fit_transform(df)

    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    iso_forest.fit(X)
    
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(iso_forest, model_path)
    print(f"Anomaly detector saved to {model_path}")

if __name__ == "__main__":
    raw_path = "data/raw/properties.csv"
    syn_path = "data/synthetic/synthetic_properties.csv"
    
    # Prefer synthetic if large, else raw
    train_path = syn_path if os.path.exists(syn_path) else raw_path
    model_out = "models/registry/production/anomaly_detector.joblib"
    train_anomaly_detector(train_path, model_out)
