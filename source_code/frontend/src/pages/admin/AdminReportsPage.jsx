import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const AdminReportsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState({
        startDate: '2025-01-01',
        endDate: '2025-12-31'
    });
    const [activePeriod, setActivePeriod] = useState('year'); // Quick filter selection
    const [loading, setLoading] = useState(true);

    // Quick date filter helper
    const setQuickDateRange = (period) => {
        const today = new Date('2025-12-15'); // Using 2025 date for sample data
        let start, end;

        switch (period) {
            case 'today':
                start = end = today;
                break;
            case 'week':
                start = new Date(today);
                start.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)
                end = today;
                break;
            case 'lastWeek':
                end = new Date(today);
                end.setDate(today.getDate() - today.getDay() - 1); // Last Saturday
                start = new Date(end);
                start.setDate(end.getDate() - 6); // Last Sunday
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = today;
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of prev month
                break;
            case 'year':
                start = new Date(2025, 0, 1);
                end = new Date(2025, 11, 31);
                break;
            default:
                return;
        }

        setActivePeriod(period);
        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
    };

    // Sales Performance Data
    const [kpiData, setKpiData] = useState({});
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [channelMixData, setChannelMixData] = useState([]);
    const [paymentMixData, setPaymentMixData] = useState([]);
    const [topProductsData, setTopProductsData] = useState([]);
    const [displayLimit, setDisplayLimit] = useState(5);

    // Supply Chain Data
    const [supplyKpiData, setSupplyKpiData] = useState({});
    const [abcData, setAbcData] = useState([]);
    const [reorderAlerts, setReorderAlerts] = useState([]);
    const [turnoverData, setTurnoverData] = useState([]);

    // Product Analytics Data
    const [productKpiData, setProductKpiData] = useState({});
    const [bcgData, setBcgData] = useState([]);
    const [comboData, setComboData] = useState([]);
    const [trendData, setTrendData] = useState([]);

    // Workforce Analytics Data
    const [workforceKpiData, setWorkforceKpiData] = useState({});
    const [processTimeData, setProcessTimeData] = useState({});
    const [staffRankingData, setStaffRankingData] = useState([]);
    const [reconciliationData, setReconciliationData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        if (activeTab === 'sales') {
            fetchSalesData();
        } else if (activeTab === 'supply') {
            fetchSupplyChainData();
        } else if (activeTab === 'product') {
            fetchProductData();
        } else if (activeTab === 'workforce') {
            fetchWorkforceData();
        }
    }, [navigate, activeTab, dateRange.startDate, dateRange.endDate]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            const [kpi, timeSeries, channel, payment, topProducts] = await Promise.all([
                axios.get('http://localhost:8080/api/analytics/sales/kpi', { params }),
                axios.get('http://localhost:8080/api/analytics/sales/time-series', { params: { ...params, granularity: 'day' } }),
                axios.get('http://localhost:8080/api/analytics/sales/channel-mix', { params }),
                axios.get('http://localhost:8080/api/analytics/sales/payment-mix', { params }),
                axios.get('http://localhost:8080/api/analytics/sales/top-products', { params: { ...params, limit: 50 } }) // Fetch 50 for pagination
            ]);

            setKpiData(kpi.data);
            setTimeSeriesData(timeSeries.data);
            setChannelMixData(channel.data);
            setPaymentMixData(payment.data);
            setTopProductsData(topProducts.data);
            setDisplayLimit(5); // Reset to 5 when data refreshes
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplyChainData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            const [kpi, abc, alerts, turnover] = await Promise.all([
                axios.get('http://localhost:8080/api/analytics/supply-chain/kpi', { params }),
                axios.get('http://localhost:8080/api/analytics/supply-chain/abc-analysis', { params }),
                axios.get('http://localhost:8080/api/analytics/supply-chain/reorder-alerts'),
                axios.get('http://localhost:8080/api/analytics/supply-chain/turnover', { params })
            ]);

            setSupplyKpiData(kpi.data);
            setAbcData(abc.data);
            setReorderAlerts(alerts.data);
            setTurnoverData(turnover.data);
        } catch (error) {
            console.error('Error fetching supply chain data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            const [kpi, bcg, combo, trend] = await Promise.all([
                axios.get('http://localhost:8080/api/analytics/product/kpi', { params }),
                axios.get('http://localhost:8080/api/analytics/product/bcg-matrix', { params }),
                axios.get('http://localhost:8080/api/analytics/product/combo-suggestions', { params: { limit: 10 } }),
                axios.get('http://localhost:8080/api/analytics/product/weekly-trend', { params })
            ]);

            setProductKpiData(kpi.data);
            setBcgData(bcg.data);
            setComboData(combo.data);
            setTrendData(trend.data);
        } catch (error) {
            console.error('Error fetching product data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkforceData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            const [kpi, processTime, staffRanking, reconciliation, heatmap] = await Promise.all([
                axios.get('http://localhost:8080/api/analytics/workforce/kpi', { params }),
                axios.get('http://localhost:8080/api/analytics/workforce/process-time', { params }),
                axios.get('http://localhost:8080/api/analytics/workforce/staff-ranking', { params }),
                axios.get('http://localhost:8080/api/analytics/workforce/reconciliation', { params }),
                axios.get('http://localhost:8080/api/analytics/workforce/hourly-heatmap', { params })
            ]);

            setWorkforceKpiData(kpi.data);
            setProcessTimeData(processTime.data);
            setStaffRankingData(staffRanking.data);
            setReconciliationData(reconciliation.data);
            setHeatmapData(heatmap.data);
        } catch (error) {
            console.error('Error fetching workforce data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Rice Shop Admin';
            workbook.created = new Date();

            // ===== Sheet 1: KPI Summary =====
            const kpiSheet = workbook.addWorksheet('KPI Tổng hợp');
            kpiSheet.columns = [
                { header: 'Chỉ số', key: 'metric', width: 30 },
                { header: 'Giá trị', key: 'value', width: 25 }
            ];

            // Style header
            kpiSheet.getRow(1).font = { bold: true, size: 12 };
            kpiSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
            kpiSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            kpiSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Add KPI data
            kpiSheet.addRow({ metric: 'Tổng Doanh thu', value: formatCurrency(kpiData.total_revenue) + ' đ' });
            kpiSheet.addRow({ metric: 'Đơn hàng hoàn thành', value: kpiData.completed_orders });
            kpiSheet.addRow({ metric: 'Tổng đơn hàng', value: kpiData.total_orders });
            kpiSheet.addRow({ metric: 'Tỷ lệ hoàn thành', value: kpiData.completion_rate + '%' });
            kpiSheet.addRow({ metric: 'Giá trị TB/Đơn (AOV)', value: formatCurrency(kpiData.avg_order_value) + ' đ' });
            kpiSheet.addRow({ metric: 'Khách hàng độc lập', value: kpiData.unique_customers });
            kpiSheet.addRow({ metric: 'Tỷ lệ tăng trưởng', value: (kpiData.growth_rate > 0 ? '+' : '') + kpiData.growth_rate + '%' });

            // Style data rows
            kpiSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.font = { size: 11 };
                    row.getCell(1).font = { bold: true };
                }
            });

            // ===== Sheet 2: Time Series =====
            const timeSheet = workbook.addWorksheet('Doanh thu theo ngày');
            timeSheet.columns = [
                { header: 'Ngày', key: 'date', width: 15 },
                { header: 'Số đơn', key: 'orders', width: 12 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
            ];

            timeSheet.getRow(1).font = { bold: true, size: 12 };
            timeSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            timeSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            timeSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            timeSeriesData.forEach(d => {
                timeSheet.addRow({
                    date: new Date(d.time_bucket).toLocaleDateString('vi-VN'),
                    orders: d.total_orders,
                    revenue: formatCurrency(d.total_revenue)
                });
            });

            // ===== Sheet 3: Channel Mix =====
            const channelSheet = workbook.addWorksheet('Kênh bán hàng');
            channelSheet.columns = [
                { header: 'Kênh', key: 'channel', width: 15 },
                { header: 'Số giao dịch', key: 'count', width: 15 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 },
                { header: 'Tỷ lệ (%)', key: 'percentage', width: 12 }
            ];

            channelSheet.getRow(1).font = { bold: true, size: 12 };
            channelSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
            channelSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            channelSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            channelMixData.forEach(d => {
                channelSheet.addRow({
                    channel: d.order_type === 'ONLINE' ? 'Online' : 'Tại quán',
                    count: d.transaction_count,
                    revenue: formatCurrency(d.revenue_volume),
                    percentage: d.percentage + '%'
                });
            });

            // ===== Sheet 4: Payment Mix =====
            const paymentSheet = workbook.addWorksheet('Phương thức thanh toán');
            paymentSheet.columns = [
                { header: 'Phương thức', key: 'method', width: 15 },
                { header: 'Số giao dịch', key: 'count', width: 15 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 },
                { header: 'Tỷ lệ (%)', key: 'percentage', width: 12 }
            ];

            paymentSheet.getRow(1).font = { bold: true, size: 12 };
            paymentSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
            paymentSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            paymentSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            paymentMixData.forEach(d => {
                paymentSheet.addRow({
                    method: d.payment_method === 'CASH' ? 'Tiền mặt' : 'VietQR',
                    count: d.transaction_count,
                    revenue: formatCurrency(d.revenue_volume),
                    percentage: d.percentage + '%'
                });
            });

            // ===== Sheet 5: Top Products =====
            const productsSheet = workbook.addWorksheet('Top sản phẩm');
            productsSheet.columns = [
                { header: '#', key: 'rank', width: 5 },
                { header: 'Tên món', key: 'name', width: 30 },
                { header: 'Danh mục', key: 'category', width: 15 },
                { header: 'Số lượng', key: 'quantity', width: 12 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
            ];

            productsSheet.getRow(1).font = { bold: true, size: 12 };
            productsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
            productsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            productsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            topProductsData.forEach((p, index) => {
                productsSheet.addRow({
                    rank: index + 1,
                    name: p.product_name,
                    category: p.category,
                    quantity: p.total_quantity,
                    revenue: formatCurrency(p.total_revenue)
                });
            });

            // Save file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = `BaoCao_DoanhThu_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
            saveAs(blob, fileName);

            alert('✅ Xuất file Excel thành công!\n\nLưu ý: Bạn có thể tạo biểu đồ từ dữ liệu này trong Excel bằng cách:\n1. Chọn dữ liệu\n2. Insert → Chart\n3. Chọn loại biểu đồ phù hợp');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('❌ Lỗi khi xuất file Excel: ' + error.message);
        }
    };

    const tabs = [
        { id: 'sales', label: 'Báo cáo Bán hàng', icon: '📊', description: 'Doanh thu và đơn hàng' },
        { id: 'supply', label: 'Quản lý Kho', icon: '📦', description: 'Tồn kho và nhập xuất' },
        { id: 'product', label: 'Phân tích Món ăn', icon: '🎯', description: 'Ma trận BCG & Gợi ý Combo' },
        { id: 'workforce', label: 'Báo cáo Nhân viên', icon: '👥', description: 'Hiệu suất & Đối soát ca' }
    ];

    // Chart configurations
    const timeSeriesChartData = {
        labels: timeSeriesData.map(d => new Date(d.time_bucket).toLocaleDateString('vi-VN')),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: timeSeriesData.map(d => d.total_revenue),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const channelChartData = {
        labels: channelMixData.map(d => d.order_type === 'ONLINE' ? 'Online' : 'Tại quán'),
        datasets: [{
            data: channelMixData.map(d => d.revenue_volume),
            backgroundColor: ['#3b82f6', '#10b981'],
            borderWidth: 0
        }]
    };

    const paymentChartData = {
        labels: paymentMixData.map(d => d.payment_method === 'CASH' ? 'Tiền mặt' : 'VietQR'),
        datasets: [{
            data: paymentMixData.map(d => d.revenue_volume),
            backgroundColor: ['#f59e0b', '#8b5cf6'],
            borderWidth: 0
        }]
    };

    return (
        <AdminLayout activePage="Báo cáo Thống kê">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="grid grid-cols-4 border-b">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-4 font-bold transition text-center ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{tab.icon}</div>
                            <div className="text-sm">{tab.label}</div>
                            <div className="text-xs opacity-70">{tab.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Date Filter - Shared across all tabs */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                {/* Quick Filter Buttons */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-700">🗓️ Bộ lọc nhanh:</span>
                    {[
                        { id: 'today', label: 'Hôm nay' },
                        { id: 'week', label: 'Tuần này' },
                        { id: 'lastWeek', label: 'Tuần trước' },
                        { id: 'month', label: 'Tháng này' },
                        { id: 'lastMonth', label: 'Tháng trước' },
                        { id: 'year', label: 'Năm 2025' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setQuickDateRange(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activePeriod === p.id
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                {/* Custom Date Range */}
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700">Tùy chọn:</span>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => { setDateRange({ ...dateRange, startDate: e.target.value }); setActivePeriod('custom'); }}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium"
                    />
                    <span className="text-gray-600">→</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => { setDateRange({ ...dateRange, endDate: e.target.value }); setActivePeriod('custom'); }}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium"
                    />
                    <span className="text-sm text-gray-500 italic">
                        ({dateRange.startDate} → {dateRange.endDate})
                    </span>
                    {activeTab === 'sales' && (
                        <button
                            onClick={exportToExcel}
                            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            📥 Xuất Excel
                        </button>
                    )}
                </div>
            </div>
            {/* Sales Performance Tab */}
            {activeTab === 'sales' && (
                <>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-6 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📊 Doanh thu (S)</div>
                                    <div className="text-xl font-black">{formatCurrency(kpiData.total_revenue)} đ</div>
                                    <div className="text-xs opacity-75 mt-2">
                                        {kpiData.growth_rate > 0 ? '📈' : '📉'} {Math.abs(kpiData.growth_rate || 0).toFixed(1)}% vs kỳ trước
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📦 Giá vốn (COGS)</div>
                                    <div className="text-xl font-black">{formatCurrency(kpiData.cogs)} đ</div>
                                    <div className="text-xs opacity-75 mt-2 italic">
                                        Chi phí nguyên liệu đã dùng
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">💰 Lợi nhuận gộp (P<sub>gross</sub>)</div>
                                    <div className="text-xl font-black">{formatCurrency(kpiData.gross_profit)} đ</div>
                                    <div className="text-xs opacity-75 mt-2">
                                        Biên lợi nhuận: {kpiData.gross_margin_pct || 0}%
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">✅ Đơn Thành Công</div>
                                    <div className="text-xl font-black">{kpiData.completed_orders || 0}</div>
                                    <div className="text-xs opacity-75 mt-2 italic">
                                        {kpiData.completion_rate || 0}% trên {kpiData.total_orders || 0} đơn
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">💵 TB/Đơn (AOV)</div>
                                    <div className="text-xl font-black">{formatCurrency(kpiData.avg_order_value)} đ</div>
                                    <div className="text-xs opacity-75 mt-2 italic">
                                        Tiền TB mỗi đơn hàng
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">👤 Khách Hàng</div>
                                    <div className="text-xl font-black">{kpiData.unique_customers || 0}</div>
                                    <div className="text-xs opacity-75 mt-2 italic">
                                        Số người đã mua hàng
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">📈 Doanh thu theo ngày</h3>
                                    <Line data={timeSeriesChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                                </div>
                            </div>

                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">🏪 Kênh bán hàng</h3>
                                    <Pie data={channelChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">💳 Phương thức thanh toán</h3>
                                    <Pie data={paymentChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                                </div>
                            </div>

                            {/* Top Products Table */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-black text-gray-800 mb-4">🏆 Top 5 sản phẩm bán chạy</h3>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">Tên món</th>
                                            <th className="px-4 py-3 text-center font-bold text-gray-700">Danh mục</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Số lượng</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProductsData.slice(0, displayLimit).map((product, index) => (
                                            <tr key={product.product_id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3 font-bold text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3 font-bold text-gray-800">{product.product_name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">{product.total_quantity}</td>
                                                <td className="px-4 py-3 text-right font-black text-green-600">
                                                    {formatCurrency(product.total_revenue)} đ
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Show More Button */}
                                {displayLimit < topProductsData.length && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={() => setDisplayLimit(prev => Math.min(prev + 5, topProductsData.length))}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
                                        >
                                            📊 Xem thêm ({topProductsData.length - displayLimit} còn lại)
                                        </button>
                                    </div>
                                )}

                                {/* Collapse Button */}
                                {displayLimit > 5 && displayLimit >= topProductsData.length && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={() => setDisplayLimit(5)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold transition"
                                        >
                                            ⬆️ Thu gọn
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Supply Chain Tab */}
            {activeTab === 'supply' && (
                <>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-1 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📦 Tổng Giá Trị Kho</div>
                                    <div className="text-2xl font-black">{formatCurrency(supplyKpiData.total_inventory_value)} đ</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Tổng tiền nguyên liệu đang tồn</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⚠️ Cảnh Báo Sắp Hết</div>
                                    <div className="text-2xl font-black">{supplyKpiData.urgent_alerts || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Số nguyên liệu sắp hết · Trên {supplyKpiData.total_materials} loại</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⭐ Nguyên Liệu Quan Trọng</div>
                                    <div className="text-2xl font-black">{supplyKpiData.abc_class_a_count || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Chiếm 80% giá trị · Cần kiểm soát chặt</div>
                                </div>
                                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">🔄 Tốc Độ Bán</div>
                                    <div className="text-2xl font-black">{supplyKpiData.avg_turnover_ratio || 0}x</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Kho quay vòng bao nhiêu lần/tháng</div>
                                </div>
                            </div>

                            {/* ABC Analysis Chart */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">📊 Mức Độ Quan Trọng của Nguyên Liệu</h3>
                                    <Pie
                                        data={{
                                            labels: ['⭐ Quan Trọng Nhất (Chiếm 80%)', '🟡 Trung Bình (15%)', '🟢 Ít Quan Trọng (5%)'],
                                            datasets: [{
                                                data: [
                                                    supplyKpiData.abc_class_a_count || 0,
                                                    supplyKpiData.abc_class_b_count || 0,
                                                    supplyKpiData.abc_class_c_count || 0
                                                ],
                                                backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
                                            }]
                                        }}
                                    />
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">📈 Turnover Top 5</h3>
                                    <Bar
                                        data={{
                                            labels: turnoverData.slice(0, 5).map(m => m.name),
                                            datasets: [{
                                                label: 'Tỷ lệ quay vòng',
                                                data: turnoverData.slice(0, 5).map(m => m.turnover_ratio || 0),
                                                backgroundColor: '#3b82f6'
                                            }]
                                        }}
                                        options={{ indexAxis: 'y', responsive: true }}
                                    />
                                </div>
                            </div>

                            {/* Reorder Alerts Table */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-black text-gray-800 mb-4">🚨 Cảnh báo Tồn kho</h3>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold">Nguyên liệu</th>
                                            <th className="px-4 py-3 text-right font-bold">Tồn hiện tại</th>
                                            <th className="px-4 py-3 text-right font-bold">Dùng TB/ngày</th>
                                            <th className="px-4 py-3 text-right font-bold">Số ngày còn</th>
                                            <th className="px-4 py-3 text-center font-bold">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reorderAlerts.filter(m => m.alert_status !== 'OK').map(material => (
                                            <tr key={material.material_id} className="border-t">
                                                <td className="px-4 py-3 font-bold">{material.name}</td>
                                                <td className="px-4 py-3 text-right">{material.quantity_in_stock} {material.unit}</td>
                                                <td className="px-4 py-3 text-right">{material.avg_daily_usage}</td>
                                                <td className="px-4 py-3 text-right">{material.days_until_stockout || 'N/A'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${material.alert_status === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {material.alert_status === 'URGENT' ? '🔴 Khẩn cấp' : '⚠️ Cảnh báo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {reorderAlerts.filter(m => m.alert_status !== 'OK').length === 0 && (
                                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">✅ Tất cả nguyên liệu đều đủ tồn kho</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'sales' && activeTab !== 'supply' && activeTab !== 'product' && activeTab !== 'workforce' && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Tính năng đang phát triển</h3>
                    <p className="text-gray-600">
                        {tabs.find(t => t.id === activeTab)?.description} sẽ sớm được cập nhật
                    </p>
                </div>
            )}

            {/* Workforce Analytics Tab */}
            {activeTab === 'workforce' && (
                <>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⏱️ Thời Gian Xử Lý TB</div>
                                    <div className="text-2xl font-black">{workforceKpiData.avg_process_time || 0} phút</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Từ đặt đến hoàn thành</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">🏆 Nhân Viên Xuất Sắc</div>
                                    <div className="text-xl font-black">{workforceKpiData.top_performer || 'N/A'}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">{formatCurrency(workforceKpiData.top_revenue_per_hour)}đ/giờ</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📅 Tổng Ca Đã Đóng</div>
                                    <div className="text-2xl font-black">{workforceKpiData.total_closed_shifts || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">{workforceKpiData.active_staff_count || 0} nhân viên</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⚠️ Ca Có Chênh Lệch</div>
                                    <div className="text-2xl font-black">{workforceKpiData.reconciliation_issues || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Cần kiểm tra lại</div>
                                </div>
                            </div>

                            {/* Process Time Chart */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="font-black text-gray-800 mb-4">⏱️ Thời Gian Xử Lý Đơn Hàng</h3>
                                <p className="text-sm text-gray-500 mb-4 italic">Thời gian trung bình mỗi giai đoạn (phút)</p>
                                <Bar
                                    data={{
                                        labels: ['Xác nhận đơn', 'Chế biến (Bếp)', 'Chờ lấy đồ'],
                                        datasets: [{
                                            label: 'Phút',
                                            data: [
                                                processTimeData.avg_confirm_min || 0,
                                                processTimeData.avg_cooking_min || 0,
                                                processTimeData.avg_pickup_min || 0
                                            ],
                                            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true, title: { display: true, text: 'Phút' } } }
                                    }}
                                />
                            </div>

                            {/* Two Tables Row */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Staff Ranking */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">🏆 Xếp Hạng Nhân Viên</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">Theo doanh thu mỗi giờ làm việc</p>
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold">Hạng</th>
                                                <th className="px-3 py-2 text-left font-bold">Nhân viên</th>
                                                <th className="px-3 py-2 text-right font-bold">Số ca</th>
                                                <th className="px-3 py-2 text-right font-bold">DT/Giờ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffRankingData.slice(0, 8).map((staff, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2">
                                                        {staff.rank === 1 && '🥇'}
                                                        {staff.rank === 2 && '🥈'}
                                                        {staff.rank === 3 && '🥉'}
                                                        {staff.rank > 3 && `#${staff.rank}`}
                                                    </td>
                                                    <td className="px-3 py-2 font-medium">{staff.full_name}</td>
                                                    <td className="px-3 py-2 text-right">{staff.total_shifts}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-green-600">{formatCurrency(staff.revenue_per_hour)}đ</td>
                                                </tr>
                                            ))}
                                            {staffRankingData.length === 0 && (
                                                <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-500">Chưa có dữ liệu ca</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Peak Hours */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">🔥 Giờ Cao Điểm</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">Số đơn theo khung giờ</p>
                                    <div className="grid grid-cols-6 gap-1">
                                        {Array.from({ length: 18 }, (_, i) => i + 6).map(hour => {
                                            const hourData = heatmapData.filter(h => h.hour === hour);
                                            const total = hourData.reduce((sum, h) => sum + (h.order_count || 0), 0);
                                            const maxTotal = Math.max(...Array.from({ length: 18 }, (_, i) =>
                                                heatmapData.filter(h => h.hour === i + 6).reduce((s, h) => s + (h.order_count || 0), 0)
                                            ), 1);
                                            const intensity = Math.round((total / maxTotal) * 100);
                                            return (
                                                <div key={hour} className="text-center">
                                                    <div
                                                        className="h-8 rounded mb-1"
                                                        style={{
                                                            backgroundColor: `rgba(239, 68, 68, ${intensity / 100})`,
                                                            border: '1px solid #e5e7eb'
                                                        }}
                                                        title={`${hour}h: ${total} đơn`}
                                                    ></div>
                                                    <div className="text-xs text-gray-500">{hour}h</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-sm text-gray-600">Giờ cao điểm: </span>
                                        <span className="font-bold text-red-600">{workforceKpiData.peak_hour || 12}h</span>
                                        <span className="text-sm text-gray-600"> ({workforceKpiData.peak_orders || 0} đơn)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reconciliation Table */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-black text-gray-800 mb-4">💰 Đối Soát Ca Làm Việc</h3>
                                <p className="text-sm text-gray-500 mb-4 italic">So sánh tiền mặt hệ thống vs khai báo</p>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold">Nhân viên</th>
                                            <th className="px-3 py-2 text-left font-bold">Thời gian</th>
                                            <th className="px-3 py-2 text-right font-bold">HT ghi nhận</th>
                                            <th className="px-3 py-2 text-right font-bold">NV khai báo</th>
                                            <th className="px-3 py-2 text-right font-bold">Chênh lệch</th>
                                            <th className="px-3 py-2 text-center font-bold">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reconciliationData.slice(0, 10).map((shift, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-3 py-2 font-medium">{shift.full_name}</td>
                                                <td className="px-3 py-2 text-sm">
                                                    {new Date(shift.start_time).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(shift.system_cash)}đ</td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(shift.declared_cash)}đ</td>
                                                <td className={`px-3 py-2 text-right font-bold ${shift.variance > 0 ? 'text-green-600' : shift.variance < 0 ? 'text-red-600' : ''}`}>
                                                    {shift.variance > 0 ? '+' : ''}{formatCurrency(shift.variance)}đ
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {shift.status === 'OK' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ OK</span>}
                                                    {shift.status === 'WARNING' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">⚠️ Cảnh báo</span>}
                                                    {shift.status === 'CRITICAL' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">🔴 Nghiêm trọng</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {reconciliationData.length === 0 && (
                                            <tr><td colSpan="6" className="px-3 py-4 text-center text-gray-500">Chưa có dữ liệu ca</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Product Analytics Tab */}
            {activeTab === 'product' && (
                <>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⭐ Món Bán Chạy & Lãi Cao</div>
                                    <div className="text-2xl font-black">{productKpiData.star_count || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Giữ nguyên, tập trung quảng bá</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">❌ Cần Xem Xét Loại Bỏ</div>
                                    <div className="text-2xl font-black">{productKpiData.dog_count || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Ít bán & lãi thấp</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">💡 Gợi Ý Combo</div>
                                    <div className="text-2xl font-black">{productKpiData.combo_suggestions || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Cặp món thường mua cùng</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📈 Đang Tăng Trưởng</div>
                                    <div className="text-2xl font-black">{productKpiData.rising_products || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Món bán hơn tuần trước</div>
                                </div>
                            </div>

                            {/* BCG Matrix Chart */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="font-black text-gray-800 mb-4">📊 Ma Trận Hiệu Quả Món Ăn</h3>
                                <p className="text-sm text-gray-500 mb-4 italic">Biểu đồ phân loại món theo số lượng bán (ngang) và doanh thu (dọc)</p>
                                <div style={{ height: '400px' }}>
                                    <Scatter
                                        data={{
                                            datasets: [
                                                {
                                                    label: '⭐ Bán chạy & Lãi cao',
                                                    data: bcgData.filter(p => p.bcg_category === 'STAR').map(p => ({ x: p.total_quantity, y: p.total_revenue, name: p.name })),
                                                    backgroundColor: '#f59e0b',
                                                    pointRadius: 10
                                                },
                                                {
                                                    label: '🐄 Ít bán nhưng giá trị cao',
                                                    data: bcgData.filter(p => p.bcg_category === 'CASH_COW').map(p => ({ x: p.total_quantity, y: p.total_revenue, name: p.name })),
                                                    backgroundColor: '#10b981',
                                                    pointRadius: 10
                                                },
                                                {
                                                    label: '❓ Bán nhiều, lãi thấp',
                                                    data: bcgData.filter(p => p.bcg_category === 'QUESTION').map(p => ({ x: p.total_quantity, y: p.total_revenue, name: p.name })),
                                                    backgroundColor: '#8b5cf6',
                                                    pointRadius: 10
                                                },
                                                {
                                                    label: '❌ Cần xem xét loại bỏ',
                                                    data: bcgData.filter(p => p.bcg_category === 'DOG').map(p => ({ x: p.total_quantity, y: p.total_revenue, name: p.name })),
                                                    backgroundColor: '#ef4444',
                                                    pointRadius: 10
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: (ctx) => `${ctx.raw.name}: ${ctx.raw.x} món, ${formatCurrency(ctx.raw.y)}đ`
                                                    }
                                                }
                                            },
                                            scales: {
                                                x: { title: { display: true, text: 'Số lượng bán' } },
                                                y: { title: { display: true, text: 'Doanh thu (đ)' } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Two Tables Row */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Combo Suggestions */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">💡 Gợi Ý Tạo Combo</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">Các cặp món thường được mua cùng nhau</p>
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold">Món A</th>
                                                <th className="px-3 py-2 text-left font-bold">Món B</th>
                                                <th className="px-3 py-2 text-right font-bold">Số lần</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comboData.slice(0, 8).map((pair, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2">{pair.product_a}</td>
                                                    <td className="px-3 py-2">{pair.product_b}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-purple-600">{pair.pair_count}</td>
                                                </tr>
                                            ))}
                                            {comboData.length === 0 && (
                                                <tr><td colSpan="3" className="px-3 py-4 text-center text-gray-500">Chưa đủ dữ liệu</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Period Trend */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">📈 Xu Hướng Kỳ Này</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">So sánh với kỳ trước (cùng độ dài)</p>
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold">Món</th>
                                                <th className="px-3 py-2 text-right font-bold">Kỳ này</th>
                                                <th className="px-3 py-2 text-right font-bold">Kỳ trước</th>
                                                <th className="px-3 py-2 text-center font-bold">Xu hướng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trendData.slice(0, 8).map((item, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2 font-medium">{item.name}</td>
                                                    <td className="px-3 py-2 text-right">{item.this_period || 0}</td>
                                                    <td className="px-3 py-2 text-right">{item.last_period || 0}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        {item.trend === 'UP' && <span className="text-green-600 font-bold">⬆️ +{item.growth_pct}%</span>}
                                                        {item.trend === 'DOWN' && <span className="text-red-600 font-bold">⬇️ {item.growth_pct}%</span>}
                                                        {item.trend === 'STABLE' && <span className="text-gray-500">➡️ 0%</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {trendData.length === 0 && (
                                                <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-500">Chưa đủ dữ liệu</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminReportsPage;
