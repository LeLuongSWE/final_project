import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminMenuPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'MÓN MẶN',
        isActive: true,
        imageData: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://192.168.1.161:8080/api/products/all');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const groupedProducts = () => {
        const filtered = products.filter(p => {
            const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && p.isActive) ||
                (filterStatus === 'inactive' && !p.isActive);
            return matchSearch && matchStatus;
        });

        const groups = {};
        filtered.forEach(p => {
            const cat = p.category || 'Khác';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', category: 'MÓN MẶN', isActive: true, imageData: '' });
        setImagePreview('');
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category || 'MÓN MẶN',
            isActive: product.isActive,
            imageData: product.imageData || ''
        });
        setImagePreview(product.imageData || '');
        setShowModal(true);
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, imageData: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            if (editingProduct) {
                await axios.put(`http://192.168.1.161:8080/api/products/${editingProduct.productId}`, formData);
            } else {
                await axios.post('http://192.168.1.161:8080/api/products', formData);
            }
            fetchProducts();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Có lỗi khi lưu sản phẩm');
        }
    };

    const handleDelete = (productId, name) => {
        setConfirmDelete({ show: true, id: productId, name });
    };

    const confirmDeleteAction = async () => {
        try {
            // Use hard delete to permanently remove product
            await axios.delete(`http://192.168.1.161:8080/api/products/${confirmDelete.id}/hard`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Có lỗi khi xóa sản phẩm. Sản phẩm có thể đang được sử dụng trong đơn hàng.');
        } finally {
            setConfirmDelete({ show: false, id: null, name: '' });
        }
    };

    const toggleStatus = async (product) => {
        try {
            await axios.put(`http://192.168.1.161:8080/api/products/${product.productId}`, {
                isActive: !product.isActive
            });
            fetchProducts();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Get image source - prioritize imageData then imageUrl
    const getImageSrc = (product) => {
        if (product.imageData) return product.imageData;
        if (product.imageUrl) return product.imageUrl;
        return null;
    };

    const categories = ['MÓN MẶN', 'RAU/CANH', 'CƠM THÊM'];

    return (
        <AdminLayout activePage="Quản lý Thực đơn">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="[ Tìm món ăn... ]"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                />
                <span className="font-bold text-gray-700">Lọc:</span>
                {[
                    { value: 'all', label: '[Tất cả]' },
                    { value: 'active', label: '[Đang bán]' },
                    { value: 'inactive', label: '[Hết hàng]' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilterStatus(f.value)}
                        className={`px-3 py-2 rounded-lg font-bold transition ${filterStatus === f.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
                <button
                    onClick={handleAddNew}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                    [ + THÊM MÓN MỚI ]
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : (
                Object.entries(groupedProducts()).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-lg shadow mb-6">
                        <div className="bg-gray-200 px-4 py-3 rounded-t-lg">
                            <h2 className="font-black text-gray-800">Danh mục: {category}</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-20">Hình ảnh</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Tên món ăn</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Giá bán</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-24">Đơn vị</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Tình trạng</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(product => (
                                    <tr key={product.productId} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {getImageSrc(product) ? (
                                                <img
                                                    src={getImageSrc(product)}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
                                                    [IMG]
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                                        <td className="px-4 py-3 font-bold text-gray-800">{formatCurrency(product.price)} đ</td>
                                        <td className="px-4 py-3 text-gray-600">Đĩa</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={`px-2 py-1 rounded font-bold text-sm ${product.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                [{product.isActive ? 'x' : ' '}] ({product.isActive ? 'Còn hàng' : 'Hết hàng'})
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:text-blue-800 font-bold mr-2"
                                            >
                                                [Sửa]
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.productId, product.name)}
                                                className="text-red-600 hover:text-red-800 font-bold"
                                            >
                                                [X]
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}

            {/* Add/Edit Modal with Image Upload */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-gray-800 mb-4">
                            {editingProduct ? 'Sửa món ăn' : 'Thêm món mới'}
                        </h2>
                        <div className="space-y-4">
                            {/* Image upload section */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Hình ảnh món ăn</label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-sm text-center">Click để<br />chọn ảnh</span>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium text-sm"
                                        >
                                            📷 Chọn ảnh từ máy
                                        </button>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(''); setFormData({ ...formData, imageData: '' }); }}
                                                className="ml-2 text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                ❌ Xóa ảnh
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Tối đa 2MB, định dạng JPG/PNG</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Tên món ăn</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Giá bán (VNĐ)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Danh mục</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5"
                                />
                                <label className="font-bold text-gray-700">Còn hàng</label>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold text-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete.show}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa món "${confirmDelete.name}"?`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </AdminLayout>
    );
};

export default AdminMenuPage;
