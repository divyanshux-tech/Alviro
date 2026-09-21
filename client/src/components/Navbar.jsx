import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Menu, X, UtensilsCrossed, Sun, Moon } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { theme, toggleTheme } = useTheme();

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: "Chef's Table", href: '#chef-table' },
        { name: 'Popular Dishes', href: '#popular' },
        { name: 'Menu', href: '/menu' },
        { name: 'Reservations', href: '#reservation' },
        { name: 'Contact', href: '#contact' }
    ];



    const scrollToSection = (id) => {
        if (id.startsWith('/')) {
            // It's a route
            return;
        }
        if (!isHome) {
            window.location.href = '/' + id;
        } else {
            const element = document.getElementById(id.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setIsOpen(false);
    };

    // Hide customer navbar on Admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (

        <>
            <motion.div
                className="fixed top-0 left-0 right-0 h-0.5 bg-primary origin-left z-[60]"
                style={{ scaleX }}
            />

            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
                    ? 'bg-[#050505]/90 backdrop-blur-md md:backdrop-blur-xl py-6 md:py-4 shadow-2xl'
                    : 'bg-transparent py-8 md:py-6'
                    }`}
            >
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 relative flex justify-center items-center h-full">

                    {/* Logo - Absolute Left */}
                    <Link to="/" className="group absolute left-6 md:left-12 z-50">
                        <span className="font-serif italic text-2xl md:text-3xl text-primary tracking-wider group-hover:text-amber-200 transition-colors duration-500 font-light">
                            Alviro
                        </span>
                    </Link>

                    {/* Desktop Navigation - Centered with left margin */}
                    <div className="hidden xl:flex items-center gap-8 2xl:gap-12 ml-64">
                        {navLinks.map((item) => (
                            item.href.startsWith('/') ?
                                <Link key={item.name} to={item.href} className="font-display text-base tracking-wider text-white/60 hover:text-primary transition-colors duration-300 font-medium">
                                    {item.name}
                                </Link>
                                :
                                <button
                                    key={item.name}
                                    onClick={() => scrollToSection(item.href)}
                                    className="font-display text-base tracking-wider text-white/60 hover:text-primary transition-colors duration-300 font-medium"
                                >
                                    {item.name}
                                </button>
                        ))}

                        <button
                            onClick={() => scrollToSection('#reservation')}
                            className="px-8 py-3 border border-primary text-primary font-display text-sm font-medium tracking-wider hover:bg-primary hover:text-black transition-all duration-500 ml-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            style={{ borderRadius: '1px' }}
                        >
                            Reserve
                        </button>
                    </div>

                    {/* Tablet/Mobile Menu Toggle - Absolute Right */}
                    <div className="xl:hidden flex items-center justify-end z-50 absolute right-4 md:right-8">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-primary hover:text-white transition-colors p-2"
                        >
                            {isOpen ? <X size={32} strokeWidth={1} /> : <Menu size={32} strokeWidth={1} />}
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Menu Overlay */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
                        exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed inset-0 z-[60] bg-black h-screen w-screen flex flex-col justify-center items-center opacity-100 will-change-transform"
                    >
                        {/* Close Button - Internal */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-primary hover:text-white transition-colors p-2 z-50"
                        >
                            <X size={32} strokeWidth={1} />
                        </button>

                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

                        <div className="flex flex-col items-center space-y-6 relative z-10 w-full px-6 text-center max-h-screen overflow-y-auto py-20">
                            {navLinks.map((item, idx) => (
                                item.href.startsWith('/') ?
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
                                            className="block text-3xl font-serif font-medium text-white/50 hover:text-primary transition-all duration-300 tracking-tight"
                                        >
                                            {item.name}
                                        </motion.span>
                                    </Link>
                                    :
                                    <button
                                        key={item.name}
                                        onClick={() => scrollToSection(item.href)}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05, duration: 0.5 }}
                                            className="block text-3xl font-serif font-medium text-white/50 hover:text-primary transition-all duration-300 tracking-tight"
                                        >
                                            {item.name}
                                        </motion.span>
                                    </button>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="pt-8"
                            >
                                <button
                                    onClick={() => scrollToSection('#reservation')}
                                    className="px-10 py-4 bg-primary text-black font-header font-bold text-sm tracking-[0.3em] uppercase rounded-none hover:bg-white transition-all hover:scale-105"
                                >
                                    Reserve A Table
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
