import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentModal from '../../components/staff/PaymentModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const CashierPOSPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [cashReceived, setCashReceived] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [staffUser, setStaffUser] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [orderNumber, setOrderNumber] = useState(1);
    const [activeCategory, setActiveCategory] = useState('TẤT CẢ');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [onlineOrderCount, setOnlineOrderCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [newOrderData, setNewOrderData] = useState(null);
    const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);

    const categories = ['TẤT CẢ', 'MÓN MẶN', 'RAU/CANH', 'CƠM THÊM'];

    useEffect(() => {
        // Check staff session
        const user = sessionStorage.getItem('staffUser');
        const shift = sessionStorage.getItem('currentShift');

        if (!user) {
            navigate('/staff/login');
            return;
        }

        setStaffUser(JSON.parse(user));
        if (shift) {
            setCurrentShift(JSON.parse(shift));
        }

        fetchProducts();

        // Check for new online orders every 15 seconds
        const checkOnlineOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/orders/online/pending');
                const pendingOrders = response.data || [];
                const currentCount = pendingOrders.length;

                // If there are more orders than before, show notification
                if (currentCount > onlineOrderCount && onlineOrderCount > 0) {
                    // Play notification sound
                    playNotificationSound();
                    // Show notification popup
                    setNewOrderData(pendingOrders[0]);
                    setShowNotification(true);
                    // Auto-hide after 5 seconds
                    setTimeout(() => setShowNotification(false), 5000);
                }
                setOnlineOrderCount(currentCount);
            } catch (error) {
                console.error('Error checking online orders:', error);
            }
        };

        // Initial check
        checkOnlineOrders();

        // Set up polling interval
        const interval = setInterval(checkOnlineOrders, 15000);
        return () => clearInterval(interval);
    }, [navigate]);

    const playNotificationSound = () => {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);

            // Second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.3);
            }, 200);
        } catch (e) {
            console.log('Could not play notification sound');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const addToOrder = (product) => {
        const existingItem = orderItems.find(item => item.productId === product.productId);

        if (existingItem) {
            setOrderItems(orderItems.map(item =>
                item.productId === product.productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setOrderItems([...orderItems, {
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: 1
            }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setOrderItems(orderItems.map(item => {
            if (item.productId === productId) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const removeItem = (productId) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId));
    };

    const getTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getChange = () => {
        const received = parseFloat(cashReceived) || 0;
        const total = getTotal();
        return received - total;
    };

    const handleNewOrder = () => {
        setOrderItems([]);
        setCashReceived('');
        setOrderNote('');
        setOrderNumber(prev => prev + 1);
    };

    const handlePayment = () => {
        if (orderItems.length === 0) {
            alert('Vui lòng thêm món vào đơn hàng');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('staffUser');
        sessionStorage.removeItem('currentShift');
        navigate('/staff/login');
    };

    const handleEndShift = async () => {
        if (!currentShift) return;
        setShowEndShiftConfirm(true);
    };

    const confirmEndShift = async () => {
        try {
            const response = await axios.put(`http://localhost:8080/api/shifts/${currentShift.shiftId}/end`);
            setShowEndShiftConfirm(false);
            // Show success and logout
            handleLogout();
        } catch (error) {
            console.error('Error ending shift:', error);
        }
    };

    // Filter products by category and search
    const filteredProducts = products.filter(product => {
        const matchCategory = activeCategory === 'TẤT CẢ' || product.category === activeCategory;
        const matchSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    return (
        <div className="min-h-screen bg-gray-800 text-white flex flex-col">
            {/* Header */}
            <header className="bg-gray-700 px-4 py-2 flex justify-between items-center border-b border-gray-600">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-xl">
                        🍚
                    </div>
                    <span className="font-bold text-lg">Cơm Bình Dân 123</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-medium">NV: {staffUser?.fullName || 'Nhân viên'}</span>
                    <span className="text-green-400 font-medium">[O] Online (Wifi)</span>
                    <button
                        onClick={() => navigate('/staff/orders')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold relative"
                    >
                        📋 Đơn hàng
                        {onlineOrderCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {onlineOrderCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleEndShift}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold"
                    >
                        Đóng ca
                    </button>
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Left: Product Grid */}
                <div className="flex-1 p-4">
                    <div className="bg-gray-700 rounded-lg p-4 h-full flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold mb-3">
                                DANH MỤC MÓN ĂN (Thực đơn hôm nay: {today})
                            </h2>
                            <div className="flex gap-2 flex-wrap items-center">
                                {/* Search Toggle/Input */}
                                {showSearch ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Nhập tên món..."
                                            className="w-48 px-3 py-2 bg-gray-600 rounded text-white font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowSearch(true)}
                                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold"
                                    >
                                        🔍
                                    </button>
                                )}

                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded font-bold transition ${activeCategory === cat
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                            }`}
                                    >
                                        [{cat}]
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.productId}
                                    onClick={() => product.isActive && addToOrder(product)}
                                    disabled={!product.isActive}
                                    className={`p-4 rounded-lg text-center transition ${product.isActive
                                        ? 'bg-gray-600 hover:bg-gray-500 cursor-pointer'
                                        : 'bg-yellow-700 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="font-bold text-white">{product.name}</div>
                                    <div className="text-lg font-semibold text-orange-300">
                                        {product.price === 0 ? 'Miễn phí' : formatCurrency(product.price)}
                                    </div>
                                    {!product.isActive && (
                                        <div className="text-yellow-300 text-sm font-bold">[HẾT HÀNG]</div>
                                    )}
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-3 text-center py-8 text-gray-400">
                                    Không tìm thấy món ăn phù hợp
                                </div>
                            )}
                        </div>

                        {/* Bottom actions */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleNewOrder}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded font-bold"
                            >
                                [F1] Làm mới
                            </button>
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className={`flex-1 py-3 rounded font-bold ${orderNote ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-500'}`}
                            >
                                [F2] Ghi chú {orderNote && '✓'}
                            </button>
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded font-bold"
                            >
                                [F3] Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Order Panel */}
                <div className="w-96 bg-gray-700 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">ĐƠN HÀNG HIỆN TẠI</h2>
                        <span className="text-orange-400 font-bold">#Đơn: {String(orderNumber).padStart(3, '0')}</span>
                    </div>

                    {/* Order Note Display */}
                    {orderNote && (
                        <div className="bg-yellow-600 bg-opacity-30 border border-yellow-500 rounded-lg p-2 mb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs text-yellow-400 font-bold">📝 GHI CHÚ:</span>
                                    <p className="text-sm text-white">{orderNote}</p>
                                </div>
                                <button
                                    onClick={() => setOrderNote('')}
                                    className="text-yellow-400 hover:text-white text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {orderItems.map((item, index) => (
                            <div key={item.productId} className="bg-gray-600 rounded p-2 flex items-center gap-2">
                                <span className="w-6 font-bold">{index + 1}.</span>
                                <span className="flex-1 truncate font-medium">{item.name}</span>
                                <span className="w-16 text-right text-orange-300 font-medium">{formatCurrency(item.price)}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => updateQuantity(item.productId, -1)}
                                        className="w-7 h-7 bg-gray-500 hover:bg-gray-400 rounded font-bold"
                                    >-</button>
                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, 1)}
                                        className="w-7 h-7 bg-gray-500 hover:bg-gray-400 rounded font-bold"
                                    >+</button>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="w-7 h-7 bg-red-600 hover:bg-red-500 rounded font-bold"
                                    >×</button>
                                </div>
                            </div>
                        ))}

                        {orderItems.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                Chưa có món nào
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                        <div className="flex justify-between text-lg">
                            <span className="font-bold">TỔNG TIỀN:</span>
                            <span className="text-orange-400 font-black text-xl">
                                {formatCurrency(getTotal())} đ
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Khách đưa:</span>
                            <input
                                type="text"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value.replace(/\D/g, ''))}
                                placeholder="0"
                                className="w-32 bg-gray-600 text-right px-3 py-2 rounded font-bold"
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Tiền thừa:</span>
                            <span className={`font-bold ${getChange() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(Math.max(0, getChange()))} đ
                            </span>
                        </div>
                    </div>

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-4 rounded-lg text-xl font-black transition shadow-lg"
                    >
                        [ THANH TOÁN & IN ]
                        <div className="text-sm font-medium">(Phím tắt: Enter)</div>
                    </button>
                </div>
            </div>

            {/* Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">📝 Ghi chú đơn hàng</h2>
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="w-8 h-8 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Nhập ghi chú cho đơn hàng... VD: Không hành, ít ớt..."
                                className="w-full h-32 px-4 py-3 border-2 border-gray-400 rounded-xl focus:border-orange-500 focus:outline-none text-gray-900 placeholder-gray-500 font-medium"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                {['Không hành', 'Ít ớt', 'Món riêng', 'Để mang về'].map(quick => (
                                    <button
                                        key={quick}
                                        onClick={() => setOrderNote(prev => prev ? `${prev}, ${quick}` : quick)}
                                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 text-sm font-bold"
                                    >
                                        {quick}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setOrderNote(''); setShowNoteModal(false); }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-bold text-gray-800"
                                >
                                    Xóa ghi chú
                                </button>
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3 rounded-xl font-bold text-white"
                                >
                                    Lưu ghi chú
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    orderItems={orderItems}
                    total={getTotal()}
                    cashReceived={parseFloat(cashReceived) || 0}
                    staffUser={staffUser}
                    currentShift={currentShift}
                    orderNote={orderNote}
                    onClose={() => setShowPaymentModal(false)}
                    onComplete={() => {
                        setShowPaymentModal(false);
                        handleNewOrder();
                    }}
                />
            )}

            {/* Online Order Notification Popup */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl p-5 max-w-sm border-4 border-white">
                        <div className="flex items-start gap-3">
                            <div className="text-4xl">🔔</div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg mb-1">ĐƠN HÀNG ONLINE MỚI!</h3>
                                {newOrderData && (
                                    <div className="text-sm opacity-90">
                                        <p>Mã: #{newOrderData.orderCode}</p>
                                        <p className="font-bold">{new Intl.NumberFormat('vi-VN').format(newOrderData.totalAmount)} đ</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowNotification(false)}
                                className="text-xl opacity-70 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowNotification(false);
                                navigate('/staff/orders');
                            }}
                            className="mt-3 w-full bg-white text-green-600 font-bold py-2 rounded-lg hover:bg-green-50"
                        >
                            Xem đơn hàng →
                        </button>
                    </div>
                </div>
            )}

            {/* End Shift Confirm Modal */}
            <ConfirmModal
                isOpen={showEndShiftConfirm}
                title="Xác nhận đóng ca"
                message="Bạn có chắc muốn đóng ca làm việc?"
                onConfirm={confirmEndShift}
                onCancel={() => setShowEndShiftConfirm(false)}
                confirmText="Đóng ca"
                cancelText="Hủy"
                type="warning"
            />
        </div>
    );
};

export default CashierPOSPage;
