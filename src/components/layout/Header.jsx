import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const ZONE_TABS = [
    { id: 'dashboard', label: 'Dashboard', zone: null, path: '/dashboard' },
    { id: 'docs', label: 'Docs', zone: 'docs' },
    { id: 'tools', label: 'Tools', zone: 'tools' },
    { id: 'images', label: 'Images', zone: 'gallery' },
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const currentZone = searchParams.get('zone') || 'docs';
    const isDocsPage = location.pathname === '/docs';

    const handleTabClick = (tab) => {
        if (tab.path) {
            // External route (Dashboard)
            navigate(tab.path);
        } else {
            // Zone navigation within one-map
            navigate(`/docs?zone=${tab.zone}`);
        }
    };

    const isActive = (tab) => {
        if (tab.path) {
            return location.pathname === tab.path;
        }
        return isDocsPage && currentZone === tab.zone;
    };

    return (
        <header className="h-24 w-full flex items-center justify-between px-8 z-30 bg-transparent shrink-0">
            <div className="flex items-center w-[250px] shrink-0">
                <div className="w-10 h-10 bg-cyan-600 rounded-[12px] flex items-center justify-center mr-3 shadow-md">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
                <div>
                    <h1 className="font-display font-bold text-[1.1rem] text-cyan-600 tracking-tight leading-tight">Khắc Nghĩa</h1>
                    <p className="text-[0.6rem] font-semibold text-slate-400 tracking-widest uppercase">Rảnh rỗi</p>
                </div>
            </div>

            <nav className="flex items-center gap-10">
                {ZONE_TABS.map(tab => {
                    const active = isActive(tab);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={`text-[0.95rem] font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${active ? 'text-cyan-700 dark:text-cyan-400 font-bold relative pb-1' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <div className="flex flex-col items-center">
                                <span>{tab.label}</span>
                                {active && <div className="absolute -bottom-[26px] w-12 h-[3px] bg-cyan-600 dark:bg-cyan-400 rounded-t-md"></div>}
                            </div>
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center justify-end gap-4 w-[250px] shrink-0">
                <div className="relative hidden xl:block">
                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 w-48 rounded-full bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-[0.85rem] font-medium text-slate-700 dark:text-slate-200 placeholder-slate-500 shadow-sm" />
                </div>
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-600 glass-panel transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>
                </button>
                <div className="h-8 w-px bg-slate-300/50 dark:bg-white/10 mx-1"></div>
                <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden hover:ring-2 ring-cyan-500/50 transition-all shadow-md">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
