import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:5000")

# Model configuration
GEMINI_MODEL_NAME = "gemini-3.6-flash"

# Bot configuration
BOT_NAME = os.getenv("BOT_NAME", "DineMate")
