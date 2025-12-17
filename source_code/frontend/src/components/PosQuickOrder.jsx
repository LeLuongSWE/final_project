import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, X, ChefHat, Coffee, Package, QrCode, CheckCircle } from 'lucide-react';

/**
 * CẤU HÌNH GÓI GIÁ
 */
const PRICE_PACKS = [
  { id: 'p1', name: 'Suất 30k', price: 30000, color: 'bg-orange-100 border-orange-300 text-orange-800', icon: <ChefHat /> },
  { id: 'p2', name: 'Suất 35k', price: 35000, color: 'bg-blue-100 border-blue-300 text-blue-800', icon: <ChefHat /> },
  { id: 'p3', name: 'Suất 40k', price: 40000, color: 'bg-green-100 border-green-300 text-green-800', icon: <ChefHat /> },
  { id: 'p4', name: 'Suất 50k', price: 50000, color: 'bg-purple-100 border-purple-300 text-purple-800', icon: <ChefHat /> },
  { id: 'e1', name: 'Cơm thêm', price: 5000, color: 'bg-gray-100 border-gray-300 text-gray-800', icon: <Package size={18} /> },
  { id: 'e2', name: 'Trà đá', price: 3000, color: 'bg-teal-100 border-teal-300 text-teal-800', icon: <Coffee size={18} /> },
];

// Thông tin tài khoản ngân hàng giả lập (Dùng để tạo VietQR)
const BANK_INFO = {
  bankId: 'MB', // Ngân hàng Quân Đội
  accountNo: '0987654321', // Số tài khoản mẫu
  template: 'compact', // Giao diện QR
  accountName: 'QUAN COM BINH DAN'
};

const PosWithDynamicQR = () => {
  const [cart, setCart] = useState([]);
  const [qrModal, setQrModal] = useState({ show: false, amount: 0, orderId: '' });
  const [successModal, setSuccessModal] = useState(false);

  // --- LOGIC GIỎ HÀNG ---
  const addItem = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- XỬ LÝ THANH TOÁN ---
  
  const handleCashPayment = () => {
    // Thanh toán tiền mặt: Xong luôn
    completeOrder('Tiền mặt');
  };

  const handleQRPayment = () => {
    // Thanh toán QR: Hiển thị mã QR động
    const orderId = `DH${Math.floor(Math.random() * 10000)}`;
    setQrModal({
      show: true,
      amount: totalAmount,
      orderId: orderId
    });
  };

  const completeOrder = (method) => {
    setQrModal({ show: false, amount: 0, orderId: '' });
    setSuccessModal(true);
    setCart([]); // Reset giỏ hàng
    
    // Tự động tắt thông báo thành công sau 2s
    setTimeout(() => {
      setSuccessModal(false);
    }, 2000);
  };

  // Tạo Link QR động từ VietQR API
  // Cú pháp: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
  const qrImageUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${qrModal.amount}&addInfo=${qrModal.orderId}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* 1. MENU CHỌN MÓN (BÊN TRÁI) */}
      <div className="flex-1 flex flex-col h-full pr-0">
        <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10">
          <h1 className="font-bold text-xl text-slate-800">POS Cơm Bình Dân</h1>
          <div className="text-sm text-gray-500">Ca làm việc: Sáng (06:00 - 14:00)</div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRICE_PACKS.map(pack => (
              <button
                key={pack.id}
                onClick={() => addItem(pack)}
                className={`${pack.color} h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-transform active:scale-95 shadow-sm hover:shadow-md`}
              >
                <div className="text-3xl mb-2">{pack.icon}</div>
                <span className="font-bold text-xl">{pack.name}</span>
                <span className="opacity-80">{pack.price.toLocaleString()}đ</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GIỎ HÀNG & THANH TOÁN (BÊN PHẢI) */}
      <div className="w-[420px] bg-white border-l shadow-2xl flex flex-col z-20">
        {/* Header Giỏ */}
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart /> <span className="font-bold text-lg">Đơn Hàng</span>
          </div>
          <button onClick={() => setCart([])} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>Chưa có món</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-bold text-gray-800">{item.name}</div>
                  <div className="text-blue-600 text-sm font-medium">{item.price.toLocaleString()}đ</div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={16}/></button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-green-500"><Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Thanh Toán */}
        <div className="p-5 bg-white border-t border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">Tổng thanh toán</span>
            <span className="text-4xl font-extrabold text-blue-700">{totalAmount.toLocaleString()}đ</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nút Tiền mặt */}
            <button 
              disabled={cart.length === 0}
              onClick={handleCashPayment}
              className="py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Banknote size={24} />
              <span>Tiền mặt</span>
            </button>

            {/* Nút QR Code */}
            <button 
              disabled={cart.length === 0}
              onClick={handleQRPayment}
              className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode size={24} />
              <span>Chuyển khoản QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL HIỂN THỊ MÃ QR ĐỘNG (THEO YÊU CẦU) */}
      {qrModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center relative animate-scale-in">
            <button 
              onClick={() => setQrModal({ ...qrModal, show: false })}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">Quét Mã Thanh Toán</h3>
            <p className="text-blue-600 font-bold text-2xl mb-4">{qrModal.amount.toLocaleString()}đ</p>
            
            {/* Ảnh QR Động từ VietQR */}
            <div className="bg-white p-2 border-2 border-blue-500 rounded-xl inline-block mb-4">
              <img 
                src={qrImageUrl} 
                alt="VietQR" 
                className="w-64 h-64 object-contain"
              />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Nội dung: <span className="font-mono font-bold text-black">{qrModal.orderId}</span>
            </p>

            {/* Nút xác nhận đã nhận tiền */}
            <button 
              onClick={() => completeOrder('QR Code')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle /> Xác Nhận Đã Thu Tiền
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL THÀNH CÔNG (AUTO HIDE) */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-in">
            <div className="bg-white text-green-600 p-3 rounded-full mb-3">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold">Thanh Toán Thành Công!</h3>
            <p className="opacity-90">Đang in hóa đơn...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosWithDynamicQR;