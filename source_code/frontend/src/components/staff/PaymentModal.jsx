import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentModal = ({ orderItems, total, cashReceived, staffUser, currentShift, onClose, onComplete }) => {
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [customerCash, setCustomerCash] = useState(cashReceived || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [step, setStep] = useState('table'); // 'table' -> 'invoice'

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getChange = () => {
        return Math.max(0, customerCash - total);
    };

    const setQuickAmount = (amount) => {
        setCustomerCash(amount);
    };

    const generateVietQR = () => {
        const bankId = '970422';
        const accountNo = '0123456789';
        const accountName = 'COM BINH DAN 123';
        const amount = Math.round(total);
        const description = orderData?.orderCode || `DH${Date.now()}`;
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
    };

    const handleCreateOrder = async () => {
        if (!tableNumber) {
            alert('Vui lòng nhập số bàn');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await axios.post('http://localhost:8080/api/orders/instore', {
                totalAmount: total,
                paymentMethod: 'PENDING',
                tableNumber: tableNumber,
                shiftId: currentShift?.shiftId,
                cashierId: staffUser?.userId,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.name
                }))
            });

            setOrderData(response.data);
            setStep('invoice');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Có lỗi khi tạo đơn hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmPayment = async () => {
        try {
            await axios.put(`http://localhost:8080/api/orders/${orderData.orderId}/status`, {
                status: 'COMPLETED'
            });
            onComplete();
        } catch (error) {
            console.error('Error confirming payment:', error);
            onComplete();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Step 1: Table number input
    if (step === 'table') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Nhập số bàn</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="text-center text-2xl font-bold text-gray-900 mb-4">
                            Tổng tiền: <span className="text-orange-600">{formatCurrency(total)} đ</span>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                Loại đơn hàng
                            </label>
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setTableNumber('Mang về')}
                                    className={`flex-1 py-3 rounded-lg text-base font-bold transition ${tableNumber === 'Mang về'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    📦 Mang về
                                </button>
                                <button
                                    onClick={() => setTableNumber('')}
                                    className={`flex-1 py-3 rounded-lg text-base font-bold transition ${tableNumber !== 'Mang về' && tableNumber !== ''
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : tableNumber === '' ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    🪑 Tại quán
                                </button>
                            </div>
                        </div>

                        {tableNumber !== 'Mang về' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Nhập số bàn
                                </label>
                                <input
                                    type="text"
                                    value={tableNumber === 'Mang về' ? '' : tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    placeholder="VD: 1, 2, 3, VIP1..."
                                    className="w-full px-4 py-3 text-lg font-medium border-2 border-gray-400 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
                                    autoFocus
                                />
                            </div>
                        )}

                        <button
                            onClick={handleCreateOrder}
                            disabled={isProcessing || !tableNumber}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl text-lg font-bold disabled:opacity-50 transition shadow-lg"
                        >
                            {isProcessing ? 'Đang xử lý...' : '🖨️ Tạo hóa đơn & In'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Invoice with QR
    if (step === 'invoice') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div
                    className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white text-2xl font-bold z-10 print:hidden shadow-lg"
                    >
                        ×
                    </button>

                    {/* Invoice Content */}
                    <div id="invoice-content" className="p-6 bg-white">
                        {/* Header */}
                        <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
                            <div className="text-3xl mb-1">🍚</div>
                            <h1 className="text-2xl font-black text-gray-900">CƠM BÌNH DÂN 123</h1>
                            <p className="text-sm font-medium text-gray-700">123 Đường ABC, Quận XYZ, Hà Nội</p>
                            <p className="text-sm font-medium text-gray-700">ĐT: 0123 456 789</p>
                        </div>

                        {/* Order Info */}
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-black text-orange-600">HÓA ĐƠN THANH TOÁN</h2>
                            <p className="text-base font-bold text-gray-800">Số: {orderData?.orderCode}</p>
                            <p className="text-sm font-medium text-gray-700">
                                Ngày: {new Date(orderData?.orderDate).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-base font-bold text-gray-800">Bàn: {tableNumber}</p>
                        </div>

                        {/* Items */}
                        <div className="border-t-2 border-b-2 border-gray-300 py-3 mb-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-2 text-sm font-black text-gray-800">Món</th>
                                        <th className="text-center w-12 text-sm font-black text-gray-800">SL</th>
                                        <th className="text-right w-24 text-sm font-black text-gray-800">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="py-2 text-sm font-semibold text-gray-800">{item.name}</td>
                                            <td className="text-center text-sm font-bold text-gray-800">{item.quantity}</td>
                                            <td className="text-right text-sm font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="text-center mb-4">
                            <div className="text-2xl font-black text-gray-900">
                                TỔNG CỘNG: <span className="text-orange-600">{formatCurrency(total)} đ</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="text-center border-t-2 border-gray-300 pt-4 mb-4">
                            <p className="text-base font-bold text-gray-800 mb-2">Quét mã để thanh toán:</p>
                            <img
                                src={generateVietQR()}
                                alt="VietQR"
                                className="w-52 h-52 mx-auto rounded-lg shadow-lg"
                            />
                        </div>

                        {/* Footer */}
                        <div className="text-center border-t-2 border-dashed border-gray-400 pt-4">
                            <p className="text-lg font-bold text-gray-800">Cảm ơn quý khách!</p>
                            <p className="text-sm font-medium text-gray-600">Hẹn gặp lại</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-100 border-t-2 print:hidden space-y-3">
                        <button
                            onClick={handlePrint}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                        >
                            🖨️ In hóa đơn
                        </button>

                        {/* Payment confirmation */}
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
                            <p className="text-sm font-bold text-gray-800 mb-2 text-center">Xác nhận phương thức thanh toán:</p>
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`flex-1 py-2 rounded-lg font-bold transition ${paymentMethod === 'CASH'
                                        ? 'bg-green-500 text-white shadow'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    💵 Tiền mặt
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('VIETQR')}
                                    className={`flex-1 py-2 rounded-lg font-bold transition ${paymentMethod === 'VIETQR'
                                        ? 'bg-purple-500 text-white shadow'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    📱 Chuyển khoản
                                </button>
                            </div>

                            {paymentMethod === 'CASH' && (
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">Khách đưa:</span>
                                        <input
                                            type="text"
                                            value={customerCash}
                                            onChange={(e) => setCustomerCash(parseFloat(e.target.value.replace(/\D/g, '')) || 0)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-400 rounded-lg text-right font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        {[50000, 100000, 200000, 500000].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => setQuickAmount(amount)}
                                                className="flex-1 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold text-gray-800"
                                            >
                                                {amount / 1000}k
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center text-lg font-black text-green-600">
                                        Tiền thừa: {formatCurrency(getChange())} đ
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleConfirmPayment}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold shadow-lg"
                            >
                                ✓ Xác nhận đã thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PaymentModal;
