import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.userId) {
            fetchOrders();
        } else if (user === null) {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getUserOrders(user.userId);
            setOrders(data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/orders" />

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                Đặt hàng ngay
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
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

                                        <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                                            <span>
                                                Thanh toán: {order.paymentMethod === 'VIETQR' ? 'VietQR' :
                                                    order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod}
                                            </span>
                                            <span className="text-orange-600 hover:text-orange-700 font-medium">
                                                Xem chi tiết →
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrderHistoryPage;
