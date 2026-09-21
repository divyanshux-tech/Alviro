import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { Plus, Trash, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuManager = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', image: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/menu`);
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching menu");
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/menu`, newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewItem({ name: '', description: '', price: '', category: '', image: '' });
            fetchItems();
        } catch (error) {
            console.error("Error adding item");
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/menu/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchItems();
        } catch (error) {
            console.error("Error deleting item");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Menu Manager</h1>

            {/* Add Item Form */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input placeholder="Name" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="border p-2 rounded" />
                    <input placeholder="Category" required value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="border p-2 rounded" />
                    <input placeholder="Price" required type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="border p-2 rounded" />
                    <input placeholder="Image URL" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} className="border p-2 rounded" />
                    <button type="submit" className="bg-primary text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-orange-700">
                        <Plus size={18} /> Add Item
                    </button>
                    <div className="lg:col-span-5">
                        <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="border p-2 rounded w-full" rows="2"></textarea>
                    </div>
                </form>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">{item.category}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                            <div className="font-bold text-primary">${item.price}</div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
                            <button onClick={() => deleteItem(item._id)} className="text-red-500 hover:text-red-700 p-2"><Trash size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <button onClick={() => navigate('/admin/dashboard')} className="text-gray-600 underline">Back to Dashboard</button>
            </div>
        </div>
    );
};

export default MenuManager;
