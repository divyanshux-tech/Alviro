from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from services.sentiment_service import sentiment_service

router = APIRouter(prefix="/api/ai", tags=["Sentiment Analysis"])

class ReviewAnalysisRequest(BaseModel):
    comment: str = Field(..., description="Customer review text")
    rating: Optional[int] = Field(5, ge=1, le=5)

@router.post("/analyze-sentiment")
async def analyze_customer_review(request: ReviewAnalysisRequest):
    """Analyzes a customer review across 4 aspects: Food, Service, Ambience, and Price."""
    try:
        result = sentiment_service.analyze_text(request.comment, rating=request.rating)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment-summary")
async def get_sentiment_analytics():
    """Returns aggregated aspect satisfaction metrics, praises, and complaints for Admin Intelligence Dashboard."""
    try:
        return sentiment_service.get_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
