import React from 'react';

// =============================================
// WIREFRAME SKELETON - HOMEPAGE
// Simplified version for demo/documentation
// =============================================

const HomePage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-white border-r p-4">
                <div className="mb-8">
                    <div className="h-12 bg-orange-200 rounded flex items-center justify-center font-bold">
                        🍚 LOGO
                    </div>
                </div>

                <nav className="space-y-2">
                    <div className="h-10 bg-orange-100 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">🛒 Giỏ hàng</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">👤 Tài khoản</div>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-10 bg-red-100 rounded flex items-center justify-center">🚪 Đăng xuất</div>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg mb-6 flex items-center justify-center text-white text-2xl font-bold">
                    🎉 BANNER QUẢNG CÁO
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <div className="px-4 py-2 bg-orange-500 text-white rounded-full whitespace-nowrap">Tất cả</div>
                    <div className="px-4 py-2 bg-gray-200 rounded-full whitespace-nowrap">MÓN MẶN</div>
                    <div className="px-4 py-2 bg-gray-200 rounded-full whitespace-nowrap">RAU/CANH</div>
                    <div className="px-4 py-2 bg-gray-200 rounded-full whitespace-nowrap">CƠM THÊM</div>
                    <div className="px-4 py-2 bg-gray-200 rounded-full whitespace-nowrap">NƯỚC</div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white rounded-lg shadow p-4">
                            <div className="h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-4xl">
                                🍚
                            </div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-orange-200 rounded w-1/3"></div>
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">+</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* ===== CART FLOATING BUTTON ===== */}
            <div className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl">
                🛒
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
            </div>
        </div>
    );
};

export default HomePage;
