import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/reservations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReservations(res.data);
            } catch (error) {
                console.error(error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/admin/login');
                }
            }
        };
        fetchReservations();
    }, [navigate]);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/reservations/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(reservations.map(r => r._id === id ? { ...r, status } : r));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-white text-gray-700 rounded shadow hover:bg-gray-50"
                        >
                            Visit Site
                        </button>
                        <button
                            onClick={() => navigate('/admin/menu')}
                            className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-orange-700"
                        >
                            Manage Menu
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Recent Reservations</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reservations.map((res) => (
                                    <tr key={res._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(res.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{res.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{res.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{res.email}</div>
                                            <div>{res.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.guests}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                res.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateStatus(res._id, 'Confirmed')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-semibold transition-colors shadow-sm active:scale-95">Confirm</button>
                                                <button onClick={() => updateStatus(res._id, 'Cancelled')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold transition-colors shadow-sm active:scale-95">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
