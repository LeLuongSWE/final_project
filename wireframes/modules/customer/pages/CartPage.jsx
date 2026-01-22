import React from 'react';

// =============================================
// WIREFRAME SKELETON - CART PAGE
// Simplified version for demo/documentation
// =============================================

const CartPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-white border-r p-4">
                <div className="h-12 bg-orange-200 rounded flex items-center justify-center font-bold mb-8">
                    🍚 LOGO
                </div>
                <nav className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 bg-orange-100 rounded px-3 flex items-center">🛒 Giỏ hàng</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">👤 Tài khoản</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">🛒 Giỏ hàng của bạn</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-2xl">🍚</div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-orange-200 rounded w-1/4"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">-</div>
                                    <span className="w-8 text-center">2</span>
                                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">+</div>
                                </div>
                                <div className="w-24 text-right font-bold text-orange-600">30,000đ</div>
                                <button className="text-red-500">✕</button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        {/* Address Section */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold mb-3">📍 Địa chỉ giao hàng</h3>
                            <div className="space-y-2">
                                <div className="border-2 border-orange-400 rounded p-3 bg-orange-50">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" checked readOnly />
                                        <span>🏠 Nhà</span>
                                        <span className="bg-orange-500 text-white text-xs px-2 rounded">Mặc định</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Nguyễn Văn A - 0912345678</div>
                                    <div className="text-sm text-gray-500">123 Đường ABC, Quận 1, TP.HCM</div>
                                </div>
                                <div className="border rounded p-3">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" readOnly />
                                        <span>🏢 Công ty</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Nguyễn Văn A - 0912345678</div>
                                    <div className="text-sm text-gray-500">456 Đường XYZ, Quận 2, TP.HCM</div>
                                </div>
                            </div>
                            <a href="#" className="text-orange-600 text-sm mt-2 inline-block">+ Quản lý địa chỉ</a>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold mb-3">📋 Tổng đơn hàng</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>90,000đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí giao hàng:</span>
                                    <span className="text-green-600">Miễn phí</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-orange-600">90,000đ</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-orange-500 text-white py-3 rounded-lg font-bold">
                                Thanh toán VietQR
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CartPage;
