import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../../../shared/components/ConfirmModal';

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

    const removeTable = () => {
        if (tables.length === 0) return;
        const newTables = tables.slice(0, -1); // Remove last table
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
                <div className="grid grid-cols-1 gap-6">
                    <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-2xl font-black text-blue-600">
                            TỔNG SỐ BÀN HIỆN CÓ: {totalTables}
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
                        className="border-2 border-green-500 bg-green-50 rounded-lg p-6 text-center hover:bg-green-100 transition"
                    >
                        <div className="text-xl font-black text-green-700 mb-2">[ + THÊM BÀN MỚI ]</div>
                        <div className="text-green-600">(Tự động tăng mã số bàn)</div>
                    </button>
                    <button
                        onClick={removeTable}
                        disabled={tables.length === 0}
                        className={`border-2 rounded-lg p-6 text-center transition ${tables.length === 0
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                : 'border-red-500 bg-red-50 hover:bg-red-100'
                            }`}
                    >
                        <div className={`text-xl font-black mb-2 ${tables.length === 0 ? 'text-gray-400' : 'text-red-700'}`}>[ - BỚT BÀN ]</div>
                        <div className={tables.length === 0 ? 'text-gray-400' : 'text-red-600'}>(Xóa bàn cuối cùng)</div>
                    </button>
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
