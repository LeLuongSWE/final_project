import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminStaffPage = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        roleId: 2,
        phone: ''
    });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });

    const roles = [
        { id: 1, name: 'ADMIN', label: 'Quản lý' },
        { id: 2, name: 'CASHIER', label: 'Thu ngân' },
        { id: 3, name: 'KITCHEN', label: 'Bếp trưởng' },
    ];

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }
        fetchStaff();
    }, [navigate]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://192.168.1.161:8080/api/admin/staff');
            setStaff(response.data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (roleId) => {
        return roles.find(r => r.id === roleId)?.label || 'Nhân viên';
    };

    const filteredStaff = staff.filter(s => {
        const matchSearch = !searchQuery ||
            s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.phone?.includes(searchQuery) ||
            s.username?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = filterRole === 'all' || s.roleId === parseInt(filterRole);
        return matchSearch && matchRole;
    });

    const handleAddNew = () => {
        setEditingStaff(null);
        setFormData({
            username: '',
            password: '',
            fullName: '',
            roleId: 2,
            phone: ''
        });
        setShowModal(true);
    };

    const handleEdit = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            username: staffMember.username,
            password: '',
            fullName: staffMember.fullName,
            roleId: staffMember.roleId,
            phone: staffMember.phone || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingStaff) {
                await axios.put(`http://192.168.1.161:8080/api/admin/staff/${editingStaff.userId}`, {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    roleId: formData.roleId,
                    password: formData.password || undefined
                });
            } else {
                await axios.post('http://192.168.1.161:8080/api/admin/staff', formData);
            }
            fetchStaff();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving staff:', error);
            alert(error.response?.data?.error || 'Có lỗi khi lưu nhân viên');
        }
    };

    const handleDelete = (userId, name) => {
        setConfirmDelete({ show: true, id: userId, name });
    };

    const confirmDeleteAction = async () => {
        try {
            await axios.delete(`http://192.168.1.161:8080/api/admin/staff/${confirmDelete.id}`);
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
        } finally {
            setConfirmDelete({ show: false, id: null, name: '' });
        }
    };

    return (
        <AdminLayout activePage="Quản lý Nhân viên">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="[ Tìm kiếm tên/SĐT/Username... ]"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                />
                <span className="font-bold text-gray-700">Lọc:</span>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                >
                    <option value="all">Tất cả</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                </select>
                <button
                    onClick={handleAddNew}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                    [ + THÊM NHÂN VIÊN MỚI ]
                </button>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="bg-gray-200 px-4 py-3 rounded-t-lg">
                    <h2 className="font-black text-gray-800">Danh sách nhân viên ({filteredStaff.length})</h2>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 w-24">Mã NV</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700">Username</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700">Họ và Tên</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Chức vụ</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Số điện thoại</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        Không có nhân viên nào
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((s, index) => (
                                    <tr key={s.userId} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-gray-800">
                                            NV{String(s.userId).padStart(3, '0')}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{s.username}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{s.fullName}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-sm font-bold ${s.roleId === 1 ? 'bg-purple-100 text-purple-700' :
                                                s.roleId === 2 ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {getRoleName(s.roleId)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{s.phone || '---'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="text-blue-600 hover:text-blue-800 font-bold mr-2"
                                            >
                                                [Sửa]
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.userId, s.fullName)}
                                                className="text-red-600 hover:text-red-800 font-bold"
                                            >
                                                [X]
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-black text-gray-800 mb-4">
                            {editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                    disabled={!!editingStaff}
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">
                                    {editingStaff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Chức vụ</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
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
                message={`Bạn có chắc muốn xóa nhân viên "${confirmDelete.name}"?`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </AdminLayout>
    );
};

export default AdminStaffPage;
