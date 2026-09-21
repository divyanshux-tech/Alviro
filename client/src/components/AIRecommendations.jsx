import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, Award, Wine, Flame, DollarSign, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AI_API_URL } from '../config';


const FILTER_TAGS = [
    { id: 'all', label: 'All Favorites', prefs: { preferredCategory: 'All', preferredSpice: 'Any' } },
    { id: 'veg', label: 'Vegetarian', prefs: { isVegetarian: true, preferredSpice: 'Any' } },
    { id: 'gf', label: 'Gluten-Free', prefs: { isGlutenFree: true, preferredSpice: 'Any' } },
    { id: 'spicy', label: 'Spicy & Bold', prefs: { preferredSpice: 'Hot', cravingKeywords: 'spicy chili' } },
    { id: 'budget', label: 'Under $20', prefs: { maxBudget: 20.0 } },
    { id: 'pasta', label: 'Artisan Pasta', prefs: { preferredCategory: 'Pasta' } }
];

const DISH_IMAGE_MAP = {
    "Truffle Risotto": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
    "Margherita Classica": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80",
    "Lobster Ravioli": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "Osso Buco alla Milanese": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "Penne all'Arrabbiata": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
    "Bruschetta al Pomodoro": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
    "Classic Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    "Fettuccine Alfredo con Pollo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
    "Diavola Pizza": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
    "Burrata Pugliese Salad": "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80"
};

const DEFAULT_DISH_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

const LOCAL_FILTER_DATA = {
    all: [
        {
            dish: { name: "Truffle Risotto", category: "Main", price: 28.00, description: "Creamy Carnaroli rice cooked with aromatic black winter truffles, aged Parmigiano Reggiano, and white wine glaze.", isVegetarian: true, isGlutenFree: true, spiceLevel: "None", winePairing: "Barolo DOCG" },
            matchPercentage: 98, explanation: "98% Match — Signature Heritage Pick • Rich Winter Truffles"
        },
        {
            dish: { name: "Osso Buco alla Milanese", category: "Main", price: 36.00, description: "Tender braised veal shank simmered with white wine, root vegetables, and gremolata over saffron risotto.", isVegetarian: false, isGlutenFree: true, spiceLevel: "None", winePairing: "Amarone della Valpolicella" },
            matchPercentage: 95, explanation: "95% Match — Milanese Heritage • Slow-Braised Veal"
        },
        {
            dish: { name: "Lobster Ravioli", category: "Pasta", price: 32.00, description: "Handmade squid-ink ravioli stuffed with Atlantic lobster and mascarpone in saffron shellfish bisque.", isVegetarian: false, isGlutenFree: false, spiceLevel: "Mild", winePairing: "Pinot Grigio" },
            matchPercentage: 93, explanation: "93% Match — Handcrafted Pasta • Atlantic Lobster Bisque"
        }
    ],
    veg: [
        {
            dish: { name: "Truffle Risotto", category: "Main", price: 28.00, description: "Creamy Carnaroli rice cooked with aromatic black winter truffles, aged Parmigiano Reggiano, and white wine glaze.", isVegetarian: true, isGlutenFree: true, spiceLevel: "None", winePairing: "Barolo DOCG" },
            matchPercentage: 97, explanation: "97% Match — 100% Vegetarian Certified • Black Truffle Notes"
        },
        {
            dish: { name: "Margherita Classica", category: "Pizza", price: 18.50, description: "Wood-fired traditional pizza with San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil.", isVegetarian: true, isGlutenFree: false, spiceLevel: "None", winePairing: "Chianti Classico" },
            matchPercentage: 94, explanation: "94% Match — 100% Vegetarian Certified • Buffalo Mozzarella"
        },
        {
            dish: { name: "Penne all'Arrabbiata", category: "Pasta", price: 19.00, description: "Al dente penne pasta tossed in a fiery San Marzano tomato sauce infused with garlic, Calabrian chilies, and parsley.", isVegetarian: true, isGlutenFree: false, spiceLevel: "Hot", winePairing: "Primitivo di Manduria" },
            matchPercentage: 92, explanation: "92% Match — 100% Vegetarian Certified • Fiery Calabrian Chilies"
        }
    ],
    gf: [
        {
            dish: { name: "Truffle Risotto", category: "Main", price: 28.00, description: "Creamy Carnaroli rice cooked with aromatic black winter truffles, aged Parmigiano Reggiano, and white wine glaze.", isVegetarian: true, isGlutenFree: true, spiceLevel: "None", winePairing: "Barolo DOCG" },
            matchPercentage: 98, explanation: "98% Match — Gluten-Free Certified • Pure Carnaroli Rice"
        },
        {
            dish: { name: "Osso Buco alla Milanese", category: "Main", price: 36.00, description: "Tender braised veal shank simmered with white wine, root vegetables, and gremolata over saffron risotto.", isVegetarian: false, isGlutenFree: true, spiceLevel: "None", winePairing: "Amarone della Valpolicella" },
            matchPercentage: 95, explanation: "95% Match — Gluten-Free Certified • Braised Veal Shank"
        },
        {
            dish: { name: "Burrata Pugliese Salad", category: "Appetizer", price: 16.00, description: "Creamy whole Pugliese burrata cheese served with heirloom tomatoes, aged balsamic reduction, and fresh focaccia.", isVegetarian: true, isGlutenFree: true, spiceLevel: "None", winePairing: "Prosecco Superiore" },
            matchPercentage: 91, explanation: "91% Match — Gluten-Free Option Available • Heirloom Tomatoes"
        }
    ],
    spicy: [
        {
            dish: { name: "Penne all'Arrabbiata", category: "Pasta", price: 19.00, description: "Al dente penne pasta tossed in a fiery San Marzano tomato sauce infused with garlic, fresh red Calabrian chilies, and parsley.", isVegetarian: true, isGlutenFree: false, spiceLevel: "Hot", winePairing: "Primitivo di Manduria" },
            matchPercentage: 97, explanation: "97% Match — Hot Spice Match • Fiery Calabrian Chilies"
        },
        {
            dish: { name: "Diavola Pizza", category: "Pizza", price: 21.00, description: "Spicy artisanal pizza with spicy Sopressata salami, crushed Calabrian chilies, San Marzano sauce, and mozzarella.", isVegetarian: false, isGlutenFree: false, spiceLevel: "Hot", winePairing: "Nero d'Avola" },
            matchPercentage: 94, explanation: "94% Match — Hot Spice Match • Spicy Sopressata Salami"
        },
        {
            dish: { name: "Lobster Ravioli", category: "Pasta", price: 32.00, description: "Handmade squid-ink ravioli stuffed with Atlantic lobster and mascarpone in saffron shellfish bisque.", isVegetarian: false, isGlutenFree: false, spiceLevel: "Mild", winePairing: "Pinot Grigio" },
            matchPercentage: 86, explanation: "86% Match — Mild Spice Balance • Saffron Aromatic Notes"
        }
    ],
    budget: [
        {
            dish: { name: "Bruschetta al Pomodoro", category: "Appetizer", price: 12.00, description: "Toasted artisan sourdough rubbed with garlic and topped with diced vine-ripened tomatoes, fresh basil, and extra virgin olive oil.", isVegetarian: true, isGlutenFree: false, spiceLevel: "None", winePairing: "Pinot Grigio" },
            matchPercentage: 96, explanation: "96% Match — Value Pick ($12.00) • Vine-Ripened Tomatoes"
        },
        {
            dish: { name: "Classic Tiramisu", category: "Dessert", price: 11.50, description: "Layered espresso-dipped Savoiardi ladyfingers, rich mascarpone cream, dark rum essence, and Valrhona cocoa powder.", isVegetarian: true, isGlutenFree: false, spiceLevel: "None", winePairing: "Vin Santo or Espresso" },
            matchPercentage: 94, explanation: "94% Match — Value Pick ($11.50) • Valrhona Dark Cocoa"
        },
        {
            dish: { name: "Margherita Classica", category: "Pizza", price: 18.50, description: "Wood-fired traditional pizza with San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and olive oil.", isVegetarian: true, isGlutenFree: false, spiceLevel: "None", winePairing: "Chianti Classico" },
            matchPercentage: 89, explanation: "89% Match — Value Pick ($18.50) • Wood-Fired Neapolitan"
        }
    ],
    pasta: [
        {
            dish: { name: "Lobster Ravioli", category: "Pasta", price: 32.00, description: "Handmade squid-ink ravioli stuffed with Atlantic lobster and mascarpone, served in a delicate saffron shellfish bisque.", isVegetarian: false, isGlutenFree: false, spiceLevel: "Mild", winePairing: "Pinot Grigio" },
            matchPercentage: 98, explanation: "98% Match — Artisan Pasta Specialty • Fresh Egg Squid Ink"
        },
        {
            dish: { name: "Penne all'Arrabbiata", category: "Pasta", price: 19.00, description: "Al dente penne pasta tossed in a fiery San Marzano tomato sauce infused with garlic, fresh red Calabrian chilies, and parsley.", isVegetarian: true, isGlutenFree: false, spiceLevel: "Hot", winePairing: "Primitivo di Manduria" },
            matchPercentage: 94, explanation: "94% Match — Artisan Pasta Specialty • Al Dente Penne"
        },
        {
            dish: { name: "Fettuccine Alfredo con Pollo", category: "Pasta", price: 24.50, description: "Handcrafted fettuccine ribbon pasta tossed in a velvety Parmigiano Reggiano butter sauce, topped with grilled chicken.", isVegetarian: false, isGlutenFree: false, spiceLevel: "None", winePairing: "Chardonnay" },
            matchPercentage: 91, explanation: "91% Match — Artisan Pasta Specialty • 24-Month Parmigiano"
        }
    ]
};

