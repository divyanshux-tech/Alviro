import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

const FoodGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch menu items
                const res = await axios.get(`${API_URL}/api/menu`);
                // Fisher-Yates shuffle
                const shuffled = [...res.data];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                // Ensure we have at least 9 items or repeat if necessary to fill the grid
                let selection = shuffled.slice(0, 9);
                if (selection.length > 0 && selection.length < 9) {
                    // Repeat items to fill grid if we don't have enough
                    while (selection.length < 9) {
                        selection = [...selection, ...selection].slice(0, 9);
                    }
                }

                setImages(selection);
            } catch (err) {
                console.error("Error fetching gallery images:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    // Safety: Only prepare columns if we have images
    const col1 = images.slice(0, 3);
    const col2 = images.slice(3, 6);
    const col3 = images.slice(6, 9);

    return (
        <section ref={containerRef} className="py-24 bg-gray-50 overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold tracking-[0.2em] uppercase text-xs"
                    >
                        Visual Experience
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-serif font-black text-secondary mt-4 mb-4 tracking-tight"
                    >
                        Culinary Artistry
                    </motion.h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg font-normal">
                        A curated showcase of our chef's masterpiece creations.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-[600px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[800px] overflow-hidden">
                        {images.length > 0 ? (
                            <>
                                {/* Column 1 - Parallax Up */}
                                <motion.div style={{ y: y1 }} className="flex flex-col gap-8">
                                    {col1.map((img, i) => <GalleryCard key={`c1-${i}`} item={img} />)}
                                </motion.div>

                                {/* Column 2 - Parallax Down (Offset) */}
                                <motion.div style={{ y: y2 }} className="flex flex-col gap-8 pt-12">
                                    {col2.map((img, i) => <GalleryCard key={`c2-${i}`} item={img} />)}
                                </motion.div>

                                {/* Column 3 - Parallax Up */}
                                <motion.div style={{ y: y3 }} className="flex flex-col gap-8">
                                    {col3.map((img, i) => <GalleryCard key={`c3-${i}`} item={img} />)}
                                </motion.div>
                            </>
                        ) : (
                            <div className="col-span-3 text-center text-gray-400 py-20">
                                Gallery temporarily unavailable
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

const GalleryCard = ({ item }) => (
    <div className="relative group rounded-3xl overflow-hidden shadow-xl aspect-[4/5] bg-gray-200">
        {item && item.image && (
            <>
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-accent text-xs font-bold uppercase tracking-wider block mb-2">{item.category}</span>
                        <h3 className="text-white text-xl font-serif font-bold leading-snug">{item.name}</h3>
                    </div>
                </div>
            </>
        )}
    </div>
);

export default FoodGallery;
