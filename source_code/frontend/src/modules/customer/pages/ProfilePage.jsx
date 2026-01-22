import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../../shared/context/AuthContext';
import { userService } from '../../../shared/services/userService';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        label: 'Nhà',
        recipientName: '',
        phone: '',
        addressLine: '',
        ward: '',
        district: '',
        city: 'Hà Nội'
    });

    // Load profile data
    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.full_name || user.fullName || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
        loadAddresses();
    }, [user]);

    const loadAddresses = async () => {
        try {
            const data = await userService.getAddresses();
            setAddresses(data);
        } catch (err) {
            console.error('Error loading addresses:', err);
        }
    };

    // Profile handlers
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const result = await userService.updateProfile(profileForm);
            // Update local user data
            const updatedUser = { ...user, ...result.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);
            setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setProfileLoading(false);
        }
    };

    // Password handlers  
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        setPasswordLoading(true);

        try {
            await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Address handlers
    const resetAddressForm = () => {
        setAddressForm({
            label: 'Nhà',
            recipientName: user?.full_name || user?.fullName || '',
            phone: user?.phone || '',
            addressLine: '',
            ward: '',
            district: '',
            city: 'Hà Nội'
        });
        setEditingAddress(null);
    };

    const handleAddAddress = () => {
        resetAddressForm();
        setShowAddressForm(true);
    };

    const handleEditAddress = (address) => {
        setAddressForm({
            label: address.label || 'Nhà',
            recipientName: address.recipientName,
            phone: address.phone,
            addressLine: address.addressLine,
            ward: address.ward || '',
            district: address.district || '',
            city: address.city || 'Hà Nội'
        });
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setAddressLoading(true);

        try {
            if (editingAddress) {
                await userService.updateAddress(editingAddress.addressId, addressForm);
            } else {
                await userService.createAddress(addressForm);
            }
            await loadAddresses();
            setShowAddressForm(false);
            resetAddressForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

        try {
            await userService.deleteAddress(addressId);
            await loadAddresses();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await userService.setDefaultAddress(addressId);
            await loadAddresses();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
        { id: 'password', label: 'Đổi mật khẩu', icon: '🔐' },
        { id: 'addresses', label: 'Địa chỉ giao hàng', icon: '📍' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/profile" />

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Tài khoản cá nhân</h1>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2
                                    ${activeTab === tab.id
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

                            {profileMessage.text && (
                                <div className={`mb-4 p-3 rounded ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {profileMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={profileForm.fullName}
                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="0912345678"
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
                                    >
                                        {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>

                            {passwordMessage.text && (
                                <div className={`mb-4 p-3 rounded ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Tối thiểu 6 ký tự"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={handleAddAddress}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
                                    >
                                        <span>+</span> Thêm địa chỉ
                                    </button>
                                )}
                            </div>

                            {/* Address Form */}
                            {showAddressForm && (
                                <div className="border-2 border-orange-200 rounded-lg p-4 mb-4 bg-orange-50">
                                    <h3 className="font-medium mb-3">{editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại địa chỉ</label>
                                                <select
                                                    value={addressForm.label}
                                                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value="Nhà">🏠 Nhà</option>
                                                    <option value="Công ty">🏢 Công ty</option>
                                                    <option value="Khác">📍 Khác</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.recipientName}
                                                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                                            <input
                                                type="text"
                                                value={addressForm.addressLine}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                                                required
                                                placeholder="Số nhà, tên đường..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.ward}
                                                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.district}
                                                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={addressLoading}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                                            >
                                                {addressLoading ? 'Đang lưu...' : (editingAddress ? 'Cập nhật' : 'Thêm địa chỉ')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowAddressForm(false); resetAddressForm(); }}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Address List */}
                            {addresses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">📍</p>
                                    <p>Chưa có địa chỉ nào được lưu</p>
                                    <p className="text-sm">Thêm địa chỉ để đặt hàng nhanh hơn</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(address => (
                                        <div key={address.addressId} className={`border rounded-lg p-4 ${address.isDefault ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{address.label === 'Nhà' ? '🏠' : address.label === 'Công ty' ? '🏢' : '📍'} {address.label}</span>
                                                        {address.isDefault && (
                                                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">Mặc định</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-800">{address.recipientName} - {address.phone}</p>
                                                    <p className="text-gray-600 text-sm">
                                                        {address.addressLine}
                                                        {address.ward && `, ${address.ward}`}
                                                        {address.district && `, ${address.district}`}
                                                        {address.city && `, ${address.city}`}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!address.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefault(address.addressId)}
                                                            className="text-orange-600 hover:text-orange-700 text-sm"
                                                        >
                                                            Đặt mặc định
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(address.addressId)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
