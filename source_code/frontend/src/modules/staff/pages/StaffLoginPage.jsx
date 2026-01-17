import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axiosClient';

const StaffLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            const userData = response.data;
            const user = userData.user;

            // Check if login was successful
            if (!user) {
                setError(userData.message || 'Đăng nhập thất bại');
                setLoading(false);
                return;
            }

            // Check if user is CASHIER or ADMIN (roleId = 1 or 2)
            const allowedRoles = [1, 2]; // ADMIN = 1, CASHIER = 2
            if (!allowedRoles.includes(user.roleId)) {
                setError('Bạn không có quyền truy cập hệ thống bán hàng');
                setLoading(false);
                return;
            }

            // Store in sessionStorage (not localStorage - session only)
            sessionStorage.setItem('staffUser', JSON.stringify(user));

            // Start a new shift
            try {
                const shiftResponse = await api.post('/shifts/start', {
                    cashierId: user.userId
                });
                sessionStorage.setItem('currentShift', JSON.stringify(shiftResponse.data));
            } catch (shiftError) {
                // Check if already has active shift
                const activeShift = await api.get(`/shifts/active/${user.userId}`);
                sessionStorage.setItem('currentShift', JSON.stringify(activeShift.data));
            }

            navigate('/staff/pos');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">🍚</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Cơm Bình Dân 123</h1>
                    <p className="text-gray-600">Đăng nhập nhân viên</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Liên hệ quản lý nếu quên mật khẩu</p>
                </div>
            </div>
        </div>
    );
};

export default StaffLoginPage;
