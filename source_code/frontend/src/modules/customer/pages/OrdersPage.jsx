import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../../shared/context/AuthContext';
import api from '../../../shared/api/axiosClient';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('OrdersPage - useEffect triggered');
        console.log('OrdersPage - user:', user);
        console.log('OrdersPage - user?.userId:', user?.userId);

        const fetchOrders = async () => {
            if (!user) {
                console.log('OrdersPage - No user yet, waiting...');
                return; // Không làm gì, đợi user được set
            }

            if (!user.userId) {
                console.log('OrdersPage - User exists but no userId:', user);
                setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('OrdersPage - Fetching orders for userId:', user.userId);
                const response = await api.get(`/orders/user/${user.userId}`);
                console.log('OrdersPage - Orders response:', response.data);
                setOrders(response.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'preparing':
                return 'bg-purple-100 text-purple-800';
            case 'delivering':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'delivering': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status.toLowerCase()] || status;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/orders" />

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>

                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-center">
                            {error}
                        </div>
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <p className="text-gray-500 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                Đặt hàng ngay
                            </button>
                        </div>
                    )}

                    {!loading && !error && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Đơn hàng #{order.orderId}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tổng tiền:</span>
                                            <span className="font-semibold text-orange-600">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </div>
                                        {order.paymentMethod && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Phương thức:</span>
                                                <span className="text-gray-800">{order.paymentMethod}</span>
                                            </div>
                                        )}
                                        {order.deliveryAddress && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Địa chỉ: </span>
                                                <span className="text-gray-800">{order.deliveryAddress}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/orders/${order.orderId}`)}
                                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    >
                                        Xem chi tiết →
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrdersPage;
