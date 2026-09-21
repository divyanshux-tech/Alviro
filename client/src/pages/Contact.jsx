import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '',
        specialRequest: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await axios.post(`${API_URL}/api/reservations`, formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: '', specialRequest: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary font-bold tracking-widest uppercase text-sm">Reservations</span>
                        <h1 className="text-5xl font-bold text-secondary mt-2 mb-4 font-serif">Book a Table</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">Reserve your spot for an unforgettable dining experience.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="bg-orange-50 p-10 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-bold text-secondary mb-8 relative z-10">Get in Touch</h3>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Phone</p>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email</p>
                                        <p className="text-gray-600">reservations@gourmethash.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Location</p>
                                        <p className="text-gray-600">123 Culinary Ave, Foodie City, FC 90210</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Opening Hours</p>
                                        <p className="text-gray-600">Mon-Sun: 11:00 AM - 11:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-80 bg-gray-200 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                            <iframe
                                title="map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133972322!2d-73.98773172355556!3d40.75797467138766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1703248325988!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </motion.div>

                    {/* Reservation Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100"
                    >
                        {status === 'success' ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <Calendar className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Request Received!</h3>
                                <p className="text-gray-600 text-lg max-w-md">Your reservation request is being reviewed. A notification email has been sent to your registered email. We'll confirm your booking shortly!</p>
                                <button onClick={() => setStatus('')} className="mt-8 px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors">
                                    Make another booking
                                </button>
                            </div>
                        ) : (

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-xl font-bold text-secondary mb-6">Reservation Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Phone</label>
                                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="(555) 000-0000" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Date</label>
                                            <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Time</label>
                                            <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Guests</label>
                                            <input required type="number" min="1" name="guests" value={formData.guests} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="2" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Special Requests</label>
                                        <textarea rows="3" name="specialRequest" value={formData.specialRequest} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Allergies, outdoor seating, etc." />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-orange-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status === 'submitting' ? 'Confirming Availability...' : 'Confirm Reservation'}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-4">By booking, you agree to our Terms & Privacy Policy.</p>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
