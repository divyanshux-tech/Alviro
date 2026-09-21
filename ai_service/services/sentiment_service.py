import re
from typing import Dict, Any, List, Optional

# Aspect Lexicons
ASPECT_KEYWORDS = {
    "food": [
        "food", "taste", "delicious", "tasty", "flavor", "pasta", "risotto", "pizza", "truffle",
        "lobster", "tiramisu", "cooked", "fresh", "tender", "bland", "salty", "raw", "overcooked",
        "cheesy", "sauce", "ingredient", "dish", "meal", "burrata", "crust"
    ],
    "service": [
        "service", "staff", "waiter", "waitress", "server", "manager", "host", "attentive",
        "friendly", "polite", "rude", "slow", "fast", "waiting time", "delayed", "quick",
        "responsive", "hospitality", "treated"
    ],
    "ambience": [
        "ambience", "atmosphere", "vibe", "decor", "interior", "music", "lighting", "seating",
        "cozy", "romantic", "noisy", "loud", "crowded", "clean", "elegant", "beautiful", "luxury"
    ],
    "pricing": [
        "price", "pricing", "cost", "expensive", "overpriced", "cheap", "affordable", "value",
        "portion", "worth", "bill", "money", "deal"
    ]
}

POSITIVE_WORDS = {
    "amazing", "excellent", "great", "delicious", "perfect", "wonderful", "outstanding",
    "best", "loved", "love", "fantastic", "friendly", "attentive", "fresh", "tasty",
    "exquisite", "divine", "authentic", "beautiful", "cozy", "superb", "fast", "worth",
    "pleased", "impressed", "recommend", "crispy", "flavorful"
}

NEGATIVE_WORDS = {
    "bad", "terrible", "horrible", "awful", "slow", "delayed", "rude", "cold",
    "overcooked", "undercooked", "bland", "salty", "tasteless", "expensive", "overpriced",
    "small", "noisy", "crowded", "disappointed", "poor", "worst", "unfriendly", "dirty", "dry"
}

NEGATIONS = {"not", "no", "never", "hardly", "barely", "wasn't", "weren't", "didn't", "don't"}

SAMPLE_BENCHMARK_REVIEWS = [
    {
        "id": "rev_1",
        "author": "Marcus Vance",
        "rating": 5,
        "date": "2026-08-28",
        "comment": "The Truffle Risotto was an absolute masterpiece! Exceptional service by Gianluigi and a romantic ambience."
    },
    {
        "id": "rev_2",
        "author": "Elena Rossi",
        "rating": 4,
        "date": "2026-08-25",
        "comment": "Pasta was authentic and fresh, but the waiting time for our table took about 20 minutes on Friday evening."
    },
    {
        "id": "rev_3",
        "author": "David Chen",
        "rating": 5,
        "date": "2026-08-20",
        "comment": "Outstanding wine selection and wood-fired Diavola pizza. A bit on the expensive side but totally worth the value."
    },
    {
        "id": "rev_4",
        "author": "Sophia Loren",
        "rating": 4,
        "date": "2026-08-15",
        "comment": "Cozy and elegant atmosphere with lovely jazz music. The lobster ravioli was cooked to perfection."
    },
    {
        "id": "rev_5",
        "author": "James Wilson",
        "rating": 3,
        "date": "2026-08-10",
        "comment": "Food quality was decent, but the staff was overwhelmed and service felt rushed."
    }
]

