import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../../shared/services/authService';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        token: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Pre-fill token if passed from ForgotPasswordPage
    useEffect(() => {
        if (location.state?.token) {
            setFormData(prev => ({ ...prev, token: location.state.token }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(formData.token, formData.newPassword);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
                    >
                        <span>←</span>
                        <span>Quay lại</span>
                    </button>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-2xl">🔐</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
                <p className="text-gray-600 mb-6">Nhập mã xác nhận và mật khẩu mới</p>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                                Mã xác nhận
                            </label>
                            <input
                                id="token"
                                name="token"
                                type="text"
                                value={formData.token}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase tracking-widest text-center text-lg"
                                placeholder="XXXXXXXX"
                                maxLength={8}
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-center">
                            <span className="text-4xl mb-2 block">✓</span>
                            <p className="font-medium text-lg">Đặt lại mật khẩu thành công!</p>
                            <p className="text-sm mt-1">Bạn có thể đăng nhập với mật khẩu mới</p>
                        </div>

                        <button
                            onClick={() => navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' } })}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                        >
                            Đăng nhập ngay →
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-gray-600 hover:text-orange-600">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
