from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.demand_service import demand_service

router = APIRouter(prefix="/api/ai", tags=["Demand Forecasting"])

@router.get("/demand-forecast")
async def get_demand_forecast(
    date: Optional[str] = Query(None, description="Target forecast date (YYYY-MM-DD)"),
    weather: Optional[str] = Query("Sunny", description="Weather forecast: Sunny, Rainy, Cloudy, Chilly"),
    temp: Optional[float] = Query(24.0, description="Temperature in Celsius")
):
    """Predicts daily dish sales, rush hours, revenue, and inventory prep using Random Forest Regressor."""
    try:
        result = demand_service.forecast_demand(target_date=date, weather=weather, temperature=temp)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demand-metrics")
async def get_model_evaluation_metrics():
    """Returns academic ML model evaluation metrics (R2 Score, MAE, RMSE, Dataset parameters)."""
    return demand_service.metrics
