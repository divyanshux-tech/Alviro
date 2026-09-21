import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Award, Truck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <section id="about" className="py-32 bg-secondary relative overflow-hidden text-center">

            <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <span className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs block mb-6">Our Story</span>
                    <h2 className="text-6xl md:text-8xl font-header text-white mb-8 leading-tight">
                        A Passion <span className="italic font-serif text-primary/80">for</span> Excellence
                    </h2>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-10"></div>

                    <p className="text-gray-300 text-xl leading-relaxed mb-6 font-normal max-w-3xl mx-auto">
                        Founded in the heart of the city, <span className="text-primary font-medium">Alviro</span> brings the soul of Italian gastronomy to discerning palates. Our chef, trained in the kitchens of Milan and Rome, crafts each dish with reverence for tradition and a modern sensibility.
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed font-normal max-w-3xl mx-auto">
                        Every ingredient is sourced with care—from the finest Parmigiano-Reggiano aged 36 months to hand-picked truffles from Alba. We believe in the beauty of simplicity, allowing exceptional ingredients to speak for themselves.
                    </p>
                </motion.div>

                {/* Separator Line */}
                <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-24"></div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p className="text-6xl md:text-7xl font-header font-medium text-primary mb-3">15+</p>
                        <p className="text-gray-500 text-xs tracking-[0.25em] uppercase font-sans">Years of Excellence</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <p className="text-6xl md:text-7xl font-header font-medium text-primary mb-3">100%</p>
                        <p className="text-gray-500 text-xs tracking-[0.25em] uppercase font-sans">Italian Ingredients</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <p className="text-6xl md:text-7xl font-header font-medium text-primary mb-3">1</p>
                        <p className="text-gray-500 text-xs tracking-[0.25em] uppercase font-sans">Michelin Star</p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default About;
