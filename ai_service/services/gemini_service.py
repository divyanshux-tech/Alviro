import os
import json
import re
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

class GeminiService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.is_configured = False
        self._init_client()

    def _init_client(self):
        key = self.api_key or os.getenv("GEMINI_API_KEY", "")
        if key and key not in ("your_gemini_api_key_here", ""):
            try:
                genai.configure(api_key=key)
                self.api_key = key
                self.is_configured = True
                print("[GeminiService] OK: Gemini API configured successfully.")
            except Exception as e:
                print(f"[GeminiService] Warning: Failed to configure Gemini API: {e}")
                self.is_configured = False
        else:
            self.is_configured = False
            print("[GeminiService] WARNING: No valid Gemini API key found -- using RAG fallback mode.")

    def is_ready(self) -> bool:
        return self.is_configured

    async def generate_response(self, prompt: str, system_instruction: str = "") -> str:
        """Generate a plain text response using Gemini LLM."""
        if not self.is_configured:
            self.api_key = os.getenv("GEMINI_API_KEY", "")
            self._init_client()
        if not self.is_configured:
            return ""
        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL_NAME,
                system_instruction=system_instruction if system_instruction else None
            )
            response = await model.generate_content_async(prompt)
            try:
                return response.text if response.text else ""
            except ValueError:
                return " ".join([p.text for p in response.candidates[0].content.parts if hasattr(p, "text")])
        except Exception as e:
            print(f"[GeminiService] Generation error: {e}")
            return ""

    async def generate_agent_response(self, prompt: str, system_instruction: str = "") -> dict:
        """
        Generate a structured JSON agent response from Gemini.
        Uses plain text mode and extracts JSON — avoids SDK version issues with response_mime_type.
        Returns dict with: reply, voice_summary, action_type, suggested_dish_names, quick_replies
        """
        if not self.is_configured:
            self.api_key = os.getenv("GEMINI_API_KEY", "")
            self._init_client()
        if not self.is_configured:
            return {}

        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL_NAME,
                system_instruction=system_instruction if system_instruction else None
            )
            response = await model.generate_content_async(prompt)
            try:
                raw = response.text if response.text else ""
            except ValueError:
                raw = " ".join([p.text for p in response.candidates[0].content.parts if hasattr(p, "text")])
            if not raw.strip():
                return {}

            # Try to extract JSON from the response
            parsed = self._extract_json(raw)
            if parsed:
                if "reply" in parsed or "response" in parsed:
                    if "response" in parsed and "reply" not in parsed:
                        parsed["reply"] = parsed.pop("response")
                    return parsed

            # If Gemini returned plain text instead of JSON, wrap it
            # (this happens when the model ignores JSON instructions)
            cleaned = raw.strip().replace("**", "").replace("##", "").strip()
            return {
                "reply": cleaned,
                "voice_summary": cleaned[:250],
                "action_type": "chat",
                "suggested_dish_names": [],
                "quick_replies": []
            }

        except Exception as e:
            print(f"[GeminiService] Agent generation error: {type(e).__name__}: {e}")
            return {}

    def _extract_json(self, text: str) -> dict:
        """Extracts the first valid JSON object from a string, handling markdown fences."""
        if not text:
            return {}
        # Strip markdown code fences
        cleaned = text.strip()
        if "```" in cleaned:
            # Extract content between first ``` pair
            parts = cleaned.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    cleaned = part
                    break

        # Try direct parse
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Try finding JSON object with regex
        try:
            m = re.search(r'\{[\s\S]*\}', cleaned)
            if m:
                return json.loads(m.group(0))
        except (json.JSONDecodeError, Exception):
            pass

        return {}

# Singleton instance
gemini_service = GeminiService()
