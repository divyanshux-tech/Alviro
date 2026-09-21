# DineMate AI Chatbot - Major Update Guide 🎉

Welcome to the fully upgraded DineMate AI! We've made massive improvements to the chatbot to make it incredibly smart, dynamic, and realistic. 

This guide outlines exactly what has changed and the step-by-step instructions to get it running on your local machine so you can experience the exact same flow!

---

## 🚀 What We Upgraded

### 1. ElevenLabs-Quality Neural Voice (Completely Free!)
We completely removed the default robotic browser voice. The AI now uses **Microsoft Edge Neural TTS** on the backend. 
- It uses the `en-IN-NeerjaNeural` model, which is a highly realistic, warm, and natural Indian-English female voice.
- It sounds exactly like a premium ElevenLabs or Azure voice but costs $0 to run.
- The React frontend now directly streams this high-quality audio from the Python backend (`/api/ai/tts`).

### 2. Fully Dynamic, LLM-Driven Reservations
Previously, the reservation flow relied on rigid, hard-coded Regex steps (e.g., "Step 1: guests", "Step 2: time"). If a user got confused or changed their mind mid-booking, it crashed the logic.
- We **deleted the hard-coded regex** and handed 100% control of the reservation state over to Gemini.
- The AI now outputs `reservation_updates` dynamically. If you say, *"Wait, actually make that 6 people instead of 4,"* or *"Show me the menu before I finish booking,"* Sofia will naturally understand, update the state, and gently steer the conversation back when you're ready.

### 3. Deep Context Awareness & UI Fixes
- Added an extensive synthetic dataset of 100+ authentic Indian & Italian dishes into the AI's fallback menu knowledge.
- Fixed a bug where multi-part Gemini responses crashed the FastAPI server.
- Fixed a React UI crash (`resStep` ReferenceError) that occurred when opening the menu browser via the chatbot.
- The AI is now fully aware of the user's **cart context**. If you add items to the cart, Sofia knows exactly what you ordered in real-time.

---

## 🛠️ How to Run This on Your Local Machine

Follow these exact steps to pull the updates and see the exact same flow.

### Step 1: Pull the Latest Code
Open your terminal in the `Alviro` project root and pull the latest changes from GitHub:
```bash
git pull origin main
```

### Step 2: Install New Python Dependencies
Because we added the new premium voice generation, you **must** update your Python packages.
1. Open your terminal and navigate to the `ai_service` folder:
   ```bash
   cd ai_service
   ```
2. Install the updated requirements (this installs `edge-tts` and ensures `google-generativeai` is up to date):
   ```bash
   pip install -r requirements.txt
   ```

### Step 3: Configure Your Gemini API Key
Make sure your Gemini API key is active.
1. Inside the `ai_service` folder, open the `.env` file.
2. Ensure you have your key set up (If you don't have one, get a free key from Google AI Studio):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Note: You do not need to change anything else. We upgraded the model to `gemini-3.6-flash` automatically in the config!).*

### Step 4: Run the Application!
You need all three servers running for the full experience.

1. **Start the Database / Backend (Express):**
   ```bash
   cd server
   npm run dev
   ```
   *(Since you have your local MongoDB setup, the AI will automatically fetch the live restaurant menu from your database!)*

2. **Start the Frontend (React):**
   ```bash
   cd client
   npm run dev
   ```

3. **Start the AI Service (Python):**
   ```bash
   cd ai_service
   python main.py
   ```

### 🎯 Test It Out!
Open your browser to `http://localhost:5173`. Click the AI Chatbot icon and try out the new features:
- **Test the voice:** Turn on the sound and listen to Sofia's new realistic voice.
- **Test the smart booking:** Say *"Book a table for 4"*, then in the next message say *"Actually, change that to 6 people and show me the menu"*. Watch how flawlessly the AI handles it! 

Enjoy the upgrade! 🍷
