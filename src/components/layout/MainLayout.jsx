import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { Icon } from '../ui/Icons';

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'home', label: 'Accueil', icon: 'LayoutDashboard', path: '/' },
        { id: 'startups', label: 'Startups', icon: 'Building2', path: '/startups' },
        { id: 'offers', label: 'Opportunités', icon: 'Briefcase', path: '/offers' },
        { id: 'messages', label: 'Messages', icon: 'MessageSquare', path: '/messages' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ id: 'admin', label: 'Admin', icon: 'ShieldAlert', path: '/admin' });
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-16">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="w-10 h-10 bg-theme rounded-lg flex items-center justify-center text-white">
                            S
                        </div>
                        <span className="hidden md:inline">
                            Startup<span className="text-theme">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-1">
                        {navItems.map(item => (
                            <Link key={item.id} to={item.path}>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-gray-600 hover:bg-gray-50 hover:text-theme transition">
                                    <Icon name={item.icon} size={18} />
                                    {item.label}
                                </button>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                            <Icon name="Bell" size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.displayName}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-theme-light flex items-center justify-center text-sm font-bold text-theme">
                                {user?.displayName?.substring(0, 2).toUpperCase()}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 transition"
                                title="Déconnexion"
                            >
                                <Icon name="LogOut" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto pt-20 pb-10 px-4 md:px-6">
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
                <div className="grid grid-cols-5 gap-1 p-2">
                    {navItems.map(item => (
                        <Link key={item.id} to={item.path}>
                            <button className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-theme transition">
                                <Icon name={item.icon} size={20} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
