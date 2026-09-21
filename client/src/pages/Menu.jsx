import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { BadgeCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [categories, setCategories] = useState(['All']);

    const [expandedDishId, setExpandedDishId] = useState(null);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Min load time for smooth UX
            const response = await axios.get(`${API_URL}/api/menu`);
            setMenuItems(response.data);

            // Extract unique categories
            const uniqueCats = ['All', ...new Set(response.data.map(item => item.category))];
            setCategories(uniqueCats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setLoading(false);
        }
    };

    const filteredItems = filter === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === filter);

    return (
        <div className="bg-secondary min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs block mb-3">Full Menu</span>
                    <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-6 leading-tight italic">
                        All <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 font-bold">Seasonal Creations</span>
                    </h2>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-primary to-transparent mx-auto"></div>
                </div>


                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-6 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${filter === cat
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-white border-b-2 border-transparent'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white/5 rounded-none p-0 animate-pulse h-96"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                key={item._id}
                                className={`group cursor-pointer relative transition-all duration-500 ease-out rounded-xl ${expandedDishId === item._id ? 'scale-[1.02] z-20 ring-1 ring-primary/50 shadow-[0_0_50px_rgba(212,175,55,0.15)] bg-white/5' : 'hover:bg-white/5 hover:scale-[1.01]'}`}
                                onClick={() => setExpandedDishId(expandedDishId === item._id ? null : item._id)}
                            >
                                <div className="w-full aspect-[4/3] overflow-hidden mb-6 bg-gray-900 relative">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    />
                                    {/* Overlay for "Click to view" hint */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <span className="text-white text-xs tracking-widest uppercase border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm"> View Details </span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className="text-primary font-serif font-bold text-xs tracking-widest uppercase mb-2 block">{item.category}</span>
                                    <h3 className="text-2xl font-serif text-white mb-2 font-bold">{item.name}</h3>

                                    {/* Expandable Content */}
                                    <motion.div
                                        initial={false}
                                        animate={{ height: expandedDishId === item._id ? 'auto' : 0, opacity: expandedDishId === item._id ? 1 : 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-xs mx-auto italic font-medium">
                                            "{item.specialty || item.description || "A chef's special creation."}"
                                        </p>
                                    </motion.div>

                                    {/* 1-Liner Teaser (Visual when collapsed) */}
                                    {expandedDishId !== item._id && (
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-1 max-w-xs mx-auto font-medium">
                                            {item.description}
                                        </p>
                                    )}

                                    <span className="text-xl font-serif text-primary italic font-bold">${item.price}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-serif">
                        <p>No items found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
