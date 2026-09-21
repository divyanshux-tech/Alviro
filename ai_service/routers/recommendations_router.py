from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from services.recommender_service import recommender_service, PreferenceInput

router = APIRouter(prefix="/api/ai", tags=["Food Recommendations"])

@router.post("/recommendations")
async def get_personalized_recommendations(prefs: PreferenceInput, limit: Optional[int] = 4):
    """Calculates personalized dish recommendations using hybrid Content-Based ML & Constraint Satisfaction."""
    try:
        results = recommender_service.recommend(prefs, limit=limit)
        return {
            "total_matches": len(results),
            "preferences_applied": prefs.dict(),
            "recommendations": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/featured")
async def get_featured_recommendations():
    """Returns top chef recommendations across popular dietary filters."""
    default_prefs = PreferenceInput(isVegetarian=False, preferredSpice="Any")
    veg_prefs = PreferenceInput(isVegetarian=True)
    gf_prefs = PreferenceInput(isGlutenFree=True)

    return {
        "chef_specials": recommender_service.recommend(default_prefs, limit=3),
        "vegetarian_top_picks": recommender_service.recommend(veg_prefs, limit=3),
        "gluten_free_top_picks": recommender_service.recommend(gf_prefs, limit=3)
    }
