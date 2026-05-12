import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReturnedBooks = () => {
    const [returnedBooks, setReturnedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReturnedBooks();
    }, []);

    const fetchReturnedBooks = async () => {
        try {
            const profileRes = await axios.get('/members/profile');
            const response = await axios.get(`/issues/member/${profileRes.data.id}`);
            // Filter only returned books
            setReturnedBooks(response.data.filter(b => b.status === 'returned'));
        } catch (error) {
            console.error('Fetch returned books error:', error);
            toast.error('Failed to fetch returned books');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 text-2xl shadow-sm">
                    <FiCheckCircle />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Returned Books</h1>
                    <p className="text-slate-500">Books you have successfully returned</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Book Details</th>
                                <th className="px-8 py-4">Issue Date</th>
                                <th className="px-8 py-4">Return Date</th>
                                <th className="px-8 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center">Loading...</td></tr>
                            ) : returnedBooks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400">
                                        No books returned yet
                                    </td>
                                </tr>
                            ) : (
                                returnedBooks.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 text-slate-300 flex items-center justify-center">
                                                    <FiCalendar />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{issue.bookTitle}</p>
                                                    <p className="text-xs text-slate-500 font-medium">ISBN: {issue.isbn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-600 font-medium">{new Date(issue.issueDate).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-sm text-slate-600 font-medium">
                                            {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                Returned
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReturnedBooks;
