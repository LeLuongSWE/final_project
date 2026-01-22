import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../shared/services/authService';

const ForgotPasswordPage = () => {
    // Steps: 1 = Enter email, 2 = Verify token, 3 = Reset password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Step 1: Send email
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setStep(2); // Move to token verification step
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify token
    const handleVerifyToken = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.verifyToken(token);
            setStep(3); // Move to password reset step
        } catch (err) {
            setError(err.response?.data?.message || 'Mã xác nhận không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Quên mật khẩu';
            case 2: return 'Xác nhận mã';
            case 3: return 'Đặt lại mật khẩu';
            default: return 'Quên mật khẩu';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return 'Nhập email đã đăng ký để nhận mã xác nhận';
            case 2: return 'Nhập mã xác nhận đã gửi đến email của bạn';
            case 3: return 'Nhập mật khẩu mới cho tài khoản';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
                    >
                        <span>←</span>
                        <span>{step > 1 ? 'Quay lại' : 'Đăng nhập'}</span>
                    </button>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-2xl">🔑</span>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                                ${step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-8 h-1 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{getStepTitle()}</h2>
                <p className="text-gray-600 mb-6 text-center text-sm">{getStepDescription()}</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!success ? (
                    <>
                        {/* Step 1: Email Form */}
                        {step === 1 && (
                            <form onSubmit={handleSendEmail} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Nhập email đã đăng ký"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: Token Verification Form */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyToken} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-blue-700">
                                        📧 Mã xác nhận đã được gửi đến <strong>{email}</strong>
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Kiểm tra hộp thư (bao gồm cả thư rác)
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã xác nhận
                                    </label>
                                    <input
                                        id="token"
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase tracking-widest text-center text-lg"
                                        placeholder="XXXXXXXX"
                                        maxLength={8}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || token.length < 8}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Đang xác nhận...' : 'Xác nhận mã'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setToken(''); setError(''); }}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
                                >
                                    Gửi lại mã
                                </button>
                            </form>
                        )}

                        {/* Step 3: Password Reset Form */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-green-700 flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Mã xác nhận hợp lệ!
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-lg text-center">
                            <span className="text-4xl mb-2 block">✓</span>
                            <p className="font-medium text-lg">Đặt lại mật khẩu thành công!</p>
                            <p className="text-sm mt-1">Bạn có thể đăng nhập với mật khẩu mới</p>
                        </div>
                        <button
                            onClick={() => navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công!' } })}
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

export default ForgotPasswordPage;
