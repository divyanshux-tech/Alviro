import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Instagram, Facebook, Twitter, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const scrollToReservation = () => {
        const element = document.getElementById('reservation');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center">

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Fine Dining Atmosphere"
                    className="w-full h-full object-cover"
                    style={{
                        filter: 'saturate(0.85) hue-rotate(-5deg) brightness(0.92) contrast(1.05)'
                    }}
                />
                <div className="absolute inset-0 bg-black/30"></div> {/* Minimal dark overlay for text readability, no blur */}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <span className="block text-primary text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-3">
                        Fine Italian Cuisine
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-4 leading-tight">
                        Alviro
                    </h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
                    <p className="font-sans text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                        An exquisite journey through the authentic flavors of Italy, where tradition meets elegance.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <button
                        onClick={scrollToReservation}
                        className="px-8 py-3 bg-primary text-secondary font-bold tracking-widest uppercase text-sm border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                        style={{ borderRadius: '1px' }}
                    >
                        Reserve a Table
                    </button>
                    <Link to="/menu">
                        <button className="px-8 py-3 bg-transparent text-white font-bold tracking-widest uppercase text-sm border border-white/30 hover:bg-white hover:text-secondary transition-all duration-300" style={{ borderRadius: '1px' }}>
                            View Menu
                        </button>
                    </Link>
                </motion.div>

            </div>

            {/* Bottom Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="w-[30px] h-[50px] rounded-full border-2 border-white/20 flex justify-center p-2">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
