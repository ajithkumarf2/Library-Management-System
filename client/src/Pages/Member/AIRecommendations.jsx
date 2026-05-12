import React, { useState } from 'react';
import axios from 'axios';
import { FiSend, FiCpu, FiUser, FiZap, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AIRecommendations = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            role: 'assistant', 
            text: "Hello! I'm your Library AI assistant. Tell me what you've enjoyed reading lately, or what genres you're interested in, and I'll recommend some books from our collection!" 
        }
    ]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: prompt };
        setMessages(prev => [...prev, userMsg]);
        setPrompt('');
        try {
            const response = await axios.post('/ai/recommend', { prompt });
            
            const assistantMsg = { 
                id: Date.now() + 1, 
                role: 'assistant', 
                text: response.data.text,
                recs: response.data.recs || []
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = error.response?.data?.message || "I'm sorry, I encountered an error while trying to process your request. Please ensure the backend is properly configured with an AI API key.";
            toast.error(errorMessage);
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: errorMessage
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-3 rounded-2xl text-white text-2xl shadow-lg shadow-indigo-200">
                    <FiCpu />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">AI Recommendations</h1>
                    <p className="text-slate-500">Personalized suggestions powered by Gemini AI</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-sm ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-indigo-600'
                                }`}>
                                    {msg.role === 'user' ? <FiUser /> : <FiCpu />}
                                </div>
                                <div className={`p-4 rounded-2xl ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                                }`}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                    
                                    {msg.recs && (
                                        <div className="mt-4 grid grid-cols-1 gap-2">
                                            {msg.recs.map(rec => (
                                                <div key={rec.id} className="bg-white/50 backdrop-blur p-3 rounded-xl border border-white/20 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer group">
                                                    <div className="flex items-center gap-3">
                                                        <FiBook className="text-indigo-600" />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{rec.title}</p>
                                                            <p className="text-[10px] text-slate-500">{rec.author}</p>
                                                        </div>
                                                    </div>
                                                    <FiZap className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600">
                                    <FiCpu />
                                </div>
                                <div className="bg-slate-100 h-10 w-32 rounded-2xl"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            placeholder="Type your reading preferences..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendations;
