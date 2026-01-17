import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, History, User, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useCart } from '../../../shared/context/CartContext';

const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: History, label: 'Lịch sử đơn hàng', path: '/orders' },
    { icon: User, label: 'Tài khoản cá nhân', path: '/profile' },
    { icon: ShoppingCart, label: 'Giỏ hàng', path: '/cart', badge: true },
];

function Sidebar({ activePath = '/' }) {
    const { logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">🍚</span>
                </div>
                <h1 className="text-center mt-3 font-bold text-gray-800 text-lg">
                    Cơm Bình Dân 123
                </h1>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activePath === item.path;
                        const isCart = item.path === '/cart';
                        const displayBadge = isCart && itemCount > 0;

                        return (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-orange-50 text-orange-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="flex-1">{item.label}</span>
                                    {displayBadge && (
                                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {itemCount}
                                        </span>
                                    )}
                                    {isCart && !displayBadge && (
                                        <span className="text-gray-400 text-sm">({itemCount})</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}

                    {/* Logout Button */}
                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut size={20} strokeWidth={2} />
                            <span className="flex-1 text-left">Thoát</span>
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-400">
                © 2025 Cơm Bình Dân 123
            </div>
        </aside>
    );
}

export default Sidebar;
