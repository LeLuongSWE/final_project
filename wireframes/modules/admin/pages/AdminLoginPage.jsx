import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN LOGIN PAGE
// Simplified version for demo/documentation
// =============================================

const AdminLoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4">
                        👨‍💼
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản trị viên</h1>
                    <p className="text-gray-500">Hệ thống quản lý cơm bình dân</p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            👤 admin
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            🔒 ••••••••
                        </div>
                    </div>

                    <button className="w-full h-12 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition">
                        Đăng nhập Admin
                    </button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ Khu vực chỉ dành cho quản trị viên. Mọi hoạt động đều được ghi nhận.
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
