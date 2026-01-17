import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const OrderStatusPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://192.168.1.161:8080/api/orders/${orderId}`);
                setOrderData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderStatus();

            // Auto-refresh every 10 seconds for real-time status updates
            const interval = setInterval(fetchOrderStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [orderId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'PENDING': { text: 'Đã gửi đơn', icon: '📝' },
            'PREPARING': { text: 'Bếp đang chuẩn bị', icon: '👨‍🍳' },
            'READY': { text: 'Sẵn sàng để lấy', icon: '✅' },
            'COMPLETED': { text: 'Đã hoàn thành', icon: '🎉' },
            'CANCELLED': { text: 'Đã hủy', icon: '❌' },
        };
        return statusMap[status] || { text: status, icon: '📦' };
    };

    const getPaymentMethodText = (method) => {
        const methods = {
            'CASH': 'Thanh toán khi nhận',
            'CARD': 'Thẻ tín dụng',
            'EWALLET': 'Ví điện tử',
            'VIETQR': 'VietQR'
        };
        return methods[method] || method;
    };

    // Define all possible statuses in order
    const allStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];

    const isStatusCompleted = (status, statusHistory) => {
        if (!statusHistory) return false;
        return statusHistory.some(h => h.status === status);
    };

    const isCurrentStatus = (status, currentStatus) => {
        return status === currentStatus;
    };

    const getStatusTime = (status, statusHistory) => {
        if (!statusHistory) return null;
        const historyItem = statusHistory.find(h => h.status === status);
        return historyItem ? historyItem.changedAt : null;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar activePath="/orders" />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar activePath="/orders" />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
                        >
                            Quay lại lịch sử đơn hàng
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const { order, items, statusHistory } = orderData;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/orders" />

            <main className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Success Header */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {order.status === 'COMPLETED' ? 'Đơn hàng hoàn thành!' :
                                order.status === 'CANCELLED' ? 'Đơn hàng đã hủy' :
                                    'Đặt hàng thành công!'}
                        </h1>
                        <p className="text-gray-600">
                            Mã đơn hàng: <span className="font-semibold">#{order.orderCode}</span>
                        </p>
                        {order.estimatedPickupTime && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <p className="text-gray-600">
                                Thời gian dự kiến nhận: <span className="font-semibold">{formatTime(order.estimatedPickupTime)}</span>
                            </p>
                        )}
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Trạng thái đơn hàng:</h2>

                        <div className="space-y-4">
                            {allStatuses.map((status, index) => {
                                const isCompleted = isStatusCompleted(status, statusHistory);
                                const isCurrent = isCurrentStatus(status, order.status);
                                const statusTime = getStatusTime(status, statusHistory);
                                const statusInfo = getStatusInfo(status);

                                return (
                                    <div key={status} className="flex items-start">
                                        {/* Timeline dot and line */}
                                        <div className="flex flex-col items-center mr-4">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isCompleted || isCurrent
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-white border-gray-300'
                                                }`}>
                                                {isCompleted || isCurrent ? '✓' : ''}
                                            </div>
                                            {index < allStatuses.length - 1 && (
                                                <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}></div>
                                            )}
                                        </div>

                                        {/* Status content */}
                                        <div className={`flex-1 pb-4 ${isCurrent ? 'font-semibold' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <span className={isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'}>
                                                    {statusInfo.icon} {statusInfo.text}
                                                </span>
                                                {statusTime && (
                                                    <span className="text-sm text-gray-500">
                                                        ({formatTime(statusTime)})
                                                    </span>
                                                )}
                                                {!isCompleted && !isCurrent && (
                                                    <span className="text-sm text-gray-400">(Chưa đến)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Chi tiết đơn hàng:</h2>

                        <div className="space-y-3">
                            {items && items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-700">
                                        - {item.productName || 'Sản phẩm'} (x{item.quantity})
                                    </span>
                                    <span className="text-gray-600">
                                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Tổng tiền:</span>
                                <span className="text-orange-600">
                                    {formatCurrency(order.totalAmount)} ({getPaymentMethodText(order.paymentMethod)})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = 'tel:0901234567'}
                            className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition"
                        >
                            [ Gọi cho quán ]
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition"
                        >
                            [ Về Trang chủ ]
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderStatusPage;
