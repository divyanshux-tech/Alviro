import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ item }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="relative w-[300px] md:w-[340px] h-[460px] md:h-[520px] flex-shrink-0 rounded-[1.5rem] bg-[#050505] shadow-2xl cursor-pointer overflow-hidden group border border-white/5 hover:border-primary/50 transition-all duration-500"
        >
            {/* Full Height Image Layer */}
            <motion.div
                style={{ transform: "translateZ(20px)" }}
                className="absolute inset-0 w-full h-full"
            >
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[30%] group-hover:grayscale-0"
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
            </motion.div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <div style={{ transform: "translateZ(40px)" }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-primary/90 text-[10px] font-bold uppercase tracking-[0.4em] border-b border-primary/30 pb-1">{item.category}</span>
                        <span className="text-amber-200 font-serif text-2xl italic">${item.price}</span>
                    </div>

                    <h3 className="text-4xl font-serif text-white group-hover:text-primary transition-colors duration-300 leading-tight mb-4 font-bold">{item.title}</h3>

                    <p className="text-gray-400 text-xs font-medium tracking-wide line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                        {item.description || "A masterfully curated dish featuring the finest ingredients, designed to transport your palate to the heart of Italy."}
                    </p>

                    {/* View Details Button */}
                    <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 delay-200">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">View Details</span>
                        <div className="w-8 h-[1px] bg-primary"></div>
                    </div>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
        </motion.div>
    );
};

const InteractiveMenu = () => {
    const dishes = [
        { id: 1, title: 'Truffle Tagliatelle', price: '28', category: 'Primi', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000&auto=format&fit=crop' },
        { id: 2, title: 'Osso Buco', price: '38', category: 'Secondi', image: 'https://images.unsplash.com/photo-1544510808-91bcbee1df55?q=80&w=1000&auto=format&fit=crop' },
        { id: 3, title: 'Tiramisù Classico', price: '14', category: 'Dolci', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80' },
        { id: 4, title: 'Risotto ai Funghi', price: '26', category: 'Primi', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80' },
        { id: 5, title: 'Negroni Sbagliato', price: '16', category: 'Aperitivo', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80' },
    ];

    return (
        <section id="chef-table" className="pt-32 pb-0 bg-secondary overflow-hidden relative">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Ambient Background Glow - Enhanced */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none opacity-50"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Background Title - More Subtle */}
            <div className="absolute -top-10 left-0 w-full text-center overflow-hidden pointer-events-none opacity-[0.04]">
                <h2 className="text-[18rem] md:text-[25rem] font-header font-bold text-transparent text-stroke-2 text-stroke-white leading-none whitespace-nowrap tracking-tighter">FLAVOR</h2>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6 border-b border-white/5 pb-8">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-primary font-header font-bold text-sm tracking-[0.4em] uppercase block mb-4"
                        >
                            Exquisite Selections
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-header font-medium text-white"
                        >
                            The <span className="text-primary italic font-serif">Chef's Table</span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="hidden md:flex flex-col gap-2 max-w-sm text-right"
                    >
                        <p className="text-gray-300 text-lg leading-relaxed font-serif italic tracking-wide font-medium">"Swipe to discover our most prized creations, each crafted with passion and precision to ignite your senses."</p>
                        <div className="h-[2px] w-12 bg-primary self-end mt-2"></div>
                    </motion.div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-8 overflow-x-auto pb-16 pt-8 px-4 snap-x hide-scrollbar mask-gradient">
                    {dishes.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <TiltCard item={item} />
                        </motion.div>
                    ))}
                    {/* Spacer for right padding */}
                    <div className="w-8 shrink-0"></div>
                </div>
            </div>
        </section>
    );
};
export default InteractiveMenu;
