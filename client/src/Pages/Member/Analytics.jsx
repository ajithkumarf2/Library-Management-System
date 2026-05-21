import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiBook, FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('/issues/analytics');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Could not load reading data');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'FiBook': return <FiBook />;
            case 'FiCheckCircle': return <FiCheckCircle />;
            case 'FiClock': return <FiClock />;
            case 'FiAward': return <FiAward />;
            default: return <FiBook />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Analyzing your reading habits...</p>
                </div>
            </div>
        );
    }

    const { stats, genres, activity } = data || { stats: [], genres: [], activity: [] };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Reading Analytics</h1>
                <p className="text-slate-500">Track your progress and reading habits</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                        <div className={`${stat.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                            {getIcon(stat.icon)}
                        </div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Genre Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Genre Distribution</h3>
                    {genres.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 italic">No genre data available yet.</div>
                    ) : (
                        <div className="space-y-6">
                            {genres.map((genre, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-700">{genre.name}</span>
                                        <span className="text-slate-500">{genre.percentage}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${genre.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${genre.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Monthly Activity */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Reading Activity (History)</h3>
                    {activity.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 italic">No activity data recorded in the last 6 months.</div>
                    ) : (
                        (() => {
                            const maxCount = Math.max(...activity.map(a => Number(a.count || 0)), 0) || 1;
                            return (
                                <div className="flex flex-col justify-between h-48">
                                    <div className="flex items-end justify-between h-40 gap-2">
                                        {activity.map((item, i) => {
                                            const barHeight = `${(Number(item.count || 0) / maxCount) * 100}%`;
                                            return (
                                                <div key={i} className="flex-1 h-full flex items-end">
                                                    <div 
                                                        className="w-full bg-blue-100 rounded-t-xl group relative cursor-pointer"
                                                        style={{ height: barHeight }}
                                                    >
                                                        <div className="absolute inset-0 bg-blue-600 rounded-t-xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {item.count} books
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between gap-2 mt-2">
                                        {activity.map((item, i) => (
                                            <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase">{item.month}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>


        </div>
    );
};

export default Analytics;
