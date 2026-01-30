import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: '✨',
        error: '⚠️',
        info: 'ℹ️'
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[200] ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-up transition-all transform hover:scale-105`}>
            <span className="text-xl">{icons[type]}</span>
            <p className="font-bold tracking-wide text-sm">{message}</p>
            <button
                onClick={onClose}
                className="ml-4 opacity-70 hover:opacity-100 transition-opacity font-bold text-lg"
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;
