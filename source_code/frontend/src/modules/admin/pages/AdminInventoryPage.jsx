import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axiosClient';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const AdminInventoryPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('materials');
    const [materials, setMaterials] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // add, edit, stock-in, stock-out
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [formData, setFormData] = useState({
        name: '', unit: 'kg', unitPrice: 0, minStockLevel: 0, quantity: 0, note: ''
    });
    const [summary, setSummary] = useState({ totalMaterials: 0, lowStockCount: 0, totalInventoryValue: 0 });
    const [unitTypes, setUnitTypes] = useState(['kg', 'lít', 'quả', 'bó', 'bìa', 'gói', 'hộp', 'chai', 'túi', 'con']);
    const [newUnitInput, setNewUnitInput] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });
    const [displayCount, setDisplayCount] = useState(20); // Lazy load: show 20 items at a time

    const addNewUnit = () => {
        if (newUnitInput.trim() && !unitTypes.includes(newUnitInput.trim())) {
            setUnitTypes([...unitTypes, newUnitInput.trim()]);
            setNewUnitInput('');
        }
    };

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [materialsRes, transactionsRes, summaryRes] = await Promise.all([
                api.get('/inventory/materials'),
                api.get('/inventory/transactions'),
                api.get('/inventory/summary')
            ]);
            setMaterials(materialsRes.data);
            setTransactions(transactionsRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    const openModal = (type, material = null) => {
        setModalType(type);
        setSelectedMaterial(material);
        if (type === 'edit' && material) {
            setFormData({
                name: material.name,
                unit: material.unit,
                unitPrice: material.unitPrice || 0,
                minStockLevel: material.minStockLevel || 0,
                quantity: 0,
                note: ''
            });
        } else if (type === 'stock-in' || type === 'stock-out') {
            setFormData({
                ...formData,
                quantity: 0,
                unitPrice: material?.unitPrice || 0,
                note: ''
            });
        } else {
            setFormData({ name: '', unit: 'kg', unitPrice: 0, minStockLevel: 0, quantity: 0, note: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            if (modalType === 'add') {
                await api.post('/inventory/materials', {
                    name: formData.name,
                    unit: formData.unit,
                    unitPrice: parseFloat(formData.unitPrice) || 0,
                    minStockLevel: parseFloat(formData.minStockLevel) || 0,
                    quantityInStock: 0
                });
            } else if (modalType === 'edit') {
                await api.put(`/inventory/materials/${selectedMaterial.materialId}`, {
                    name: formData.name,
                    unit: formData.unit,
                    unitPrice: parseFloat(formData.unitPrice) || 0,
                    minStockLevel: parseFloat(formData.minStockLevel) || 0
                });
            } else if (modalType === 'stock-in') {
                await api.post('/inventory/stock-in', {
                    materialId: selectedMaterial.materialId,
                    quantity: parseFloat(formData.quantity) || 0,
                    unitPrice: parseFloat(formData.unitPrice) || 0,
                    note: formData.note
                });
            } else if (modalType === 'stock-out') {
                await api.post('/inventory/stock-out', {
                    materialId: selectedMaterial.materialId,
                    quantity: parseFloat(formData.quantity) || 0,
                    note: formData.note
                });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id, name) => {
        setConfirmDelete({ show: true, id, name });
    };

    const confirmDeleteAction = async () => {
        try {
            await api.delete(`/inventory/materials/${confirmDelete.id}`);
            fetchData();
        } catch (error) {
            console.error('Lỗi:', error.response?.data?.error || error.message);
        } finally {
            setConfirmDelete({ show: false, id: null, name: '' });
        }
    };

    const tabs = [
        { id: 'materials', label: '📦 Nguyên liệu', icon: '📦' },
        { id: 'transactions', label: '📜 Lịch sử', icon: '📜' }
    ];

    return (
        <AdminLayout activePage="Quản lý Nguyên vật liệu">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="text-gray-600 font-bold text-sm">TỔNG NGUYÊN LIỆU</div>
                    <div className="text-2xl font-black text-blue-600">{summary.totalMaterials}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <div className="text-gray-600 font-bold text-sm">SẮP HẾT HÀNG</div>
                    <div className="text-2xl font-black text-red-600">{summary.lowStockCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="text-gray-600 font-bold text-sm">GIÁ TRỊ TỒN KHO</div>
                    <div className="text-2xl font-black text-green-600">{formatCurrency(summary.totalInventoryValue)} đ</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex border-b">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-bold transition ${activeTab === tab.id
                                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    {activeTab === 'materials' && (
                        <button
                            onClick={() => openModal('add')}
                            className="ml-auto mr-4 my-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                        >
                            + Thêm nguyên liệu
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="p-4">
                        {/* Materials Tab */}
                        {activeTab === 'materials' && (
                            <>
                                {/* Unit Types Manager */}
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-4 flex-wrap">
                                    <span className="font-bold text-gray-700 text-sm">Đơn vị:</span>
                                    {unitTypes.map((unit, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                            {unit}
                                        </span>
                                    ))}
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={newUnitInput}
                                            onChange={(e) => setNewUnitInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addNewUnit()}
                                            placeholder="Thêm đơn vị mới..."
                                            className="px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={addNewUnit}
                                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">Tên nguyên liệu</th>
                                            <th className="px-4 py-3 text-center font-bold text-gray-700">Đơn vị</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Giá mua</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Tồn kho</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Mức cảnh báo</th>
                                            <th className="px-4 py-3 text-center font-bold text-gray-700">Trạng thái</th>
                                            <th className="px-4 py-3 text-center font-bold text-gray-700">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map(material => {
                                            const isLow = material.quantityInStock <= material.minStockLevel;
                                            return (
                                                <tr key={material.materialId} className={`border-t ${isLow ? 'bg-red-50' : ''}`}>
                                                    <td className="px-4 py-3 font-bold text-gray-800">{material.name}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{material.unit}</td>
                                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(material.unitPrice)} đ</td>
                                                    <td className={`px-4 py-3 text-right font-black ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                                                        {material.quantityInStock} {material.unit}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">{material.minStockLevel} {material.unit}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {isLow ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                                ⚠️ Sắp hết
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                                ✓ Đủ hàng
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => openModal('stock-in', material)}
                                                                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold"
                                                                title="Nhập kho"
                                                            >
                                                                📥 Nhập
                                                            </button>
                                                            <button
                                                                onClick={() => openModal('stock-out', material)}
                                                                className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold"
                                                                title="Xuất kho"
                                                            >
                                                                📤 Xuất
                                                            </button>
                                                            <button
                                                                onClick={() => openModal('edit', material)}
                                                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(material.materialId, material.name)}
                                                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Transactions Tab */}
                        {activeTab === 'transactions' && (
                            <>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">Thời gian</th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">Nguyên liệu</th>
                                            <th className="px-4 py-3 text-center font-bold text-gray-700">Loại</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Số lượng</th>
                                            <th className="px-4 py-3 text-right font-bold text-gray-700">Đơn giá</th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-700">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice(0, displayCount).map(tx => (
                                            <tr key={tx.transaction_id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-600 text-sm">
                                                    {new Date(tx.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-800">{tx.material_name || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {tx.type === 'IN' ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                                            📥 NHẬP
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                                                            📤 XUẤT
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit || ''}
                                                </td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(tx.unit_price)} đ</td>
                                                <td className="px-4 py-3 text-gray-600">{tx.note || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Load More Button */}
                                {displayCount < transactions.length && (
                                    <div className="text-center py-4">
                                        <button
                                            onClick={() => setDisplayCount(prev => prev + 20)}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                                        >
                                            📥 Xem thêm ({transactions.length - displayCount} còn lại)
                                        </button>
                                    </div>
                                )}
                                {transactions.length > 0 && (
                                    <div className="text-center text-gray-500 text-sm py-2">
                                        Đang hiển thị {Math.min(displayCount, transactions.length)} / {transactions.length} giao dịch
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold text-lg">
                                {modalType === 'add' && '➕ Thêm nguyên liệu'}
                                {modalType === 'edit' && '✏️ Sửa nguyên liệu'}
                                {modalType === 'stock-in' && `📥 Nhập kho: ${selectedMaterial?.name}`}
                                {modalType === 'stock-out' && `📤 Xuất kho: ${selectedMaterial?.name}`}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-2xl font-bold hover:opacity-70">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(modalType === 'add' || modalType === 'edit') && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên nguyên liệu</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            placeholder="VD: Gạo, Thịt lợn..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị</label>
                                            <select
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            >
                                                {unitTypes.map((unit, idx) => (
                                                    <option key={idx} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Giá mua (đ)</label>
                                            <input
                                                type="number"
                                                value={formData.unitPrice}
                                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Mức cảnh báo tồn kho</label>
                                        <input
                                            type="number"
                                            value={formData.minStockLevel}
                                            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            placeholder="Số lượng tối thiểu"
                                        />
                                    </div>
                                </>
                            )}

                            {(modalType === 'stock-in' || modalType === 'stock-out') && (
                                <>
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <span className="text-gray-600">Tồn kho hiện tại: </span>
                                        <span className="font-black text-blue-600">
                                            {selectedMaterial?.quantityInStock} {selectedMaterial?.unit}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Số lượng {modalType === 'stock-in' ? 'nhập' : 'xuất'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-lg"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                    {modalType === 'stock-in' && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Giá mua mới (nếu thay đổi)</label>
                                            <input
                                                type="number"
                                                value={formData.unitPrice}
                                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
                                        <input
                                            type="text"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                                            placeholder="VD: Nhập từ chợ đầu mối..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className={`flex-1 py-2 text-white font-bold rounded-lg ${modalType === 'stock-out'
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {modalType === 'add' && '➕ Thêm'}
                                    {modalType === 'edit' && '💾 Lưu'}
                                    {modalType === 'stock-in' && '📥 Nhập kho'}
                                    {modalType === 'stock-out' && '📤 Xuất kho'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete.show}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa nguyên liệu "${confirmDelete.name}"?`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </AdminLayout>
    );
};

export default AdminInventoryPage;
