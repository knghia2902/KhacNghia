import React, { useRef, useEffect } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const CascadingNav = ({ isOpen, onClose, items, folderName, searchQuery, setSearchQuery, activeDocId, onDocClick, onContextMenu, onAddNote, loading }) => {
    const navRef = useRef(null);

    useOnClickOutside(navRef, () => {
        if (isOpen) onClose();
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <div
            ref={navRef}
            id="secondary-panel"
            className={`h-full glass-panel dark:bg-black/30 rounded-[1.5rem] shadow-float z-20 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
                isOpen ? 'w-[340px] translate-x-0 opacity-100 border border-white dark:border-white/10' : 'w-0 -translate-x-10 opacity-0 pointer-events-none border-transparent -mr-6'
            }`}
        >
            <div className="px-6 pt-6 pb-4 flex justify-between items-center">
                <h3 className="font-display text-lg font-bold text-cyan-700 dark:text-cyan-400">{folderName || 'Architecture'}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="px-4 pb-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu..."
                        value={searchQuery || ''}
                        onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all backdrop-blur-md"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 mt-2">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onDocClick && onDocClick(item.id)}
                            onContextMenu={(e) => onContextMenu && onContextMenu(e, item.id, 'doc', item.parentId)}
                            className={`group flex items-center px-4 py-3 rounded-[1rem] shadow-sm border cursor-pointer transition-all duration-300 ${
                                item.id === activeDocId 
                                    ? 'bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border-white/50 dark:border-white/20 hover:border-white dark:hover:border-white/30' 
                                    : 'hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-sm border-transparent'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0 ${
                                item.id === activeDocId 
                                    ? 'bg-white dark:bg-black/40 text-cyan-600 dark:text-cyan-400 shadow-sm' 
                                    : 'bg-white/60 dark:bg-white/5 text-cyan-600 dark:text-cyan-500'
                            }`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate transition-colors ${
                                    item.id === activeDocId 
                                        ? 'font-bold text-cyan-800 dark:text-cyan-300' 
                                        : 'font-semibold text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-400'
                                }`}>
                                    {item.title || item.name}
                                </p>
                                {item.id === activeDocId && (
                                    <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 mt-0.5">Đang mở</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <svg className="w-24 h-24 text-cyan-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <p className="font-sans text-sm font-medium text-slate-600 dark:text-slate-400">Thư mục trống</p>
                    </div>
                )}
            </div>

            <div className="p-4 mt-auto border-t border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md">
                <button
                    onClick={onAddNote}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm shadow-[0_8px_16px_-4px_rgba(13,148,136,0.3)] hover:scale-[1.02] transition-transform flex justify-center items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    Tài liệu mới
                </button>
            </div>
        </div>
    );
};

export default CascadingNav;