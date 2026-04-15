import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-slate-800 dark:text-slate-100 relative bg-[#fcfdfd] dark:bg-[#101614] bg-grid-pattern selection:bg-cyan-500/30 transition-colors duration-500">

            <Header />

            {children}
            {/* Agent Chat */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel dark:bg-black/40 dark:border-white/10 pl-4 pr-3 py-3 rounded-2xl shadow-heavy-float z-30 flex items-center gap-4 w-[600px] border border-white pointer-events-auto transition-colors">
                <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" opacity="0.3"/><path d="M10.5 14l-1.5-.5-1.5.5c-1.46.18-2.67 1.22-3.06 2.61L4 18l.44 1.39c.39 1.39 1.6 2.43 3.06 2.61l1.5.19 1.5-.19c1.46-.18 2.67-1.22 3.06-2.61l.44-1.39-.44-1.39c-.39-1.39-1.6-2.43-3.06-2.61L10.5 11l-1.5.5z"/></svg>
                </div>
                <input type="text" placeholder="Hỏi Vẹt Bookworm AI hoặc nhập lệnh để chỉnh sửa tài liệu..." className="flex-1 bg-transparent text-[0.85rem] font-medium text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400 dark:placeholder-slate-500" />
                <button className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md hover:bg-cyan-500 transition-colors">
                    Gửi lệnh
                </button>
            </div>
        </div>
    );
};

export default Layout;