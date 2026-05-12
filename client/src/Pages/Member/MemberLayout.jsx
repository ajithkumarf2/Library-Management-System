import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FiHome, FiBook, FiHeart, FiPieChart, FiCpu, FiBell, FiLogOut, FiMenu, FiX, FiBookOpen, FiCheckCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const MemberLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Your book 'The Great Gatsby' is due in 2 days", type: 'warning' },
        { id: 2, text: "New arrival: 'Atomic Habits' is now available", type: 'info' }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [member, setMember] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/user/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/user/browse', icon: <FiBook />, label: 'Browse Books' },
        { path: '/user/issued', icon: <FiBookOpen />, label: 'Issued Books' },
        { path: '/user/returned', icon: <FiCheckCircle />, label: 'Returned Books' },
        { path: '/user/ai-recs', icon: <FiCpu />, label: 'AI Recommendations' },
        { path: '/user/wishlist', icon: <FiHeart />, label: 'Wishlist' },
        { path: '/user/analytics', icon: <FiPieChart />, label: 'My Analytics' },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/members/profile');
            setMember(response.data);
        } catch (error) {
            console.error('Layout profile error:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get('/members/logout');
            localStorage.removeItem('libraUserToken');
            localStorage.removeItem('libraUserData');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white text-xl">
                        <FiBookOpen />
                    </div>
                    {isSidebarOpen && <span className="font-bold text-xl text-slate-800 tracking-tight">LibraNext</span>}
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                location.pathname === item.path 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <span className="text-xl"><FiLogOut /></span>
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        {isSidebarOpen ? <FiX /> : <FiMenu />}
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative"
                            >
                                <FiBell className="text-xl" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                            
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50">
                                    <div className="px-4 pb-2 border-b border-slate-50 mb-2 flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800">Notifications</h4>
                                        <button className="text-xs text-blue-600 font-medium">Clear all</button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map(n => (
                                            <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3">
                                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                                <p className="text-sm text-slate-600">{n.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                                {getInitials(member?.name)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">{member?.name || 'Loading...'}</p>
                                <p className="text-xs text-slate-500 font-medium">{member?.membershipType || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemberLayout;
