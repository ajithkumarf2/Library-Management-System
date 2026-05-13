import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiMic, FiHeart, FiEye, FiBookOpen, FiX } from 'react-icons/fi';

const BrowseBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [showReader, setShowReader] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);

    useEffect(() => {
        fetchBooks();
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await axios.get('/wishlist');
            setWishlist(response.data.map(item => item.id)); // Assuming item.id is bookId from JOIN
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('/books');
            setBooks(response.data);
        } catch (error) {
            toast.error('Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (!val) {
            fetchBooks();
            return;
        }
        try {
            const response = await axios.get(`/books/search?query=${val}`);
            setBooks(response.data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const toggleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice search not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            toast('Listening...', { icon: '🎤' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSearch(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error('Voice recognition error');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const toggleWishlist = async (bookId) => {
        try {
            if (wishlist.includes(bookId)) {
                await axios.delete(`/wishlist/${bookId}`);
                setWishlist(wishlist.filter(id => id !== bookId));
                toast.success('Removed from wishlist');
            } else {
                await axios.post('/wishlist/add', { bookId });
                setWishlist([...wishlist, bookId]);
                toast.success('Added to wishlist', { icon: '❤️' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update wishlist');
        }
    };

    const openDocument = async (book) => {
        if (!book.document) {
            toast.error('No document available for this book');
            return;
        }

        const isWordDoc = book.document.toLowerCase().endsWith('.doc') || book.document.toLowerCase().endsWith('.docx');
        if (isWordDoc) {
            toast.error('Word documents must be downloaded to read. Please use PDF for Read-Only mode.');
        }

        const loadingToast = toast.loading('Opening secure reader...');
        try {
            await axios.post('/issues/self-issue', { bookId: book.id });
            
            const serverBase = axios.defaults.baseURL.replace('/api', '');
            const url = `${serverBase}/${book.document.replace(/\\/g, '/')}`;
            
            setCurrentDoc(url);
            setShowReader(true);
            toast.success('Secure session started', { id: loadingToast });
        } catch (error) {
            console.error('Error opening book:', error);
            toast.error('Failed to open reader', { id: loadingToast });
        }
    };

    // Block keyboard shortcuts for saving/printing
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
                        
                        {/* High-Security Shields */}
                        {/* Top shield - blocks the entire toolbar area */}
                        <div className="absolute top-0 left-0 w-full h-16 bg-transparent z-10 cursor-not-allowed"></div>
                        {/* Bottom shield - blocks potential bottom toolbars */}
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-transparent z-10 cursor-not-allowed"></div>
                        {/* Left/Right click protection */}
                        <div className="absolute inset-y-0 left-0 w-12 bg-transparent z-10 cursor-not-allowed"></div>
                        <div className="absolute inset-y-0 right-0 w-12 bg-transparent z-10 cursor-not-allowed"></div>
                        
                        {/* Watermark */}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Discover Books</h1>
                    <p className="text-slate-500">Explore thousands of titles in our collection</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        placeholder="Search title, author or category..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <button 
                        onClick={toggleVoiceSearch}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                            isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'hover:bg-slate-100 text-slate-400'
                        }`}
                    >
                        <FiMic className="text-xl" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-96 animate-pulse">
                            <div className="bg-slate-100 h-64 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-slate-700">No books found</h3>
                    <p className="text-slate-500">Try searching for something else</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <div 
                            key={book.id} 
                            className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4">
                                <img 
                                    src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=687&auto=format&fit=crop`} 
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => openDocument(book)}
                                        className="p-3 bg-white text-blue-600 rounded-xl hover:scale-110 transition-transform"
                                        title="Read Book"
                                    >
                                        <FiBookOpen />
                                    </button>
                                    <button 
                                        onClick={() => toggleWishlist(book.id)}
                                        className={`p-3 rounded-xl hover:scale-110 transition-transform ${
                                            wishlist.includes(book.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-700'
                                        }`}
                                    >
                                        <FiHeart title="Add to Wishlist" />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        {book.category || 'General'}
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 line-clamp-1">{book.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">by {book.author}</p>
                            
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                    book.availableQuantity > 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                                }`}>
                                    {book.availableQuantity > 0 ? `${book.availableQuantity} Available` : 'Out of Stock'}
                                </span>
                                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Details <FiEye />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseBooks;
