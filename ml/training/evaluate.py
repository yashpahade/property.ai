import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import shap

def evaluate_models():
    print("Evaluating models...")
    models_dir = "models/registry/production/"
    fe_path = os.path.join(models_dir, 'feature_engineer.joblib')
    ens_path = os.path.join(models_dir, 'ensemble_models.joblib')
    meta_path = os.path.join(models_dir, '../metadata.json')
    
    if not (os.path.exists(fe_path) and os.path.exists(ens_path)):
        print("Models not found.")
        return
        
    fe = joblib.load(fe_path)
    models = joblib.load(ens_path)
    
    with open(meta_path, 'r') as f:
        meta = json.load(f)
        weights = meta['weights']

    # Load some test data
    test_path = "data/raw/properties.csv"
    if not os.path.exists(test_path):
        print("Test data not found.")
        return
        
    df = pd.read_csv(test_path).dropna(subset=['Actual_Transaction_Price_INR'])
    y_true = df['Actual_Transaction_Price_INR'].values
    
    X = fe.transform(df.drop(columns=['Actual_Transaction_Price_INR']))
    
    # Predict
    preds = np.zeros(len(X))
    xgb_models, lgb_models, cat_models = models
    
    n_folds = len(xgb_models)
    
    for i in range(n_folds):
        pred_xgb = xgb_models[i].predict(X)
        pred_lgb = lgb_models[i].predict(X)
        pred_cat = cat_models[i].predict(X)
        
        fold_pred = weights[0]*pred_xgb + weights[1]*pred_lgb + weights[2]*pred_cat
        preds += fold_pred / n_folds
        
    preds_orig = np.expm1(preds)
    
    metrics = {
        'rmse': float(np.sqrt(mean_squared_error(y_true, preds_orig))),
        'mae': float(mean_absolute_error(y_true, preds_orig)),
        'r2': float(r2_score(y_true, preds_orig))
    }
    
    print("Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"{k.upper()}: {v:.4f}")
        
    report = {
        'metrics': metrics
    }
    
    # SHAP
    try:
        explainer = shap.TreeExplainer(xgb_models[0])
        shap_values = explainer.shap_values(X)
        feature_importance = np.abs(shap_values).mean(axis=0)
        fi_dict = dict(zip(X.columns, feature_importance))
        report['top_features'] = dict(sorted(fi_dict.items(), key=lambda x: x[1], reverse=True)[:10])
        print("SHAP explanation generated.")
    except Exception as e:
        print(f"SHAP explanation failed: {e}")
        
    with open('models/evaluation_report.json', 'w') as f:
        json.dump(report, f, indent=4)
    print("Evaluation report saved.")

if __name__ == "__main__":
    evaluate_models()
