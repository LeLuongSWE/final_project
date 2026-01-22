import React from 'react';

// =============================================
// WIREFRAME SKELETON - ADMIN STAFF PAGE
// Simplified version for demo/documentation
// =============================================

const AdminStaffPage = () => {
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
                    <div className="h-10 bg-gray-700 rounded px-3 flex items-center">👥 Nhân viên</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📦 Kho hàng</div>
                    <div className="h-10 hover:bg-gray-700 rounded px-3 flex items-center">📈 Báo cáo</div>
                </nav>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">👥 Quản lý nhân viên</h1>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Thêm nhân viên</button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng nhân viên</p>
                        <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Đang hoạt động</p>
                        <p className="text-2xl font-bold text-green-600">8</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Thu ngân</p>
                        <p className="text-2xl font-bold text-blue-600">5</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-500">Bếp</p>
                        <p className="text-2xl font-bold text-orange-600">7</p>
                    </div>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4">Nhân viên</th>
                                <th className="text-left p-4">Tên đăng nhập</th>
                                <th className="text-left p-4">Vai trò</th>
                                <th className="text-left p-4">Số điện thoại</th>
                                <th className="text-left p-4">Trạng thái</th>
                                <th className="text-left p-4">Ngày tạo</th>
                                <th className="text-left p-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Nguyễn Văn A', username: 'nv_a', role: 'Thu ngân', phone: '0912345678', active: true },
                                { name: 'Trần Thị B', username: 'nv_b', role: 'Bếp', phone: '0987654321', active: true },
                                { name: 'Lê Văn C', username: 'nv_c', role: 'Thu ngân', phone: '0909123456', active: false },
                                { name: 'Phạm Thị D', username: 'nv_d', role: 'Bếp', phone: '0908765432', active: true },
                            ].map((staff, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                👤
                                            </div>
                                            <span className="font-medium">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{staff.username}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-sm ${staff.role === 'Thu ngân' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {staff.role === 'Thu ngân' ? '💰' : '👨‍🍳'} {staff.role}
                                        </span>
                                    </td>
                                    <td className="p-4">{staff.phone}</td>
                                    <td className="p-4">
                                        {staff.active ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Hoạt động</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Khóa</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">01/01/2024</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600">✏️ Sửa</button>
                                            <button className="text-red-600">🗑️ Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Staff Modal Preview */}
                <div className="bg-white rounded-lg shadow p-6 mt-6 max-w-md">
                    <h3 className="font-bold mb-4">➕ Form thêm nhân viên</h3>
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-100 rounded border px-3 flex items-center text-gray-400">
                            Họ và tên
                        </div>
                        <div className="h-10 bg-gray-100 rounded border px-3 flex items-center text-gray-400">
                            Tên đăng nhập
                        </div>
                        <div className="h-10 bg-gray-100 rounded border px-3 flex items-center text-gray-400">
                            Mật khẩu
                        </div>
                        <div className="h-10 bg-gray-100 rounded border px-3 flex items-center text-gray-400">
                            Số điện thoại
                        </div>
                        <select className="w-full h-10 border rounded px-3">
                            <option>Chọn vai trò</option>
                            <option>Thu ngân</option>
                            <option>Bếp</option>
                        </select>
                        <button className="w-full bg-green-500 text-white py-2 rounded font-medium">
                            Thêm nhân viên
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminStaffPage;
