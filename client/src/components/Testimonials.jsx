import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
    {
        id: 1,
        name: "Eleanor P.",
        role: "Food Critic",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "An absolute triumph of culinary art. The Truffle Risotto transported me back to Florence. The attention to detail in every dish is simply unmatched in this city."
    },
    {
        id: 2,
        name: "Marcus Chen",
        role: "Verified Guest",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "The atmosphere is breathtaking, but the service steals the show. I celebrated my anniversary here and the staff made us feel like royalty. Highly recommended."
    },
    {
        id: 3,
        name: "Sofia Rodriguez",
        role: "Sommelier",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "Their wine pairing suggestions were impeccable. The sommelier guided us perfectly through the extensive list. A truly world-class dining experience."
    },
    {
        id: 4,
        name: "James & Sarah",
        role: "Anniversary Couple",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "We chose GourmetHash for our 10th anniversary and it was magical. The private booth, the personalized dessert, and the ambiance created an unforgettable evening."
    },
    {
        id: 5,
        name: "David K.",
        role: "Business Traveler",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "The perfect spot for a business dinner. Impressive menu, discreet service, and a quiet enough atmosphere to talk shop while enjoying a phenomenal steak."
    }
];

const Testimonials = () => {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((curr) => (curr + 1) % reviews.length);
    const prev = () => setCurrent((curr) => (curr === 0 ? reviews.length - 1 : curr - 1));

    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-32 bg-secondary relative overflow-hidden text-white">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Guest Book</span>
                    <h2 className="text-5xl md:text-6xl font-header font-bold">Voices of Alviro</h2>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Decorative Large Quote */}
                    <Quote className="absolute -top-12 -left-12 w-32 h-32 text-white/5 z-0" />

                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
                            >
                                {/* Left: Image */}
                                <div className="shrink-0 relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md transform scale-110"></div>
                                    <img
                                        src={reviews[current].image}
                                        alt={reviews[current].name}
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 object-cover shadow-xl relative z-10"
                                    />
                                    <div className="absolute -bottom-4 -right-4 bg-white text-secondary p-2 rounded-full shadow-lg z-20">
                                        <Quote size={20} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Right: Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex justify-center md:justify-start gap-1 mb-6">
                                        {[...Array(reviews[current].rating)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 + (i * 0.05) }}
                                            >
                                                <Star className="w-5 h-5 text-primary fill-current" />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <p className="text-xl md:text-2xl font-serif leading-relaxed mb-8 text-gray-200 italic">
                                        "{reviews[current].text}"
                                    </p>

                                    <div>
                                        <h4 className="font-header font-bold text-2xl tracking-wide">{reviews[current].name}</h4>
                                        <span className="text-primary/80 text-sm uppercase tracking-wider font-bold">{reviews[current].role}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center md:justify-end gap-4 mt-8">
                        <button
                            onClick={prev}
                            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
