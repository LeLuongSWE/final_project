import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import feedbackService from '../../../shared/services/feedbackService';

const AdminFeedbackPage = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        loadFeedbacks();
    }, [navigate]);

    const loadFeedbacks = async () => {
        setLoading(true);
        try {
            const [feedbackData, statsData] = await Promise.all([
                feedbackService.getAllFeedbacks(startDate, endDate),
                feedbackService.getFeedbackStats(startDate, endDate)
            ]);
            setFeedbacks(feedbackData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        loadFeedbacks();
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <AdminLayout activePage="Quản lý Feedback">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold"
                    >
                        🔍 Lọc
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Tổng feedback</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalFeedbacks}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Rating trung bình</p>
                        <p className="text-2xl font-bold text-yellow-500">
                            {stats.averageRating} ★
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">5 sao</p>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.ratingDistribution?.[5] || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">1-2 sao</p>
                        <p className="text-2xl font-bold text-red-600">
                            {(stats.ratingDistribution?.[1] || 0) + (stats.ratingDistribution?.[2] || 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Rating Distribution */}
            {stats && stats.ratingDistribution && (
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h3 className="font-bold mb-4">📊 Phân bố đánh giá</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = stats.ratingDistribution[rating] || 0;
                            const percentage = stats.totalFeedbacks > 0
                                ? (count / stats.totalFeedbacks * 100).toFixed(1)
                                : 0;
                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="w-16 text-yellow-500 font-medium">{rating} ★</span>
                                    <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${rating >= 4 ? 'bg-green-400' :
                                                    rating === 3 ? 'bg-yellow-400' : 'bg-red-400'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-24 text-sm text-gray-600 text-right">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Feedbacks Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4 font-bold">Mã đơn</th>
                            <th className="text-left p-4 font-bold">Khách hàng</th>
                            <th className="text-left p-4 font-bold">Đánh giá</th>
                            <th className="text-left p-4 font-bold">Nội dung</th>
                            <th className="text-left p-4 font-bold">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : feedbacks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    Không có feedback trong khoảng thời gian này
                                </td>
                            </tr>
                        ) : (
                            feedbacks.map((feedback) => (
                                <tr
                                    key={feedback.feedbackId}
                                    className="border-t hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedFeedback(feedback)}
                                >
                                    <td className="p-4">
                                        <span className="font-medium text-blue-600">#{feedback.orderId}</span>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{feedback.fullName || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{feedback.username}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-lg ${feedback.rating >= 4 ? 'text-green-500' :
                                            feedback.rating >= 3 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {renderStars(feedback.rating)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-gray-700 max-w-md truncate">
                                            {feedback.comment || <span className="text-gray-400 italic">Không có nội dung</span>}
                                        </p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {formatDate(feedback.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Feedback Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Chi tiết Feedback
                            </h2>
                            <button
                                onClick={() => setSelectedFeedback(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-bold text-blue-600">#{selectedFeedback.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Khách hàng:</span>
                                <span className="font-medium">{selectedFeedback.fullName || selectedFeedback.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Đánh giá:</span>
                                <span className={`text-2xl ${selectedFeedback.rating >= 4 ? 'text-green-500' :
                                        selectedFeedback.rating >= 3 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {renderStars(selectedFeedback.rating)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-2">Nội dung:</span>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700">
                                        {selectedFeedback.comment || <span className="text-gray-400 italic">Khách hàng không để lại nhận xét</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Thời gian:</span>
                                <span className="text-sm">{formatDate(selectedFeedback.createdAt)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedFeedback(null)}
                            className="w-full mt-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminFeedbackPage;
