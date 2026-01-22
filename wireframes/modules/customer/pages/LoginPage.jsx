import React from 'react';

// =============================================
// WIREFRAME SKELETON - LOGIN PAGE
// Simplified version for demo/documentation
// =============================================

const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4">
                        🍚
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
                    <p className="text-gray-500">Chào mừng bạn quay lại!</p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            👤 username
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="h-12 bg-gray-100 rounded-lg border-2 border-gray-200 px-4 flex items-center text-gray-400">
                            🔒 ••••••••
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                        <a href="#" className="text-orange-600 hover:underline">Quên mật khẩu?</a>
                    </div>

                    <button className="w-full h-12 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition">
                        Đăng nhập
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Chưa có tài khoản? </span>
                    <a href="#" className="text-orange-600 font-medium hover:underline">Đăng ký ngay</a>
                </div>

                {/* Social Login */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button className="flex-1 h-12 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                            <span>🔵</span> Google
                        </button>
                        <button className="flex-1 h-12 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                            <span>🔷</span> Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
