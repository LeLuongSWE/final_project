import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useCart } from '../../../shared/context/CartContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { orderService } from '../../../shared/services/orderService';
import { userService } from '../../../shared/services/userService';

// Helper to get item ID
const getItemId = (item) => item.product_id || item.productId || item.id;

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showPayment, setShowPayment] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [showAddressWarning, setShowAddressWarning] = useState(false);

    // Load addresses on mount
    useEffect(() => {
        loadAddresses();
    }, [user]);

    const loadAddresses = async () => {
        if (!user) {
            setAddressLoading(false);
            return;
        }
        try {
            const data = await userService.getAddresses();
            setAddresses(data);
            // Auto-select default address
            const defaultAddr = data.find(a => a.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.addressId);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0].addressId);
            }
        } catch (err) {
            console.error('Error loading addresses:', err);
        } finally {
            setAddressLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const generateVietQR = (amount) => {
        const bankId = '970422';
        const accountNo = '0123456789';
        const accountName = 'COM BINH DAN';
        const amountStr = Math.round(amount).toString();
        const description = `COMBD ${Date.now()}`;

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
        // Check if address is selected
        if (addresses.length === 0) {
            setShowAddressWarning(true);
            return;
        }
        if (!selectedAddressId) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        const total = getTotal();
        const qrInfo = generateVietQR(total);
        setPaymentInfo(qrInfo);
        setShowPayment(true);
    };

    const handlePaymentComplete = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            const selectedAddress = addresses.find(a => a.addressId === selectedAddressId);

            // Build full delivery address string
            const fullAddress = selectedAddress ?
                `${selectedAddress.addressLine}${selectedAddress.ward ? ', ' + selectedAddress.ward : ''}${selectedAddress.district ? ', ' + selectedAddress.district : ''}${selectedAddress.city ? ', ' + selectedAddress.city : ''}`
                : null;

            const orderData = {
                userId: user?.userId,
                totalAmount: getTotal(),
                paymentMethod: 'VIETQR',
                // Delivery address fields matching backend DTO
                deliveryAddress: fullAddress,
                deliveryLatitude: selectedAddress?.latitude || null,
                deliveryLongitude: selectedAddress?.longitude || null,
                deliveryRecipient: selectedAddress?.recipientName || null,
                deliveryPhone: selectedAddress?.phone || null,
                items: cart.map(item => ({
                    productId: getItemId(item),
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await orderService.createOrder(orderData);

            clearCart();
            setShowPayment(false);

            navigate(`/orders/${response.orderId}/status`);

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedAddress = addresses.find(a => a.addressId === selectedAddressId);

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
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-400 text-2xl">🍚</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                                                    <p className="text-orange-600 font-medium">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>

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

                                                <div className="w-32 text-right">
                                                    <p className="font-semibold text-gray-800">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>

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

                            {/* Delivery Address Section */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        📍 Địa chỉ giao hàng
                                    </h2>
                                    <Link to="/profile" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                        Quản lý địa chỉ →
                                    </Link>
                                </div>

                                {addressLoading ? (
                                    <div className="text-center py-4 text-gray-500">Đang tải...</div>
                                ) : addresses.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 flex items-center gap-2">
                                            <span className="text-xl">⚠️</span>
                                            <span>Bạn chưa có địa chỉ giao hàng nào.</span>
                                        </p>
                                        <Link
                                            to="/profile"
                                            className="mt-2 inline-block text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            + Thêm địa chỉ mới
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {addresses.map(addr => (
                                            <label
                                                key={addr.addressId}
                                                className={`block border rounded-lg p-3 cursor-pointer transition ${selectedAddressId === addr.addressId
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        checked={selectedAddressId === addr.addressId}
                                                        onChange={() => setSelectedAddressId(addr.addressId)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">
                                                                {addr.label === 'Nhà' ? '🏠' : addr.label === 'Công ty' ? '🏢' : '📍'} {addr.label}
                                                            </span>
                                                            {addr.isDefault && (
                                                                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">Mặc định</span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-800 text-sm">{addr.recipientName} - {addr.phone}</p>
                                                        <p className="text-gray-600 text-sm">
                                                            {addr.addressLine}
                                                            {addr.ward && `, ${addr.ward}`}
                                                            {addr.district && `, ${addr.district}`}
                                                            {addr.city && `, ${addr.city}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
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
                                    {selectedAddress && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Giao đến:</span>
                                            <span className="text-right text-sm max-w-xs truncate">
                                                {selectedAddress.addressLine}, {selectedAddress.district}
                                            </span>
                                        </div>
                                    )}
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
                                        disabled={addresses.length === 0}
                                        className={`w-full font-semibold py-3 rounded-lg transition ${addresses.length === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                                            }`}
                                    >
                                        {addresses.length === 0 ? 'Vui lòng thêm địa chỉ giao hàng' : 'Thanh toán VietQR'}
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

            {/* No Address Warning Modal */}
            {showAddressWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <span className="text-5xl mb-4 block">📍</span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có địa chỉ giao hàng</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn cần thêm địa chỉ giao hàng trước khi thanh toán.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddressWarning(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg"
                                >
                                    Để sau
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg"
                                >
                                    Thêm địa chỉ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            {/* Selected Address Info */}
                            {selectedAddress && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                                    <p className="font-medium text-orange-800 mb-1">📍 Giao đến:</p>
                                    <p className="text-gray-800">{selectedAddress.recipientName} - {selectedAddress.phone}</p>
                                    <p className="text-gray-600">
                                        {selectedAddress.addressLine}
                                        {selectedAddress.ward && `, ${selectedAddress.ward}`}
                                        {selectedAddress.district && `, ${selectedAddress.district}`}
                                    </p>
                                </div>
                            )}

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
