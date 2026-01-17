import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axiosClient';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        ordersByStatus: {},
        topProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        fetchTodayStats();
    }, [navigate]);

    const fetchTodayStats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/statistics?period=today');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    const today = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AdminLayout activePage="Tổng quan">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
                <h1 className="text-2xl font-black mb-2">Xin chào, Quản lý! 👋</h1>
                <p className="opacity-90">{today}</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            ) : (
                <>
                    {/* Quick Stats - Today */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                    💰
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 font-bold">Doanh thu hôm nay</div>
                                    <div className="text-2xl font-black text-blue-600">
                                        {formatCurrency(stats.totalRevenue)} đ
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                    📦
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 font-bold">Đơn hàng hôm nay</div>
                                    <div className="text-2xl font-black text-green-600">
                                        {stats.totalOrders} đơn
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                                    📊
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 font-bold">TB/Đơn hàng</div>
                                    <div className="text-2xl font-black text-orange-600">
                                        {formatCurrency(stats.avgOrderValue)} đ
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <button
                            onClick={() => navigate('/admin/menu')}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
                        >
                            <div className="text-4xl mb-3">🍽️</div>
                            <div className="font-bold text-gray-800">Quản lý Thực đơn</div>
                            <div className="text-sm text-gray-500">Thêm/sửa món ăn</div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/staff')}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
                        >
                            <div className="text-4xl mb-3">👥</div>
                            <div className="font-bold text-gray-800">Quản lý Nhân viên</div>
                            <div className="text-sm text-gray-500">Thêm/sửa nhân viên</div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/tables')}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
                        >
                            <div className="text-4xl mb-3">🪑</div>
                            <div className="font-bold text-gray-800">Quản lý Bàn ăn</div>
                            <div className="text-sm text-gray-500">Cấu hình số bàn</div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
                        >
                            <div className="text-4xl mb-3">📈</div>
                            <div className="font-bold text-gray-800">Báo cáo Thống kê</div>
                            <div className="text-sm text-gray-500">Xuất Excel</div>
                        </button>
                    </div>

                    {/* Order Status Summary */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-black text-gray-800 mb-4">Trạng thái đơn hàng hôm nay</h2>
                            <div className="space-y-3">
                                {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-bold text-gray-700">
                                            {status === 'PENDING' ? '⏳ Chờ xử lý' :
                                                status === 'PREPARING' ? '👨‍🍳 Đang chuẩn bị' :
                                                    status === 'READY' ? '✅ Sẵn sàng' :
                                                        status === 'COMPLETED' ? '🎉 Hoàn thành' :
                                                            status === 'CANCELLED' ? '❌ Đã hủy' : status}
                                        </span>
                                        <span className="text-xl font-black text-blue-600">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(stats.ordersByStatus || {}).length === 0 && (
                                    <p className="text-gray-500 text-center py-4">Chưa có đơn hàng hôm nay</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-black text-gray-800 mb-4">Top món bán chạy hôm nay</h2>
                            {(stats.topProducts || []).length > 0 ? (
                                <div className="space-y-3">
                                    {stats.topProducts.slice(0, 5).map((product, index) => (
                                        <div key={product.productId || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-bold text-gray-700">
                                                <span className="text-orange-500">#{index + 1}</span> {product.name}
                                            </span>
                                            <span className="font-black text-green-600">{product.soldCount} suất</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu bán hàng</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
