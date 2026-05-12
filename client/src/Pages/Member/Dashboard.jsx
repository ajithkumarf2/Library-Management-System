import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiBook, FiClock, FiCalendar, FiArrowRight, FiBookOpen, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const [member, setMember] = useState(null);
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const profileRes = await axios.get('/members/profile');
            setMember(profileRes.data);
            const booksRes = await axios.get(`/issues/member/${profileRes.data.id}`);
            setIssuedBooks(booksRes.data);
        } catch (error) {
            console.error('Fetch data error:', error);
            // navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
                </div>
                <div className="h-96 bg-slate-200 rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome back, {member?.name}! 👋</h1>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                        Ready to dive back into your reading journey? You have {issuedBooks.filter(b => b.status === 'issued').length} books currently issued.
                    </p>
                    <button 
                        onClick={() => navigate('/user/browse')}
                        className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
                    >
                        Explore More Books
                    </button>
                </div>
                <div className="absolute right-[-5%] bottom-[-10%] opacity-10 text-[20rem]">
                    <FiBook />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                    onClick={() => navigate('/user/issued')}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-blue-200 cursor-pointer transition-colors"
                >
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FiBook />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Currently Reading</p>
                        <p className="text-2xl font-bold text-slate-800">{issuedBooks.filter(b => b.status === 'issued').length}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-orange-200 transition-colors">
                    <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 text-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <FiClock />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Overdue Books</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {issuedBooks.filter(b => b.status === 'issued' && new Date(b.dueDate) < new Date()).length}
                        </p>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/user/returned')}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-emerald-200 cursor-pointer transition-colors"
                >
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <FiCalendar />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Books Read</p>
                        <p className="text-2xl font-bold text-slate-800">{issuedBooks.filter(b => b.status === 'returned').length}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 text-center">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                        onClick={() => navigate('/user/browse')}
                        className="p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-100 flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
                    >
                        <FiBook className="text-3xl" />
                        <span className="font-bold">Browse Books</span>
                    </button>
                    <button 
                        onClick={() => navigate('/user/issued')}
                        className="p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl shadow-lg shadow-orange-100 flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
                    >
                        <FiBookOpen className="text-3xl" />
                        <span className="font-bold">Issued Books</span>
                    </button>
                    <button 
                        onClick={() => navigate('/user/returned')}
                        className="p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl shadow-lg shadow-emerald-100 flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
                    >
                        <FiCheckCircle className="text-3xl" />
                        <span className="font-bold">Returned Books</span>
                    </button>
                    <button 
                        onClick={() => navigate('/user/wishlist')}
                        className="p-6 bg-rose-500 hover:bg-rose-600 text-white rounded-3xl shadow-lg shadow-rose-100 flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
                    >
                        <FiHeart className="text-3xl" />
                        <span className="font-bold">Wishlist</span>
                    </button>
                </div>
            </div>

            {/* Recently Issued */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">My Library</h2>
                    <button 
                        onClick={() => navigate('/user/returned')}
                        className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                    >
                        View History <FiArrowRight />
                    </button>
                </div>
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
                            {issuedBooks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <FiBook className="text-6xl mb-4" />
                                            <p className="text-lg font-medium">No books in your library yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                issuedBooks.map((issue) => (
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
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                                issue.status === 'issued' 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {issue.status === 'issued' ? 'Active' : 'Returned'}
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

export default MemberDashboard;
