import './index.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { CartProvider } from './shared/context/CartContext';

// Customer pages
import LoginPage from './modules/customer/pages/LoginPage';
import RegisterPage from './modules/customer/pages/RegisterPage';
import HomePage from './modules/customer/pages/HomePage';
import CartPage from './modules/customer/pages/CartPage';
import OrderHistoryPage from './modules/customer/pages/OrderHistoryPage';
import OrderStatusPage from './modules/customer/pages/OrderStatusPage';
import ProfilePage from './modules/customer/pages/ProfilePage';

// Staff pages
import StaffLoginPage from './modules/staff/pages/StaffLoginPage';
import CashierPOSPage from './modules/staff/pages/CashierPOSPage';
import OnlineOrdersPage from './modules/staff/pages/OnlineOrdersPage';

// Admin pages
import AdminLoginPage from './modules/admin/pages/AdminLoginPage';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import AdminMenuPage from './modules/admin/pages/AdminMenuPage';
import AdminTablePage from './modules/admin/pages/AdminTablePage';
import AdminStaffPage from './modules/admin/pages/AdminStaffPage';
import AdminOrdersPage from './modules/admin/pages/AdminOrdersPage';
import AdminReportsPage from './modules/admin/pages/AdminReportsPage';
import AdminInventoryPage from './modules/admin/pages/AdminInventoryPage';

// Protected Route Component for Customers
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component to update document title based on route
const PageTitleUpdater = () => {
    const location = useLocation();

    React.useEffect(() => {
        const path = location.pathname;
        let title = 'Nhà Hàng Cơm Bình Dân';

        // Customer routes
        if (path === '/') title = 'Thực đơn - Cơm Bình Dân';
        else if (path === '/login') title = 'Đăng nhập - Cơm Bình Dân';
        else if (path === '/register') title = 'Đăng ký - Cơm Bình Dân';
        else if (path === '/cart') title = 'Giỏ hàng - Cơm Bình Dân';
        else if (path === '/orders') title = 'Lịch sử đơn hàng - Cơm Bình Dân';
        else if (path.includes('/status')) title = 'Trạng thái đơn hàng - Cơm Bình Dân';
        else if (path === '/profile') title = 'Thông tin cá nhân - Cơm Bình Dân';

        // Staff routes
        else if (path === '/staff/login') title = 'Đăng nhập Nhân viên - Cơm Bình Dân';
        else if (path === '/staff/pos') title = 'Bán hàng - Cơm Bình Dân';
        else if (path === '/staff/orders') title = 'Đơn hàng online - Cơm Bình Dân';

        // Admin routes
        else if (path === '/admin/login') title = 'Đăng nhập Quản trị - Cơm Bình Dân';
        else if (path === '/admin' || path === '/admin/dashboard') title = 'Tổng quan - Quản trị Cơm Bình Dân';
        else if (path === '/admin/menu') title = 'Quản lý thực đơn - Quản trị Cơm Bình Dân';
        else if (path === '/admin/tables') title = 'Quản lý bàn - Quản trị Cơm Bình Dân';
        else if (path === '/admin/staff') title = 'Quản lý nhân viên - Quản trị Cơm Bình Dân';
        else if (path === '/admin/orders') title = 'Quản lý đơn hàng - Quản trị Cơm Bình Dân';
        else if (path === '/admin/reports') title = 'Báo cáo thống kê - Quản trị Cơm Bình Dân';
        else if (path === '/admin/inventory') title = 'Quản lý kho - Quản trị Cơm Bình Dân';

        document.title = title;
    }, [location]);

    return null;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <PageTitleUpdater />
                    <Routes>
                        {/* Customer Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <OrderHistoryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders/:orderId/status"
                            element={
                                <ProtectedRoute>
                                    <OrderStatusPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Staff Routes */}
                        <Route path="/staff/login" element={<StaffLoginPage />} />
                        <Route path="/staff/pos" element={<CashierPOSPage />} />
                        <Route path="/staff/orders" element={<OnlineOrdersPage />} />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/menu" element={<AdminMenuPage />} />
                        <Route path="/admin/tables" element={<AdminTablePage />} />
                        <Route path="/admin/staff" element={<AdminStaffPage />} />
                        <Route path="/admin/orders" element={<AdminOrdersPage />} />
                        <Route path="/admin/reports" element={<AdminReportsPage />} />
                        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
