import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Clock, MapPin, Phone, User, ChevronRight, Minus, Plus, X, Search } from 'lucide-react';

const MOCK_MENU = [
  {
    id: 1,
    name: 'Cơm Sườn Xào Chua Ngọt',
    price: 40000,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300',
    description: 'Sườn non rim chua ngọt đậm đà, kèm cơm trắng và rau.',
    rating: 4.8,
    sold: 120,
    isAvailable: true
  },
  {
    id: 2,
    name: 'Cơm Gà Rang Gừng',
    price: 35000,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=300',
    description: 'Gà ta rang gừng thơm nức mũi, vị truyền thống.',
    rating: 4.5,
    sold: 85,
    isAvailable: true
  },
  {
    id: 3,
    name: 'Cơm Thịt Kho Trứng',
    price: 35000,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1627909376662-793e7ebf7602?auto=format&fit=crop&q=80&w=300',
    description: 'Thịt ba chỉ kho mềm, trứng cút thấm vị.',
    rating: 4.9,
    sold: 200,
    isAvailable: true
  },
  {
    id: 4,
    name: 'Đậu Sốt Cà Chua',
    price: 10000,
    category: 'side',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    description: 'Đậu phụ làng Mơ chiên giòn sốt cà.',
    rating: 4.2,
    sold: 50,
    isAvailable: true
  },
  {
    id: 5,
    name: 'Canh Cua Rau Đay',
    price: 10000,
    category: 'soup',
    image: 'https://images.unsplash.com/photo-1603083536442-99646b9a897b?auto=format&fit=crop&q=80&w=300',
    description: 'Canh cua đồng giải nhiệt mùa hè, có cà pháo.',
    rating: 4.7,
    sold: 150,
    isAvailable: true
  },
  {
    id: 6,
    name: 'Nem Rán Hà Nội (Hết)',
    price: 15000,
    category: 'side',
    image: 'https://images.unsplash.com/photo-1632204627257-2c9744b08709?auto=format&fit=crop&q=80&w=300',
    description: 'Nem rán giòn rụm, nhân thịt mộc nhĩ.',
    rating: 4.6,
    sold: 300,
    isAvailable: false 
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'main', name: 'Món Chính' },
  { id: 'side', name: 'Món Phụ' },
  { id: 'soup', name: 'Canh/Rau' },
];

const DishCard = ({ item, onAdd }) => (
  <div className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}>
    <div className="w-24 h-24 flex-shrink-0">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-orange-500">
          <span className="flex items-center"><Star size={10} className="fill-orange-500 mr-0.5" /> {item.rating}</span>
          <span className="text-gray-400">• Đã bán {item.sold}+</span>
        </div>
      </div>
      <div className="flex justify-between items-end mt-2">
        <span className="font-bold text-blue-600">{item.price.toLocaleString()}đ</span>
        {item.isAvailable ? (
          <button 
            onClick={() => onAdd(item)}
            className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus size={16} />
          </button>
        ) : (
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Hết hàng</span>
        )}
      </div>
    </div>
  </div>
);


const CartDrawer = ({ cart, isOpen, onClose, onUpdateQuantity, onSubmitOrder }) => {

  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (isOpen) {
      const savedInfo = localStorage.getItem('guest_info');
      if (savedInfo) {
        setCustomerInfo(JSON.parse(savedInfo));
      }
    }
  }, [isOpen]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('guest_info', JSON.stringify(customerInfo));
    onSubmitOrder(customerInfo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="text-blue-600" /> Giỏ Hàng ({cart.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có món nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white border p-2 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-blue-600 font-bold text-sm">{item.price.toLocaleString()}đ</div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-green-500"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">Thông tin giao hàng</h3>
              <form id="order-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Tên của bạn"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    required 
                    type="tel" 
                    placeholder="Số điện thoại"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Địa chỉ nhận hàng (Cụ thể)"
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 italic">*Thông tin sẽ được tự động lưu cho lần sau.</p>
              </form>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}đ</span>
            </div>
            <button 
              form="order-form"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              Đặt Hàng Ngay <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DemoBooking = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenu = MOCK_MENU.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleOrderSubmit = (customerInfo) => {

    console.log("Submitting Order:", { customer: customerInfo, items: cart });
    alert(`Cảm ơn ${customerInfo.name}! Đơn hàng của bạn đang được chuẩn bị.\nQuán sẽ gọi vào số ${customerInfo.phone} để xác nhận.`);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20 md:pb-0">
 
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-blue-700 tracking-tight">Cơm Bình Dân 123</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} /> Mở cửa: 10:30 - 13:30
            </p>
          </div>
          
          <div className="relative">
            <button onClick={() => setIsCartOpen(true)} className="p-2 relative">
              <ShoppingBag className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>


        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Hôm nay bạn muốn ăn gì?" 
              className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>


        <div className="px-4 pb-0 overflow-x-auto no-scrollbar flex gap-3 border-b">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pb-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === cat.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>


      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          Thực Đơn Hôm Nay <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{new Date().toLocaleDateString('vi-VN')}</span>
        </h2>
        
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMenu.map(item => (
              <DishCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Không tìm thấy món ăn nào :(</p>
          </div>
        )}
      </div>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onSubmitOrder={handleOrderSubmit}
      />

      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-20">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 flex justify-between items-center px-5 animate-fade-in-up"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-bold">{totalItems}</span>
              <span className="text-sm font-medium">Giỏ hàng</span>
            </div>
            <span className="font-bold">
              {cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}đ
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DemoBooking;