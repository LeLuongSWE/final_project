import React from 'react';

// =============================================
// WIREFRAME SKELETON - CASHIER POS PAGE
// Simplified version for demo/documentation
// =============================================

const CashierPOSPage = () => {
    return (
        <div className="h-screen flex bg-gray-100">
            {/* ===== LEFT PANEL - PRODUCT GRID ===== */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl">🍚</span>
                        <div>
                            <h1 className="font-bold">CƠM BÌNH DÂN - POS</h1>
                            <p className="text-sm opacity-80">Ca: #123 | Thu ngân: Nguyễn Văn A</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-500 rounded">📦 Đơn online</button>
                        <button className="px-4 py-2 bg-red-500 rounded">🚪 Kết ca</button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 p-4 bg-white border-b overflow-x-auto">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">Tất cả</div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg whitespace-nowrap">MÓN MẶN</div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg whitespace-nowrap">RAU/CANH</div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg whitespace-nowrap">CƠM THÊM</div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg whitespace-nowrap">NƯỚC</div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition">
                                <div className="h-16 bg-gray-200 rounded mb-2 flex items-center justify-center text-2xl">
                                    🍚
                                </div>
                                <div className="h-3 bg-gray-300 rounded mb-1"></div>
                                <div className="h-3 bg-orange-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== RIGHT PANEL - ORDER DETAILS ===== */}
            <div className="w-96 bg-white border-l flex flex-col">
                {/* Order Header */}
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">🧾 Đơn hàng hiện tại</h2>
                        <span className="text-sm text-gray-500">Bàn: --</span>
                    </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 pb-3 border-b">
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">🍚</div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-orange-200 rounded w-1/3"></div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="w-6 h-6 bg-gray-200 rounded">-</button>
                                    <span className="w-6 text-center">2</span>
                                    <button className="w-6 h-6 bg-blue-600 text-white rounded">+</button>
                                </div>
                                <button className="text-red-500">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span>Tạm tính:</span>
                            <span>75,000đ</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Tổng cộng:</span>
                            <span className="text-blue-600">75,000đ</span>
                        </div>
                    </div>

                    {/* Payment Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-3 bg-green-500 text-white rounded-lg font-bold">
                            💵 Tiền mặt
                        </button>
                        <button className="py-3 bg-blue-500 text-white rounded-lg font-bold">
                            📱 VietQR
                        </button>
                    </div>
                    <button className="w-full mt-2 py-2 bg-gray-200 text-gray-700 rounded-lg">
                        🗑️ Xóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashierPOSPage;
