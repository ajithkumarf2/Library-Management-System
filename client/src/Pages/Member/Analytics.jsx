import React from 'react';
import { FiTrendingUp, FiBook, FiClock, FiAward } from 'react-icons/fi';

const Analytics = () => {
    const stats = [
        { label: 'Books Read', value: '12', color: 'bg-blue-500', icon: <FiBook /> },
        { label: 'Total Pages', value: '3,450', color: 'bg-purple-500', icon: <FiTrendingUp /> },
        { label: 'Reading Hours', value: '86h', color: 'bg-orange-500', icon: <FiClock /> },
        { label: 'Achievements', value: '5', color: 'bg-emerald-500', icon: <FiAward /> },
    ];

    const genres = [
        { name: 'Fiction', percentage: 45, color: 'bg-blue-500' },
        { name: 'Self-Help', percentage: 25, color: 'bg-purple-500' },
        { name: 'Science', percentage: 15, color: 'bg-orange-500' },
        { name: 'Biography', percentage: 15, color: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Reading Analytics</h1>
                <p className="text-slate-500">Track your progress and reading habits</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                        <div className={`${stat.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-${stat.color.split('-')[1]}-100`}>
                            {stat.icon}
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
                </div>

                {/* Monthly Activity Mock Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Reading Activity (6 Months)</h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {[40, 70, 45, 90, 65, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-blue-100 rounded-t-xl group relative cursor-pointer"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute inset-0 bg-blue-600 rounded-t-xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {Math.round(h * 1.5)} pages
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Achievement Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-2xl font-bold">You're on fire! 🔥</h3>
                    <p className="text-slate-400">You've read 3 books more than last month. Keep it up!</p>
                </div>
                <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                    View All Badges
                </button>
            </div>
        </div>
    );
};

export default Analytics;
