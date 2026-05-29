import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    isProcessing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isProcessing = false
}) => {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            console.error('ConfirmationModal onConfirm error:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 transform transition-all scale-100">
                <h3 className="text-xl font-mystic text-rose-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="px-6 py-2 rounded-lg bg-red-500 text-white font-bold tracking-wide hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                PROCESSING...
                            </>
                        ) : (
                            'CONFIRM'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
