import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../../shared/context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/profile" />

            <main className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Tài khoản cá nhân</h1>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                value={user?.full_name || ''}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <input
                                type="text"
                                value={user?.role_name || 'Khách hàng'}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                            <input
                                type="text"
                                value={
                                    user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                                        : 'N/A'
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Để thay đổi thông tin tài khoản, vui lòng liên hệ quản trị viên.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
