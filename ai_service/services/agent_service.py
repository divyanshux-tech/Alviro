import os
import re
import json
import time
import aiohttp
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME, EXPRESS_API_URL, BOT_NAME
from services.gemini_service import gemini_service
from services.rag_service import rag_service

# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT  (NOTE: {{ and }} are escaped braces for Python .format())
# ─────────────────────────────────────────────────────────────────────────────
def build_system_prompt(menu_context: str, session_context: str) -> str:
    """Build the system prompt by simple string concatenation — avoids .format() brace conflicts."""
    return (
        f"You are {BOT_NAME}, the charming and knowledgeable dining concierge at Al Viro — "
        "an acclaimed restaurant offering authentic Italian Fine Dining and rich Indian cuisine. "
        "You have years of experience helping guests discover exceptional food and make reservations.\n\n"
        "=== YOUR PERSONALITY & TONE ===\n"
        "- Speak naturally, warmly, and conversationally — exactly like a real human staff member.\n"
        "- **Hinglish & Casual Hindi**: Seamlessly understand and respond to Hinglish/Hindi casually (e.g., if a user says 'kuch meethe me dikhao', reply naturally like 'Haan bilkul! Humare paas bohat badiya sweets hain...'). Use casual terms like 'book kr do', 'ya pack krna hai'.\n"
        "- Be highly empathetic, soft-spoken, and human-centric.\n"
        "- **Seasonal Context**: Actively recommend dishes based on typical seasons (e.g., if summer is implied or it's hot, eagerly recommend Mango Ice Cream or refreshing drinks). \n"
        "- Use contractions (we've, let's, it's) and varying sentence structures. NEVER sound robotic.\n"
        "- NEVER say 'I am an AI' or 'As an AI language model'.\n\n"

        "=== CRITICAL RESPONSE RULES ===\n"
        "1. ALWAYS respond based on the actual LIVE MENU data provided below. Never invent dishes.\n"
        "2. When recommending dishes, use their EXACT names, EXACT prices, and EXACT descriptions from the menu.\n"
        "3. For 'what is best', 'recommend', 'popular', 'chef special' — pick 2-4 standout dishes from the menu and describe them enthusiastically.\n"
        "4. For dietary queries (veg, vegan, gluten-free) — filter dishes from the live menu with those exact flags.\n"
        "5. If the guest's query is unclear, make a reasonable helpful guess rather than asking for clarification.\n"
        "6. If they ask to book a table, pack food, or similar requests, gently guide them into the reservation flow.\n\n"

        "=== RESPONSE FORMAT (return ONLY this JSON, no markdown fences, no extra text) ===\n"
        "Return a single JSON object with these exact keys:\n"
        "  reply          : string  — full response with markdown (bold dish names, bullet points for lists)\n"
        "  voice_summary  : string  — 1-2 sentence spoken version, no markdown, max 180 chars. *If responding to Hindi/Hinglish, this should also be in Hinglish so it sounds natural when spoken by TTS!*\n"
        "  action_type    : string  — EXACTLY one of: chat, reservation_prompt, reservation_confirmed,\n"
        "                             full_menu, open_menu_browser, dishes_text, show_cart, item_not_found\n"
        "  suggested_dish_names : array of strings — EXACT dish names from the menu (empty if none relevant)\n"
        "  quick_replies  : array of 3-4 strings — contextual follow-up suggestion chips for the customer\n"
        "  reservation_updates : object — key-value pairs of any booking details the user just provided (e.g., {'guests': 2, 'date': 'tomorrow'}). Empty if none.\n"
        "  reservation_updates: object — key-value pairs of ANY booking details you extracted from this message (keys: guests, date, time, name, contact). Only include what was explicitly mentioned/updated.\n\n"

        "=== ACTION TYPE GUIDE ===\n"
        "chat               → greetings, general info, small talk, hours, location\n"
        "dishes_text        → showing specific dishes/recommendations (most common for food queries)\n"
        "full_menu          → customer wants the complete menu listed\n"
        "open_menu_browser  → same as full_menu, triggers the visual menu browser\n"
        "reservation_prompt → you are mid-way through collecting booking details (like 'table book kr do')\n"
        "reservation_confirmed → all booking details collected, booking is done\n"
        "item_not_found     → requested item genuinely not on our menu\n"
        "show_cart          → customer asked about their cart/pre-order\n\n"

        "=== RESERVATION FLOW ===\n"
        "To book a table, you need: guests, date, time, name, and contact (phone/email).\n"
        "You are fully in charge of managing this. Ask for missing details naturally and conversationally.\n"
        "If the customer changes their mind (e.g., 'add 2 more people', 'make it tomorrow instead'), just output the new values in `reservation_updates` and acknowledge it warmly.\n"
        "If the customer asks to see the menu mid-booking, happily oblige and seamlessly resume booking later.\n"
        "Only output `action_type: reservation_confirmed` when ALL 5 details are collected and confirmed.\n\n"

        "=== QUICK REPLY CHIPS ===\n"
        "After every response, suggest 3-4 natural follow-up actions a customer would likely want next.\n"
        "Keep them short (2-5 words) and contextually relevant. Feel free to use Hinglish chips if the conversation is in Hindi.\n"
        "Examples: 'Book a table', 'Show me sweets', 'Kuch spicy dikhao', 'What's under $15?'\n\n"

        "=== LIVE RESTAURANT MENU ===\n"
        + menu_context + "\n\n"

        "=== CURRENT SESSION STATE ===\n"
        + session_context + "\n\n"

        f"Remember: You are {BOT_NAME}. Be warm, genuine, and culturally fluent in both Italian fine dining and vibrant Indian cuisine."
    )

