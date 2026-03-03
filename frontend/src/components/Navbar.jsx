import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Plus, Brain, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => { logout(); navigate('/'); };

    const isActive = (path) =>
        pathname === path ? 'text-violet-400 bg-violet-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Avatar initials
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/80 bg-gray-950/85 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Mock<span className="gradient-text">Mate</span>
                    </span>
                </Link>

                {/* Nav */}
                {user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className={`hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all ${isActive('/dashboard')}`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>

                        <Link to="/interview/new" className="btn-primary text-sm py-2 px-4">
                            <Plus className="w-4 h-4" /> New Interview
                        </Link>

                        {/* User menu */}
                        <div className="relative ml-1" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-800"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {initials}
                                </div>
                                <span className="hidden sm:block text-sm text-gray-300 max-w-[100px] truncate">{user.name}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 glass-dark rounded-xl shadow-xl border border-gray-800 overflow-hidden animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-800">
                                        <div className="text-sm font-medium text-white truncate">{user.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors sm:hidden"
                                    >
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
