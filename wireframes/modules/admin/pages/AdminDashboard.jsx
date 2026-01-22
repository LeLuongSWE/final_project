import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN DASHBOARD
// Simplified version for demo/documentation
// =============================================

const AdminDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-gray-800 text-white">
                <div className="p-4 border-b border-gray-700">
                    <div className="h-12 bg-gray-700 rounded flex items-center justify-center font-bold">
                        👨‍💼 ADMIN PANEL
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    <div className="h-10 bg-gray-700 rounded px-3 flex items-center">📊 Dashboard</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">👥 Nhân viên</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Kho hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📈 Báo cáo</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">🪑 Bàn ăn</div>
                </nav>

                <div className="absolute bottom-4 left-4 right-4 w-56">
                    <div className="h-10 bg-red-600 rounded flex items-center justify-center cursor-pointer">
                        🚪 Đăng xuất
                    </div>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">💰</div>
                            <div>
                                <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
                                <p className="text-2xl font-bold text-blue-600">2,450,000đ</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
                            <div>
                                <p className="text-sm text-gray-500">Đơn hàng hôm nay</p>
                                <p className="text-2xl font-bold text-green-600">68</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🍚</div>
                            <div>
                                <p className="text-sm text-gray-500">Sản phẩm bán chạy</p>
                                <p className="text-2xl font-bold text-orange-600">Sườn xào</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">⚠️</div>
                            <div>
                                <p className="text-sm text-gray-500">Nguyên liệu sắp hết</p>
                                <p className="text-2xl font-bold text-red-600">3</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">📈 Doanh thu 7 ngày qua</h3>
                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                            [BIỂU ĐỒ DOANH THU]
                        </div>
                    </div>

                    {/* Orders Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">📊 Đơn hàng theo giờ</h3>
                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                            [BIỂU ĐỒ ĐƠN HÀNG]
                        </div>
                    </div>
                </div>

                {/* Recent Orders & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">🕐 Đơn hàng gần đây</h3>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center justify-between py-2 border-b">
                                    <div>
                                        <span className="font-medium">#DH00{i}</span>
                                        <span className="ml-2 text-sm text-gray-500">2 phút trước</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-600 font-medium">45,000đ</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Hoàn thành</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">⚠️ Nguyên liệu sắp hết</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Gạo tẻ</span>
                                <span className="text-red-600 font-medium">Còn 5kg</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Thịt lợn</span>
                                <span className="text-orange-600 font-medium">Còn 3kg</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Trứng gà</span>
                                <span className="text-orange-600 font-medium">Còn 20 quả</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
