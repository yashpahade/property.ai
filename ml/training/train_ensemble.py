import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from scipy.optimize import minimize
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.metrics import mean_absolute_percentage_error
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor

from training.feature_engineering import RealEstateFeatureEngineer

class RealEstateEnsemble:
    def __init__(self, models_dir="models/registry/production/"):
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)
        self.models = []
        self.weights = []
        self.fe = RealEstateFeatureEngineer()
        
    def _optimize_weights(self, preds_list, y_true):
        def loss_func(weights):
            final_pred = np.zeros_like(y_true)
            for w, p in zip(weights, preds_list):
                final_pred += w * p
            return mean_squared_error(y_true, final_pred)

        n_models = len(preds_list)
        init_weights = [1.0 / n_models] * n_models
        bounds = [(0.0, 1.0)] * n_models
        constraints = ({'type': 'eq', 'fun': lambda w: 1.0 - sum(w)})
        
        result = minimize(loss_func, init_weights, method='SLSQP', bounds=bounds, constraints=constraints)
        return result.x

    def train(self, df, target_col='Actual_Transaction_Price_INR', group_col='Locality'):
        print(f"Starting training with {len(df)} records...")
        
        # Prepare data
        df = df.dropna(subset=[target_col])
        y = np.log1p(df[target_col].values)
        
        X = self.fe.fit_transform(df.drop(columns=[target_col]), y)
        groups = df[group_col].values if group_col in df.columns else np.zeros(len(df))
        
        # Handle small dataset: reduce folds if needed
        n_splits = min(5, len(np.unique(groups)) if len(np.unique(groups)) > 1 else 3)
        if len(df) < 50:
            n_splits = max(2, min(n_splits, len(df) // 10))

        if len(np.unique(groups)) < n_splits:
            print("Warning: GroupKFold not possible, falling back to basic split array.")
            groups = np.arange(len(df)) % n_splits

        gkf = GroupKFold(n_splits=n_splits)
        
        oof_preds_xgb = np.zeros(len(X))
        oof_preds_lgb = np.zeros(len(X))
        oof_preds_cat = np.zeros(len(X))
        
        trained_xgb, trained_lgb, trained_cat = [], [], []
        
        for fold, (train_idx, val_idx) in enumerate(gkf.split(X, y, groups)):
            X_train, y_train = X.iloc[train_idx], y[train_idx]
            X_val, y_val = X.iloc[val_idx], y[val_idx]
            
            # XGBoost
            xgb = XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6, subsample=0.8, random_state=42)
            xgb.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
            oof_preds_xgb[val_idx] = xgb.predict(X_val)
            trained_xgb.append(xgb)
            
            # LightGBM
            lgb = LGBMRegressor(n_estimators=500, learning_rate=0.05, num_leaves=63, subsample=0.8, random_state=42)
            lgb.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[])
            oof_preds_lgb[val_idx] = lgb.predict(X_val)
            trained_lgb.append(lgb)
            
            # CatBoost
            cat = CatBoostRegressor(iterations=500, learning_rate=0.05, depth=6, random_state=42, verbose=False)
            cat.fit(X_train, y_train, eval_set=(X_val, y_val))
            oof_preds_cat[val_idx] = cat.predict(X_val)
            trained_cat.append(cat)
            
        print("Optimizing ensemble weights...")
        self.weights = self._optimize_weights([oof_preds_xgb, oof_preds_lgb, oof_preds_cat], y)
        print(f"Optimal Weights - XGB: {self.weights[0]:.3f}, LGB: {self.weights[1]:.3f}, CAT: {self.weights[2]:.3f}")
        
        oof_final = self.weights[0]*oof_preds_xgb + self.weights[1]*oof_preds_lgb + self.weights[2]*oof_preds_cat
        
        # Calculate metrics on original scale
        y_true_orig = np.expm1(y)
        y_pred_orig = np.expm1(oof_final)
        
        metrics = {
            'rmse': float(np.sqrt(mean_squared_error(y_true_orig, y_pred_orig))),
            'mae': float(mean_absolute_error(y_true_orig, y_pred_orig)),
            'mape': float(mean_absolute_percentage_error(y_true_orig, y_pred_orig)),
            'r2': float(r2_score(y_true_orig, y_pred_orig))
        }
        
        print("\nTraining Report:")
        for k, v in metrics.items():
            print(f"{k.upper()}: {v:.4f}")
            
        # Save models
        self.models = [trained_xgb, trained_lgb, trained_cat]
        self.save_models(metrics)

    def save_models(self, metrics):
        # Save feature engineer
        joblib.dump(self.fe, os.path.join(self.models_dir, 'feature_engineer.joblib'))
        
        # Save models
        joblib.dump(self.models, os.path.join(self.models_dir, 'ensemble_models.joblib'))
        
        # Save metadata
        metadata = {
            'training_date': datetime.now().isoformat(),
            'metrics': metrics,
            'weights': self.weights.tolist(),
            'feature_names': self.fe.feature_names_
        }
        
        meta_path = os.path.join(os.path.dirname(self.models_dir), 'metadata.json')
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=4)
        print(f"Models and metadata saved to {self.models_dir}")

if __name__ == "__main__":
    # Load data
    try:
        raw_path = "data/raw/properties.csv"
        syn_path = "data/synthetic/synthetic_properties.csv"
        
        dfs = []
        if os.path.exists(raw_path):
            dfs.append(pd.read_csv(raw_path))
        if os.path.exists(syn_path):
            dfs.append(pd.read_csv(syn_path))
            
        if dfs:
            df = pd.concat(dfs, ignore_index=True)
            trainer = RealEstateEnsemble()
            trainer.train(df)
        else:
            print("No data found for training.")
    except Exception as e:
        print(f"Error during training: {e}")
