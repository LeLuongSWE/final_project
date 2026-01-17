import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderManagementPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ONLINE');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffUser, setStaffUser] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [instoreCount, setInstoreCount] = useState(0);
    const [paymentModal, setPaymentModal] = useState(null);

    useEffect(() => {
        const user = sessionStorage.getItem('staffUser');
        const shift = sessionStorage.getItem('currentShift');

        if (!user) {
            navigate('/staff/login');
            return;
        }

        setStaffUser(JSON.parse(user));
        if (shift) {
            setCurrentShift(JSON.parse(shift));
        }

        // Fetch counts for both tabs on initial load
        fetchOrderCounts();
        fetchOrders();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchOrderCounts();
            fetchOrders();
        }, 30000);
        return () => clearInterval(interval);
    }, [navigate, activeTab]);

    const fetchOrderCounts = async () => {
        try {
            // Fetch online count
            const onlineResponse = await axios.get('http://192.168.1.161:8080/api/orders/online/pending');
            setOnlineCount(onlineResponse.data.length);

            // Fetch instore count
            const shift = JSON.parse(sessionStorage.getItem('currentShift'));
            if (shift) {
                const instoreResponse = await axios.get(`http://192.168.1.161:8080/api/orders/instore/shift/${shift.shiftId}`);
                setInstoreCount(instoreResponse.data.length);
            }
        } catch (error) {
            console.error('Error fetching order counts:', error);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'ONLINE') {
                response = await axios.get('http://192.168.1.161:8080/api/orders/online/pending');
            } else {
                const shift = JSON.parse(sessionStorage.getItem('currentShift'));
                if (shift) {
                    response = await axios.get(`http://192.168.1.161:8080/api/orders/instore/shift/${shift.shiftId}`);
                } else {
                    response = { data: [] };
                }
            }
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmPayment = async (orderId, paymentMethod) => {
        try {
            await axios.put(`http://192.168.1.161:8080/api/orders/${orderId}/payment`, {
                paymentMethod: paymentMethod,
                status: 'COMPLETED'
            });
            setPaymentModal(null);
            fetchOrders();
            fetchOrderCounts();
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Có lỗi khi xác nhận thanh toán');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'PENDING': { text: 'Chờ xử lý', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
            'PREPARING': { text: 'Đang chuẩn bị', color: 'bg-blue-500', textColor: 'text-blue-600' },
            'READY': { text: 'Sẵn sàng', color: 'bg-green-500', textColor: 'text-green-600' },
            'COMPLETED': { text: 'Hoàn thành', color: 'bg-gray-500', textColor: 'text-gray-600' },
            'CANCELLED': { text: 'Đã hủy', color: 'bg-red-500', textColor: 'text-red-600' }
        };
        return statusMap[status] || { text: status, color: 'bg-gray-500', textColor: 'text-gray-600' };
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'PENDING': 'PREPARING',
            'PREPARING': 'READY',
            'READY': 'COMPLETED'
        };
        return statusFlow[currentStatus] || null;
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://192.168.1.161:8080/api/orders/${orderId}/status`, {
                status: newStatus
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Có lỗi khi cập nhật trạng thái');
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white">
            {/* Header */}
            <header className="bg-gray-700 px-4 py-3 flex justify-between items-center border-b border-gray-600">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/staff/pos')}
                        className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-bold"
                    >
                        ← Quay lại POS
                    </button>
                    <h1 className="text-xl font-bold">Quản lý đơn hàng</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-medium">NV: {staffUser?.fullName}</span>
                    <button
                        onClick={fetchOrders}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
                    >
                        🔄 Làm mới
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('ONLINE')}
                        className={`px-6 py-3 rounded-t-lg font-bold transition ${activeTab === 'ONLINE'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                    >
                        📱 Đơn Online ({onlineCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('INSTORE')}
                        className={`px-6 py-3 rounded-t-lg font-bold transition ${activeTab === 'INSTORE'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                    >
                        🏪 Đơn tại quán ({instoreCount})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Đang tải...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-lg text-gray-400">
                            {activeTab === 'ONLINE'
                                ? 'Không có đơn hàng online nào đang chờ xử lý'
                                : 'Không có đơn hàng tại quán trong ca này'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            const nextStatus = getNextStatus(order.status);

                            return (
                                <div key={order.orderId} className="bg-gray-700 rounded-xl overflow-hidden shadow-lg">
                                    {/* Order Header */}
                                    <div className={`${statusInfo.color} px-4 py-3 flex justify-between items-center`}>
                                        <div>
                                            <span className="font-black text-lg">#{order.orderCode}</span>
                                            {order.tableNumber && (
                                                <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded text-sm font-bold">
                                                    {order.tableNumber}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold">{formatTime(order.orderDate)}</span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4">
                                        <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                                            {order.items?.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="font-medium">
                                                        {item.quantity}x {item.productName || item.name}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {formatCurrency(item.priceAtPurchase * item.quantity)} đ
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-600 pt-3 mb-3">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Tổng:</span>
                                                <span className="text-orange-400">{formatCurrency(order.totalAmount)} đ</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                <div>Thanh toán: {order.paymentMethod === 'VIETQR' ? '📱 Chuyển khoản' : order.paymentMethod === 'PENDING' ? '⏳ Chờ thanh toán' : '💵 Tiền mặt'}</div>
                                                {order.orderType === 'ONLINE' && order.estimatedPickupTime && (
                                                    <div>Dự kiến: {formatTime(order.estimatedPickupTime)}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Trạng thái:</span>
                                                <span className={`${statusInfo.color} px-3 py-1 rounded-full text-sm font-bold`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>

                                            {activeTab === 'ONLINE' && nextStatus && (
                                                <button
                                                    onClick={() => updateStatus(order.orderId, nextStatus)}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded-lg font-bold transition"
                                                >
                                                    Chuyển: {getStatusInfo(nextStatus).text}
                                                </button>
                                            )}

                                            {activeTab === 'ONLINE' && order.status === 'READY' && (
                                                <button
                                                    onClick={() => updateStatus(order.orderId, 'COMPLETED')}
                                                    className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-bold transition"
                                                >
                                                    ✓ Khách đã nhận hàng
                                                </button>
                                            )}

                                            {/* Payment button for INSTORE PENDING orders */}
                                            {activeTab === 'INSTORE' && order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => setPaymentModal(order)}
                                                    className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-bold transition"
                                                >
                                                    💰 Xác nhận thanh toán
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Xác nhận thanh toán</h2>
                            <button
                                onClick={() => setPaymentModal(null)}
                                className="w-8 h-8 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <p className="text-gray-600 font-medium">Đơn hàng: <span className="font-bold text-gray-900">{paymentModal.orderCode}</span></p>
                                <p className="text-gray-600 font-medium">Bàn: <span className="font-bold text-gray-900">{paymentModal.tableNumber}</span></p>
                                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(paymentModal.totalAmount)} đ</p>
                            </div>

                            <p className="text-center text-sm font-bold text-gray-800">Chọn phương thức thanh toán:</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => confirmPayment(paymentModal.orderId, 'CASH')}
                                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex flex-col items-center gap-1"
                                >
                                    <span className="text-2xl">💵</span>
                                    <span>Tiền mặt</span>
                                </button>
                                <button
                                    onClick={() => confirmPayment(paymentModal.orderId, 'VIETQR')}
                                    className="flex-1 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex flex-col items-center gap-1"
                                >
                                    <span className="text-2xl">📱</span>
                                    <span>Chuyển khoản</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagementPage;
