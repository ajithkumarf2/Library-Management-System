import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await axios.get('/wishlist');
            setWishlistItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookId) => {
        try {
            await axios.delete(`/wishlist/${bookId}`);
            setWishlistItems(wishlistItems.filter(item => item.id !== bookId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleIssue = async (bookId) => {
        try {
            await axios.post('/issues/self-issue', { bookId });
            toast.success('Book issued successfully!');
            fetchWishlist();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue book');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-2xl text-red-500 text-2xl">
                    <FiHeart />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Wishlist</h1>
                    <p className="text-slate-500">Books you're interested in reading later</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading your wishlist...</div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-5xl mb-4">Empty</div>
                            <p className="text-slate-500">You haven't added any books to your wishlist yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Book</th>
                                    <th className="px-8 py-4">Category</th>
                                    <th className="px-8 py-4">Availability</th>
                                    <th className="px-8 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {wishlistItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">{item.author}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">
                                                {item.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-xs font-bold ${item.availableQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleIssue(item.id)}
                                                    disabled={item.availableQuantity <= 0}
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
                                                    title="Issue Book"
                                                >
                                                    <FiShoppingCart />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemove(item.id)}
                                                    className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