# ─────────────────────────────────────────────────────────────────────────────
# RAG FALLBACK SYSTEM PROMPT (when Gemini key is unavailable)
# ─────────────────────────────────────────────────────────────────────────────
FALLBACK_SYSTEM_PROMPT = f"""\
You are {BOT_NAME}, the warm dining concierge at Al Viro, offering Italian fine dining and rich Indian cuisine.
Answer using ONLY the restaurant context provided. Be warm, conversational, and naturally understand Hinglish/Hindi.
"""


class AgentService:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self._cached_menu: List[Dict[str, Any]] = []
        self._last_menu_fetch: float = 0.0
        self._menu_cache_ttl: float = 10.0

    # ─────────────────────────────────── Session ────────────────────────────
    def _get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "history": [],
                "reservation": {
                    "step": 0,      # 0=idle 1=guests 2=date 3=time 4=name 5=contact
                    "guests": None,
                    "date": None,
                    "time": None,
                    "name": None,
                    "contact": None
                }
            }
        return self.sessions[session_id]

    # ─────────────────────────────────── Live Menu ──────────────────────────
    async def get_live_menu(self) -> List[Dict[str, Any]]:
        """Fetches live menu from Express/MongoDB with short-lived cache."""
        now = time.time()
        if self._cached_menu and (now - self._last_menu_fetch < self._menu_cache_ttl):
            return self._cached_menu

        try:
            timeout = aiohttp.ClientTimeout(total=2.0)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(f"{EXPRESS_API_URL}/api/menu") as resp:
                    if resp.status == 200:
                        items = await resp.json()
                        if isinstance(items, list) and len(items) > 0:
                            live_dishes = []
                            for it in items:
                                if it.get("isAvailable", True) is not False:
                                    live_dishes.append({
                                        "id": str(it.get("_id", it.get("id", ""))),
                                        "name": it.get("name", "Artisan Dish"),
                                        "category": it.get("category", "Mains"),
                                        "price": float(it.get("price", 0.0)),
                                        "description": it.get("description", ""),
                                        "image": it.get("image", ""),
                                        "isVegetarian": bool(it.get("isVegetarian", False)),
                                        "isVegan": bool(it.get("isVegan", False)),
                                        "isGlutenFree": bool(it.get("isGlutenFree", False)),
                                        "spiceLevel": it.get("spiceLevel", "mild"),
                                        "ingredients": it.get("ingredients", []),
                                        "allergens": it.get("allergens", [])
                                    })
                            if live_dishes:
                                self._cached_menu = live_dishes
                                self._last_menu_fetch = now
                                return self._cached_menu
        except Exception as e:
            print(f"[AgentService] Menu fetch notice: {e}")

        if not self._cached_menu:
            self._cached_menu = rag_service.dishes
            self._last_menu_fetch = now
        return self._cached_menu

    # ─────────────────────────────────── Context Builders ───────────────────
    def _build_menu_context(self, dishes: List[Dict[str, Any]]) -> str:
        """Builds a rich menu context string for the system prompt."""
        rest = rag_service.restaurant_info
        lines = [
            f"Restaurant: {rest.get('name', 'Al Viro')} | {rest.get('cuisine', 'Fine Italian Dining')}",
            f"Location: {rest.get('location', '')}",
            f"Hours: {json.dumps(rest.get('opening_hours', {}))}",
            f"Reservation Policy: {rest.get('reservation_policy', '')}",
            f"Contact: {rest.get('contact', {}).get('phone', '')} | {rest.get('contact', {}).get('email', '')}",
            "",
            "LIVE MENU (only recommend these exact items):"
        ]
        # Group by category
        categories: Dict[str, List] = {}
        for d in dishes:
            cat = d.get("category", "Mains")
            categories.setdefault(cat, []).append(d)

        for cat, items in categories.items():
            lines.append(f"\n[{cat}]")
            for d in items:
                tags = []
                if d.get("isVegetarian"): tags.append("Veg")
                if d.get("isVegan"): tags.append("Vegan")
                if d.get("isGlutenFree"): tags.append("GF")
                tag_str = f" [{', '.join(tags)}]" if tags else ""
                lines.append(
                    f"  • {d.get('name')} — ${d.get('price', 0):.2f}{tag_str}: {d.get('description', '')}"
                )
        return "\n".join(lines)

    def _build_session_context(self, session: Dict[str, Any], cart_context: str = "") -> str:
        """Describes current reservation state so Gemini knows what's been collected."""
        res = session["reservation"]
        step = res["step"]
        parts = []
        if step == 0:
            parts.append("No active reservation booking in progress.")
        else:
            parts.append(f"Reservation booking in progress (step {step}/5):")
            if res["guests"]: parts.append(f"  - Guests: {res['guests']}")
            if res["date"]: parts.append(f"  - Date: {res['date']}")
            if res["time"]: parts.append(f"  - Time: {res['time']}")
            if res["name"]: parts.append(f"  - Name: {res['name']}")
            if res["contact"]: parts.append(f"  - Contact: {res['contact']}")

            missing = []
            if not res["guests"]: missing.append("number of guests")
            if not res["date"]: missing.append("preferred date")
            if not res["time"]: missing.append("preferred time")
            if not res["name"]: missing.append("guest name")
            if not res["contact"]: missing.append("phone or email")
            if missing:
                parts.append(f"  Still needed: {', '.join(missing)}")

        if cart_context:
            parts.append(f"\nCustomer's current pre-order cart: {cart_context}")
        else:
            parts.append("\nCustomer cart: empty")

        history = session.get("history", [])
        if history:
            recent = history[-6:]
            parts.append("\nRecent conversation:")
            for h in recent:
                        role = "Customer" if h.get("sender") == "user" else BOT_NAME
                        parts.append(f"  {role}: {h.get('text', '')[:120]}")

        return "\n".join(parts)

    # ─────────────────────────────────── Backend Booking ────────────────────
    async def _save_reservation(self, res: Dict[str, Any]) -> Dict[str, Any]:
        try:
            contact = str(res.get("contact", ""))
            payload = {
                "name": res.get("name") or "Valued Guest",
                "email": contact if "@" in contact else "guest@alviro.com",
                "phone": contact if "@" not in contact else "+1 (555) 019-2834",
                "date": res.get("date") or datetime.now().strftime("%Y-%m-%d"),
                "time": res.get("time") or "8:00 PM",
                "guests": int(res.get("guests") or 2),
                "specialRequest": "Booked via DineMate AI Assistant"
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{EXPRESS_API_URL}/api/reservations",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as resp:
                    if resp.status in [200, 201]:
                        data = await resp.json()
                        return {"success": True, "data": data}
        except Exception as e:
            print(f"[AgentService] Booking save notice: {e}")
        return {"success": True, "data": res}

    # ─────────────────────────────────── Dish Resolver ──────────────────────
    def _resolve_dishes(self, dish_names: List[str], live_dishes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Maps dish names returned by Gemini to actual dish objects from the live menu."""
        resolved = []
        for name in dish_names:
            name_lower = name.lower().strip()
            # Exact match first
            match = next((d for d in live_dishes if d.get("name", "").lower() == name_lower), None)
            # Fuzzy: name contains the query term
            if not match:
                match = next((d for d in live_dishes if name_lower in d.get("name", "").lower() or
                              d.get("name", "").lower() in name_lower), None)
            if match and match not in resolved:
                resolved.append(match)
        return resolved

    # ─────────────────────────────────── RAG Fallback ───────────────────────
    def _rag_fallback(self, message: str, live_dishes: List[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Dynamic RAG-based fallback when Gemini is unavailable."""
        retrieved = rag_service.retrieve_context(message, top_k=4)
        matched_dishes, info_chunks = [], []
        seen = set()

        for item in retrieved:
            meta = item.get("metadata", {})
            if meta.get("type") == "dish":
                d = meta.get("data", {})
                d_id = str(d.get("_id", d.get("id", d.get("name", ""))))
                if d_id not in seen:
                    seen.add(d_id)
                    matched_dishes.append(d)
            else:
                info_chunks.append(item.get("document", ""))

        lower = message.lower()

        # Greeting fallback
        if any(g in lower for g in ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"]):
            greetings = [
                f"Welcome to Al Viro! 🍷 I'm {BOT_NAME}, your dining concierge. Whether you're looking to explore our menu, find the perfect dish, or book a table — I'm here to help. What can I do for you?",
                f"Hello and welcome! 😊 I'm {BOT_NAME} at Al Viro. We've got some wonderful dishes on the menu today. Can I help you with a reservation, or would you like to browse what's on?",
                f"Good evening! Welcome to Al Viro 🌿 I'm your concierge, {BOT_NAME}. Feel free to ask me anything — our menu, table availability, dietary options, you name it!"
            ]
            import random
            reply = random.choice(greetings)
            return {
                "reply": reply,
                "voice_summary": reply,
                "action_type": "chat",
                "suggested_dishes": [],
                "quick_replies": ["Show me the menu", "Book a table", "What's popular today?", "Vegetarian options"],
                "session_id": session_id
            }

        if matched_dishes:
            dish_lines = []
            for d in matched_dishes[:4]:
                tags = []
                if d.get("isVegetarian"): tags.append("Vegetarian")
                if d.get("isGlutenFree"): tags.append("Gluten-Free")
                tag_str = f" *({', '.join(tags)})*" if tags else ""
                dish_lines.append(f"• **{d.get('name')}** (${d.get('price', 0):.2f}){tag_str} — {d.get('description', '')}")

            reply = f"Here's what we have for you:\n\n" + "\n".join(dish_lines) + "\n\nWould you like to know more about any of these, or shall I help you book a table?"
            top_names = ", ".join([d.get("name", "") for d in matched_dishes[:2]])
            return {
                "reply": reply,
                "voice_summary": f"Here's what we have: {top_names}. Would you like to book a table?",
                "action_type": "dishes_text",
                "suggested_dishes": matched_dishes[:4],
                "quick_replies": ["Book a table", "Show full menu", "Any vegan options?"],
                "session_id": session_id
            }

        if info_chunks:
            reply = f"{info_chunks[0]}\n\nAnything else I can help you with?"
            return {
                "reply": reply,
                "voice_summary": info_chunks[0][:150],
                "action_type": "chat",
                "suggested_dishes": [],
                "quick_replies": ["Show me the menu", "Book a table", "Popular dishes"],
                "session_id": session_id
            }

        reply = (
            "I'd love to help! At Al Viro, we specialise in authentic Italian fine dining — "
            "handcrafted pastas, wood-fired mains, and gorgeous desserts. "
            "I can show you our full menu, recommend something based on your mood, "
            "or help you reserve a table. What sounds good?"
        )
        return {
            "reply": reply,
            "voice_summary": "I'd love to help! I can show you the menu, make recommendations, or help you reserve a table.",
            "action_type": "chat",
            "suggested_dishes": [],
            "quick_replies": ["Show me the menu", "Book a table", "What's the chef's recommendation?", "Vegan dishes"],
            "session_id": session_id
        }

    # ─────────────────────────────────── Main Entry Point ───────────────────
    async def process_chat(
        self,
        message: str,
        session_id: str = "default",
        client_history: List[Dict[str, str]] = None,
        cart_context: str = ""
    ) -> Dict[str, Any]:
        import traceback as tb

        try:
            session = self._get_session(session_id)
            res_state = session["reservation"]

            # Append user message to session history
            session["history"].append({"sender": "user", "text": message})
            if len(session["history"]) > 20:
                session["history"] = session["history"][-20:]

            # Fetch live menu from database
            live_dishes = await self.get_live_menu()

            # ─────────────────────────────────────────────────────────────
            # GEMINI — PRIMARY BRAIN
            # ─────────────────────────────────────────────────────────────
            if gemini_service.is_ready():
                try:
                    menu_context = self._build_menu_context(live_dishes)
                    session_context = self._build_session_context(session, cart_context)
                    system_prompt = build_system_prompt(menu_context, session_context)

                    # RAG context
                    rag_snippets = rag_service.retrieve_context(message, top_k=3)
                    rag_context = ""
                    if rag_snippets:
                        rag_context = "\nRelevant context retrieved:\n" + "\n".join(
                            [f"- {r['document'][:200]}" for r in rag_snippets]
                        )

                    # Conversation history string
                    history_str = ""
                    for h in session["history"][-8:]:
                        role = h.get("sender", "")
                        text = h.get("text", "")
                        if role == "user":
                            history_str += f"Customer: {text}\n"
                        elif role == "bot":
                            history_str += f"{BOT_NAME}: {text[:200]}\n"
                        elif role == "system":
                            history_str += f"[System]: {text}\n"

                    # Booking hint based on dynamic state
                    booking_hint = ""
                    missing = []
                    if not res_state["guests"]: missing.append("guests")
                    if not res_state["date"]: missing.append("date")
                    if not res_state["time"]: missing.append("time")
                    if not res_state["name"]: missing.append("name")
                    if not res_state["contact"]: missing.append("contact (phone/email)")
                    
                    if res_state["step"] > 0 or "book" in message.lower() or "reserve" in message.lower():
                        if missing:
                            booking_hint = f"\n[IMPORTANT: User wants to book. We still need: {', '.join(missing)}. Ask for ONE missing detail naturally. Set action_type='reservation_prompt'.]\n"
                        else:
                            booking_hint = "\n[IMPORTANT: All booking details collected! Tell the user that their reservation request has been successfully submitted and is currently pending admin approval. They will receive a confirmation email once approved. Set action_type='reservation_confirmed'.]\n"

                    prompt = (
                        f"{history_str}"
                        f"Customer: {message}\n"
                        f"{booking_hint}"
                        f"{rag_context}\n\n"
                        f"Respond as {BOT_NAME} (return valid JSON only, no markdown fences):"
                    )

                    result = await gemini_service.generate_agent_response(prompt, system_instruction=system_prompt)

                except Exception as gemini_err:
                    print(f"[AgentService] ❌ Gemini pipeline error:\n{tb.format_exc()}")
                    result = {}

                if result and result.get("reply"):
                    action = str(result.get("action_type", "chat"))

                    # Apply dynamic reservation updates from Gemini
                    updates = result.get("reservation_updates", {})
                    if updates and isinstance(updates, dict):
                        res_state["step"] = 1 # Mark booking as active
                        for k, v in updates.items():
                            if k in res_state and v:
                                res_state[k] = v

                    if action == "reservation_confirmed":
                        res_state["step"] = 0
                        confirmed = {
                            "guests": res_state.get("guests") or 2,
                            "date": res_state.get("date") or "Today",
                            "time": res_state.get("time") or "8:00 PM",
                            "name": res_state.get("name") or "Guest",
                            "contact": res_state.get("contact") or "guest@alviro.com"
                        }
                        
                        # Reset state for next booking
                        session["reservation"] = {
                            "step": 0, "guests": None, "date": None, "time": None, "name": None, "contact": None
                        }
                        await self._save_reservation(confirmed)

                    # Resolve suggested dish names → actual dish objects
                    dish_names = result.get("suggested_dish_names") or []
                    if not isinstance(dish_names, list):
                        dish_names = []
                    resolved_dishes = self._resolve_dishes(dish_names, live_dishes)

                    # Menu browser trigger
                    if action in ("full_menu", "open_menu_browser"):
                        action = "open_menu_browser"
                        if not resolved_dishes:
                            resolved_dishes = live_dishes[:6]

                    quick_replies = result.get("quick_replies") or []
                    if not isinstance(quick_replies, list):
                        quick_replies = []

                    bot_reply = str(result.get("reply", ""))
                    session["history"].append({"sender": "bot", "text": bot_reply})

                    return {
                        "reply": bot_reply,
                        "voice_summary": str(result.get("voice_summary", bot_reply[:200])).replace("*", "").replace("#", ""),
                        "action_type": action,
                        "suggested_dishes": resolved_dishes,
                        "quick_replies": quick_replies,
                        "session_id": session_id
                    }

        # ─────────────────────────────────────────────────────────────────────
            # RAG FALLBACK (Gemini key not configured or returned empty)
            # ─────────────────────────────────────────────────────────────────────
            fallback = self._rag_fallback(message, live_dishes, session_id)
            session["history"].append({"sender": "bot", "text": fallback.get("reply", "")})
            return fallback

        except Exception:
            print(f"[AgentService] ❌ FATAL error in process_chat:\n{tb.format_exc()}")
            return {
                "reply": "I'm so sorry, something went wrong on my end! Could you try that again? 😊",
                "voice_summary": "Something went wrong. Please try again.",
                "action_type": "chat",
                "suggested_dishes": [],
                "quick_replies": ["Show me the menu", "Book a table"],
                "session_id": session_id
            }


agent_service = AgentService()
