import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'danger' }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const typeStyles = {
        danger: {
            icon: '⚠️',
            confirmBtn: 'bg-red-600 hover:bg-red-700',
            iconBg: 'bg-red-100 text-red-600'
        },
        warning: {
            icon: '❓',
            confirmBtn: 'bg-orange-600 hover:bg-orange-700',
            iconBg: 'bg-orange-100 text-orange-600'
        },
        info: {
            icon: 'ℹ️',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700',
            iconBg: 'bg-blue-100 text-blue-600'
        }
    };

    const style = typeStyles[type] || typeStyles.danger;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl transform transition-all relative">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                    ×
                </button>

                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${style.iconBg}`}>
                        {style.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-gray-800 mb-2">
                        {title || 'Xác nhận'}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-2 px-4 text-white font-bold rounded-lg transition ${style.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
