import os
import json
import joblib
import pandas as pd
import numpy as np
import threading

class PropertyPredictor:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, models_dir="ml/models/registry/production/"):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(PropertyPredictor, cls).__new__(cls)
                cls._instance._initialize(models_dir)
            return cls._instance

    def _initialize(self, models_dir):
        self.fe = joblib.load(os.path.join(models_dir, 'feature_engineer.joblib'))
        self.models = joblib.load(os.path.join(models_dir, 'ensemble_models.joblib'))
        meta_path = os.path.join(os.path.dirname(models_dir), 'metadata.json')
        with open(meta_path, 'r') as f:
            self.metadata = json.load(f)
        self.weights = self.metadata.get('weights', [0.33, 0.33, 0.34])

    def predict(self, property_dict):
        results = self.predict_batch([property_dict])
        return results[0] if results else None

    def predict_batch(self, property_dicts):
        if not property_dicts:
            return []

        df = pd.DataFrame(property_dicts)
        
        # Transform features
        X = self.fe.transform(df)
        
        xgb_models, lgb_models, cat_models = self.models
        n_folds = len(xgb_models)
        
        all_fold_preds = []
        
        for i in range(n_folds):
            p_xgb = xgb_models[i].predict(X)
            p_lgb = lgb_models[i].predict(X)
            p_cat = cat_models[i].predict(X)
            
            fold_pred = self.weights[0]*p_xgb + self.weights[1]*p_lgb + self.weights[2]*p_cat
            all_fold_preds.append(fold_pred)
            
        all_fold_preds = np.array(all_fold_preds)
        mean_preds = np.mean(all_fold_preds, axis=0)
        std_preds = np.std(all_fold_preds, axis=0)
        
        # Inverse log transform
        final_preds_orig = np.expm1(mean_preds)
        
        # Confidence score based on standard deviation across folds
        # Lower variance -> higher confidence
        results = []
        for i in range(len(final_preds_orig)):
            std_dev = std_preds[i]
            # Normalize confidence score (0 to 100)
            conf_score = max(0, min(100, 100 - (std_dev * 100))) 
            
            # Confidence bounds
            lower_bound = np.expm1(mean_preds[i] - 1.96 * std_dev)
            upper_bound = np.expm1(mean_preds[i] + 1.96 * std_dev)
            
            results.append({
                'predicted_price': float(final_preds_orig[i]),
                'confidence_score': float(conf_score),
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound)
            })
            
        return results