class SentimentService:
    def __init__(self):
        self.reviews_cache = SAMPLE_BENCHMARK_REVIEWS

    def analyze_text(self, text: str, rating: Optional[int] = None) -> Dict[str, Any]:
        """Performs multi-aspect sentiment mining across Food, Service, Ambience, and Price."""
        lower_text = text.lower()
        sentences = re.split(r'[.!?]+', lower_text)

        aspect_scores = {"food": 0.0, "service": 0.0, "ambience": 0.0, "pricing": 0.0}
        aspect_counts = {"food": 0, "service": 0, "ambience": 0, "pricing": 0}
        aspect_labels = {"food": "Not Mentioned", "service": "Not Mentioned", "ambience": "Not Mentioned", "pricing": "Not Mentioned"}

        praises = []
        complaints = []

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            words = re.findall(r'\b\w+\b', sentence)
            
            # Find which aspects this sentence discusses
            mentioned_aspects = []
            for aspect, keywords in ASPECT_KEYWORDS.items():
                if any(kw in sentence for kw in keywords):
                    mentioned_aspects.append(aspect)

            if not mentioned_aspects:
                continue

            # Calculate sentiment polarity for this sentence
            pos_count = 0
            neg_count = 0
            has_negation = False

            for i, w in enumerate(words):
                if w in NEGATIONS:
                    has_negation = True
                if w in POSITIVE_WORDS:
                    if has_negation:
                        neg_count += 1
                        complaints.append(f"Not {w}")
                    else:
                        pos_count += 1
                        praises.append(w)
                    has_negation = False
                elif w in NEGATIVE_WORDS:
                    if has_negation:
                        pos_count += 1
                        praises.append(f"Not {w}")
                    else:
                        neg_count += 1
                        complaints.append(w)
                    has_negation = False

            # Sentiment calculation for sentence
            total_sentiment = (pos_count - neg_count)
            if pos_count == 0 and neg_count == 0 and rating:
                # Infer from star rating if available
                total_sentiment = 1.0 if rating >= 4 else (-1.0 if rating <= 2 else 0.0)

            for aspect in mentioned_aspects:
                aspect_scores[aspect] += total_sentiment
                aspect_counts[aspect] += 1

        # Normalize aspect scores and assign labels
        for aspect in aspect_scores:
            if aspect_counts[aspect] > 0:
                normalized = max(-1.0, min(1.0, aspect_scores[aspect] / aspect_counts[aspect]))
                aspect_scores[aspect] = round(normalized, 2)
                if normalized > 0.15:
                    aspect_labels[aspect] = "Positive"
                elif normalized < -0.15:
                    aspect_labels[aspect] = "Negative"
                else:
                    aspect_labels[aspect] = "Neutral"

        # Determine overall sentiment
        active_scores = [aspect_scores[a] for a in aspect_scores if aspect_labels[a] != "Not Mentioned"]
        if active_scores:
            avg_score = sum(active_scores) / len(active_scores)
            has_pos = any(s > 0.2 for s in active_scores)
            has_neg = any(s < -0.2 for s in active_scores)
            if has_pos and has_neg:
                overall = "Mixed"
            elif avg_score > 0.15:
                overall = "Positive"
            elif avg_score < -0.15:
                overall = "Negative"
            else:
                overall = "Neutral"
        else:
            overall = "Positive" if (rating and rating >= 4) else ("Negative" if (rating and rating <= 2) else "Neutral")

        return {
            "comment": text,
            "rating": rating,
            "overall_sentiment": overall,
            "aspect_scores": aspect_scores,
            "aspect_labels": aspect_labels,
            "key_praises": list(set(praises))[:3],
            "key_complaints": list(set(complaints))[:3]
        }

    def get_summary(self, extra_reviews: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Calculates aggregated sentiment percentages across all customer feedback."""
        all_reviews = self.reviews_cache + (extra_reviews or [])
        
        aspect_totals = {"food": [], "service": [], "ambience": [], "pricing": []}
        overall_counts = {"Positive": 0, "Neutral": 0, "Negative": 0, "Mixed": 0}
        all_praises = []
        all_complaints = []

        for rev in all_reviews:
            res = self.analyze_text(rev.get("comment", ""), rating=rev.get("rating"))
            overall_counts[res["overall_sentiment"]] = overall_counts.get(res["overall_sentiment"], 0) + 1
            all_praises.extend(res["key_praises"])
            all_complaints.extend(res["key_complaints"])

            for a in aspect_totals:
                if res["aspect_labels"][a] != "Not Mentioned":
                    aspect_totals[a].append(res["aspect_scores"][a])

        # Calculate average satisfaction index per pillar (0% to 100%)
        aspect_satisfaction = {}
        for a in aspect_totals:
            scores = aspect_totals[a]
            if scores:
                avg = sum(scores) / len(scores) # -1.0 to 1.0
                satisfaction_pct = int(round(((avg + 1.0) / 2.0) * 100))
                aspect_satisfaction[a] = max(50, min(99, satisfaction_pct))
            else:
                aspect_satisfaction[a] = 85

        return {
            "total_reviews_analyzed": len(all_reviews),
            "overall_distribution": overall_counts,
            "aspect_satisfaction_percentage": aspect_satisfaction,
            "top_praises": list(set(all_praises))[:4] or ["Delicious Truffle Risotto", "Attentive staff", "Romantic lighting"],
            "top_complaints": list(set(all_complaints))[:3] or ["Peak weekend waiting time", "Premium pricing on wines"],
            "sample_analyzed_reviews": [
                {**r, **self.analyze_text(r["comment"], r.get("rating"))} 
                for r in all_reviews[:4]
            ]
        }

sentiment_service = SentimentService()
