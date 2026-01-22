import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN INVENTORY PAGE
// Simplified version for demo/documentation
// =============================================

const AdminInventoryPage = () => {
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
                    <div className="h-10 bg-gray-700 rounded px-3 flex items-center">📦 Kho hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📈 Báo cáo</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">📦 Quản lý kho hàng</h1>
                    <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Nhập kho</button>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">- Xuất kho</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Tổng nguyên liệu</p>
                        <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Sắp hết hàng</p>
                        <p className="text-2xl font-bold text-orange-600">5</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Đã hết hàng</p>
                        <p className="text-2xl font-bold text-red-600">1</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Giá trị kho</p>
                        <p className="text-2xl font-bold text-green-600">5.2M</p>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4">Nguyên liệu</th>
                                <th className="text-left p-4">Đơn vị</th>
                                <th className="text-left p-4">Tồn kho</th>
                                <th className="text-left p-4">Mức tối thiểu</th>
                                <th className="text-left p-4">Trạng thái</th>
                                <th className="text-left p-4">Đơn giá</th>
                                <th className="text-left p-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Gạo tẻ', unit: 'kg', stock: 45, min: 30, price: '15,000đ' },
                                { name: 'Thịt lợn', unit: 'kg', stock: 8, min: 10, price: '120,000đ' },
                                { name: 'Trứng gà', unit: 'quả', stock: 150, min: 50, price: '3,500đ' },
                                { name: 'Rau muống', unit: 'bó', stock: 5, min: 10, price: '5,000đ' },
                                { name: 'Dầu ăn', unit: 'lít', stock: 0, min: 5, price: '45,000đ' },
                            ].map((item, i) => {
                                const status = item.stock === 0 ? 'danger' : item.stock < item.min ? 'warning' : 'ok';
                                return (
                                    <tr key={i} className="border-t">
                                        <td className="p-4 font-medium">{item.name}</td>
                                        <td className="p-4 text-gray-500">{item.unit}</td>
                                        <td className="p-4">
                                            <span className={`font-bold ${status === 'danger' ? 'text-red-600' : status === 'warning' ? 'text-orange-600' : 'text-green-600'}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">{item.min}</td>
                                        <td className="p-4">
                                            {status === 'danger' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Hết hàng</span>}
                                            {status === 'warning' && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">Sắp hết</span>}
                                            {status === 'ok' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Đủ hàng</span>}
                                        </td>
                                        <td className="p-4">{item.price}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="text-green-600">📥 Nhập</button>
                                                <button className="text-orange-600">📤 Xuất</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                    <h3 className="font-bold mb-4">📜 Lịch sử nhập/xuất gần đây</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-3">
                                <span className="text-green-600">📥</span>
                                <span>Nhập 50kg Gạo tẻ</span>
                            </div>
                            <span className="text-sm text-gray-500">2 giờ trước</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-3">
                                <span className="text-orange-600">📤</span>
                                <span>Xuất 5kg Thịt lợn - Sử dụng ngày</span>
                            </div>
                            <span className="text-sm text-gray-500">5 giờ trước</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminInventoryPage;
