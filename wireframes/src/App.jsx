import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Customer pages
import HomePage from '../modules/customer/pages/HomePage';
import CartPage from '../modules/customer/pages/CartPage';
import LoginPage from '../modules/customer/pages/LoginPage';
import ProfilePage from '../modules/customer/pages/ProfilePage';
import OrderStatusPage from '../modules/customer/pages/OrderStatusPage';

// Staff pages
import StaffLoginPage from '../modules/staff/pages/StaffLoginPage';
import CashierPOSPage from '../modules/staff/pages/CashierPOSPage';
import OnlineOrdersPage from '../modules/staff/pages/OnlineOrdersPage';

// Admin pages
import AdminLoginPage from '../modules/admin/pages/AdminLoginPage';
import AdminDashboard from '../modules/admin/pages/AdminDashboard';
import AdminMenuPage from '../modules/admin/pages/AdminMenuPage';
import AdminInventoryPage from '../modules/admin/pages/AdminInventoryPage';
import AdminReportsPage from '../modules/admin/pages/AdminReportsPage';
import AdminStaffPage from '../modules/admin/pages/AdminStaffPage';

// Index page with navigation
const IndexPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2">🍚 Wireframe Demo</h1>
            <p className="text-center text-gray-600 mb-8">Cơm Bình Dân - Frontend Skeleton</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Module */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                        👤 Customer
                    </h2>
                    <div className="space-y-2">
                        <Link to="/customer/home" className="block p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                            🏠 HomePage
                        </Link>
                        <Link to="/customer/cart" className="block p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                            🛒 CartPage
                        </Link>
                        <Link to="/customer/login" className="block p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                            🔐 LoginPage
                        </Link>
                        <Link to="/customer/profile" className="block p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                            👤 ProfilePage
                        </Link>
                        <Link to="/customer/order-status" className="block p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                            📦 OrderStatusPage
                        </Link>
                    </div>
                </div>

                {/* Staff Module */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                        👨‍💼 Staff
                    </h2>
                    <div className="space-y-2">
                        <Link to="/staff/login" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                            🔐 StaffLoginPage
                        </Link>
                        <Link to="/staff/pos" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                            💰 CashierPOSPage
                        </Link>
                        <Link to="/staff/online-orders" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                            📦 OnlineOrdersPage
                        </Link>
                    </div>
                </div>

                {/* Admin Module */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        👨‍💼 Admin
                    </h2>
                    <div className="space-y-2">
                        <Link to="/admin/login" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            🔐 AdminLoginPage
                        </Link>
                        <Link to="/admin/dashboard" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            📊 AdminDashboard
                        </Link>
                        <Link to="/admin/menu" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            📋 AdminMenuPage
                        </Link>
                        <Link to="/admin/inventory" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            📦 AdminInventoryPage
                        </Link>
                        <Link to="/admin/reports" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            📈 AdminReportsPage
                        </Link>
                        <Link to="/admin/staff" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            👥 AdminStaffPage
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
                Click vào từng trang để xem wireframe demo
            </div>
        </div>
    </div>
);

// Back button component - Press 'B' to toggle visibility
const BackButton = () => {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'b' || e.key === 'B') {
                setVisible(v => !v);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (!visible) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2"
        >
            ← Quay lại Menu
        </Link>
    );
};

// Wrapper component
const PageWrapper = ({ children }) => (
    <>
        <BackButton />
        {children}
    </>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IndexPage />} />

                {/* Customer Routes */}
                <Route path="/customer/home" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/customer/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
                <Route path="/customer/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                <Route path="/customer/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                <Route path="/customer/order-status" element={<PageWrapper><OrderStatusPage /></PageWrapper>} />

                {/* Staff Routes */}
                <Route path="/staff/login" element={<PageWrapper><StaffLoginPage /></PageWrapper>} />
                <Route path="/staff/pos" element={<PageWrapper><CashierPOSPage /></PageWrapper>} />
                <Route path="/staff/online-orders" element={<PageWrapper><OnlineOrdersPage /></PageWrapper>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<PageWrapper><AdminLoginPage /></PageWrapper>} />
                <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                <Route path="/admin/menu" element={<PageWrapper><AdminMenuPage /></PageWrapper>} />
                <Route path="/admin/inventory" element={<PageWrapper><AdminInventoryPage /></PageWrapper>} />
                <Route path="/admin/reports" element={<PageWrapper><AdminReportsPage /></PageWrapper>} />
                <Route path="/admin/staff" element={<PageWrapper><AdminStaffPage /></PageWrapper>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
