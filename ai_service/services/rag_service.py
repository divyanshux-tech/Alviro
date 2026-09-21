import os
import json
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.gemini_service import gemini_service

class MenuRAGService:
    def __init__(self, data_path: str = None):
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), "..", "data", "menu_knowledge.json")
        self.data_path = data_path
        self.dishes: List[Dict[str, Any]] = []
        self.restaurant_info: Dict[str, Any] = {}
        self.documents: List[str] = []
        self.doc_metadata: List[Dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer = None
        self.tfidf_matrix = None
        
        self._load_and_index()

    def _load_and_index(self):
        """Loads JSON data and creates vector index for semantic search."""
        if not os.path.exists(self.data_path):
            print(f"[MenuRAGService] Warning: Knowledge file not found at {self.data_path}")
            return

        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.restaurant_info = data.get("restaurant", {})
        self.dishes = data.get("dishes", [])

        self.documents = []
        self.doc_metadata = []

        # 1. Index General Restaurant Policies & Info
        rest_doc = (
            f"Restaurant: {self.restaurant_info.get('name', 'Al Viro')} - {self.restaurant_info.get('cuisine', '')}. "
            f"Tagline: {self.restaurant_info.get('tagline', '')}. "
            f"Location: {self.restaurant_info.get('location', '')}. "
            f"Opening Hours: {json.dumps(self.restaurant_info.get('opening_hours', {}))}. "
            f"Reservation Policy: {self.restaurant_info.get('reservation_policy', '')}. "
            f"Dress Code: {self.restaurant_info.get('dress_code', '')}. "
            f"Contact: {self.restaurant_info.get('contact', {}).get('phone', '')}, Email: {self.restaurant_info.get('contact', {}).get('email', '')}."
        )
        self.documents.append(rest_doc)
        self.doc_metadata.append({"type": "restaurant_info", "data": self.restaurant_info})

        # 2. Index Each Menu Item with Full Semantic Context
        for dish in self.dishes:
            dietary_tags = []
            if dish.get("isVegetarian"): dietary_tags.append("Vegetarian")
            if dish.get("isVegan"): dietary_tags.append("Vegan")
            if dish.get("isGlutenFree"): dietary_tags.append("Gluten-Free")

            dish_doc = (
                f"Dish: {dish.get('name')} | Category: {dish.get('category')} | Price: ${dish.get('price'):.2f}. "
                f"Description: {dish.get('description')} "
                f"Dietary: {', '.join(dietary_tags) if dietary_tags else 'Regular Non-Vegetarian'}. "
                f"Spice Level: {dish.get('spiceLevel', 'None')}. "
                f"Ingredients: {', '.join(dish.get('ingredients', []))}. "
                f"Allergens: {', '.join(dish.get('allergens', [])) if dish.get('allergens') else 'None'}. "
                f"Calories: {dish.get('calories', '')} kcal. "
                f"Preparation Time: {dish.get('prepTimeMinutes', '')} mins. "
                f"Flavor Profile: {', '.join(dish.get('flavorProfile', []))}. "
                f"Wine Pairing: {dish.get('winePairing', 'Chef selection')}."
            )
            self.documents.append(dish_doc)
            self.doc_metadata.append({"type": "dish", "data": dish})

        # 3. Fit Vectorizer
        if self.documents:
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
            self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
            print(f"[MenuRAGService] Successfully indexed {len(self.documents)} knowledge documents.")

    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Finds top-k relevant knowledge chunks for a given query."""
        if not self.vectorizer or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        top_indices = similarities.argsort()[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.05:  # Filter out completely irrelevant chunks
                results.append({
                    "score": round(score, 3),
                    "document": self.documents[idx],
                    "metadata": self.doc_metadata[idx]
                })
        return results

    async def answer_query(self, user_query: str) -> Dict[str, Any]:
        """Answers customer questions grounded strictly in Al Viro menu and restaurant facts."""
        retrieved = self.retrieve_context(user_query, top_k=4)

        context_text = "\n\n".join([f"[{i+1}] {item['document']}" for i, item in enumerate(retrieved)])
        
        system_instruction = (
            "You are DineMate, the refined, warm, and expert Italian Sommelier and AI Assistant for 'Al Viro' restaurant.\n"
            "Answer the customer's question using ONLY the provided Restaurant Context.\n"
            "Rules:\n"
            "1. Be welcoming, sophisticated, and concise.\n"
            "2. Always mention exact prices, ingredients, and allergen/dietary details when relevant.\n"
            "3. If a dish or question is not covered in the context, politely clarify that Al Viro does not currently offer it, but suggest our closest available authentic Italian dish.\n"
            "4. Use appetizing formatting with bold highlights for dish names and prices."
        )

        prompt = (
            f"=== AL VIRO RESTAURANT KNOWLEDGE CONTEXT ===\n"
            f"{context_text if context_text else 'No specific menu items matched.'}\n\n"
            f"=== CUSTOMER QUESTION ===\n"
            f"{user_query}\n\n"
            f"=== YOUR DINEMATE AI RESPONSE ==="
        )

        llm_response = await gemini_service.generate_response(prompt, system_instruction=system_instruction)

        # Extract dish objects that were retrieved
        retrieved_dishes = [
            r["metadata"]["data"] 
            for r in retrieved 
            if r["metadata"]["type"] == "dish"
        ]

        return {
            "query": user_query,
            "answer": llm_response,
            "matched_dishes": retrieved_dishes,
            "context_count": len(retrieved)
        }

    def add_dish(self, new_dish: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamically indexes a new dish into TF-IDF vector space, updates knowledge base, and syncs recommender."""
        if not new_dish.get("id"):
            new_dish["id"] = f"dish_{len(self.dishes) + 1}"
        if not new_dish.get("name"):
            new_dish["name"] = "Artisan Special"
        if not new_dish.get("category"):
            new_dish["category"] = "Main"
        if not new_dish.get("price"):
            new_dish["price"] = 25.00

        # Ensure lists
        if isinstance(new_dish.get("ingredients"), str):
            new_dish["ingredients"] = [i.strip() for i in new_dish["ingredients"].split(",") if i.strip()]
        if isinstance(new_dish.get("allergens"), str):
            new_dish["allergens"] = [a.strip() for a in new_dish["allergens"].split(",") if a.strip()]
        if isinstance(new_dish.get("flavorProfile"), str):
            new_dish["flavorProfile"] = [f.strip() for f in new_dish["flavorProfile"].split(",") if f.strip()]

        # Append to in-memory dishes list
        self.dishes.append(new_dish)

        # Re-build document indexing and vectorizer
        self._load_and_index()

        # Persist to menu_knowledge.json
        try:
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump({
                    "restaurant": self.restaurant_info,
                    "dishes": self.dishes
                }, f, indent=2)
        except Exception as e:
            print(f"[MenuRAGService] Note on saving JSON: {e}")

        # Sync Recommender Feature Matrix
        try:
            from services.recommender_service import recommender_service
            recommender_service._build_feature_matrix()
        except Exception as e:
            print(f"[MenuRAGService] Recommender sync notice: {e}")

        return {
            "success": True,
            "dish": new_dish,
            "total_dishes_indexed": len(self.dishes),
            "message": f"Successfully indexed '{new_dish['name']}' into AI RAG Vector Space & Recommendation Engine!"
        }

# Singleton instance
rag_service = MenuRAGService()

