import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBook, FiClock, FiBookOpen, FiX, FiRotateCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const IssuedBooks = () => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReader, setShowReader] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);

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

    const openDocument = async (issue) => {
        if (!issue.document) {
            toast.error('No document available for this book');
            return;
        }

        const isWordDoc = issue.document.toLowerCase().endsWith('.doc') || issue.document.toLowerCase().endsWith('.docx');
        if (isWordDoc) {
            toast.error('Word documents must be downloaded to read. Please use PDF for Read-Only mode.');
        }

        const loadingToast = toast.loading('Opening secure reader...');
        try {
            await axios.post('/issues/self-issue', { bookId: issue.bookId });
            
            const serverBase = axios.defaults.baseURL.replace('/api', '');
            const url = `${serverBase}/${issue.document.replace(/\\/g, '/')}`;
            
            setCurrentDoc(url);
            setShowReader(true);
            toast.success('Secure session started', { id: loadingToast });
        } catch (error) {
            console.error('Error opening book:', error);
            toast.error('Failed to open reader', { id: loadingToast });
        }
    };

    const handleReturn = async (issueId) => {
        const confirmReturn = window.confirm('Are you sure you want to return this book?');
        if (!confirmReturn) return;

        try {
            await axios.put(`/issues/self-return/${issueId}`);
            toast.success('Book returned successfully');
            fetchIssuedBooks(); // Refresh list
        } catch (error) {
            console.error('Return error:', error);
            toast.error(error.response?.data?.message || 'Failed to return book');
        }
    };

    // Block keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showReader && (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
                e.preventDefault();
                toast.error('Download, Print and Source view are disabled', { id: 'security-toast' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showReader]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Reader Modal */}
            {showReader && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-in zoom-in duration-300"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="flex justify-between items-center text-white mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <FiBookOpen className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Secure Library Reader</h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Protected Environment</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setShowReader(false);
                                setCurrentDoc(null);
                            }}
                            className="p-3 hover:bg-white/10 rounded-full transition-all text-3xl hover:rotate-90 duration-300"
                        >
                            <FiX />
                        </button>
                    </div>
                    
                    <div className="flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl border-4 border-white/10">
                        <iframe 
                            src={`${currentDoc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} 
                            className="w-full h-full border-none select-none"
                            onContextMenu={(e) => e.preventDefault()}
                            title="Book Reader"
                        />
                        
                        <div className="absolute top-0 left-0 w-full h-16 bg-transparent z-10 cursor-not-allowed"></div>
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-transparent z-10 cursor-not-allowed"></div>
                        <div className="absolute inset-y-0 left-0 w-12 bg-transparent z-10 cursor-not-allowed"></div>
                        <div className="absolute inset-y-0 right-0 w-12 bg-transparent z-10 cursor-not-allowed"></div>
                        
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-45 text-6xl font-bold text-white">
                            SECURE READER • DO NOT COPY
                        </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Secure Mode Active
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="text-white/40 text-sm font-medium">
                            Download and Printing Restricted
                        </div>
                    </div>
                </div>
            )}
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
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
                                                        isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {isOverdue && <FiClock />}
                                                        {isOverdue ? 'Overdue' : 'Active'}
                                                    </span>
                                                    <button 
                                                        onClick={() => openDocument(issue)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                        title="Read Now"
                                                    >
                                                        <FiBookOpen />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReturn(issue.id)}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                                        title="Return Book"
                                                    >
                                                        <FiRotateCcw />
                                                    </button>
                                                </div>
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
