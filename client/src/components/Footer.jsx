import React from 'react';
import { useLocation } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (

        <footer id="contact" className="bg-[#050505] text-white py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-50%] left-[50%] transform -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

                {/* Brand */}
                <div className="mb-20">
                    <h2 className="font-serif italic text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-primary to-amber-200 mb-4">Alviro</h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] w-8 bg-primary/30"></div>
                        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-primary/80">Fine Italian Cuisine</p>
                        <div className="h-[1px] w-8 bg-primary/30"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 font-normal">
                    {/* Address */}
                    <div className="space-y-6">
                        <h3 className="text-primary font-sans font-bold text-[10px] tracking-[0.25em] uppercase">Address</h3>
                        <p className="text-gray-400/80 leading-loose text-sm">
                            123 Via Roma<br />
                            Downtown District<br />
                            City, State 10001
                        </p>
                    </div>

                    {/* Hours */}
                    <div className="space-y-6">
                        <h3 className="text-primary font-sans font-bold text-[10px] tracking-[0.25em] uppercase">Hours</h3>
                        <p className="text-gray-400/80 leading-loose text-sm">
                            Tuesday - Thursday: 6PM - 10PM<br />
                            Friday - Saturday: 6PM - 11PM<br />
                            Sunday: 5PM - 9PM
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h3 className="text-primary font-sans font-bold text-[10px] tracking-[0.25em] uppercase">Contact</h3>
                        <p className="text-gray-400/80 leading-loose text-sm">
                            +1 (555) 234-5678<br />
                            <a href="mailto:reservations@alviro.com" className="hover:text-primary transition-colors">reservations@alviro.com</a>
                        </p>
                    </div>
                </div>

                {/* Socials */}
                <div className="flex justify-center space-x-6 mb-16">
                    <a href="#" className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#050505] hover:bg-primary hover:border-primary transition-all duration-300 transform hover:scale-110">
                        <Instagram size={18} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#050505] hover:bg-primary hover:border-primary transition-all duration-300 transform hover:scale-110">
                        <Facebook size={18} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#050505] hover:bg-primary hover:border-primary transition-all duration-300 transform hover:scale-110">
                        <Twitter size={18} />
                    </a>
                </div>

                <div className="text-gray-600 text-[10px] tracking-[0.2em] uppercase border-t border-white/5 pt-8 inline-block px-12">
                    &copy; {new Date().getFullYear()} Alviro. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
