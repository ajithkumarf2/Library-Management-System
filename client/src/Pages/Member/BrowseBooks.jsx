import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiMic, FiHeart, FiEye, FiBookOpen, FiShoppingCart } from 'react-icons/fi';

const BrowseBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [wishlist, setWishlist] = useState([]);

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                                        onClick={() => toast('Reader opening...')}
                                        className="p-3 bg-white text-blue-600 rounded-xl hover:scale-110 transition-transform"
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
                                    <button 
                                        onClick={() => {
                                            if (!wishlist.includes(book.id)) toggleWishlist(book.id);
                                            else toast.success('Already in wishlist');
                                        }}
                                        className="p-3 bg-white text-green-600 rounded-xl hover:scale-110 transition-transform"
                                    >
                                        <FiShoppingCart title="Buy / Add to Wishlist" />
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
