import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axiosClient';

const OrderManagementPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ONLINE');
    const [orders, setOrders] = useState([]);
    const [displayedOrders, setDisplayedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [staffUser, setStaffUser] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [instoreCount, setInstoreCount] = useState(0);
    const [paymentModal, setPaymentModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Lazy loading state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 12;
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    // Status priority (lower = higher priority, shown first)
    const STATUS_PRIORITY = {
        'PENDING': 1,
        'PREPARING': 2,
        'READY': 3,
        'COMPLETED': 4,
        'CANCELLED': 5
    };

    // Status options for filter
    const statusOptions = [
        { value: 'ALL', label: 'Tất cả', color: 'bg-gray-600' },
        { value: 'PENDING', label: 'Chờ xử lý', color: 'bg-yellow-600' },
        { value: 'PREPARING', label: 'Đang chuẩn bị', color: 'bg-blue-600' },
        { value: 'READY', label: 'Sẵn sàng', color: 'bg-green-600' },
        { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-gray-500' },
    ];

    // Sort orders by status priority and date
    const sortOrders = (orderList) => {
        return [...orderList].sort((a, b) => {
            // First sort by status priority
            const priorityA = STATUS_PRIORITY[a.status] || 99;
            const priorityB = STATUS_PRIORITY[b.status] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;

            // Then by date (newest first within same status)
            return new Date(b.orderDate) - new Date(a.orderDate);
        });
    };

    // Filter orders based on search query and status
    const getFilteredOrders = useCallback(() => {
        let filtered = orders.filter(order => {
            // Status filter
            if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

            // Search filter
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                order.orderCode?.toLowerCase().includes(query) ||
                order.tableNumber?.toLowerCase().includes(query)
            );
        });

        return sortOrders(filtered);
    }, [orders, statusFilter, searchQuery]);

    // Update displayed orders when filters change
    useEffect(() => {
        const filtered = getFilteredOrders();
        setPage(1);
        setDisplayedOrders(filtered.slice(0, ITEMS_PER_PAGE));
        setHasMore(filtered.length > ITEMS_PER_PAGE);
    }, [orders, statusFilter, searchQuery, getFilteredOrders]);

    // Load more orders when scrolling
    const loadMoreOrders = useCallback(() => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const filtered = getFilteredOrders();
        const nextPage = page + 1;
        const endIndex = nextPage * ITEMS_PER_PAGE;

        setTimeout(() => {
            setDisplayedOrders(filtered.slice(0, endIndex));
            setPage(nextPage);
            setHasMore(endIndex < filtered.length);
            setLoadingMore(false);
        }, 300); // Small delay for smooth UX
    }, [page, hasMore, loadingMore, getFilteredOrders]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreOrders();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, loadingMore, loadMoreOrders]);

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
            const onlineResponse = await api.get('/orders/online/pending');
            setOnlineCount(onlineResponse.data.length);

            // Fetch instore count
            const shift = JSON.parse(sessionStorage.getItem('currentShift'));
            if (shift) {
                const instoreResponse = await api.get(`/orders/instore/shift/${shift.shiftId}`);
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
                response = await api.get('/orders/online/pending');
            } else {
                const shift = JSON.parse(sessionStorage.getItem('currentShift'));
                if (shift) {
                    response = await api.get(`/orders/instore/shift/${shift.shiftId}`);
                } else {
                    response = { data: [] };
                }
            }
            // Sort orders immediately after fetching
            const sortedOrders = sortOrders(response.data);
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmPayment = async (orderId, paymentMethod) => {
        try {
            await api.put(`/orders/${orderId}/payment`, {
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
            await api.put(`/orders/${orderId}/status`, {
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
            <header className="bg-gray-700 px-4 py-3 flex justify-between items-center border-b border-gray-600 sticky top-0 z-20">
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

            {/* Search Bar */}
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍 Tìm theo mã đơn hoặc số bàn..."
                        className="w-full px-4 py-2 pl-10 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

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

            {/* Status Filter */}
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400 text-sm mr-2">Lọc theo trạng thái:</span>
                    {statusOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${statusFilter === opt.value
                                ? `${opt.color} text-white`
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Count Summary */}
            <div className="bg-gray-750 px-4 py-2 border-b border-gray-600 flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                    Hiển thị {displayedOrders.length} / {getFilteredOrders().length} đơn hàng
                </span>
                {statusFilter === 'ALL' && (
                    <div className="flex gap-2">
                        {['PENDING', 'PREPARING', 'READY'].map(status => {
                            const count = orders.filter(o => o.status === status).length;
                            if (count === 0) return null;
                            const info = getStatusInfo(status);
                            return (
                                <span key={status} className={`${info.color} px-2 py-0.5 rounded text-xs font-bold`}>
                                    {info.text}: {count}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Đang tải...</p>
                    </div>
                ) : displayedOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">{searchQuery ? '🔍' : '📋'}</div>
                        <p className="text-lg text-gray-400">
                            {searchQuery
                                ? `Không tìm thấy đơn hàng với "${searchQuery}"`
                                : activeTab === 'ONLINE'
                                    ? 'Không có đơn hàng online nào đang chờ xử lý'
                                    : 'Không có đơn hàng tại quán trong ca này'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayedOrders.map(order => {
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

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                className="flex justify-center items-center py-8"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                                        <span className="text-gray-400">Đang tải thêm...</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={loadMoreOrders}
                                        className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-medium"
                                    >
                                        Tải thêm đơn hàng
                                    </button>
                                )}
                            </div>
                        )}

                        {!hasMore && displayedOrders.length > 0 && (
                            <div className="text-center py-6 text-gray-500">
                                ── Đã hiển thị tất cả {displayedOrders.length} đơn hàng ──
                            </div>
                        )}
                    </>
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
