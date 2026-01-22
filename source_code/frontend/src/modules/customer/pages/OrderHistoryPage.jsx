import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../../shared/context/AuthContext';
import { orderService } from '../../../shared/services/orderService';
import feedbackService from '../../../shared/services/feedbackService';

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState({});
    const [feedbackData, setFeedbackData] = useState({});

    // Date filter state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Feedback modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    useEffect(() => {
        if (user && user.userId) {
            fetchOrders();
        } else if (user === null) {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [orders, startDate, endDate, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getUserOrders(user.userId);
            setOrders(data || []);
            setFilteredOrders(data || []);
            setError('');

            // Check feedback status for completed orders
            const completedOrders = (data || []).filter(o => o.status === 'COMPLETED');
            const statusMap = {};
            const dataMap = {};
            for (const order of completedOrders) {
                try {
                    const result = await feedbackService.getFeedbackByOrder(order.orderId);
                    if (result.feedbackId) {
                        statusMap[order.orderId] = true;
                        dataMap[order.orderId] = result;
                    } else {
                        statusMap[order.orderId] = false;
                    }
                } catch {
                    statusMap[order.orderId] = false;
                }
            }
            setFeedbackStatus(statusMap);
            setFeedbackData(dataMap);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Filter by date
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(order => new Date(order.orderDate) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.orderDate) <= end);
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('ALL');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'PENDING': { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
            'PREPARING': { text: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-800' },
            'READY': { text: 'Sẵn sàng', color: 'bg-purple-100 text-purple-800' },
            'COMPLETED': { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
            'CANCELLED': { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
        };
        return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}/status`);
    };

    const openFeedbackModal = (order, e, viewMode = false) => {
        e.stopPropagation();
        setSelectedOrder(order);
        setIsViewMode(viewMode);

        if (viewMode && feedbackData[order.orderId]) {
            // View existing feedback
            setRating(feedbackData[order.orderId].rating);
            setComment(feedbackData[order.orderId].comment || '');
        } else {
            // New feedback
            setRating(5);
            setComment('');
        }
        setFeedbackMessage('');
        setShowFeedbackModal(true);
    };

    const submitFeedback = async () => {
        if (!selectedOrder) return;

        setSubmitting(true);
        try {
            await feedbackService.createFeedback(selectedOrder.orderId, rating, comment);
            setFeedbackMessage('Cảm ơn bạn đã đánh giá!');
            setFeedbackStatus(prev => ({ ...prev, [selectedOrder.orderId]: true }));
            setFeedbackData(prev => ({
                ...prev,
                [selectedOrder.orderId]: { rating, comment, createdAt: new Date().toISOString() }
            }));
            setTimeout(() => {
                setShowFeedbackModal(false);
            }, 1500);
        } catch (err) {
            setFeedbackMessage(err.response?.data?.error || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (currentRating, interactive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && !isViewMode && setRating(star)}
                        className={`text-3xl ${interactive && !isViewMode ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'} ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        disabled={!interactive || isViewMode}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    const renderSmallStars = (rating) => {
        return (
            <span className="text-yellow-500 text-sm">
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/orders" />

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>

                    {/* Date Filter */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="PENDING">Đang xử lý</option>
                                    <option value="PREPARING">Đang chuẩn bị</option>
                                    <option value="READY">Sẵn sàng</option>
                                    <option value="COMPLETED">Đã hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-gray-600 hover:text-gray-800 px-3 py-2"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                        {(startDate || endDate || statusFilter !== 'ALL') && (
                            <p className="mt-3 text-sm text-gray-500">
                                Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-lg mb-4">
                                {orders.length === 0 ? 'Bạn chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng phù hợp'}
                            </p>
                            {orders.length === 0 ? (
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
                                >
                                    Đặt hàng ngay
                                </button>
                            ) : (
                                <button
                                    onClick={clearFilters}
                                    className="text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Xóa bộ lọc để xem tất cả
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                const hasFeedback = feedbackStatus[order.orderId];
                                const canFeedback = order.status === 'COMPLETED' && !hasFeedback;
                                const orderFeedback = feedbackData[order.orderId];

                                return (
                                    <div
                                        key={order.orderId}
                                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition"
                                        onClick={() => handleOrderClick(order.orderId)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800">
                                                    Đơn hàng #{order.orderCode || order.orderId}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(order.orderDate)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-orange-600">
                                                    {formatCurrency(order.totalAmount)}
                                                </p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Thanh toán: {order.paymentMethod === 'VIETQR' ? 'VietQR' :
                                                    order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod}
                                            </span>

                                            <div className="flex items-center gap-3">
                                                {canFeedback && (
                                                    <button
                                                        onClick={(e) => openFeedbackModal(order, e, false)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
                                                    >
                                                        ⭐ Đánh giá
                                                    </button>
                                                )}
                                                {hasFeedback && orderFeedback && (
                                                    <button
                                                        onClick={(e) => openFeedbackModal(order, e, true)}
                                                        className="text-green-600 text-sm font-medium flex items-center gap-1 hover:text-green-700"
                                                    >
                                                        ✓ {renderSmallStars(orderFeedback.rating)}
                                                    </button>
                                                )}
                                                <span className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                                                    Xem chi tiết →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Feedback Modal */}
            {showFeedbackModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {isViewMode ? 'Đánh giá của bạn' : 'Đánh giá đơn hàng'} #{selectedOrder.orderCode || selectedOrder.orderId}
                        </h2>
                        <p className="text-gray-500 mb-4">
                            {isViewMode ? 'Cảm ơn bạn đã đánh giá!' : 'Trải nghiệm của bạn như thế nào?'}
                        </p>

                        {/* Star Rating */}
                        <div className="flex justify-center mb-4">
                            {renderStars(rating, true)}
                        </div>
                        <p className="text-center text-sm text-gray-500 mb-4">
                            {rating === 5 && 'Tuyệt vời!'}
                            {rating === 4 && 'Rất tốt'}
                            {rating === 3 && 'Bình thường'}
                            {rating === 2 && 'Chưa hài lòng'}
                            {rating === 1 && 'Rất tệ'}
                        </p>

                        {/* Comment */}
                        {isViewMode ? (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-gray-700">
                                    {comment || <span className="text-gray-400 italic">Không có nhận xét</span>}
                                </p>
                                {feedbackData[selectedOrder.orderId]?.createdAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Đánh giá lúc: {formatDate(feedbackData[selectedOrder.orderId].createdAt)}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ thêm về trải nghiệm của bạn (không bắt buộc)..."
                                className="w-full border rounded-lg p-3 mb-4 resize-none h-24 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        )}

                        {/* Message */}
                        {feedbackMessage && (
                            <div className={`text-center mb-4 ${feedbackMessage.includes('Cảm ơn') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {feedbackMessage}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className={`flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition ${isViewMode ? '' : ''}`}
                                disabled={submitting}
                            >
                                {isViewMode ? 'Đóng' : 'Hủy'}
                            </button>
                            {!isViewMode && (
                                <button
                                    onClick={submitFeedback}
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
