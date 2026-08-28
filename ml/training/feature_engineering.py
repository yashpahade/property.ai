import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder
import math

class RealEstateFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.imputers_numeric = SimpleImputer(strategy='median')
        self.imputers_categorical = SimpleImputer(strategy='most_frequent')
        self.label_encoders = {}
        self.target_encoding_means = {}
        self.cbd_coords = {
            'nagpur': (21.1458, 79.0882),
            'pune': (18.5204, 73.8567),
            'mumbai': (19.0760, 72.8777),
            'nashik': (20.0063, 73.7900)
        }
        self.feature_names_ = None
        self.is_fitted = False

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        if pd.isna(lat1) or pd.isna(lon1) or pd.isna(lat2) or pd.isna(lon2):
            return np.nan
        R = 6371  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
            * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def fit(self, X, y=None):
        df = X.copy()
        
        # Identify column types based on actual columns in data
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
        
        # Remove target if present
        if 'Actual_Transaction_Price_INR' in numeric_cols:
            numeric_cols.remove('Actual_Transaction_Price_INR')
            
        self.numeric_features_ = numeric_cols
        self.categorical_features_ = categorical_cols

        if numeric_cols:
            self.imputers_numeric.fit(df[numeric_cols])
        if categorical_cols:
            self.imputers_categorical.fit(df[categorical_cols])

        # Target encoding for locality if y is provided
        if y is not None and 'locality' in df.columns:
            temp_df = pd.DataFrame({'locality': df['locality'], 'target': y})
            self.target_encoding_means['locality'] = temp_df.groupby('locality')['target'].mean().to_dict()
            self.global_mean = y.mean()

        # Label encoding for categorical columns
        if categorical_cols:
            imputed_cats = pd.DataFrame(self.imputers_categorical.transform(df[categorical_cols]), columns=categorical_cols)
            for col in categorical_cols:
                le = LabelEncoder()
                le.fit(imputed_cats[col].astype(str))
                self.label_encoders[col] = le
        
        self.is_fitted = True
        
        # Determine final features names
        X_trans = self.transform(X[:1])
        self.feature_names_ = list(X_trans.columns)
        
        return self

    def transform(self, X, y=None):
        if not self.is_fitted:
            raise RuntimeError("You must fit the transformer before using it!")
        df = X.copy()
        
        # 1. Imputation
        if self.numeric_features_:
            df[self.numeric_features_] = self.imputers_numeric.transform(df[self.numeric_features_])
        if self.categorical_features_:
            df[self.categorical_features_] = self.imputers_categorical.transform(df[self.categorical_features_])

        # 2. Spatial Features
        if 'latitude' in df.columns and 'longitude' in df.columns and 'city' in df.columns:
            def get_cbd_distance(row):
                city = str(row['city']).lower()
                if city in self.cbd_coords:
                    cbd_lat, cbd_lon = self.cbd_coords[city]
                    return self._haversine_distance(row['latitude'], row['longitude'], cbd_lat, cbd_lon)
                return np.nan
            df['cbd_distance'] = df.apply(get_cbd_distance, axis=1)
            # Fill missing distances with median
            df['cbd_distance'] = df['cbd_distance'].fillna(df['cbd_distance'].median())

        # 3. Physical Features
        for area_col in ['carpet_area', 'built_up_area', 'plot_area']:
            if area_col in df.columns:
                df[f'log_{area_col}'] = np.log1p(df[area_col].fillna(0))
                
        if 'floor' in df.columns and 'total_floors' in df.columns:
            # Handle total_floors = 0
            df['floor_ratio'] = np.where(df['total_floors'] > 0, 
                                         df['floor'] / df['total_floors'], 
                                         0)

        # 4. Amenities / Derived Features
        if 'property_age' in df.columns:
            df['is_new_construction'] = (df['property_age'] <= 1).astype(int)
            
        if 'locality_rating' in df.columns:
            df['is_premium_locality'] = (df['locality_rating'] >= 4.5).astype(int)

        # Area Type Derivation
        def derive_area_type(row):
            if row.get('plot_area', 0) > 0 and row.get('built_up_area', 0) == 0:
                return 'plot'
            elif row.get('built_up_area', 0) > 0 and row.get('plot_area', 0) > 0:
                return 'rowhouse'
            return 'flat'
        df['derived_area_type'] = df.apply(derive_area_type, axis=1)
        
        # Ensure it is encoded
        le_area = LabelEncoder()
        df['derived_area_type_encoded'] = le_area.fit_transform(df['derived_area_type'])

        # 5. Locality Target Encoding
        if 'locality' in df.columns:
            if 'locality' in self.target_encoding_means:
                df['locality_target_encoded'] = df['locality'].map(self.target_encoding_means['locality']).fillna(getattr(self, 'global_mean', 0))
            else:
                df['locality_target_encoded'] = 0

        # 6. Categorical Encoding (Label Encoding)
        for col, le in self.label_encoders.items():
            if col in df.columns:
                # Handle unseen labels by assigning them to a default class or -1
                df[col + '_encoded'] = df[col].astype(str).map(
                    lambda s: le.transform([s])[0] if s in le.classes_ else -1
                )
                
        # Drop original string columns
        cols_to_drop = df.select_dtypes(exclude=[np.number]).columns
        df = df.drop(columns=cols_to_drop)

        # Clean up any remaining NaNs safely
        df = df.fillna(0)

        # If y is provided (e.g. for fit_transform where returning X, y is useful)
        if y is not None:
            return df, y
        return df

    def get_feature_names(self):
        return self.feature_names_
