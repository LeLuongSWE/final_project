import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN REPORTS PAGE
// Simplified version for demo/documentation
// =============================================

const AdminReportsPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-gray-800 text-white">
                <div className="p-4 border-b border-gray-700">
                    <div className="h-12 bg-gray-700 rounded flex items-center justify-center font-bold">
                        👨‍💼 ADMIN PANEL
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📊 Dashboard</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">👥 Nhân viên</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Kho hàng</div>
                    <div className="h-10 bg-gray-700 rounded px-3 flex items-center">📈 Báo cáo</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">📈 Báo cáo & Thống kê</h1>
                    <div className="flex gap-2">
                        <input type="date" className="border rounded-lg px-4 py-2" />
                        <span className="py-2">đến</span>
                        <input type="date" className="border rounded-lg px-4 py-2" />
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Xuất PDF</button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="text-2xl font-bold text-green-600">45.2M</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                        <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Đơn trung bình</p>
                        <p className="text-2xl font-bold text-blue-600">36.6K</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Chi phí nguyên liệu</p>
                        <p className="text-2xl font-bold text-orange-600">12.5M</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Lợi nhuận ước tính</p>
                        <p className="text-2xl font-bold text-green-600">32.7M</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">📈 Doanh thu theo ngày</h3>
                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                            [BIỂU ĐỒ ĐƯỜNG - DOANH THU]
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold mb-4">🥧 Doanh thu theo danh mục</h3>
                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                            [BIỂU ĐỒ TRÒN - DANH MỤC]
                        </div>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">🏆 Top sản phẩm bán chạy</h3>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3">#</th>
                                <th className="text-left p-3">Tên món</th>
                                <th className="text-left p-3">Số lượng bán</th>
                                <th className="text-left p-3">Doanh thu</th>
                                <th className="text-left p-3">% Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { rank: 1, name: 'Sườn xào chua ngọt', qty: 456, rev: '6,840,000đ', pct: '15.1%' },
                                { rank: 2, name: 'Thịt kho tàu', qty: 389, rev: '4,668,000đ', pct: '10.3%' },
                                { rank: 3, name: 'Cơm trắng', qty: 1234, rev: '6,170,000đ', pct: '13.6%' },
                                { rank: 4, name: 'Cá kho tộ', qty: 234, rev: '4,680,000đ', pct: '10.4%' },
                                { rank: 5, name: 'Gà rang muối', qty: 198, rev: '3,564,000đ', pct: '7.9%' },
                            ].map(item => (
                                <tr key={item.rank} className="border-t">
                                    <td className="p-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                item.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                    item.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-50 text-gray-500'
                                            }`}>
                                            {item.rank}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3">{item.qty}</td>
                                    <td className="p-3 text-green-600 font-medium">{item.rev}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full"
                                                    style={{ width: item.pct }}
                                                ></div>
                                            </div>
                                            <span className="text-sm">{item.pct}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminReportsPage;
