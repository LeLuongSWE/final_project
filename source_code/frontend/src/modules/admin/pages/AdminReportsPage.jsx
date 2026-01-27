import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axiosClient';
import AdminLayout from '../components/AdminLayout';
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

    // Get today's date in yyyy-mm-dd format (local timezone)
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTodayString = () => {
        return formatDateLocal(new Date());
    };

    const [dateRange, setDateRange] = useState({
        startDate: getTodayString(),
        endDate: getTodayString()
    });
    const [activePeriod, setActivePeriod] = useState('today'); // Default to today
    const [loading, setLoading] = useState(true);

    // Display values for dd/mm/yyyy format
    const formatToDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const [startDateDisplay, setStartDateDisplay] = useState(formatToDisplay(getTodayString()));
    const [endDateDisplay, setEndDateDisplay] = useState(formatToDisplay(getTodayString()));
    const [dateError, setDateError] = useState('');

    // Handle date change with validation
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        if (newStartDate > dateRange.endDate) {
            setDateError('⚠️ Ngày bắt đầu không được lớn hơn ngày kết thúc!');
            setTimeout(() => setDateError(''), 3000);
            return;
        }
        setDateError('');
        setDateRange({ ...dateRange, startDate: newStartDate });
        setActivePeriod('custom');
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        if (newEndDate < dateRange.startDate) {
            setDateError('⚠️ Ngày kết thúc không được nhỏ hơn ngày bắt đầu!');
            setTimeout(() => setDateError(''), 3000);
            return;
        }
        setDateError('');
        setDateRange({ ...dateRange, endDate: newEndDate });
        setActivePeriod('custom');
    };

    // Sync display values when dateRange changes (from quick filters)
    useEffect(() => {
        setStartDateDisplay(formatToDisplay(dateRange.startDate));
        setEndDateDisplay(formatToDisplay(dateRange.endDate));
    }, [dateRange.startDate, dateRange.endDate]);

    // Navigate to previous/next period
    const navigatePeriod = (direction) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Calculate the period length in days
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const periodDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        let newStart, newEnd;

        if (direction === 'prev') {
            // Go to previous period
            newEnd = new Date(startDate);
            newEnd.setDate(newEnd.getDate() - 1);
            newStart = new Date(newEnd);
            newStart.setDate(newStart.getDate() - periodDays + 1);
        } else {
            // Go to next period
            newStart = new Date(endDate);
            newStart.setDate(newStart.getDate() + 1);
            newEnd = new Date(newStart);
            newEnd.setDate(newEnd.getDate() + periodDays - 1);

            // Don't allow going beyond today
            if (newStart > today) {
                setDateError('⚠️ Không thể xem dữ liệu sau ngày hôm nay!');
                setTimeout(() => setDateError(''), 3000);
                return;
            }

            // Cap end date at today
            if (newEnd > today) {
                newEnd = today;
            }
        }

        setDateRange({
            startDate: formatDateLocal(newStart),
            endDate: formatDateLocal(newEnd)
        });
        setActivePeriod('custom');
    };

    // Check if can navigate to next period
    const canNavigateNext = () => {
        const today = new Date();
        const endDate = new Date(dateRange.endDate);
        return endDate < today;
    };

    // Quick date filter helper
    const setQuickDateRange = (period) => {
        const today = new Date(); // Use actual current date
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
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                return;
        }

        setActivePeriod(period);
        setDateRange({
            startDate: formatDateLocal(start),
            endDate: formatDateLocal(end)
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

    // Customer Analytics Data
    const [customerKpiData, setCustomerKpiData] = useState({});
    const [customerDistrictData, setCustomerDistrictData] = useState([]);
    const [customerFrequencyData, setCustomerFrequencyData] = useState([]);
    const [customerValueData, setCustomerValueData] = useState([]);

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
        } else if (activeTab === 'customer') {
            fetchCustomerData();
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
                api.get('/analytics/sales/kpi', { params }),
                api.get('/analytics/sales/time-series', { params: { ...params, granularity: 'day' } }),
                api.get('/analytics/sales/channel-mix', { params }),
                api.get('/analytics/sales/payment-mix', { params }),
                api.get('/analytics/sales/top-products', { params: { ...params, limit: 50 } }) // Fetch 50 for pagination
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
                api.get('/analytics/supply-chain/kpi', { params }),
                api.get('/analytics/supply-chain/abc-analysis', { params }),
                api.get('/analytics/supply-chain/reorder-alerts'),
                api.get('/analytics/supply-chain/turnover', { params })
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
                api.get('/analytics/product/kpi', { params }),
                api.get('/analytics/product/bcg-matrix', { params }),
                api.get('/analytics/product/combo-suggestions', { params: { limit: 10 } }),
                api.get('/analytics/product/weekly-trend', { params })
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
                api.get('/analytics/workforce/kpi', { params }),
                api.get('/analytics/workforce/process-time', { params }),
                api.get('/analytics/workforce/staff-ranking', { params }),
                api.get('/analytics/workforce/reconciliation', { params }),
                api.get('/analytics/workforce/hourly-heatmap', { params })
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

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            const [kpi, ward, frequency, orderValue] = await Promise.all([
                api.get('/analytics/customers/kpi', { params }),
                api.get('/analytics/customers/by-ward', { params }),
                api.get('/analytics/customers/by-frequency', { params }),
                api.get('/analytics/customers/by-order-value', { params })
            ]);

            setCustomerKpiData(kpi.data);
            setCustomerDistrictData(ward.data);
            setCustomerFrequencyData(frequency.data);
            setCustomerValueData(orderValue.data);
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    // Format date to dd/mm/yyyy for Vietnamese display
    const formatDateVN = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Parse dd/mm/yyyy back to yyyy-mm-dd for API
    const parseDateVN = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;
        const [day, month, year] = parts;
        if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    };

    // Handle date input change with dd/mm/yyyy format
    const handleDateChange = (field, value) => {
        // Allow typing in dd/mm/yyyy format
        let cleanValue = value.replace(/[^0-9/]/g, '');

        // Auto-add slashes
        if (cleanValue.length === 2 && !cleanValue.includes('/')) {
            cleanValue = cleanValue + '/';
        } else if (cleanValue.length === 5 && cleanValue.split('/').length === 2) {
            cleanValue = cleanValue + '/';
        }

        // Limit length
        if (cleanValue.length > 10) cleanValue = cleanValue.substring(0, 10);

        // Update display value
        if (field === 'start') {
            setStartDateDisplay(cleanValue);
            // If complete date, update dateRange
            if (cleanValue.length === 10) {
                const parsed = parseDateVN(cleanValue);
                if (parsed !== cleanValue) {
                    setDateRange({ ...dateRange, startDate: parsed });
                    setActivePeriod('custom');
                }
            }
        } else {
            setEndDateDisplay(cleanValue);
            if (cleanValue.length === 10) {
                const parsed = parseDateVN(cleanValue);
                if (parsed !== cleanValue) {
                    setDateRange({ ...dateRange, endDate: parsed });
                    setActivePeriod('custom');
                }
            }
        }
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

    // Export Supply Chain (Quản lý Kho) to Excel
    const exportSupplyChainToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Rice Shop Admin';
            workbook.created = new Date();

            // ===== Sheet 1: KPI Summary =====
            const kpiSheet = workbook.addWorksheet('KPI Kho hàng');
            kpiSheet.columns = [
                { header: 'Chỉ số', key: 'metric', width: 35 },
                { header: 'Giá trị', key: 'value', width: 25 }
            ];

            kpiSheet.getRow(1).font = { bold: true, size: 12 };
            kpiSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
            kpiSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            kpiSheet.addRow({ metric: 'Kỳ báo cáo', value: supplyKpiData.period_days + ' ngày' });
            kpiSheet.addRow({ metric: 'Tồn kho đầu kỳ', value: formatCurrency(supplyKpiData.start_inventory_value) + ' đ' });
            kpiSheet.addRow({ metric: 'Tồn kho cuối kỳ', value: formatCurrency(supplyKpiData.end_inventory_value) + ' đ' });
            kpiSheet.addRow({ metric: 'Tồn kho bình quân', value: formatCurrency(supplyKpiData.avg_inventory_value) + ' đ' });
            kpiSheet.addRow({ metric: 'Tổng nhập kho', value: formatCurrency(supplyKpiData.total_in_value) + ' đ' });
            kpiSheet.addRow({ metric: 'Tổng xuất kho (COGS)', value: formatCurrency(supplyKpiData.cogs) + ' đ' });
            kpiSheet.addRow({ metric: 'Vòng quay tồn kho', value: (supplyKpiData.turnover_ratio || 0) + 'x' });
            kpiSheet.addRow({ metric: 'Số ngày tồn kho', value: supplyKpiData.days_on_hand || 0 });
            kpiSheet.addRow({ metric: 'Số loại nguyên liệu', value: supplyKpiData.total_materials || 0 });
            kpiSheet.addRow({ metric: 'Cảnh báo cần nhập', value: supplyKpiData.urgent_alerts || 0 });
            kpiSheet.addRow({ metric: 'Hết hàng', value: supplyKpiData.out_of_stock || 0 });
            kpiSheet.addRow({ metric: 'Phân loại A (80% giá trị)', value: supplyKpiData.abc_class_a_count || 0 });
            kpiSheet.addRow({ metric: 'Phân loại B (15% giá trị)', value: supplyKpiData.abc_class_b_count || 0 });
            kpiSheet.addRow({ metric: 'Phân loại C (5% giá trị)', value: supplyKpiData.abc_class_c_count || 0 });

            // ===== Sheet 2: ABC Analysis =====
            const abcSheet = workbook.addWorksheet('Phân loại ABC');
            abcSheet.columns = [
                { header: 'Tên nguyên liệu', key: 'name', width: 30 },
                { header: 'Phân loại', key: 'category', width: 12 },
                { header: 'Giá trị (VNĐ)', key: 'value', width: 25 },
                { header: 'Số lượng', key: 'quantity', width: 15 },
                { header: '% Tích lũy', key: 'pct', width: 12 }
            ];

            abcSheet.getRow(1).font = { bold: true, size: 12 };
            abcSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            abcSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            abcData.forEach(item => {
                abcSheet.addRow({
                    name: item.name,
                    category: item.abc_class,
                    value: formatCurrency(item.total_value),
                    quantity: (item.total_quantity || 0).toFixed(2),
                    pct: (item.cumulative_pct || 0).toFixed(1) + '%'
                });
            });

            // ===== Sheet 3: Reorder Alerts =====
            const alertSheet = workbook.addWorksheet('Tình trạng tồn kho');
            alertSheet.columns = [
                { header: 'Tên nguyên liệu', key: 'name', width: 30 },
                { header: 'SL tồn hiện tại', key: 'current', width: 18 },
                { header: 'Mức tối thiểu', key: 'min', width: 15 },
                { header: 'Đơn vị', key: 'unit', width: 10 },
                { header: 'SD TB/ngày', key: 'usage', width: 15 },
                { header: 'Số ngày còn', key: 'days', width: 15 },
                { header: 'Trạng thái', key: 'status', width: 12 }
            ];

            alertSheet.getRow(1).font = { bold: true, size: 12 };
            alertSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
            alertSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            reorderAlerts.forEach(item => {
                const row = alertSheet.addRow({
                    name: item.name,
                    current: (item.quantity_in_stock || 0).toFixed(2),
                    min: item.current_min || 0,
                    unit: item.unit,
                    usage: (item.avg_daily_usage || 0).toFixed(2),
                    days: (item.days_until_stockout || 0).toFixed(0),
                    status: item.alert_status || 'OK'
                });
                if (item.alert_status !== 'OK') {
                    row.font = { color: { argb: 'FFEF4444' } };
                }
            });

            // ===== Sheet 4: Turnover Data =====
            const turnoverSheet = workbook.addWorksheet('Vòng quay tồn kho');
            turnoverSheet.columns = [
                { header: 'Tên nguyên liệu', key: 'name', width: 30 },
                { header: 'Đơn vị', key: 'unit', width: 10 },
                { header: 'Vòng quay', key: 'turnover', width: 15 },
                { header: 'Giá vốn (VNĐ)', key: 'cogs', width: 20 },
                { header: 'TB tồn kho (VNĐ)', key: 'avgInventory', width: 25 }
            ];

            turnoverSheet.getRow(1).font = { bold: true, size: 12 };
            turnoverSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
            turnoverSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            turnoverData.forEach(item => {
                turnoverSheet.addRow({
                    name: item.name,
                    unit: item.unit,
                    turnover: (item.turnover_ratio || 0).toFixed(2),
                    cogs: formatCurrency(item.cogs),
                    avgInventory: formatCurrency(item.avg_inventory_value)
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `BaoCao_QuanLyKho_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
            alert('✅ Xuất file Excel Quản lý Kho thành công!');
        } catch (error) {
            console.error('Error exporting supply chain to Excel:', error);
            alert('❌ Lỗi khi xuất file Excel: ' + error.message);
        }
    };

    // Export Product Analytics (Phân tích Món ăn) to Excel
    const exportProductToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Rice Shop Admin';
            workbook.created = new Date();

            // ===== Sheet 1: KPI Summary =====
            const kpiSheet = workbook.addWorksheet('KPI Sản phẩm');
            kpiSheet.columns = [
                { header: 'Chỉ số', key: 'metric', width: 35 },
                { header: 'Giá trị', key: 'value', width: 25 }
            ];

            kpiSheet.getRow(1).font = { bold: true, size: 12 };
            kpiSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
            kpiSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            kpiSheet.addRow({ metric: 'Tổng số món', value: productKpiData.total_products });
            kpiSheet.addRow({ metric: 'Món đang bán', value: productKpiData.active_products });
            kpiSheet.addRow({ metric: 'Danh mục', value: productKpiData.categories });
            kpiSheet.addRow({ metric: 'Combo hay được đặt cùng', value: productKpiData.popular_combos });

            // ===== Sheet 2: BCG Matrix =====
            const bcgSheet = workbook.addWorksheet('Ma trận BCG');
            bcgSheet.columns = [
                { header: 'Tên món', key: 'name', width: 30 },
                { header: 'Danh mục', key: 'category', width: 15 },
                { header: 'Phân loại BCG', key: 'bcg', width: 15 },
                { header: 'Thị phần (%)', key: 'share', width: 15 },
                { header: 'Tăng trưởng (%)', key: 'growth', width: 18 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
            ];

            bcgSheet.getRow(1).font = { bold: true, size: 12 };
            bcgSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            bcgSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            bcgData.forEach(item => {
                bcgSheet.addRow({
                    name: item.product_name,
                    category: item.category,
                    bcg: item.bcg_category,
                    share: (item.market_share || 0).toFixed(1),
                    growth: (item.growth_rate || 0).toFixed(1),
                    revenue: formatCurrency(item.revenue)
                });
            });

            // ===== Sheet 3: Combo Suggestions =====
            const comboSheet = workbook.addWorksheet('Gợi ý Combo');
            comboSheet.columns = [
                { header: 'Món 1', key: 'product1', width: 25 },
                { header: 'Món 2', key: 'product2', width: 25 },
                { header: 'Số lần đặt cùng', key: 'frequency', width: 18 },
                { header: 'Độ tin cậy (%)', key: 'confidence', width: 18 }
            ];

            comboSheet.getRow(1).font = { bold: true, size: 12 };
            comboSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
            comboSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            comboData.forEach(item => {
                comboSheet.addRow({
                    product1: item.product_1_name,
                    product2: item.product_2_name,
                    frequency: item.co_occurrence_count,
                    confidence: (item.confidence || 0).toFixed(1)
                });
            });

            // ===== Sheet 4: Weekly Trend =====
            const trendSheet = workbook.addWorksheet('Xu hướng theo tuần');
            trendSheet.columns = [
                { header: 'Tuần', key: 'week', width: 15 },
                { header: 'Tên món', key: 'name', width: 30 },
                { header: 'Số lượng', key: 'quantity', width: 12 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
            ];

            trendSheet.getRow(1).font = { bold: true, size: 12 };
            trendSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
            trendSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            trendData.forEach(item => {
                trendSheet.addRow({
                    week: item.week_start,
                    name: item.product_name,
                    quantity: item.total_quantity,
                    revenue: formatCurrency(item.total_revenue)
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `BaoCao_PhanTichMonAn_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
            alert('✅ Xuất file Excel Phân tích Món ăn thành công!');
        } catch (error) {
            console.error('Error exporting product to Excel:', error);
            alert('❌ Lỗi khi xuất file Excel: ' + error.message);
        }
    };

    // Export Workforce (Báo cáo Nhân viên) to Excel
    const exportWorkforceToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Rice Shop Admin';
            workbook.created = new Date();

            // ===== Sheet 1: KPI Summary =====
            const kpiSheet = workbook.addWorksheet('KPI Nhân viên');
            kpiSheet.columns = [
                { header: 'Chỉ số', key: 'metric', width: 35 },
                { header: 'Giá trị', key: 'value', width: 25 }
            ];

            kpiSheet.getRow(1).font = { bold: true, size: 12 };
            kpiSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
            kpiSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            kpiSheet.addRow({ metric: 'Tổng số nhân viên', value: workforceKpiData.total_staff });
            kpiSheet.addRow({ metric: 'Tổng ca làm việc', value: workforceKpiData.total_shifts });
            kpiSheet.addRow({ metric: 'Tổng giờ làm', value: (workforceKpiData.total_hours || 0).toFixed(1) + ' giờ' });
            kpiSheet.addRow({ metric: 'TB đơn/ca', value: (workforceKpiData.avg_orders_per_shift || 0).toFixed(1) });
            kpiSheet.addRow({ metric: 'TB doanh thu/ca', value: formatCurrency(workforceKpiData.avg_revenue_per_shift) + ' đ' });

            // ===== Sheet 2: Staff Ranking =====
            const rankSheet = workbook.addWorksheet('Xếp hạng Nhân viên');
            rankSheet.columns = [
                { header: 'Hạng', key: 'rank', width: 8 },
                { header: 'Tên nhân viên', key: 'name', width: 25 },
                { header: 'Số ca', key: 'shifts', width: 12 },
                { header: 'Tổng đơn', key: 'orders', width: 12 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 },
                { header: 'TB đơn/ca', key: 'avgOrders', width: 15 }
            ];

            rankSheet.getRow(1).font = { bold: true, size: 12 };
            rankSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            rankSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            staffRankingData.forEach((staff, index) => {
                rankSheet.addRow({
                    rank: index + 1,
                    name: staff.full_name,
                    shifts: staff.total_shifts,
                    orders: staff.total_orders,
                    revenue: formatCurrency(staff.total_revenue),
                    avgOrders: (staff.avg_orders_per_shift || 0).toFixed(1)
                });
            });

            // ===== Sheet 3: Shift Reconciliation =====
            const reconSheet = workbook.addWorksheet('Đối soát Ca');
            reconSheet.columns = [
                { header: 'ID Ca', key: 'shiftId', width: 10 },
                { header: 'Nhân viên', key: 'staff', width: 25 },
                { header: 'Ngày', key: 'date', width: 15 },
                { header: 'Giờ vào', key: 'startTime', width: 12 },
                { header: 'Giờ ra', key: 'endTime', width: 12 },
                { header: 'Số đơn', key: 'orders', width: 10 },
                { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
            ];

            reconSheet.getRow(1).font = { bold: true, size: 12 };
            reconSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
            reconSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            reconciliationData.forEach(shift => {
                reconSheet.addRow({
                    shiftId: shift.shift_id,
                    staff: shift.full_name,
                    date: shift.work_date ? new Date(shift.work_date).toLocaleDateString('vi-VN') : '',
                    startTime: shift.start_time,
                    endTime: shift.end_time || 'Đang làm',
                    orders: shift.total_orders,
                    revenue: formatCurrency(shift.total_revenue)
                });
            });

            // ===== Sheet 4: Hourly Heatmap =====
            const heatmapSheet = workbook.addWorksheet('Biểu đồ giờ cao điểm');
            heatmapSheet.columns = [
                { header: 'Thứ', key: 'dayOfWeek', width: 15 },
                { header: 'Giờ', key: 'hour', width: 10 },
                { header: 'Số đơn TB', key: 'avgOrders', width: 15 }
            ];

            heatmapSheet.getRow(1).font = { bold: true, size: 12 };
            heatmapSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
            heatmapSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            heatmapData.forEach(item => {
                heatmapSheet.addRow({
                    dayOfWeek: dayNames[item.day_of_week] || item.day_of_week,
                    hour: item.hour + ':00',
                    avgOrders: (item.avg_orders || 0).toFixed(1)
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `BaoCao_NhanVien_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
            alert('✅ Xuất file Excel Báo cáo Nhân viên thành công!');
        } catch (error) {
            console.error('Error exporting workforce to Excel:', error);
            alert('❌ Lỗi khi xuất file Excel: ' + error.message);
        }
    };

    const tabs = [
        { id: 'sales', label: 'Báo cáo Bán hàng', icon: '📊', description: 'Doanh thu và đơn hàng' },
        { id: 'supply', label: 'Quản lý Kho', icon: '📦', description: 'Tồn kho và nhập xuất' },
        { id: 'product', label: 'Phân tích Món ăn', icon: '🎯', description: 'Ma trận BCG & Gợi ý Combo' },
        { id: 'workforce', label: 'Báo cáo Nhân viên', icon: '👥', description: 'Hiệu suất & Đối soát ca' },
        { id: 'customer', label: 'Phân tích Khách hàng', icon: '🧑‍🤝‍🧑', description: 'Vị trí & Phân khúc' }
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
                <div className="grid grid-cols-5 border-b">
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
                        { id: 'year', label: `Năm ${new Date().getFullYear()}` }
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
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-bold text-gray-700">Tùy chọn:</span>
                    {/* Start Date with Calendar */}
                    <div className="relative">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={handleStartDateChange}
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium cursor-pointer hover:border-blue-400"
                            style={{ colorScheme: 'light' }}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white pr-8 pointer-events-none font-medium">
                            {startDateDisplay}
                        </div>
                    </div>
                    <span className="text-gray-600">→</span>
                    {/* End Date with Calendar */}
                    <div className="relative">
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={handleEndDateChange}
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg font-medium cursor-pointer hover:border-blue-400"
                            style={{ colorScheme: 'light' }}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white pr-8 pointer-events-none font-medium">
                            {endDateDisplay}
                        </div>
                    </div>
                    {/* Period Navigation Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigatePeriod('prev')}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all flex items-center gap-1"
                            title="Kỳ trước"
                        >
                            ◀ Kỳ trước
                        </button>
                        <button
                            onClick={() => navigatePeriod('next')}
                            disabled={!canNavigateNext()}
                            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1 ${canNavigateNext()
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            title={canNavigateNext() ? "Kỳ sau" : "Không thể xem dữ liệu sau ngày hôm nay"}
                        >
                            Kỳ sau ▶
                        </button>
                    </div>
                    {/* Date Error Message */}
                    {dateError && (
                        <span className="text-red-600 font-bold text-sm animate-pulse">
                            {dateError}
                        </span>
                    )}
                    {activeTab === 'sales' && (
                        <button
                            onClick={exportToExcel}
                            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            📥 Xuất Excel
                        </button>
                    )}
                    {activeTab === 'supply' && (
                        <button
                            onClick={exportSupplyChainToExcel}
                            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            📥 Xuất Excel
                        </button>
                    )}
                    {activeTab === 'product' && (
                        <button
                            onClick={exportProductToExcel}
                            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            📥 Xuất Excel
                        </button>
                    )}
                    {activeTab === 'workforce' && (
                        <button
                            onClick={exportWorkforceToExcel}
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
                            <div className="grid grid-cols-5 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📦 Tồn Kho Cuối Kỳ</div>
                                    <div className="text-xl font-black">{formatCurrency(supplyKpiData.end_inventory_value)} đ</div>
                                    <div className="text-xs opacity-75 mt-1">Đầu kỳ: {formatCurrency(supplyKpiData.start_inventory_value)} đ</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📥 Nhập Kho Trong Kỳ</div>
                                    <div className="text-xl font-black">{formatCurrency(supplyKpiData.total_in_value)} đ</div>
                                    <div className="text-xs opacity-75 mt-1">Tổng giá trị nguyên liệu nhập</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📤 Xuất Kho (COGS)</div>
                                    <div className="text-xl font-black">{formatCurrency(supplyKpiData.cogs)} đ</div>
                                    <div className="text-xs opacity-75 mt-1">Giá vốn hàng bán trong kỳ</div>
                                </div>
                                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">🔄 Vòng Quay Kho</div>
                                    <div className="text-xl font-black">{supplyKpiData.turnover_ratio || 0}x</div>
                                    <div className="text-xs opacity-75 mt-1">~{supplyKpiData.days_on_hand || 0} ngày tồn kho</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">⚠️ Cảnh Báo</div>
                                    <div className="text-xl font-black">{supplyKpiData.urgent_alerts || 0} / {supplyKpiData.total_materials || 0}</div>
                                    <div className="text-xs opacity-75 mt-1">Hết: {supplyKpiData.out_of_stock || 0} · Loại A: {supplyKpiData.abc_class_a_count || 0}</div>
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
            {activeTab !== 'sales' && activeTab !== 'supply' && activeTab !== 'product' && activeTab !== 'workforce' && activeTab !== 'customer' && (
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

            {/* Customer Analytics Tab */}
            {activeTab === 'customer' && (
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
                                    <div className="text-sm opacity-90 mb-1">👥 Tổng Khách Hàng</div>
                                    <div className="text-2xl font-black">{customerKpiData.totalCustomers || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Trong kỳ báo cáo</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">🆕 Khách Hàng Mới</div>
                                    <div className="text-2xl font-black">{customerKpiData.newCustomers || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Đơn đầu tiên</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">🔄 Khách Quay Lại</div>
                                    <div className="text-2xl font-black">{customerKpiData.returningCustomers || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Đã mua trước đó</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
                                    <div className="text-sm opacity-90 mb-1">📊 TB Đơn/Khách</div>
                                    <div className="text-2xl font-black">{customerKpiData.avgOrdersPerCustomer || 0}</div>
                                    <div className="text-xs opacity-75 mt-1 italic">Đơn hàng trung bình</div>
                                </div>
                            </div>

                            {/* Customer by District */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="font-black text-gray-800 mb-4">📍 Phân Bố Khách Hàng Theo Phường/Xã</h3>
                                <p className="text-sm text-gray-500 mb-4 italic">Top 15 khu vực có nhiều đơn hàng giao nhất</p>
                                {customerDistrictData.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div style={{ height: '300px' }}>
                                            <Pie
                                                data={{
                                                    labels: customerDistrictData.map(d => d.ward),
                                                    datasets: [{
                                                        data: customerDistrictData.map(d => d.order_count),
                                                        backgroundColor: [
                                                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                                            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                                                            '#14b8a6', '#a855f7', '#22c55e', '#eab308', '#fb923c'
                                                        ]
                                                    }]
                                                }}
                                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }}
                                            />
                                        </div>
                                        <div className="overflow-auto max-h-72">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Phường/Xã</th>
                                                        <th className="px-3 py-2 text-right">Số đơn</th>
                                                        <th className="px-3 py-2 text-right">Doanh thu</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerDistrictData.map((item, idx) => (
                                                        <tr key={idx} className="border-t">
                                                            <td className="px-3 py-2 font-medium">{item.ward}</td>
                                                            <td className="px-3 py-2 text-right">{item.order_count}</td>
                                                            <td className="px-3 py-2 text-right">{formatCurrency(item.total_revenue)}đ</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">Chưa có dữ liệu địa chỉ giao hàng</p>
                                )}
                            </div>

                            {/* Customer Segmentation Charts */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* By Frequency */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">📈 Phân Khúc Theo Tần Suất</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">Phân loại khách hàng dựa trên số lần đặt hàng</p>
                                    {customerFrequencyData.length > 0 ? (
                                        <Bar
                                            data={{
                                                labels: customerFrequencyData.map(d => d.segment),
                                                datasets: [{
                                                    label: 'Số khách hàng',
                                                    data: customerFrequencyData.map(d => d.customer_count),
                                                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
                                                }]
                                            }}
                                            options={{
                                                indexAxis: 'y',
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                                    )}
                                    <div className="mt-4 space-y-2">
                                        {customerFrequencyData.map((d, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{d.segment}</span>
                                                <span className="font-bold">{formatCurrency(d.total_revenue)}đ</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* By Order Value */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-black text-gray-800 mb-4">💰 Phân Khúc Theo Giá Trị</h3>
                                    <p className="text-sm text-gray-500 mb-4 italic">Phân loại theo giá trị đơn hàng trung bình</p>
                                    {customerValueData.length > 0 ? (
                                        <Bar
                                            data={{
                                                labels: customerValueData.map(d => d.segment),
                                                datasets: [{
                                                    label: 'Số khách hàng',
                                                    data: customerValueData.map(d => d.customer_count),
                                                    backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
                                                }]
                                            }}
                                            options={{
                                                indexAxis: 'y',
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                                    )}
                                    <div className="mt-4 space-y-2">
                                        {customerValueData.map((d, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{d.segment}</span>
                                                <span className="font-bold">AOV: {formatCurrency(d.avg_order_value)}đ</span>
                                            </div>
                                        ))}
                                    </div>
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
