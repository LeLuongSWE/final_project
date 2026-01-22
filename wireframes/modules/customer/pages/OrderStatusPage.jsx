import React from 'react';

// =============================================
// WIREFRAME SKELETON - ORDER STATUS PAGE
// Simplified version for demo/documentation
// =============================================

const OrderStatusPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Trạng thái đơn hàng</h1>
                    <p className="text-gray-500">#DH00123</p>
                </div>

                {/* Order Status Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    {/* Current Status */}
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-5xl mb-4">
                            🍳
                        </div>
                        <h2 className="text-xl font-bold text-orange-600">Đang chuẩn bị</h2>
                        <p className="text-gray-500">Đơn hàng của bạn đang được chuẩn bị</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="relative mb-8">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                            <div className="h-1 bg-orange-500" style={{ width: '50%' }}></div>
                        </div>
                        <div className="relative flex justify-between">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                                    ✓
                                </div>
                                <span className="text-xs text-gray-600">Đã đặt</span>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                                    🍳
                                </div>
                                <span className="text-xs text-orange-600 font-medium">Đang nấu</span>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                    📦
                                </div>
                                <span className="text-xs text-gray-400">Sẵn sàng</span>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                    ✓
                                </div>
                                <span className="text-xs text-gray-400">Hoàn thành</span>
                            </div>
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <p className="text-blue-800">⏱️ Thời gian dự kiến</p>
                        <p className="text-2xl font-bold text-blue-600">~15 phút</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">📋 Chi tiết đơn hàng</h3>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <div>
                                <span className="font-medium">Sườn xào chua ngọt</span>
                                <span className="text-gray-500 ml-2">x2</span>
                            </div>
                            <span className="text-orange-600">30,000đ</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <div>
                                <span className="font-medium">Cơm trắng</span>
                                <span className="text-gray-500 ml-2">x2</span>
                            </div>
                            <span className="text-orange-600">10,000đ</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <div>
                                <span className="font-medium">Nước lọc</span>
                                <span className="text-gray-500 ml-2">x1</span>
                            </div>
                            <span className="text-orange-600">5,000đ</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Tổng cộng:</span>
                        <span className="text-orange-600">45,000đ</span>
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">📍 Giao đến:</p>
                        <p className="font-medium">Nguyễn Văn A - 0912345678</p>
                        <p className="text-sm text-gray-600">123 Đường ABC, Phường 1, Quận 1, TP.HCM</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium">
                        ← Quay lại
                    </button>
                    <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium">
                        🔄 Làm mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusPage;