const AIRecommendations = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [recommendations, setRecommendations] = useState(LOCAL_FILTER_DATA.all);
    const [loading, setLoading] = useState(false);

    const fetchRecommendations = async (filterId, prefs) => {
        setLoading(true);
        try {
            const response = await axios.post(`${AI_API_URL}/api/ai/recommendations`, prefs, {
                params: { limit: 3 },
                timeout: 3000
            });
            if (response.data?.recommendations && response.data.recommendations.length > 0) {
                setRecommendations(response.data.recommendations);
            } else {
                setRecommendations(LOCAL_FILTER_DATA[filterId] || LOCAL_FILTER_DATA.all);
            }
        } catch (error) {
            setRecommendations(LOCAL_FILTER_DATA[filterId] || LOCAL_FILTER_DATA.all);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (tag) => {
        setActiveFilter(tag.id);
        fetchRecommendations(tag.id, tag.prefs);
    };

    useEffect(() => {
        const currentTag = FILTER_TAGS.find(t => t.id === activeFilter);
        fetchRecommendations(activeFilter, currentTag?.prefs || {});
    }, []);

    return (
        <section id="popular" className="py-32 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-cream/50 skew-y-3 transform origin-top-left -z-0"></div>
            <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
                
                {/* Unified Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between">
                    <div className="md:max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs block mb-4"
                        >
                            Fresh From Kitchen • AI Recommended
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-display font-medium text-secondary mb-6 leading-tight italic"
                        >
                            Crowd <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 font-bold">Favorites</span>
                        </motion.h2>
                        <div className="w-24 h-0.5 bg-gradient-to-r from-primary to-transparent mb-6"></div>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="hidden md:block max-w-sm text-right text-gray-500 text-lg font-normal leading-relaxed"
                    >
                        <p>Dynamic favorites powered by our machine learning engine, continuously adapting to guest tastes, seasonal demand, and dietary preferences.</p>
                    </motion.div>
                </div>

                {/* Filter Tags Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    {FILTER_TAGS.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => handleFilterClick(tag)}
                            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                                activeFilter === tag.id
                                    ? 'bg-secondary text-white shadow-xl shadow-secondary/20 scale-105'
                                    : 'bg-white text-gray-600 hover:text-secondary hover:bg-cream border border-gray-200/80 shadow-sm'
                            }`}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic ML-Ranked Food Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-[500px] rounded-[2rem] bg-gray-100 animate-pulse p-8 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="h-6 bg-gray-200 rounded-full w-1/3"></div>
                                    <div className="h-10 bg-gray-200 rounded-full w-2/3"></div>
                                </div>
                                <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
                            </div>
                        ))
                    ) : (
                        recommendations.map((item, idx) => {
                            const dish = item.dish;
                            const dishImage = DISH_IMAGE_MAP[dish.name] || dish.image || DEFAULT_DISH_IMAGE;

                            return (
                                <motion.div
                                    key={dish.name + idx + activeFilter}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative h-[500px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 ease-out border border-white/10 hover:border-primary/30"
                                >
                                    {/* Food Photography Image with Zoom on Hover */}
                                    <img
                                        src={dishImage}
                                        alt={dish.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />

                                    {/* Gradient Dark Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500"></div>

                                    {/* Top Left: Category Badge */}
                                    <div className="absolute top-6 left-6 z-20">
                                        <span className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] shadow-lg group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-500">
                                            {dish.category}
                                        </span>
                                    </div>

                                    {/* Top Right: Luxury Circular Price Tag */}
                                    <div className="absolute top-6 right-6 z-20">
                                        <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                            <span className="font-header text-xl text-primary font-bold italic">
                                                ${dish.price ? dish.price.toFixed(0) : '28'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dynamic ML Match % Floating Tag */}
                                    <div className="absolute top-20 left-6 z-20">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-[11px] font-bold shadow-md">
                                            <Sparkles size={11} className="text-emerald-400" />
                                            <span>{item.matchPercentage}% Match</span>
                                        </div>
                                    </div>

                                    {/* Bottom Content Area */}
                                    <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-3xl font-header font-bold text-white mb-2 leading-tight tracking-wide group-hover:text-primary transition-colors">
                                            {dish.name}
                                        </h3>

                                        <div className="w-12 h-0.5 bg-primary mb-3 group-hover:w-20 transition-all duration-500"></div>

                                        <p className="text-gray-200 text-xs leading-relaxed line-clamp-2 mb-4 font-light">
                                            {dish.description}
                                        </p>

                                        {/* Wine Pairing & Action */}
                                        <div className="flex items-center justify-between text-[11px] text-amber-200/90 pt-3 border-t border-white/15">
                                            <div className="flex items-center gap-1.5 italic">
                                                <Wine size={12} className="text-primary" />
                                                <span>{dish.winePairing || "Chef Selection DOCG"}</span>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary hover:text-secondary text-white flex items-center justify-center transition-colors">
                                                <Plus size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Explore Full Menu CTA Button */}
                <div className="text-center pt-8">
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-secondary text-white font-header font-bold uppercase tracking-widest rounded-full hover:bg-primary transition-all duration-300 shadow-xl shadow-secondary/20 hover:-translate-y-1 hover:shadow-2xl text-xs"
                    >
                        <span>Explore Full Seasonal Menu</span>
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AIRecommendations;

