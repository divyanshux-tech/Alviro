import os
import json
import joblib
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List
from services.rag_service import rag_service

class DemandService:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "ml", "demand_model.joblib")
        self.metrics_path = os.path.join(os.path.dirname(__file__), "..", "ml", "model_metrics.json")
        self.model = None
        self.metrics = {}
        self._load_or_train_model()

    def _load_or_train_model(self):
        """Loads trained model or triggers initial training."""
        if not os.path.exists(self.model_path):
            try:
                from ml.train_demand_model import train_and_evaluate_demand_model
                self.metrics = train_and_evaluate_demand_model()
            except Exception as e:
                print(f"[DemandService] Warning: Could not train model automatically: {e}")

        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            print("[DemandService] Loaded Random Forest Demand Forecasting Model.")

        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r", encoding="utf-8") as f:
                self.metrics = json.load(f)

    def forecast_demand(self, target_date: str = None, weather: str = "Sunny", temperature: float = 24.0) -> Dict[str, Any]:
        """Predicts order volume for all dishes on a specific date using the trained Random Forest model."""
        if not self.model:
            self._load_or_train_model()

        if target_date is None:
            target_date = datetime.now().strftime("%Y-%m-%d")

        try:
            dt = datetime.strptime(target_date, "%Y-%m-%d")
        except ValueError:
            dt = datetime.now()

        day_of_week = dt.weekday()
        is_weekend = 1 if day_of_week in [4, 5, 6] else 0
        is_holiday = 1 if dt.strftime("%m-%d") in ["12-25", "12-31", "01-01", "02-14"] else 0

        # Build feature rows for all 10 menu dishes
        records = []
        for dish in rag_service.dishes:
            records.append({
                "dish_name": dish.get("name"),
                "category": dish.get("category"),
                "weather": weather,
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
                "is_holiday": is_holiday,
                "temperature": temperature,
                "price": dish.get("price")
            })

        df_input = pd.DataFrame(records)
        
        # Predict orders using trained Random Forest pipeline
        if self.model:
            preds = self.model.predict(df_input)
        else:
            preds = [25.0] * len(records)

        dish_forecasts = []
        total_predicted_orders = 0
        total_projected_revenue = 0.0

        for i, dish in enumerate(rag_service.dishes):
            predicted_count = max(5, int(round(float(preds[i]))))
            projected_revenue = round(predicted_count * float(dish.get("price")), 2)
            total_predicted_orders += predicted_count
            total_projected_revenue += projected_revenue

            # Demand tag
            if predicted_count >= 32:
                demand_tier = "High Demand 🔥"
            elif predicted_count >= 20:
                demand_tier = "Moderate Demand ⚖️"
            else:
                demand_tier = "Standard 🍽️"

            dish_forecasts.append({
                "dish_name": dish.get("name"),
                "category": dish.get("category"),
                "price": dish.get("price"),
                "predicted_orders": predicted_count,
                "projected_revenue": projected_revenue,
                "demand_tier": demand_tier
            })

        # Sort by predicted orders descending
        dish_forecasts.sort(key=lambda x: x["predicted_orders"], reverse=True)
        top_dish = dish_forecasts[0]

        # Generate Kitchen Prep & Inventory Recommendations
        prep_advice = [
            f"Expected peak demand for **{top_dish['dish_name']}** ({top_dish['predicted_orders']} orders). Prepare sufficient base inventory.",
            f"Weekend covers surge multiplier active: Projected total revenue: **${total_projected_revenue:,.2f}** ({total_predicted_orders} total plates)." if is_weekend else "Standard weekday operations active."
        ]

        return {
            "forecast_date": target_date,
            "day_of_week_name": dt.strftime("%A"),
            "is_weekend": bool(is_weekend),
            "weather_condition": weather,
            "total_predicted_orders": total_predicted_orders,
            "total_projected_revenue": round(total_projected_revenue, 2),
            "top_dish_expected": top_dish["dish_name"],
            "dishes_forecast": dish_forecasts,
            "kitchen_prep_advice": prep_advice,
            "model_metrics": self.metrics
        }

demand_service = DemandService()
