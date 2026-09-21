import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import PORT, HOST, GEMINI_API_KEY
from services.gemini_service import gemini_service
from services.rag_service import rag_service
from routers.rag_router import router as rag_router
from routers.chat_router import router as chat_router
from routers.recommendations_router import router as rec_router
from routers.demand_router import router as demand_router
from routers.sentiment_router import router as sentiment_router

app = FastAPI(
    title="Al Viro AI Microservice",
    description="AI-Powered Conversational Restaurant Management, RAG, Food Recommendations, Demand Forecasting & Sentiment Analysis",
    version="1.0.0"
)

# Configure CORS for React Vite client & Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000", "http://127.0.0.1:5173", "http://127.0.0.1:8000", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(rag_router)
app.include_router(chat_router)
app.include_router(rec_router)
app.include_router(demand_router)
app.include_router(sentiment_router)




@app.get("/")
def root():
    return {
        "service": "Al Viro AI Microservice",
        "status": "online",
        "version": "1.0.0",
        "gemini_configured": gemini_service.is_ready(),
        "indexed_menu_dishes": len(rag_service.dishes),
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_ready": gemini_service.is_ready(),
        "indexed_dishes": len(rag_service.dishes)
    }

if __name__ == "__main__":
    import uvicorn
    print(f"[AI Service] Starting Al Viro AI Service on http://{HOST}:{PORT}")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
