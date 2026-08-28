import sqlite3
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
from sklearn.model_selection import GroupKFold
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import mean_absolute_error
from sklearn.linear_model import Ridge
from typing import Dict, Any, Tuple
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = 'props.db'
MODEL_DIR = 'models'
MODEL_PATH = os.path.join(MODEL_DIR, 'ensemble_model.joblib')

class RealEstateEnsemble:
    def __init__(self):
        self.xgb = XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
        self.lgb = LGBMRegressor(n_estimators=100, learning_rate=0.05, random_state=42, verbose=-1)
        self.cat = CatBoostRegressor(n_estimators=100, learning_rate=0.05, random_state=42, verbose=0)
        self.meta_model = Ridge(alpha=1.0)
        
        self.categorical_features = ['type', 'city', 'locality']
        self.encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
        self.features = ['bhk', 'area', 'amenities_count', 'type', 'city', 'locality']
        
    def _extract_amenities_count(self, amenities_json):
        if pd.isna(amenities_json):
            return 0
        try:
            am_list = json.loads(amenities_json)
            return len(am_list)
        except:
            return 0

    def preprocess_data(self, df: pd.DataFrame, is_training: bool = True) -> Tuple[pd.DataFrame, pd.Series]:
        df = df.copy()
        
        # Handle missing or edge cases
        df['bhk'] = df['bhk'].fillna(df['bhk'].median() if not df['bhk'].isnull().all() else 1)
        df['area'] = df['area'].fillna(df['area'].median() if not df['area'].isnull().all() else 1000)
        df['amenities_count'] = df['amenities'].apply(self._extract_amenities_count) if 'amenities' in df.columns else 0
        
        for col in self.categorical_features:
            if col not in df.columns:
                df[col] = 'Unknown'
            df[col] = df[col].fillna('Unknown')
            df[col] = df[col].astype(str)
            
        if is_training:
            df[self.categorical_features] = self.encoder.fit_transform(df[self.categorical_features])
        else:
            df[self.categorical_features] = self.encoder.transform(df[self.categorical_features])
            
        X = df[self.features]
        y = None
        if 'price' in df.columns:
            y = np.log1p(df['price']) # Log-transformed targets for price prediction
            
        return X, y

    def fit(self, X: pd.DataFrame, y: pd.Series, groups: pd.Series):
        # Determine number of splits safely
        n_splits = 5
        if groups.nunique() < 5:
            n_splits = groups.nunique()
            
        # Out-of-fold predictions for meta-model
        oof_xgb = np.zeros(len(X))
        oof_lgb = np.zeros(len(X))
        oof_cat = np.zeros(len(X))
        
        if n_splits > 1 and len(X) > n_splits:
            gkf = GroupKFold(n_splits=n_splits)
            for train_idx, val_idx in gkf.split(X, y, groups):
                X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
                X_val, y_val = X.iloc[val_idx], y.iloc[val_idx]
                
                self.xgb.fit(X_train, y_train)
                self.lgb.fit(X_train, y_train)
                self.cat.fit(X_train, y_train)
                
                oof_xgb[val_idx] = self.xgb.predict(X_val)
                oof_lgb[val_idx] = self.lgb.predict(X_val)
                oof_cat[val_idx] = self.cat.predict(X_val)
        else:
            # Fallback for very small / single group datasets
            self.xgb.fit(X, y)
            self.lgb.fit(X, y)
            self.cat.fit(X, y)
            oof_xgb = self.xgb.predict(X)
            oof_lgb = self.lgb.predict(X)
            oof_cat = self.cat.predict(X)
            
        # Fit final models on all data
        self.xgb.fit(X, y)
        self.lgb.fit(X, y)
        self.cat.fit(X, y)
        
        # Fit meta-model for optimized weighted blending
        oof_features = np.column_stack((oof_xgb, oof_lgb, oof_cat))
        self.meta_model.fit(oof_features, y)
        logger.info(f"Meta-model coefficients (Blending weights): {self.meta_model.coef_}")

    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        pred_xgb = self.xgb.predict(X)
        pred_lgb = self.lgb.predict(X)
        pred_cat = self.cat.predict(X)
        
        base_preds = np.column_stack((pred_xgb, pred_lgb, pred_cat))
        final_preds_log = self.meta_model.predict(base_preds)
        
        final_preds = np.expm1(final_preds_log)
        
        # Confidence score via prediction variance
        base_preds_exp = np.expm1(base_preds)
        variance = np.var(base_preds_exp, axis=1)
        mean_pred = np.mean(base_preds_exp, axis=1)
        
        # Simple confidence metric: coefficient of variation mapping
        cv = np.sqrt(variance) / (mean_pred + 1e-9)
        confidence = np.clip(1.0 - cv, 0, 1) * 100
        
        return final_preds, confidence

def train_and_save_model():
    if not os.path.exists(DB_PATH):
        logger.error(f"Database {DB_PATH} not found.")
        return
        
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT * FROM properties WHERE price IS NOT NULL"
    df = pd.read_sql(query, conn)
    conn.close()
    
    if df.empty:
        logger.error("No data available for training.")
        return
        
    ensemble = RealEstateEnsemble()
    X, y = ensemble.preprocess_data(df, is_training=True)
    groups = df['locality'] if 'locality' in df.columns else pd.Series(np.zeros(len(df)))
    
    ensemble.fit(X, y, groups)
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Save the ensemble
    joblib.dump(ensemble, MODEL_PATH)
    logger.info(f"Model saved to {MODEL_PATH}")

def predict_price(features: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(MODEL_PATH):
        logger.error("Model not found. Train the model first.")
        raise FileNotFoundError("Model not found")
        
    ensemble = joblib.load(MODEL_PATH)
    df = pd.DataFrame([features])
    X, _ = ensemble.preprocess_data(df, is_training=False)
    
    price, confidence = ensemble.predict(X)
    
    return {
        "predicted_price": float(price[0]),
        "confidence_score": float(confidence[0])
    }

if __name__ == "__main__":
    train_and_save_model()
