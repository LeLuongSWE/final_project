import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, activePage }) => {
    const navigate = useNavigate();
    const adminUser = JSON.parse(sessionStorage.getItem('adminUser') || '{}');

    const handleLogout = () => {
        sessionStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Tổng quan', icon: '📊' },
        { path: '/admin/menu', label: 'Quản lý Thực đơn', icon: '🍽️' },
        { path: '/admin/tables', label: 'Quản lý Bàn ăn', icon: '🪑' },
        { path: '/admin/staff', label: 'Quản lý Nhân viên', icon: '👥' },
        { path: '/admin/orders', label: 'Quản lý Đơn hàng', icon: '📦' },
        { path: '/admin/inventory', label: 'Quản lý Nguyên liệu', icon: '🥬' },
        { path: '/admin/reports', label: 'Báo cáo Thống kê', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - fixed/sticky on scroll */}
            <aside className="w-64 bg-gray-800 flex flex-col sticky top-0 h-screen">
                {/* Logo - matching header height */}
                <div className="h-14 px-4 flex items-center bg-gray-900 border-b border-gray-700">
                    <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-xl mr-3">
                        🍚
                    </div>
                    <span className="font-black text-lg text-white">Cơm Bình Dân 123</span>
                </div>

                {/* Menu Items - scrollable if needed */}
                <nav className="flex-1 p-2 overflow-y-auto">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `block px-4 py-3 mb-1 rounded-lg font-bold transition ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header - sticky on scroll */}
                <header className="h-14 bg-gray-800 px-6 flex justify-between items-center border-b border-gray-700 sticky top-0 z-10">
                    <h1 className="text-xl font-black text-white">{activePage}</h1>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-300">
                            [Admin: {adminUser.fullName || 'Quản lý'}]
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
