from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.rag_service import rag_service

router = APIRouter(prefix="/api/ai", tags=["Menu RAG"])

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Customer's natural language question about the menu or restaurant")

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    matched_dishes: List[Dict[str, Any]]
    context_count: int

@router.post("/menu-rag", response_model=RAGQueryResponse)
async def query_menu_rag(request: RAGQueryRequest):
    """Answers customer inquiries about dishes, ingredients, allergens, prices, and policies using RAG."""
    try:
        result = await rag_service.answer_query(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/menu-items")
async def get_menu_items():
    """Returns all indexed menu items with enriched AI metadata."""
    return {
        "restaurant": rag_service.restaurant_info,
        "dishes": rag_service.dishes,
        "total": len(rag_service.dishes)
    }

@router.post("/sync-dish")
async def sync_and_learn_new_dish(dish_data: Dict[str, Any]):
    """Dynamically learns and vectorizes a new dish into TF-IDF vector space and Recommender feature matrix."""
    try:
        result = rag_service.add_dish(dish_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

