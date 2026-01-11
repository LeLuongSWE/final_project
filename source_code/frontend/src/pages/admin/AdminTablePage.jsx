import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminTablePage = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [totalTables, setTotalTables] = useState(20);
    const [tablesInUse, setTablesInUse] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: '' });

    useEffect(() => {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Initialize tables from localStorage or default
        const savedTables = localStorage.getItem('shopTables');
        if (savedTables) {
            const parsedTables = JSON.parse(savedTables);
            setTables(parsedTables);
            setTotalTables(parsedTables.length);
            setTablesInUse(parsedTables.filter(t => t.inUse).length);
        } else {
            // Create default tables
            const defaultTables = Array.from({ length: 20 }, (_, i) => ({
                id: i + 1,
                name: `Bàn ${i + 1}`,
                inUse: i < 12 // First 12 tables in use as demo
            }));
            setTables(defaultTables);
            setTablesInUse(12);
            localStorage.setItem('shopTables', JSON.stringify(defaultTables));
        }
    }, [navigate]);

    const addTable = () => {
        const newTable = {
            id: tables.length + 1,
            name: `Bàn ${tables.length + 1}`,
            inUse: false
        };
        const newTables = [...tables, newTable];
        setTables(newTables);
        setTotalTables(newTables.length);
        localStorage.setItem('shopTables', JSON.stringify(newTables));
    };

    const deleteTable = (tableId) => {
        const table = tables.find(t => t.id === tableId);
        if (table?.inUse) {
            return; // Can't delete table in use
        }
        setConfirmDelete({ show: true, id: tableId, name: table.name });
    };

    const confirmDeleteAction = () => {
        const newTables = tables.filter(t => t.id !== confirmDelete.id);
        setTables(newTables);
        setTotalTables(newTables.length);
        localStorage.setItem('shopTables', JSON.stringify(newTables));
        setConfirmDelete({ show: false, id: null, name: '' });
    };

    const toggleTableStatus = (tableId) => {
        const newTables = tables.map(t =>
            t.id === tableId ? { ...t, inUse: !t.inUse } : t
        );
        setTables(newTables);
        setTablesInUse(newTables.filter(t => t.inUse).length);
        localStorage.setItem('shopTables', JSON.stringify(newTables));
    };

    return (
        <AdminLayout activePage="Quản lý Bàn ăn">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-black text-gray-800 mb-4">THÔNG TIN TỔNG QUAN</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-2xl font-black text-blue-600">
                            TỔNG SỐ BÀN HIỆN CÓ: {totalTables}
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-2xl font-black text-green-600">
                            SỐ BÀN ĐANG SỬ DỤNG: {tablesInUse}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-black text-gray-800 mb-4">CẤU HÌNH SỐ LƯỢNG</h2>
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={addTable}
                        className="border-2 border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition"
                    >
                        <div className="text-xl font-black text-gray-800 mb-2">[ + THÊM BÀN MỚI ]</div>
                        <div className="text-gray-600">(Tự động tăng mã số bàn)</div>
                    </button>
                    <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-xl font-black text-gray-800 mb-2">[ - XÓA BÀN ĐÃ CHỌN ]</div>
                        <div className="text-gray-600">(Cần chọn bàn trống để xóa)</div>
                    </div>
                </div>
            </div>

            {/* Table Grid */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-black text-gray-800 mb-4">DANH SÁCH BÀN</h2>
                <div className="grid grid-cols-5 gap-4">
                    {tables.map(table => (
                        <div
                            key={table.id}
                            className={`border-2 rounded-lg p-4 text-center relative ${table.inUse
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-gray-50'
                                }`}
                        >
                            <div className="font-black text-gray-800 mb-2">{table.name}</div>
                            <div className={`text-sm font-bold ${table.inUse ? 'text-green-600' : 'text-gray-500'}`}>
                                {table.inUse ? '🟢 Đang dùng' : '⚪ Trống'}
                            </div>
                            <div className="mt-2 flex justify-center gap-1">
                                <button
                                    onClick={() => toggleTableStatus(table.id)}
                                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                                >
                                    {table.inUse ? 'Trả bàn' : 'Sử dụng'}
                                </button>
                                {!table.inUse && (
                                    <button
                                        onClick={() => deleteTable(table.id)}
                                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete.show}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa ${confirmDelete.name}?`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ show: false, id: null, name: '' })}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </AdminLayout>
    );
};

export default AdminTablePage;
