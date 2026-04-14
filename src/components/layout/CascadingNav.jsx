import React, { useRef, useEffect } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const CascadingNav = ({ isOpen, onClose, items, folderName, searchQuery, setSearchQuery, activeDocId, onDocClick, onContextMenu, onAddNote, loading, isFocusMode }) => {
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
            className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full md:w-[400px] bg-atrium-primary-container/15 backdrop-blur-[20px] shadow-ambient flex flex-col overflow-hidden border-l border-white/20 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            {/* Mobile Header */}
            <div className="md:hidden px-6 pt-6 pb-4 flex items-center bg-white/10 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={onClose}
                    className="mr-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors text-slate-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h3 className="font-display text-lg font-bold text-atrium-primary truncate">{folderName || 'Tài liệu'}</h3>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex px-6 pt-6 pb-4 justify-between items-center">
                <h3 className="font-display text-lg font-bold text-atrium-primary truncate">{folderName || 'Tài liệu'}</h3>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors text-slate-500 shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 pb-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu..."
                        value={searchQuery || ''}
                        onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-atrium-primary/30 transition-all backdrop-blur-md"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 mt-2">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onDocClick && onDocClick(item.id)}
                            onContextMenu={(e) => onContextMenu && onContextMenu(e, item.id, 'doc', item.parentId)}
                            className={`group flex items-center px-4 py-3 rounded-[1rem] hover:bg-atrium-surface-lowest hover:shadow-ambient transition-all duration-300 cursor-pointer ${
                                item.id === activeDocId ? 'bg-atrium-primary/10 ring-1 ring-atrium-primary/30' : ''
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0 transition-colors ${item.id === activeDocId ? 'bg-atrium-primary text-white' : 'bg-white/60 text-atrium-primary group-hover:bg-white'}`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-sans font-semibold truncate transition-colors ${item.id === activeDocId ? 'text-atrium-primary' : 'text-slate-600 group-hover:text-atrium-primary'}`}>
                                    {item.title || item.name}
                                </p>
                                {item.updatedAt && (
                                    <p className={`text-[0.65rem] mt-0.5 ${item.id === activeDocId ? 'text-atrium-primary/70' : 'text-slate-500'}`}>
                                        {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        </div>
                        ))
                        ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <svg className="w-24 h-24 text-atrium-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <p className="font-sans text-sm font-medium text-slate-600">Thư mục trống</p>
                        </div>
                        )}
                        </div>

                        <div className="p-4 mt-auto border-t border-white/40 bg-white/30 backdrop-blur-md">
                        <button
                        onClick={onAddNote}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-atrium-primary to-atrium-primary-container text-white font-bold text-sm shadow-[0_8px_16px_-4px_rgba(0,106,101,0.3)] hover:scale-[1.02] transition-transform flex justify-center items-center"
                        >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                        Tài liệu mới
                        </button>
                        </div>        </div>
    );
};

export default CascadingNav;
