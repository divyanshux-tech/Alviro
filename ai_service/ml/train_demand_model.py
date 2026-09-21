import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error

def train_and_evaluate_demand_model():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "orders_dataset.csv")
    model_output_path = os.path.join(os.path.dirname(__file__), "demand_model.joblib")
    metrics_output_path = os.path.join(os.path.dirname(__file__), "model_metrics.json")

    # Generate data if missing
    if not os.path.exists(data_path):
        from generate_orders_dataset import generate_orders_dataset
        generate_orders_dataset(data_path)

    df = pd.read_csv(data_path)

    # Define feature columns
    categorical_features = ["dish_name", "category", "weather"]
    numeric_features = ["day_of_week", "is_weekend", "is_holiday", "temperature", "price"]

    X = df[categorical_features + numeric_features]
    y = df["orders_count"]

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numeric_features)
        ]
    )

    # 1. Baseline Model: Linear Regression
    lr_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", LinearRegression())])
    lr_pipeline.fit(X_train, y_train)
    lr_preds = lr_pipeline.predict(X_test)
    lr_r2 = r2_score(y_test, lr_preds)
    lr_mae = mean_absolute_error(y_test, lr_preds)

    # 2. Main Model: Random Forest Regressor
    rf_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=120, max_depth=16, random_state=42))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_preds = rf_pipeline.predict(X_test)
    rf_r2 = r2_score(y_test, rf_preds)
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = root_mean_squared_error(y_test, rf_preds)

    # Save trained model
    joblib.dump(rf_pipeline, model_output_path)

    # Save metrics for academic presentation & dashboard
    metrics = {
        "model_type": "Random Forest Regressor",
        "n_estimators": 120,
        "dataset_records": len(df),
        "test_size": len(X_test),
        "random_forest": {
            "r2_score": round(float(rf_r2), 4),
            "mae": round(float(rf_mae), 2),
            "rmse": round(float(rf_rmse), 2)
        },
        "baseline_linear_regression": {
            "r2_score": round(float(lr_r2), 4),
            "mae": round(float(lr_mae), 2)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(metrics_output_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"✅ Random Forest Model Trained Successfully!")
    print(f"   - R² Score: {rf_r2:.4f} (Baseline LR: {lr_r2:.4f})")
    print(f"   - Mean Absolute Error: {rf_mae:.2f} dish portions")
    print(f"   - Model saved to {model_output_path}")

    return metrics

if __name__ == "__main__":
    train_and_evaluate_demand_model()
