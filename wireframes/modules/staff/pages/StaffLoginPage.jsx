import React from 'react';

// =============================================
// WIREFRAME SKELETON - STAFF LOGIN PAGE
// Simplified version for demo/documentation
// =============================================

const StaffLoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4">
                        👨‍💼
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Đăng nhập Nhân viên</h1>
                    <p className="text-gray-500">Hệ thống quản lý bán hàng</p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            👤 nv_username
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            🔒 ••••••••
                        </div>
                    </div>

                    <button className="w-full h-12 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                        Đăng nhập
                    </button>
                </form>

                {/* Role Badges */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Vai trò được hỗ trợ:</p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">💰 Thu ngân</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">👨‍🍳 Bếp</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLoginPage;
