import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function Toast({ message, isVisible, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 2500);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] rounded-2xl shadow-2xl border border-white/10 text-xs font-bold">
                <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>
                <span>{message}</span>
            </div>
        </div>,
        document.body
    );
}
