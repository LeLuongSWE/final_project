import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const pageSize = 20;

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Ref for scroll listener
    const tableRef = useRef(null);

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
    }, [navigate]);

    // Initial load and filter change
    useEffect(() => {
        resetAndFetch();
    }, [filterStatus, startDate, endDate]);

    const resetAndFetch = () => {
        setOrders([]);
        setPage(0);
        setHasMore(true);
        fetchOrders(0, true);
    };

    const fetchOrders = async (pageNum = 0, reset = false) => {
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = {
                page: pageNum,
                size: pageSize,
            };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filterStatus) params.status = filterStatus;
            if (searchQuery) params.search = searchQuery;

            const response = await axios.get('http://192.168.1.161:8080/api/orders/search', { params });
            const data = response.data;

            if (reset) {
                setOrders(data.content || []);
            } else {
                setOrders(prev => [...prev, ...(data.content || [])]);
            }

            setTotalElements(data.totalElements || 0);
            setHasMore(data.hasNext || false);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = () => {
        resetAndFetch();
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchOrders(page + 1, false);
        }
    };

    // Quick date filters
    const setQuickDate = (period) => {
        const today = new Date();
        let start, end;

        switch (period) {
            case 'today':
                start = end = today.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                start = end = yesterday.toISOString().split('T')[0];
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                start = weekAgo.toISOString().split('T')[0];
                end = today.toISOString().split('T')[0];
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                end = today.toISOString().split('T')[0];
                break;
            case 'all':
            default:
                start = '';
                end = '';
        }

        setStartDate(start);
        setEndDate(end);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'PENDING': { text: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-50' },
            'PREPARING': { text: 'Đang chuẩn bị', color: 'text-blue-600 bg-blue-50' },
            'READY': { text: 'Chờ lấy', color: 'text-green-600 bg-green-50' },
            'COMPLETED': { text: 'Đã xong', color: 'text-gray-600 bg-gray-100' },
            'CANCELLED': { text: 'Đã hủy', color: 'text-red-600 bg-red-50' }
        };
        return statusMap[status] || { text: status, color: 'text-gray-600 bg-gray-100' };
    };

    const getOrderTypeLabel = (type) => {
        const types = {
            'INSTORE': '🏪 Tại quán',
            'ONLINE': '🌐 Đặt Online',
            'TAKEAWAY': '📦 Mang về'
        };
        return types[type] || type || 'Khách lẻ';
    };

    const statusFilters = [
        { value: '', label: 'Tất cả' },
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'PREPARING', label: 'Đang chuẩn bị' },
        { value: 'READY', label: 'Chờ lấy' },
        { value: 'COMPLETED', label: 'Đã xong' },
        { value: 'CANCELLED', label: 'Đã hủy' }
    ];

    return (
        <AdminLayout activePage="Quản lý Đơn hàng">
            {/* Quick Date Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-700">🗓️ Lọc nhanh:</span>
                    {[
                        { id: 'today', label: 'Hôm nay' },
                        { id: 'yesterday', label: 'Hôm qua' },
                        { id: 'week', label: '7 ngày qua' },
                        { id: 'month', label: 'Tháng này' },
                        { id: 'all', label: 'Tất cả' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setQuickDate(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${(p.id === 'all' && !startDate && !endDate) ||
                                    (p.id === 'today' && startDate === new Date().toISOString().split('T')[0] && endDate === startDate)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Range & Search */}
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-bold text-gray-700">📅 Tùy chọn:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium"
                    />
                    <span className="text-gray-600">→</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium"
                    />

                    <span className="font-bold text-gray-700 ml-4">🔍 Tìm mã đơn:</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="VD: ORD123 hoặc 12345"
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium w-48"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        🔍 Tìm
                    </button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-4">
                <span className="font-bold text-gray-700">📋 Trạng thái:</span>
                {statusFilters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilterStatus(f.value)}
                        className={`px-4 py-2 rounded-lg font-bold transition ${filterStatus === f.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
                <span className="ml-auto text-gray-600">
                    Hiển thị: <strong>{orders.length}</strong> / <strong>{totalElements}</strong> đơn
                </span>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow" ref={tableRef}>
                <table className="w-full">
                    <thead className="bg-gray-200 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-28">Mã đơn</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-40">Thời gian</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-28">Loại đơn</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Khách hàng</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-28">Tổng tiền</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Trạng thái</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-500">Đang tải...</p>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-gray-500">
                                    Không tìm thấy đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, idx) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr key={order.order_id || idx} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-blue-600">
                                            #{order.order_code}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {formatDateTime(order.order_date)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {getOrderTypeLabel(order.order_type)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {order.customer_name || 'Khách lẻ'}
                                            {order.customer_phone && <span className="text-xs text-gray-400 ml-1">({order.customer_phone})</span>}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-800">
                                            {formatCurrency(order.total_amount)} đ
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded font-bold text-xs ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Load More Button */}
                {hasMore && orders.length > 0 && (
                    <div className="px-4 py-4 border-t border-gray-200 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Đang tải...
                                </span>
                            ) : (
                                `Tải thêm (${orders.length}/${totalElements})`
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-black text-gray-800">
                                Chi tiết đơn #{selectedOrder.order_code}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3 text-gray-700">
                            <div><strong>Thời gian:</strong> {formatDateTime(selectedOrder.order_date)}</div>
                            <div><strong>Loại đơn:</strong> {getOrderTypeLabel(selectedOrder.order_type)}</div>
                            <div><strong>Khách hàng:</strong> {selectedOrder.customer_name || 'Khách lẻ'}</div>
                            {selectedOrder.customer_phone && (
                                <div><strong>SĐT:</strong> {selectedOrder.customer_phone}</div>
                            )}
                            <div><strong>Thanh toán:</strong> {selectedOrder.payment_method}</div>
                            <div><strong>Trạng thái:</strong> {getStatusInfo(selectedOrder.status).text}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                            <span className="text-xl font-black text-orange-600">
                                Tổng: {formatCurrency(selectedOrder.total_amount)} đ
                            </span>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrdersPage;
