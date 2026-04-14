import React from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const CascadingNav = ({
    isOpen,
    onClose,
    items,
    folderName,
    loading,
    searchQuery,
    setSearchQuery,
    activeDocId,
    onDocClick,
    onContextMenu,
    isFocusMode
}) => {
    const navRef = React.useRef();

    // Optionally close when clicking outside if on mobile or if needed
    // The design from phase3-preview shows the secondary panel sitting next to the primary panel.
    // If it's acting as an overlay on mobile, we can use useOnClickOutside.
    // useOnClickOutside(navRef, () => {
    //     if (isOpen && window.innerWidth < 768) {
    //         onClose();
    //     }
    // });

    return (
        <div
            ref={navRef}
            id="secondary-panel"
            className={`
                h-full glass-panel rounded-[1.5rem] shadow-float z-20 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 border border-white
                ${isOpen ? 'translate-x-0 opacity-100 w-[340px]' : '-translate-x-10 opacity-0 w-0 pointer-events-none'}
                ${isFocusMode ? 'hidden' : 'hidden lg:flex'}
            `}
        >
            <div className="px-6 pt-6 pb-4 flex justify-between items-center shrink-0">
                <h3 className="font-display text-lg font-bold text-cyan-700 truncate mr-2">{folderName || 'Tài liệu'}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors text-slate-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="px-4 pb-2 flex items-center gap-2 shrink-0">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#1d2624]/40">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-white/40 border border-white/50 hover:border-white focus:border-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                        placeholder="Tìm kiếm tài liệu..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="px-3 py-1 rounded-full bg-cyan-100/80 text-[10px] font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200 cursor-pointer shadow-sm">Tất cả</span>
                <span className="px-3 py-1 rounded-full bg-white/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-white/70 transition-colors shadow-sm">Nháp</span>
                <span className="px-3 py-1 rounded-full bg-white/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-white/70 transition-colors shadow-sm">Đã chia sẻ</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-2 mt-2">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/40 rounded-2xl border border-white/50"></div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 truncate mt-10">
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">folder_open</span>
                        <p className="text-sm font-medium opacity-60">Thư mục trống</p>
                        <p className="text-xs mt-1 opacity-40">Chưa có tài liệu nào</p>
                    </div>
                ) : (
                    items.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => onDocClick(doc.id)}
                            onContextMenu={(e) => onContextMenu(e, doc.id, 'doc', doc.parentId)}
                            className={`group flex items-center px-4 py-3 rounded-[1rem] shadow-sm border cursor-pointer transition-all ${
                                activeDocId === doc.id 
                                ? 'bg-white/70 border-white shadow-md' 
                                : 'bg-white/40 border-white/50 hover:bg-white/60 hover:border-white hover:shadow-sm'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center mr-3 shrink-0 shadow-sm transition-colors ${
                                activeDocId === doc.id ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-500'
                            }`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <p className={`text-sm font-bold truncate transition-colors ${
                                        activeDocId === doc.id ? 'text-cyan-800' : 'text-slate-600 group-hover:text-cyan-700'
                                    }`}>
                                        {doc.title}
                                    </p>
                                    {doc.isLocked && (
                                        <span className="material-symbols-outlined text-[12px] text-amber-500" title="Khóa - Yêu cầu đăng nhập">lock</span>
                                    )}
                                    {doc.isHidden && (
                                        <span className="material-symbols-outlined text-[12px] text-gray-400" title="Ẩn - Chỉ Admin">visibility_off</span>
                                    )}
                                </div>
                                <p className="text-[0.65rem] text-slate-500 mt-0.5 flex justify-between">
                                    <span className="truncate pr-2">
                                        {doc.content !== undefined 
                                            ? (doc.content.replace(/<[^>]*>?/gm, '').substring(0, 30) + '...') 
                                            : 'Click để tải...'
                                        }
                                    </span>
                                    <span className="shrink-0">{doc.date}</span>
                                </p>
                                {doc.tags && doc.tags.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                                        {doc.tags.slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="px-1.5 py-0.5 text-[8px] font-bold rounded-md uppercase bg-white/60 text-slate-500 border border-white/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 mt-auto border-t border-white/40 bg-white/30 backdrop-blur-md shrink-0">
                <button 
                    onClick={() => {
                        // Assuming you pass a prop or use a generic create action
                        // The user explicitly requested phase3 design, and we have a create button
                        const newNoteBtn = document.querySelector('button[title="New Note"]') || document.querySelector('.bg-primary.text-white');
                        if (newNoteBtn) newNoteBtn.click();
                    }}
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