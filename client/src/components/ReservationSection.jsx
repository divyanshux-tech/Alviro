import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const ReservationSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        guests: '2'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post(`${API_URL}/api/reservations`, formData);
            setStatus({ type: 'success', message: `Reservation request received! Your booking is pending confirmation and a notification email has been sent to ${formData.email}. We'll confirm shortly!` });
            setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '2' });
        } catch (error) {

            console.error(error);
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="reservation" className="py-24 bg-[#050505] relative overflow-hidden flex items-center justify-center min-h-[90vh]">
            {/* Background Composition - Golden Glows */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[100px] opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 w-full">

                {/* Left: Content & Image (Span 6) */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:block lg:col-span-6 relative"
                >
                    <div className="relative z-10 mb-16">
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-6 block ml-1">Table Service</span>
                        <h2 className="text-7xl lg:text-8xl font-serif font-medium text-white leading-[0.9]">
                            Book Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-200 to-primary italic font-serif pr-4">Moment</span>
                        </h2>
                        <p className="text-gray-400 mt-8 max-w-md text-lg leading-relaxed font-normal border-l border-primary/30 pl-6">
                            Whether it's a romantic dinner or a family gathering, we ensure every detail is perfect. Experience the art of hospitality.
                        </p>
                    </div>

                    {/* Image Composition - Premium Frame */}
                    <div className="relative pl-8 pb-8 group">
                        <div className="absolute top-0 left-0 w-full h-full border-l border-b border-primary/30 -z-10 rounded-bl-[60px] transition-all duration-700 group-hover:border-primary/60 group-hover:translate-x-[-10px] group-hover:translate-y-[10px]"></div>
                        <img
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Dining Interior"
                            className="w-full max-w-lg rounded-bl-[60px] rounded-tr-[20px] shadow-2xl object-cover h-[500px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </motion.div>

                {/* Right: Form (Span 6) */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="lg:col-span-6 w-full"
                >
                    <div className="bg-[#111111] border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                        <div className="mb-10 relative z-10">
                            <h3 className="text-4xl font-serif text-white mb-2">Secure Your Table</h3>
                            <p className="text-gray-500 text-sm font-normal">Reservations are recommended 2 days in advance.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-1">Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal placeholder-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-1">Phone</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        required
                                        placeholder="+1 234..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-1">Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal placeholder-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-1">Guests</label>
                                    <select
                                        name="guests"
                                        value={formData.guests}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal h-[58px] appearance-none cursor-pointer"
                                    >
                                        <option value="2" className="text-black">2 People</option>
                                        <option value="3" className="text-black">3 People</option>
                                        <option value="4" className="text-black">4 People</option>
                                        <option value="5" className="text-black">5+ People</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-1">When?</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            type="date"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal text-sm uppercase tracking-wider"
                                        />
                                        <input
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            type="time"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-normal text-sm uppercase tracking-wider"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button disabled={loading} className="w-full bg-primary text-secondary font-sans font-bold uppercase tracking-[0.2em] py-5 rounded-lg hover:bg-white hover:text-black transition-all mt-6 shadow-xl hover:shadow-primary/20 hover:-translate-y-1 group flex items-center justify-center gap-3 disabled:opacity-50 text-xs">
                                {loading ? 'Processing...' : 'Confirm Table'}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-center gap-3 text-xs font-bold uppercase tracking-wider mt-4 ${status.type === 'success' ? 'text-green-400 bg-green-900/20 p-4 rounded-lg border border-green-500/20' : 'text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500/20'}`}
                                >
                                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {status.message}
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default ReservationSection;
