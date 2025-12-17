import React, { useState } from 'react';
import { 
  LayoutDashboard, Utensils, DollarSign, Plus, Edit, Trash2, 
  Save, X, Check, Image as ImageIcon, ChefHat, Eye, EyeOff 
} from 'lucide-react';


const INITIAL_PRICE_PACKS = [
  { id: 'p1', name: 'Suất 30k', price: 30000, color: 'bg-orange-100', isActive: true },
  { id: 'p2', name: 'Suất 35k', price: 35000, color: 'bg-blue-100', isActive: true },
  { id: 'p3', name: 'Suất 40k', price: 40000, color: 'bg-green-100', isActive: true },
  { id: 'e1', name: 'Trà đá', price: 3000, color: 'bg-teal-100', isActive: true },
];

const INITIAL_DISHES = [
  { id: 1, name: 'Sườn xào chua ngọt', category: 'Món Mặn', isAvailable: true, description: 'Sườn non, nước sốt đặc biệt' },
  { id: 2, name: 'Gà rang gừng', category: 'Món Mặn', isAvailable: true, description: 'Gà ta, gừng tươi' },
  { id: 3, name: 'Đậu sốt cà chua', category: 'Món Phụ', isAvailable: true, description: 'Đậu mơ, cà chua' },
  { id: 4, name: 'Rau muống luộc', category: 'Rau/Canh', isAvailable: true, description: 'Rau muống, nước luộc đánh sấu' },
  { id: 5, name: 'Chả lá lốt', category: 'Món Mặn', isAvailable: false, description: 'Thịt lợn, lá lốt' }, // Hết hàng
];

const AdminMenuManager = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'web'
  
  const [pricePacks, setPricePacks] = useState(INITIAL_PRICE_PACKS);
  const [dishes, setDishes] = useState(INITIAL_DISHES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);


  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (activeTab === 'pos') {
      const newPack = {
        id: editingItem ? editingItem.id : `new_${Date.now()}`,
        name: data.name,
        price: Number(data.price),
        color: data.color || 'bg-gray-100',
        isActive: editingItem ? editingItem.isActive : true
      };

      if (editingItem) {
        setPricePacks(prev => prev.map(p => p.id === editingItem.id ? newPack : p));
      } else {
        setPricePacks([...pricePacks, newPack]);
      }
    } else {
      const newDish = {
        id: editingItem ? editingItem.id : Date.now(),
        name: data.name,
        category: data.category,
        description: data.description,
        isAvailable: editingItem ? editingItem.isAvailable : true
      };

      if (editingItem) {
        setDishes(prev => prev.map(d => d.id === editingItem.id ? newDish : d));
      } else {
        setDishes([...dishes, newDish]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    if (activeTab === 'pos') {
      setPricePacks(prev => prev.filter(p => p.id !== id));
    } else {
      setDishes(prev => prev.filter(d => d.id !== id));
    }
  };

  const toggleStatus = (id) => {
    if (activeTab === 'pos') {
      setPricePacks(prev => prev.map(p => p.id === id ? {...p, isActive: !p.isActive} : p));
    } else {
      setDishes(prev => prev.map(d => d.id === id ? {...d, isAvailable: !d.isAvailable} : d));
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-blue-400"/> Quản Trị
          </h1>
          <p className="text-xs text-slate-400 mt-1">Hệ thống Cơm Bình Dân</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'pos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <DollarSign size={20} />
            <div className="text-left">
              <div className="font-bold">Cấu hình POS</div>
              <div className="text-[10px] opacity-80">Quản lý các gói giá</div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('web')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'web' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <Utensils size={20} />
            <div className="text-left">
              <div className="font-bold">Thực đơn Online</div>
              <div className="text-[10px] opacity-80">Quản lý món ăn hiển thị</div>
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-center text-slate-500">
          Logged in as: Manager
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'pos' ? 'Cấu Hình Gói Giá (POS Buttons)' : 'Quản Lý Thực Đơn Online'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'pos' 
                ? 'Các nút này sẽ xuất hiện trên màn hình bán hàng của nhân viên.' 
                : 'Danh sách này sẽ hiển thị trên website cho khách hàng xem.'}
            </p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Plus size={18} /> Thêm Mới
          </button>
        </header>

        <div className="p-6">
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pricePacks.map(pack => (
                <div key={pack.id} className={`bg-white rounded-xl shadow-sm border-2 p-4 relative group transition-all ${pack.isActive ? 'border-transparent' : 'border-gray-200 opacity-60 grayscale'}`}>
                  {/* Preview Button Look */}
                  <div className={`h-24 ${pack.color} rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300/50`}>
                    <ChefHat className="mb-2 opacity-50" />
                    <span className="font-bold text-lg">{pack.name}</span>
                    <span className="text-sm opacity-80">{pack.price.toLocaleString()}đ</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button 
                      onClick={() => toggleStatus(pack.id)}
                      className={`text-xs font-bold px-2 py-1 rounded ${pack.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {pack.isActive ? 'Đang hiện' : 'Đang ẩn'}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(pack)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(pack.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'web' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4 border-b">Tên Món Ăn</th>
                    <th className="p-4 border-b">Danh Mục</th>
                    <th className="p-4 border-b">Mô Tả (Hiển thị web)</th>
                    <th className="p-4 border-b text-center">Trạng Thái (Hôm nay)</th>
                    <th className="p-4 border-b text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dishes.map(dish => (
                    <tr key={dish.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{dish.name}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{dish.category}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{dish.description}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleStatus(dish.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            dish.isAvailable 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {dish.isAvailable ? <Eye size={12}/> : <EyeOff size={12}/>}
                          {dish.isAvailable ? 'Đang bán' : 'Hết hàng'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(dish)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(dish.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? 'Chỉnh Sửa' : 'Thêm Mới'} {activeTab === 'pos' ? 'Gói Giá' : 'Món Ăn'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                <input 
                  name="name"
                  defaultValue={editingItem?.name}
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={activeTab === 'pos' ? "Ví dụ: Suất 50k" : "Ví dụ: Thịt kho tàu"}
                />
              </div>

              {activeTab === 'pos' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (VNĐ)</label>
                    <input 
                      name="price"
                      type="number"
                      defaultValue={editingItem?.price}
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu nút (Tailwind Class)</label>
                    <select 
                      name="color" 
                      defaultValue={editingItem?.color}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="bg-gray-100">Xám (Mặc định)</option>
                      <option value="bg-orange-100">Cam (Suất ăn)</option>
                      <option value="bg-blue-100">Xanh dương (Suất ăn)</option>
                      <option value="bg-green-100">Xanh lá (Suất ăn)</option>
                      <option value="bg-teal-100">Xanh ngọc (Đồ uống)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select 
                      name="category"
                      defaultValue={editingItem?.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option>Món Mặn</option>
                      <option>Món Phụ</option>
                      <option>Rau/Canh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả món ăn</label>
                    <textarea 
                      name="description"
                      defaultValue={editingItem?.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                      placeholder="Mô tả nguyên liệu, hương vị..."
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                >
                  <Save size={18} className="inline mr-2" /> Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManager;