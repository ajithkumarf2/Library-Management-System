import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBook, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const IssuedBooks = () => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssuedBooks();
    }, []);

    const fetchIssuedBooks = async () => {
        try {
            const profileRes = await axios.get('/members/profile');
            const response = await axios.get(`/issues/member/${profileRes.data.id}`);
            // Filter only currently issued books
            setIssuedBooks(response.data.filter(b => b.status === 'issued' || b.status === 'overdue'));
        } catch (error) {
            console.error('Fetch issued books error:', error);
            toast.error('Failed to fetch issued books');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 text-2xl shadow-sm">
                    <FiBook />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Issued Books</h1>
                    <p className="text-slate-500">Books currently in your possession</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Book Details</th>
                                <th className="px-8 py-4">Issue Date</th>
                                <th className="px-8 py-4">Due Date</th>
                                <th className="px-8 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center">Loading...</td></tr>
                            ) : issuedBooks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400">
                                        No books currently issued
                                    </td>
                                </tr>
                            ) : (
                                issuedBooks.map((issue) => {
                                    const isOverdue = new Date(issue.dueDate) < new Date();
                                    return (
                                        <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=687&auto=format&fit=crop" 
                                                            alt="cover" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{issue.bookTitle}</p>
                                                        <p className="text-xs text-slate-500 font-medium">ISBN: {issue.isbn}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-medium">{new Date(issue.issueDate).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-medium">{new Date(issue.dueDate).toLocaleDateString()}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
                                                    isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {isOverdue && <FiClock />}
                                                    {isOverdue ? 'Overdue' : 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IssuedBooks;
