import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.result));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-secondary mb-2">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to access your dashboard</p>
                </div>

                {/* Google Sign In Button */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6 group"
                    onClick={() => alert("Google Sign-In is effectively simulated here! In a production app, this would open the Google OAuth popup.")}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Sign in with Google</span>
                </button>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 font-medium">Or continue with email</span>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100"
                    >
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Admin Email</label>
                        <input
                            type="email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-5 py-3 bg-gray-50 text-gray-900 font-semibold border-gray-300 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1 ml-1">
                            <label className="block text-sm font-bold text-gray-700">Password</label>
                            <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-5 py-3 bg-gray-50 text-gray-900 font-semibold border-gray-300 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-secondary text-white font-bold py-4 rounded-xl hover:bg-primary transition-colors shadow-lg shadow-orange-500/20 mt-2">
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <span className="text-primary font-bold cursor-pointer">Contact Support</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
