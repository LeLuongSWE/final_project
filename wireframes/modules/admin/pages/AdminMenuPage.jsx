import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN MENU PAGE
// Simplified version for demo/documentation
// =============================================

const AdminMenuPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===== SIDEBAR (Same as Dashboard) ===== */}
            <aside className="w-64 bg-gray-800 text-white">
                <div className="p-4 border-b border-gray-700">
                    <div className="h-12 bg-gray-700 rounded flex items-center justify-center font-bold">
                        👨‍💼 ADMIN PANEL
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📊 Dashboard</div>
                    <div className="h-10 bg-gray-700 rounded px-3 flex items-center">📋 Thực đơn</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Đơn hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">👥 Nhân viên</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Kho hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📈 Báo cáo</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">📋 Quản lý thực đơn</h1>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Thêm món mới</button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
                    <div className="flex-1">
                        <input type="text" placeholder="🔍 Tìm kiếm món ăn..." className="w-full h-10 border rounded-lg px-4" />
                    </div>
                    <select className="h-10 border rounded-lg px-4">
                        <option>Tất cả danh mục</option>
                        <option>MÓN MẶN</option>
                        <option>RAU/CANH</option>
                        <option>CƠM THÊM</option>
                        <option>NƯỚC</option>
                    </select>
                    <select className="h-10 border rounded-lg px-4">
                        <option>Tất cả trạng thái</option>
                        <option>Đang bán</option>
                        <option>Ngừng bán</option>
                    </select>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4">Hình ảnh</th>
                                <th className="text-left p-4">Tên món</th>
                                <th className="text-left p-4">Danh mục</th>
                                <th className="text-left p-4">Giá</th>
                                <th className="text-left p-4">Trạng thái</th>
                                <th className="text-left p-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Sườn xào chua ngọt', cat: 'MÓN MẶN', price: '15,000đ', active: true },
                                { name: 'Thịt kho tàu', cat: 'MÓN MẶN', price: '12,000đ', active: true },
                                { name: 'Rau muống xào', cat: 'RAU/CANH', price: '6,000đ', active: true },
                                { name: 'Canh chua', cat: 'RAU/CANH', price: '8,000đ', active: false },
                                { name: 'Cơm trắng', cat: 'CƠM THÊM', price: '5,000đ', active: true },
                            ].map((item, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">🍚</div>
                                    </td>
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">{item.cat}</span>
                                    </td>
                                    <td className="p-4 text-orange-600 font-medium">{item.price}</td>
                                    <td className="p-4">
                                        {item.active ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Đang bán</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Ngừng bán</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:underline">✏️ Sửa</button>
                                            <button className="text-red-600 hover:underline">🗑️ Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-500">Hiển thị 1-5 của 22 món</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded">←</button>
                            <button className="px-3 py-1 bg-gray-800 text-white rounded">1</button>
                            <button className="px-3 py-1 border rounded">2</button>
                            <button className="px-3 py-1 border rounded">3</button>
                            <button className="px-3 py-1 border rounded">→</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminMenuPage;
