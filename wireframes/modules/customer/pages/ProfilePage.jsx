import React from 'react';

// =============================================
// WIREFRAME SKELETON - PROFILE PAGE
// Simplified version for demo/documentation
// =============================================

const ProfilePage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-white border-r p-4">
                <div className="h-12 bg-orange-200 rounded flex items-center justify-center font-bold mb-8">
                    🍚 LOGO
                </div>
                <nav className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">🛒 Giỏ hàng</div>
                    <div className="h-10 bg-gray-100 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 bg-orange-100 rounded px-3 flex items-center">👤 Tài khoản</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">👤 Tài khoản cá nhân</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow">
                    <button className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium">
                        👤 Thông tin cá nhân
                    </button>
                    <button className="flex-1 py-3 px-4 text-gray-600 rounded-lg font-medium hover:bg-gray-100">
                        🔐 Đổi mật khẩu
                    </button>
                    <button className="flex-1 py-3 px-4 text-gray-600 rounded-lg font-medium hover:bg-gray-100">
                        📍 Địa chỉ giao hàng
                    </button>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                            <div className="h-12 bg-gray-100 rounded-lg border px-4 flex items-center text-gray-500">
                                testuser (không thể thay đổi)
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <div className="h-12 bg-white rounded-lg border-2 border-gray-200 px-4 flex items-center">
                                Nguyễn Văn A
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="h-12 bg-white rounded-lg border-2 border-gray-200 px-4 flex items-center">
                                example@email.com
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <div className="h-12 bg-white rounded-lg border-2 border-gray-200 px-4 flex items-center">
                                0912345678
                            </div>
                        </div>

                        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

                {/* Address List Preview (when on address tab) */}
                <div className="bg-white rounded-lg shadow p-6 max-w-2xl mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">📍 Địa chỉ giao hàng</h2>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">+ Thêm địa chỉ</button>
                    </div>

                    <div className="space-y-3">
                        <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-medium">🏠 Nhà</span>
                                    <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">Mặc định</span>
                                    <p className="text-gray-800 mt-1">Nguyễn Văn A - 0912345678</p>
                                    <p className="text-gray-600 text-sm">123 Đường ABC, Phường 1, Quận 1, TP.HCM</p>
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <button className="text-blue-600">Sửa</button>
                                    <button className="text-red-600">Xóa</button>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-medium">🏢 Công ty</span>
                                    <p className="text-gray-800 mt-1">Nguyễn Văn A - 0987654321</p>
                                    <p className="text-gray-600 text-sm">456 Đường XYZ, Phường 2, Quận 2, TP.HCM</p>
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <button className="text-orange-600">Đặt mặc định</button>
                                    <button className="text-blue-600">Sửa</button>
                                    <button className="text-red-600">Xóa</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
