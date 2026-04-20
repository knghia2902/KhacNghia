import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const AdminPanel = ({ onSelectView, zones }) => {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-transparent">
            {/* Header (Static) */}
            <div className="px-3 pt-2 pb-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex flex-col">
                    <h3 className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">Cài Đặt</h3>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Tùy Chỉnh Hệ Thống</span>
                </div>
            </div>

            {/* Transition Container */}
            <div className="flex-1 relative w-full overflow-hidden">
                {/* --- MAIN MENU --- */}
                <div className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar px-4 pb-4">
                    <div className="space-y-2.5">
                        {/* Profile Menu Item */}
                        <button onClick={() => onSelectView('profile')} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 p-3 flex justify-between items-center transition-all hover:border-amber-500/50 hover:shadow-md hover:ring-1 hover:ring-amber-500/10 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hồ sơ</h4>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                        </button>

                        {/* Zones Menu Item */}
                        <button onClick={() => onSelectView('zones')} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 p-3 flex justify-between items-center transition-all hover:border-amber-500/50 hover:shadow-md hover:ring-1 hover:ring-amber-500/10 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Quản lý không gian</h4>
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">Chỉnh sửa toạ độ, xoá vùng...</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500">{Object.keys(zones || {}).length}</span>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                            </div>
                        </button>

                        {/* Models Menu Item */}
                        <button onClick={() => onSelectView('models')} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 p-3 flex justify-between items-center transition-all hover:border-purple-500/50 hover:shadow-md hover:ring-1 hover:ring-purple-500/10 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Quản lý mô hình 3D</h4>
                                    <span className="text-[9px] text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Sắp xếp, tuỳ chỉnh mô hình...</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                            </div>
                        </button>

                        {/* Theme Menu Item */}
                        <button onClick={() => onSelectView('theme')} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 p-3 flex justify-between items-center transition-all hover:border-amber-500/50 hover:shadow-md hover:ring-1 hover:ring-amber-500/10 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">palette</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Giao diện (Theme)</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500">{theme === 'dark' ? 'Tối' : 'Sáng'}</span>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                            </div>
                        </button>

                        {/* Security Menu Item */}
                        <button onClick={() => onSelectView('security')} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 p-3 flex justify-between items-center transition-all hover:border-amber-500/50 hover:shadow-md hover:ring-1 hover:ring-amber-500/10 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Bảo mật</h4>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
