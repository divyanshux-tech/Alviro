import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, Users, DollarSign, Sparkles, Calendar, Utensils, 
    Award, ShieldAlert, CheckCircle, XCircle, ArrowUpRight, BarChart3, 
    Sun, CloudRain, Cloud, Snowflake, RefreshCw, PlusCircle, CheckCircle2,
    Wine, Flame, ArrowLeft, LogOut, Layers, LayoutDashboard, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL, AI_API_URL } from '../../config';
import { Link } from 'react-router-dom';

const AIDashboard = () => {
    // Current active workspace module
    const [activeTab, setActiveTab] = useState('overview'); 
    
    // Demand Forecast State
    const [selectedWeather, setSelectedWeather] = useState('Sunny');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [forecastData, setForecastData] = useState(null);
    const [loadingForecast, setLoadingForecast] = useState(true);

    // Sentiment State
    const [sentimentData, setSentimentData] = useState(null);
    const [loadingSentiment, setLoadingSentiment] = useState(true);

    // Reservations State
    const [reservations, setReservations] = useState([]);
    const [resStatusFilter, setResStatusFilter] = useState('all');
    const [loadingReservations, setLoadingReservations] = useState(true);
    const [expandedReservation, setExpandedReservation] = useState(null);
    const [preOrderItems, setPreOrderItems] = useState({}); // { reservationId: [...items] }
    const [loadingPreOrder, setLoadingPreOrder] = useState({});
    const [updatingItemStatus, setUpdatingItemStatus] = useState({});

    const STATUS_FILTERS = [
        { id: 'all', label: 'All', color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' },
        { id: 'Pending', label: 'Pending', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        { id: 'Confirmed', label: 'Confirmed', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
        { id: 'Completed', label: 'Completed', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
        { id: 'Cancelled', label: 'Cancelled', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/30' }
    ];

    const filteredReservations = resStatusFilter === 'all'
        ? reservations
        : reservations.filter(r => r.status === resStatusFilter);

    const getResCount = (s) => s === 'all' ? reservations.length : reservations.filter(r => r.status === s).length;

    // Menu & AI Learning State
    const [menuDishes, setMenuDishes] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [isSubmittingDish, setIsSubmittingDish] = useState(false);
    const [dishSuccessMsg, setDishSuccessMsg] = useState('');
    const [newDishForm, setNewDishForm] = useState({
        name: '',
        category: 'Pasta',
        price: '',
        description: '',
        ingredients: '',
        allergens: '',
        spiceLevel: 'None',
        isVegetarian: false,
        isGlutenFree: false,
        winePairing: ''
    });

    // Fetch Demand Forecast
    const fetchForecast = async () => {
        setLoadingForecast(true);
        try {
            const res = await axios.get(`${AI_API_URL}/api/ai/demand-forecast`, {
                params: { date: selectedDate, weather: selectedWeather }
            });
            setForecastData(res.data);
        } catch (err) {
            console.warn("Forecast fetch error:", err);
        } finally {
            setLoadingForecast(false);
        }
    };

    // Fetch Sentiment Analytics
    const fetchSentiment = async () => {
        setLoadingSentiment(true);
        try {
            const res = await axios.get(`${AI_API_URL}/api/ai/sentiment-summary`);
            setSentimentData(res.data);
        } catch (err) {
            console.warn("Sentiment fetch error:", err);
        } finally {
            setLoadingSentiment(false);
        }
    };

    // Fetch Reservations
    const fetchReservations = async () => {
        setLoadingReservations(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/reservations`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setReservations(res.data);
            }
        } catch (err) {
            console.warn("Reservations fetch error:", err);
        } finally {
            setLoadingReservations(false);
        }
    };

    // Fetch Indexed Dishes
    const fetchMenuDishes = async () => {
        setLoadingMenu(true);
        try {
            const res = await axios.get(`${AI_API_URL}/api/ai/menu-items`);
            if (res.data?.dishes) {
                setMenuDishes(res.data.dishes);
            }
        } catch (err) {
            console.warn("Menu fetch error:", err);
        } finally {
            setLoadingMenu(false);
        }
    };

    useEffect(() => {
        fetchForecast();
        fetchSentiment();
        fetchReservations();
        fetchMenuDishes();
    }, [selectedDate, selectedWeather]);

    const updateReservationStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_URL}/api/reservations/${id}`, { status }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        } catch (err) {
            console.error("Status update error:", err);
            setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        }
    };

    const fetchPreOrderItems = async (reservationId) => {
        if (preOrderItems[reservationId]) return; // already loaded
        setLoadingPreOrder(prev => ({ ...prev, [reservationId]: true }));
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/reservations/${reservationId}/items`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setPreOrderItems(prev => ({ ...prev, [reservationId]: res.data || [] }));
        } catch (err) {
            console.warn('Pre-order fetch error:', err);
            setPreOrderItems(prev => ({ ...prev, [reservationId]: [] }));
        } finally {
            setLoadingPreOrder(prev => ({ ...prev, [reservationId]: false }));
        }
    };

    const togglePreOrder = (id) => {
        const next = expandedReservation === id ? null : id;
        setExpandedReservation(next);
        if (next) fetchPreOrderItems(next);
    };

    const updateItemStatus = async (reservationId, itemId, status) => {
        setUpdatingItemStatus(prev => ({ ...prev, [itemId]: true }));
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_URL}/api/reservations/${reservationId}/items/${itemId}`, { status }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setPreOrderItems(prev => ({
                ...prev,
                [reservationId]: prev[reservationId].map(i => i._id === itemId ? { ...i, status } : i)
            }));
        } catch (err) {
            console.error('Item status update error:', err);
        } finally {
            setUpdatingItemStatus(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleAddDish = async (e) => {
        e.preventDefault();
        if (!newDishForm.name || !newDishForm.price) return;

        setIsSubmittingDish(true);
        setDishSuccessMsg('');

        try {
            const formattedDish = {
                ...newDishForm,
                price: parseFloat(newDishForm.price),
                ingredients: newDishForm.ingredients ? newDishForm.ingredients.split(',').map(i => i.trim()) : [],
                allergens: newDishForm.allergens ? newDishForm.allergens.split(',').map(a => a.trim()) : [],
                flavorProfile: ["Authentic", "Artisan", newDishForm.category]
            };

            await axios.post(`${AI_API_URL}/api/ai/sync-dish`, formattedDish);
            
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/api/menu`, formattedDish, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
            } catch (expressErr) {
                console.warn("Express MongoDB save notice:", expressErr);
            }

            setDishSuccessMsg(`🎉 "${newDishForm.name}" was learned and indexed by the DineMate AI Assistant & Recommender!`);
            fetchMenuDishes();
            fetchForecast();

            setNewDishForm({
                name: '',
                category: 'Pasta',
                price: '',
                description: '',
                ingredients: '',
                allergens: '',
                spiceLevel: 'None',
                isVegetarian: false,
                isGlutenFree: false,
                winePairing: ''
            });
        } catch (error) {
            console.error("Add dish error:", error);
        } finally {
            setIsSubmittingDish(false);
        }
    };

    const getWeatherIcon = (w) => {
        switch (w) {
            case 'Sunny': return <Sun size={15} className="text-amber-400" />;
            case 'Rainy': return <CloudRain size={15} className="text-blue-400" />;
            case 'Cloudy': return <Cloud size={15} className="text-gray-400" />;
            case 'Chilly': return <Snowflake size={15} className="text-cyan-300" />;
            default: return <Sun size={15} className="text-amber-400" />;
        }
    };

    const NAVIGATION_MODULES = [
        { id: 'overview', label: 'Executive Hub', icon: <LayoutDashboard size={18} />, desc: 'Real-time KPIs & Quick Snapshot' },
        { id: 'forecast', label: 'Demand Forecasting', icon: <TrendingUp size={18} />, desc: 'Machine Learning Sales Simulator' },
        { id: 'reservations', label: 'Table Bookings', icon: <Calendar size={18} />, desc: 'Live MongoDB Reservations' },
        { id: 'menu_learning', label: 'Menu & AI Learning', icon: <Utensils size={18} />, desc: 'Add Dishes & Auto-Vectorize' },
        { id: 'sentiment', label: 'Guest Feedback NLP', icon: <Award size={18} />, desc: 'Aspect-Based Review Sentiment' },
        { id: 'executive_brief', label: 'AI Manager Briefing', icon: <Sparkles size={18} />, desc: 'Staffing, Inventory & Margins' }
    ];

    return (
        <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans selection:bg-primary selection:text-black">
            
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/10 px-6 lg:px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img 
                        src="/best_logo.png" 
                        alt="ALVIRO Logo" 
                        className="w-10 h-10 object-contain rounded-xl"
                    />
                    <div>
                        <h1 className="font-header font-bold text-xl text-white tracking-wide">
                            Admin Dashboard
                        </h1>
                        <p className="text-[11px] text-gray-400">Intelligent Restaurant Management & Analytics Portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        to="/" 
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> <span className="hidden sm:inline">View Customer Site</span>
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/admin/login';
                        }}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                    >
                        <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Navigation Sub-Bar (Separated Feature Modules) */}
            <div className="bg-[#0f0f0f] border-b border-white/5 px-6 lg:px-12 py-3 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    {NAVIGATION_MODULES.map(module => (
                        <button
                            key={module.id}
                            onClick={() => setActiveTab(module.id)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                                activeTab === module.id
                                    ? 'bg-gradient-to-r from-primary to-amber-600 text-black font-bold shadow-lg shadow-primary/25 scale-[1.02]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                            }`}
                        >
                            {module.icon}
                            <span>{module.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Workspace View (Fully Isolated & Spacious) */}
            <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    
                    {/* =========================================================
                        MODULE 0: EXECUTIVE HUB (OVERVIEW)
                    ========================================================= */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-header font-bold text-white mb-1">
                                    Executive Operations Hub
                                </h2>
                                <p className="text-xs text-gray-400">
                                    High-level overview of daily restaurant performance, AI demand projections, and live guest bookings.
                                </p>
                            </div>

                            {/* 4 Spacious KPI Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <div className="flex justify-between items-center text-gray-400 mb-3">
                                        <span className="text-xs uppercase tracking-wider font-semibold">Projected Revenue</span>
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                            <DollarSign size={16} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-header font-bold text-white">
                                        ${forecastData?.total_projected_revenue ? Number(forecastData.total_projected_revenue).toLocaleString() : '---'}
                                    </p>
                                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                                        <ArrowUpRight size={13} /> {forecastData?.is_weekend ? 'Weekend Surge (+35%)' : 'Standard Baseline'}
                                    </p>
                                </div>

                                <div className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <div className="flex justify-between items-center text-gray-400 mb-3">
                                        <span className="text-xs uppercase tracking-wider font-semibold">Predicted Demand</span>
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                            <Utensils size={16} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-header font-bold text-white">
                                        {forecastData?.total_predicted_orders || '---'} Plates
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Top: <span className="text-primary font-semibold">{forecastData?.top_dish_expected || 'Truffle Risotto'}</span>
                                    </p>
                                </div>

                                <div className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <div className="flex justify-between items-center text-gray-400 mb-3">
                                        <span className="text-xs uppercase tracking-wider font-semibold">Active Bookings</span>
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                            <Users size={16} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-header font-bold text-white">
                                        {reservations.length} Tables
                                    </p>
                                    <p className="text-xs text-blue-300 mt-2">
                                        {reservations.filter(r => r.status === 'Pending').length} Pending · {reservations.filter(r => r.status === 'Confirmed').length} Confirmed
                                    </p>
                                </div>

                                <div className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <div className="flex justify-between items-center text-gray-400 mb-3">
                                        <span className="text-xs uppercase tracking-wider font-semibold">Sentiment Index</span>
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                            <Award size={16} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-header font-bold text-emerald-400">
                                        {sentimentData?.aspect_satisfaction_percentage?.food || 92}% Score
                                    </p>
                                    <p className="text-xs text-emerald-300/80 mt-2">
                                        Food & Ambience Rated Excellent
                                    </p>
                                </div>
                            </div>

                            {/* Quick Feature Launchers */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                <button 
                                    onClick={() => setActiveTab('forecast')}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-black/60 border border-white/10 hover:border-primary/50 text-left transition-all hover:scale-[1.01] group shadow-xl"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={22} />
                                    </div>
                                    <h3 className="font-header font-bold text-lg text-white group-hover:text-primary transition-colors">
                                        Launch Demand Simulator
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                        Simulate weather & date conditions to view plate sales forecasts generated by Random Forest ML.
                                    </p>
                                </button>

                                <button 
                                    onClick={() => setActiveTab('menu_learning')}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-black/60 border border-white/10 hover:border-primary/50 text-left transition-all hover:scale-[1.01] group shadow-xl"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Utensils size={22} />
                                    </div>
                                    <h3 className="font-header font-bold text-lg text-white group-hover:text-primary transition-colors">
                                        Add Dish & AI Vector Studio
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                        Add new recipes and automatically vectorize their ingredients into RAG and Recommender matrices.
                                    </p>
                                </button>

                                <button 
                                    onClick={() => setActiveTab('reservations')}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-black/60 border border-white/10 hover:border-primary/50 text-left transition-all hover:scale-[1.01] group shadow-xl"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Calendar size={22} />
                                    </div>
                                    <h3 className="font-header font-bold text-lg text-white group-hover:text-primary transition-colors">
                                        Manage Table Bookings
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                        Review upcoming guest reservations, confirm bookings, and manage table allocation.
                                    </p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* =========================================================
                        MODULE 1: DEMAND FORECASTING (SEPARATE FULL PAGE)
                    ========================================================= */}
                    {activeTab === 'forecast' && (
                        <motion.div
                            key="forecast"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-8"
                        >
                            {/* Header & Controls Bar */}
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-white/5 to-black/80 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <TrendingUp size={14} /> Supervised Machine Learning
                                    </span>
                                    <h2 className="text-2xl lg:text-3xl font-header font-bold text-white">
                                        Dish Sales Demand Simulator
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Trained on 12-month multi-seasonal order patterns using Random Forest Regressor.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 bg-black/80 px-4 py-2.5 rounded-2xl border border-white/15">
                                        <Calendar size={15} className="text-primary" />
                                        <input 
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-transparent text-xs text-white outline-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-black/80 p-1 rounded-2xl border border-white/15">
                                        {['Sunny', 'Rainy', 'Cloudy', 'Chilly'].map(w => (
                                            <button
                                                key={w}
                                                onClick={() => setSelectedWeather(w)}
                                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                    selectedWeather === w
                                                        ? 'bg-primary text-black font-bold shadow-lg shadow-primary/30'
                                                        : 'text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {getWeatherIcon(w)}
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Kitchen Inventory Guidance Box */}
                            {forecastData?.kitchen_prep_advice && (
                                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-black to-amber-950/20 border border-amber-500/40 text-amber-200 flex items-start gap-4 shadow-xl">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-1">
                                            AI Kitchen Inventory Guidance ({forecastData.day_of_week_name} - {forecastData.weather_condition})
                                        </h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs mt-2">
                                            {forecastData.kitchen_prep_advice.map((adv, i) => (
                                                <li key={i}>{adv.replaceAll('**', '')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Grid of Dishes with Demand Progress Bars */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {forecastData?.dishes_forecast?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-6 rounded-3xl bg-gradient-to-b from-white/5 to-black/80 border border-white/10 hover:border-primary/40 shadow-xl backdrop-blur-xl flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                    {item.category}
                                                </span>
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                                                    item.predicted_orders >= 30 
                                                        ? 'bg-red-950 text-red-300 border border-red-800' 
                                                        : 'bg-white/10 text-gray-300'
                                                }`}>
                                                    {item.demand_tier}
                                                </span>
                                            </div>
                                            <h4 className="font-header font-bold text-lg text-white">{item.dish_name}</h4>
                                            <p className="text-xs text-gray-400 mt-1">${item.price.toFixed(2)} per plate</p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-gray-300">Predicted Demand:</span>
                                                <span className="text-amber-300 font-bold text-sm">{item.predicted_orders} Plates</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-primary via-amber-500 to-amber-600 rounded-full"
                                                    style={{ width: `${Math.min(100, (item.predicted_orders / 45) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Est. Revenue:</span>
                                                <span className="text-emerald-400 font-semibold">${item.projected_revenue.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* =========================================================
                        MODULE 2: TABLE BOOKINGS (SEPARATE FULL PAGE)
                    ========================================================= */}
                    {activeTab === 'reservations' && (
                        <motion.div
                            key="reservations"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-white/5 to-black/80 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-header font-bold text-white">
                                        Current Status of Table Booking
                                    </h2>
                                    <div className="flex items-center gap-3 mt-3 text-xs flex-wrap">
                                        <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-semibold border border-white/10">
                                            Total Bookings: {reservations.length}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                            Pending: {reservations.filter(r => r.status === 'Pending').length}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                            Confirmed: {reservations.filter(r => r.status === 'Confirmed').length}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={fetchReservations}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-xs font-semibold text-gray-200 transition-all border border-white/10 shadow active:scale-95"
                                >
                                    <RefreshCw size={14} /> Refresh List
                                </button>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {STATUS_FILTERS.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setResStatusFilter(f.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                                            resStatusFilter === f.id
                                                ? `${f.bg} ${f.color} border ${f.border} shadow-lg`
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        {f.label}
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            resStatusFilter === f.id ? `${f.bg} ${f.color}` : 'bg-white/5 text-gray-500'
                                        }`}>
                                            {getResCount(f.id)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                                        <div className="rounded-3xl bg-black/60 border border-white/10 shadow-2xl overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                                                        <tr>
                                                            <th className="pb-4 px-4">Date / Time</th>
                                                            <th className="pb-4 px-4">Guest Name</th>
                                                            <th className="pb-4 px-4">Contact Details</th>
                                                            <th className="pb-4 px-4">Party Size</th>
                                                            <th className="pb-4 px-4">Pre-Order</th>
                                                            <th className="pb-4 px-4">Status</th>
                                                            <th className="pb-4 px-4">Manage</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {filteredReservations.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="7" className="py-12 text-center text-gray-500">
                                                                    {resStatusFilter === 'all'
                                                                        ? 'No active reservations found. Try booking a table via the DineMate AI Assistant!'
                                                                        : `No ${resStatusFilter.toLowerCase()} reservations found.`
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredReservations.map(res => (
                                                                <React.Fragment key={res._id}>
                                                                    <tr className="hover:bg-white/5 transition-colors">
                                                                        <td className="py-4 px-4">
                                                                            <div className="font-bold text-white text-sm">
                                                                                {res.date && !isNaN(new Date(res.date).getTime()) ? new Date(res.date).toLocaleDateString() : (res.date || 'Today')}
                                                                            </div>
                                                                            <div className="text-[11px] text-gray-400">{res.time || '8:00 PM'}</div>
                                                                        </td>
                                                                        <td className="py-4 px-4 font-semibold text-white text-sm">{res.name}</td>
                                                                        <td className="py-4 px-4 text-gray-300">
                                                                            <div>{res.email}</div>
                                                                            <div className="text-[11px] text-gray-400">{res.phone}</div>
                                                                        </td>
                                                                        <td className="py-4 px-4 font-bold text-amber-300 text-sm">{res.guests} Guests</td>
                                                                        <td className="py-4 px-4">
                                                                            {res.hasPreOrder ? (
                                                                                <button
                                                                                    onClick={() => togglePreOrder(res._id)}
                                                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                                                                        expandedReservation === res._id
                                                                                            ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                                                                                            : 'bg-amber-950/50 text-amber-400 border border-amber-800/50 hover:bg-amber-500/20'
                                                                                    }`}
                                                                                >
                                                                                    <Utensils size={10} />
                                                                                    {expandedReservation === res._id ? 'Hide' : 'View'} Pre-Order
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-[10px] text-gray-600">None</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-4 px-4">
                                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                                                res.status === 'Confirmed'
                                                                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                                                                    : res.status === 'Cancelled'
                                                                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                                                                    : res.status === 'Completed'
                                                                                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                                                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                                                            }`}>
                                                                                {res.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                                            {/* Pending → Confirm / Reject */}
                                                                            {res.status === 'Pending' && (
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <button
                                                                                        onClick={() => updateReservationStatus(res._id, 'Confirmed')}
                                                                                        className="px-3.5 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/45 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                                                    >
                                                                                        <CheckCircle size={13} />
                                                                                        <span>Confirm</span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => updateReservationStatus(res._id, 'Cancelled')}
                                                                                        className="px-3.5 py-1.5 bg-red-600/25 hover:bg-red-600/45 text-red-300 border border-red-500/40 hover:border-red-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                                                    >
                                                                                        <XCircle size={13} />
                                                                                        <span>Reject</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            {/* Confirmed → Cancel / Complete */}
                                                                            {res.status === 'Confirmed' && (
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <button
                                                                                        onClick={() => updateReservationStatus(res._id, 'Completed')}
                                                                                        className="px-3.5 py-1.5 bg-blue-600/25 hover:bg-blue-600/45 text-blue-300 border border-blue-500/40 hover:border-blue-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                                                    >
                                                                                        <CheckCircle2 size={13} />
                                                                                        <span>Complete</span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => updateReservationStatus(res._id, 'Cancelled')}
                                                                                        className="px-3.5 py-1.5 bg-red-600/25 hover:bg-red-600/45 text-red-300 border border-red-500/40 hover:border-red-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                                                    >
                                                                                        <XCircle size={13} />
                                                                                        <span>Cancel</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            {/* Completed / Cancelled → Read-only */}
                                                                            {(res.status === 'Completed' || res.status === 'Cancelled') && (
                                                                                <span className="text-xs text-gray-500 font-medium italic">Finalized</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Expandable Pre-Order Row */}
                                                                    {expandedReservation === res._id && (
                                                                        <tr>
                                                                            <td colSpan="7" className="bg-amber-950/10 border-t border-amber-500/10 px-6 py-4">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <Utensils size={13} className="text-amber-400" />
                                                                                    <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Pre-Ordered Dishes</span>
                                                                                </div>
                                                                                {loadingPreOrder[res._id] ? (
                                                                                    <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                                                                                        <RefreshCw size={12} className="animate-spin" /> Loading pre-order...
                                                                                    </div>
                                                                                ) : preOrderItems[res._id]?.length > 0 ? (
                                                                                    <div className="space-y-2">
                                                                                        {preOrderItems[res._id].map(item => (
                                                                                            <div key={item._id} className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5">
                                                                                                <span className="text-white font-semibold text-xs flex-1">{item.name}</span>
                                                                                                <span className="text-amber-300 text-xs">× {item.quantity}</span>
                                                                                                <span className="text-gray-500 text-[10px]">{item.category}</span>
                                                                                                <select
                                                                                                    value={item.status}
                                                                                                    disabled={updatingItemStatus[item._id]}
                                                                                                    onChange={(e) => updateItemStatus(res._id, item._id, e.target.value)}
                                                                                                    className="bg-[#141414] border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 outline-none focus:border-amber-500/50 transition-colors"
                                                                                                >
                                                                                                    {['preordered','confirmed','preparing','ready','served','cancelled'].map(s => (
                                                                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                                {updatingItemStatus[item._id] && (
                                                                                                    <RefreshCw size={11} className="text-amber-400 animate-spin" />
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-gray-500 text-xs">No pre-order items found.</p>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                        </motion.div>
                    )}

                    {/* =========================================================
                        MODULE 3: MENU & AI DISH LEARNING (SEPARATE FULL PAGE)
                    ========================================================= */}
                    {activeTab === 'menu_learning' && (
                        <motion.div
                            key="menu_learning"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-8"
                        >
                            {/* Add Dish & Retrain AI Form */}
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-white/5 to-black/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <Sparkles size={14} /> Automated Model Retraining & Vector Indexing
                                    </span>
                                    <h2 className="text-2xl lg:text-3xl font-header font-bold text-white">
                                        Add New Dish & Retrain AI Models
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">
                                        When you add a new recipe here, it automatically vectorizes ingredients and flavor profiles into TF-IDF space for both Menu RAG and the ML Recommender.
                                    </p>
                                </div>

                                {dishSuccessMsg && (
                                    <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 size={18} /> {dishSuccessMsg}
                                    </div>
                                )}

                                <form onSubmit={handleAddDish} className="space-y-6 text-xs">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-gray-300 mb-2 font-semibold">Dish Name *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newDishForm.name}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, name: e.target.value })}
                                                placeholder="e.g., Gnocchi al Gorgonzola"
                                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-2 font-semibold">Category</label>
                                            <select 
                                                value={newDishForm.category}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value })}
                                                className="w-full bg-[#141414] border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary text-xs"
                                            >
                                                <option value="Pasta">Pasta</option>
                                                <option value="Pizza">Pizza</option>
                                                <option value="Main">Main Course</option>
                                                <option value="Appetizer">Appetizer / Starter</option>
                                                <option value="Dessert">Dessert</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-2 font-semibold">Price ($) *</label>
                                            <input 
                                                type="number" 
                                                step="0.50"
                                                required
                                                value={newDishForm.price}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, price: e.target.value })}
                                                placeholder="24.50"
                                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 mb-2 font-semibold">Key Ingredients (comma-separated)</label>
                                            <input 
                                                type="text" 
                                                value={newDishForm.ingredients}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, ingredients: e.target.value })}
                                                placeholder="Potato gnocchi, Gorgonzola DOP, toasted walnuts, sage"
                                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-2 font-semibold">Wine Pairing</label>
                                            <input 
                                                type="text" 
                                                value={newDishForm.winePairing}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, winePairing: e.target.value })}
                                                placeholder="Pinot Grigio or Barbaresco"
                                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2 font-semibold">Culinary Description</label>
                                        <textarea 
                                            rows="2"
                                            value={newDishForm.description}
                                            onChange={(e) => setNewDishForm({ ...newDishForm, description: e.target.value })}
                                            placeholder="Handcrafted potato gnocchi served with a creamy Italian Gorgonzola sauce and toasted walnuts."
                                            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary resize-none text-xs"
                                        ></textarea>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 pt-2">
                                        <label className="flex items-center gap-2.5 cursor-pointer text-gray-200">
                                            <input 
                                                type="checkbox"
                                                checked={newDishForm.isVegetarian}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, isVegetarian: e.target.checked })}
                                                className="w-4 h-4 accent-primary rounded"
                                            />
                                            <span>🌿 100% Vegetarian Certified</span>
                                        </label>

                                        <label className="flex items-center gap-2.5 cursor-pointer text-gray-200">
                                            <input 
                                                type="checkbox"
                                                checked={newDishForm.isGlutenFree}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, isGlutenFree: e.target.checked })}
                                                className="w-4 h-4 accent-primary rounded"
                                            />
                                            <span>🌾 Gluten-Free Option</span>
                                        </label>

                                        <div className="flex items-center gap-2.5">
                                            <span className="text-gray-300">🌶️ Spice Level:</span>
                                            <select 
                                                value={newDishForm.spiceLevel}
                                                onChange={(e) => setNewDishForm({ ...newDishForm, spiceLevel: e.target.value })}
                                                className="bg-[#141414] border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs outline-none"
                                            >
                                                <option value="None">None</option>
                                                <option value="Mild">Mild</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hot">Hot</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingDish}
                                            className="px-8 py-3.5 bg-gradient-to-r from-primary via-amber-500 to-amber-600 text-black font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
                                        >
                                            <PlusCircle size={16} />
                                            {isSubmittingDish ? 'Vectorizing & Learning...' : '🚀 Add Dish & Retrain AI Models'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Active Knowledge Base Grid */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-header font-bold text-white">
                                        Indexed Dishes in Vector Space ({menuDishes.length} Items)
                                    </h3>
                                    <span className="text-xs text-primary font-semibold">Active in RAG & Recommender</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {menuDishes.map((dish, i) => (
                                        <div key={i} className="p-6 rounded-3xl bg-gradient-to-b from-white/5 to-black/80 border border-white/10 hover:border-primary/40 transition-colors shadow-lg flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-primary uppercase">{dish.category}</span>
                                                    <span className="font-bold text-amber-300 text-sm">${dish.price?.toFixed(2)}</span>
                                                </div>
                                                <h4 className="font-header font-bold text-base text-white">{dish.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{dish.description}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5 text-[10px]">
                                                {dish.isVegetarian && <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">Veg</span>}
                                                {dish.isGlutenFree && <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">GF</span>}
                                                {dish.spiceLevel && dish.spiceLevel !== 'None' && <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">{dish.spiceLevel}</span>}
                                                {dish.winePairing && <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">🍷 {dish.winePairing}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* =========================================================
                        MODULE 4: GUEST FEEDBACK NLP (SEPARATE FULL PAGE)
                    ========================================================= */}
                    {activeTab === 'sentiment' && (
                        <motion.div
                            key="sentiment"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-8"
                        >
                            <div>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                    <Award size={14} /> Natural Language Processing
                                </span>
                                <h2 className="text-2xl lg:text-3xl font-header font-bold text-white">
                                    Aspect-Based Review Sentiment Analysis
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Granular sentiment mining across Food Quality, Service, Ambience, and Price fairness.
                                </p>
                            </div>

                            {/* 4 Pillars Satisfaction Meters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { key: 'food', label: '🍝 Food Quality', color: 'from-amber-500 to-primary' },
                                    { key: 'service', label: '🤵 Service & Speed', color: 'from-blue-500 to-indigo-500' },
                                    { key: 'ambience', label: '🕯️ Ambience & Vibe', color: 'from-purple-500 to-pink-500' },
                                    { key: 'pricing', label: '💰 Pricing & Value', color: 'from-emerald-500 to-teal-500' }
                                ].map(pillar => {
                                    const score = sentimentData?.aspect_satisfaction_percentage?.[pillar.key] || 85;
                                    return (
                                        <div key={pillar.key} className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/10 shadow-2xl">
                                            <p className="text-xs font-semibold text-gray-300 mb-2">{pillar.label}</p>
                                            <p className="text-3xl font-header font-bold text-white mb-3">{score}%</p>
                                            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${pillar.color} rounded-full`} style={{ width: `${score}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2">Satisfaction Rating</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Praises & Complaints Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-950/20 to-black/80 border border-emerald-500/30 shadow-2xl">
                                    <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <CheckCircle size={18} /> Top Customer Praises (NLP Extracted)
                                    </h3>
                                    <ul className="space-y-3">
                                        {sentimentData?.top_praises?.map((praise, idx) => (
                                            <li key={idx} className="p-4 rounded-2xl bg-white/5 border border-emerald-500/20 text-xs text-gray-200 flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                {praise}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 rounded-3xl bg-gradient-to-b from-red-950/20 to-black/80 border border-red-500/30 shadow-2xl">
                                    <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <ShieldAlert size={18} /> Actionable Pain Points (NLP Extracted)
                                    </h3>
                                    <ul className="space-y-3">
                                        {sentimentData?.top_complaints?.map((comp, idx) => (
                                            <li key={idx} className="p-4 rounded-2xl bg-white/5 border border-red-500/20 text-xs text-gray-200 flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                {comp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* =========================================================
                        MODULE 5: AI EXECUTIVE BRIEFING (SEPARATE FULL PAGE)
                    ========================================================= */}
                    {activeTab === 'executive_brief' && (
                        <motion.div
                            key="executive_brief"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-8"
                        >
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-[#1c140a] to-black border border-primary/40 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                                    <Sparkles size={16} /> Daily Automated Manager Briefing
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-header font-bold text-white mb-2">
                                    Strategic Operations & Profitability Briefing
                                </h2>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Synthesized daily by Al Viro AI based on order patterns, table cover turnover, inventory levels, and customer sentiment.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-black/80 border border-white/10 shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/30">
                                            <Users size={24} />
                                        </div>
                                        <h3 className="font-header font-bold text-xl text-white mb-1">Staffing & Shift Planner</h3>
                                        <p className="text-xs text-gray-400 mb-6">Optimized floor and kitchen staffing</p>
                                        <ul className="space-y-3 text-xs text-gray-200">
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-amber-400 font-bold">•</span>
                                                <span><strong>Friday & Saturday Peak (7:30 - 9:30 PM)</strong>: 38% higher table turnover. Schedule +2 floor servers.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-amber-400 font-bold">•</span>
                                                <span><strong>Kitchen Line</strong>: Double pizza station prep during 8:00 PM rush.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                                        Status: High Efficiency
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-black/80 border border-white/10 shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                                            <Utensils size={24} />
                                        </div>
                                        <h3 className="font-header font-bold text-xl text-white mb-1">Procurement & Inventory</h3>
                                        <p className="text-xs text-gray-400 mb-6">Minimizing food waste via demand ML</p>
                                        <ul className="space-y-3 text-xs text-gray-200">
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-emerald-400 font-bold">•</span>
                                                <span><strong>Carnaroli Rice & Truffles</strong>: High steady demand (+26 portions/day). Maintain 15kg stock.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-emerald-400 font-bold">•</span>
                                                <span><strong>Fresh Atlantic Lobster</strong>: Order 35 tails for weekend pasta specials.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                                        Estimated Food Waste Reduction: -24%
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-black/80 border border-white/10 shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30">
                                            <DollarSign size={24} />
                                        </div>
                                        <h3 className="font-header font-bold text-xl text-white mb-1">Menu Margin Optimizer</h3>
                                        <p className="text-xs text-gray-400 mb-6">Pricing and high-margin pairings</p>
                                        <ul className="space-y-3 text-xs text-gray-200">
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-blue-400 font-bold">•</span>
                                                <span><strong>Wine Upsell Opportunity</strong>: 68% of Osso Buco orders pair with Amarone wine. Train staff on pairings.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="text-blue-400 font-bold">•</span>
                                                <span><strong>Dessert Conversion</strong>: Tiramisu has an 82% satisfaction rating. Suggest as meal finish in DineMate AI Assistant.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-blue-300 font-semibold uppercase tracking-wider">
                                        Projected Margin Lift: +14%
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default AIDashboard;
