import './index.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderStatusPage from './pages/OrderStatusPage';
import ProfilePage from './pages/ProfilePage';

// Staff pages
import StaffLoginPage from './pages/staff/StaffLoginPage';
import CashierPOSPage from './pages/staff/CashierPOSPage';
import OnlineOrdersPage from './pages/staff/OnlineOrdersPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminTablePage from './pages/admin/AdminTablePage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';

// Protected Route Component for Customers
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
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
