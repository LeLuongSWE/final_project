import React from 'react';

// =============================================
// WIREFRAME SKELETON - ONLINE ORDERS PAGE
// Simplified version for demo/documentation
// =============================================

const OnlineOrdersPage = () => {
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">📦</span>
                    <h1 className="font-bold text-xl">Đơn hàng Online</h1>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 rounded">🍳 Quay lại POS</button>
                    <button className="px-4 py-2 bg-green-500 rounded">🔄 Làm mới</button>
                </div>
            </div>

            {/* Order Columns */}
            <div className="flex-1 p-6 overflow-x-auto">
                <div className="flex gap-6 h-full min-w-max">
                    {/* PENDING Column */}
                    <div className="w-80 flex flex-col">
                        <div className="bg-yellow-500 text-white px-4 py-3 rounded-t-lg font-bold flex items-center justify-between">
                            <span>⏳ Chờ xác nhận</span>
                            <span className="bg-white text-yellow-500 px-2 rounded-full text-sm">3</span>
                        </div>
                        <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold">#ON001{i}</span>
                                        <span className="text-sm text-gray-500">5 phút trước</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        • Sườn xào x2<br />
                                        • Cơm trắng x2<br />
                                        • Nước lọc x1
                                    </div>
                                    <div className="font-bold text-orange-600 mb-2">75,000đ</div>
                                    <button className="w-full py-2 bg-green-500 text-white rounded font-medium">
                                        ✓ Xác nhận
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PREPARING Column */}
                    <div className="w-80 flex flex-col">
                        <div className="bg-orange-500 text-white px-4 py-3 rounded-t-lg font-bold flex items-center justify-between">
                            <span>🍳 Đang chuẩn bị</span>
                            <span className="bg-white text-orange-500 px-2 rounded-full text-sm">2</span>
                        </div>
                        <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto">
                            {[1, 2].map(i => (
                                <div key={i} className="border border-orange-300 bg-orange-50 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold">#ON000{i}</span>
                                        <span className="text-sm text-gray-500">10 phút trước</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        • Thịt kho tàu x1<br />
                                        • Canh chua x1
                                    </div>
                                    <div className="font-bold text-orange-600 mb-2">45,000đ</div>
                                    <button className="w-full py-2 bg-blue-500 text-white rounded font-medium">
                                        📦 Sẵn sàng
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* READY Column */}
                    <div className="w-80 flex flex-col">
                        <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg font-bold flex items-center justify-between">
                            <span>📦 Sẵn sàng</span>
                            <span className="bg-white text-blue-500 px-2 rounded-full text-sm">1</span>
                        </div>
                        <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto">
                            <div className="border border-blue-300 bg-blue-50 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold">#ON0001</span>
                                    <span className="text-sm text-gray-500">15 phút trước</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    • Cá kho tộ x1<br />
                                    • Rau muống x1
                                </div>
                                <div className="font-bold text-orange-600 mb-2">50,000đ</div>
                                <button className="w-full py-2 bg-green-600 text-white rounded font-medium">
                                    ✓ Hoàn thành
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COMPLETED Column */}
                    <div className="w-80 flex flex-col">
                        <div className="bg-green-500 text-white px-4 py-3 rounded-t-lg font-bold flex items-center justify-between">
                            <span>✓ Hoàn thành</span>
                            <span className="bg-white text-green-500 px-2 rounded-full text-sm">5</span>
                        </div>
                        <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto opacity-60">
                            {[1, 2].map(i => (
                                <div key={i} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-500">#ON000{i}</span>
                                        <span className="text-sm text-gray-400">30 phút trước</span>
                                    </div>
                                    <div className="text-sm text-gray-400 line-through">
                                        • Sườn xào x1
                                    </div>
                                    <div className="text-gray-400">40,000đ</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlineOrdersPage;
