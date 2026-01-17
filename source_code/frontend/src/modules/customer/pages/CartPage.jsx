import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useCart } from '../../../shared/context/CartContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { orderService } from '../../../shared/services/orderService';

// Helper to get item ID
const getItemId = (item) => item.product_id || item.productId || item.id;

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showPayment, setShowPayment] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const generateVietQR = (amount) => {
        // VietQR standard format
        const bankId = '970422'; // MB Bank (example)
        const accountNo = '0123456789'; // Account number
        const accountName = 'COM BINH DAN 123';
        const amountStr = Math.round(amount).toString();
        const description = `COMBD ${Date.now()}`;

        // Generate QR code URL using VietQR API
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amountStr}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        return {
            qrUrl,
            bankId,
            accountNo,
            accountName,
            amount: amountStr,
            description
        };
    };

    const handleCheckout = () => {
        const total = getTotal();
        const qrInfo = generateVietQR(total);
        setPaymentInfo(qrInfo);
        setShowPayment(true);
    };

    const handlePaymentComplete = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                userId: user?.userId,
                totalAmount: getTotal(),
                paymentMethod: 'VIETQR',
                items: cart.map(item => ({
                    productId: getItemId(item),
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Create order via API
            const response = await orderService.createOrder(orderData);

            // Clear cart and close modal
            clearCart();
            setShowPayment(false);

            // Navigate to order status page
            navigate(`/orders/${response.orderId}/status`);

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/cart" />

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>

                    {cart.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Cart Items */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 space-y-4">
                                    {cart.map((item) => {
                                        const itemId = getItemId(item);
                                        return (
                                            <div
                                                key={itemId}
                                                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                                            >
                                                {/* Product Image Placeholder */}
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-400 text-2xl">🍚</span>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                                                    <p className="text-orange-600 font-medium">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="w-32 text-right">
                                                    <p className="font-semibold text-gray-800">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(itemId)}
                                                    className="text-red-500 hover:text-red-700 p-2 transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Tổng đơn hàng</h2>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(getTotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Phí giao hàng:</span>
                                        <span>Miễn phí</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between text-lg font-bold text-gray-800">
                                            <span>Tổng cộng:</span>
                                            <span className="text-orange-600">{formatCurrency(getTotal())}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
                                    >
                                        Thanh toán VietQR
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                                    >
                                        Xóa giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* VietQR Payment Modal */}
            {showPayment && paymentInfo && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => !isProcessing && setShowPayment(false)}
                >
                    <div
                        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b p-6 pb-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Thanh toán VietQR</h2>
                            <button
                                onClick={() => !isProcessing && setShowPayment(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                disabled={isProcessing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 pt-4 space-y-4">
                            {/* QR Code */}
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex justify-center">
                                <img
                                    src={paymentInfo.qrUrl}
                                    alt="VietQR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngân hàng:</span>
                                    <span className="font-medium">MB Bank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số tài khoản:</span>
                                    <span className="font-medium">{paymentInfo.accountNo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tên tài khoản:</span>
                                    <span className="font-medium">{paymentInfo.accountName}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Số tiền:</span>
                                    <span className="font-bold text-orange-600 text-lg">
                                        {formatCurrency(parseInt(paymentInfo.amount))}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nội dung:</span>
                                    <span className="font-medium text-xs">{paymentInfo.description}</span>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-medium mb-1">Hướng dẫn:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Mở app banking hỗ trợ VietQR</li>
                                    <li>Quét mã QR ở trên</li>
                                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                </ol>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 sticky bottom-0 bg-white pt-2">
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                                    disabled={isProcessing}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handlePaymentComplete}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Đang xử lý...' : 'Đã thanh toán'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
