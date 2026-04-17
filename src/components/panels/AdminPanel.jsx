import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

const AdminPanel = ({ activeSettingGroup, zones, setZones }) => {
    const { user, updatePassword, uploadAvatar } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isEditMode, setIsEditMode } = useSettings();

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [expandedGroup, setExpandedGroup] = useState('profile');

    // New Zone Form State
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneShape, setNewZoneShape] = useState('rect');

    useEffect(() => {
        if (activeSettingGroup) {
            setExpandedGroup(activeSettingGroup);
        }
    }, [activeSettingGroup]);

    const handleUploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const result = await uploadAvatar(file);
        if (result.success) {
            setMessage('Cập nhật avatar thành công!');
        } else {
            setMessage(`Lỗi: ${result.error.message}`);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!password) return;
        const result = await updatePassword(password);
        if (result.success) {
            setMessage('Cập nhật mật khẩu thành công!');
            setPassword('');
        } else {
            setMessage(`Lỗi: ${result.error.message}`);
        }
    };

    const toggleGroup = (group) => {
        setExpandedGroup(prev => prev === group ? null : group);
    };

    // --- Zone Handlers ---
    const handleAddZone = () => {
        if (!newZoneName.trim()) return;
        const zoneId = `custom-${Date.now()}`;
        const colors = ['cyan', 'emerald', 'purple', 'amber', 'rose', 'indigo', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newZone = {
            x: 1600, // Place it further away by default
            y: 0,
            w: 700,
            h: 700,
            label: newZoneName,
            shape: newZoneShape,
            color: randomColor
        };

        setZones(prev => ({
            ...prev,
            [zoneId]: newZone
        }));

        setNewZoneName('');
        setMessage(`Đã tạo vùng "${newZoneName}" thành công!`);
    };

    const handleDeleteZone = (id) => {
        if (['docs', 'tools', 'gallery', 'admin'].includes(id)) {
            setMessage('Không thể xóa các vùng hệ thống mặc định!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn xóa vùng này?')) {
            const newZones = { ...zones };
            delete newZones[id];
            setZones(newZones);
            setMessage('Đã xóa vùng không gian.');
        }
    };

    const toggleZoneShape = (id) => {
        setZones(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                shape: prev[id].shape === 'rect' ? 'circle' : 'rect'
            }
        }));
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="px-3 pt-2 pb-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">Cài Đặt</h3>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Tùy Chỉnh Hệ Thống</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                {message && <div className="p-2 text-[11px] leading-relaxed bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 animate-[fadeIn_0.3s_ease-out] mb-2">{message}</div>}
                
                {/* Profile */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-all ${expandedGroup === 'profile' ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/10' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('profile')}>
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
                             <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hồ sơ</h4>
                         </div>
                         <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'profile' ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    {expandedGroup === 'profile' && (
                        <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="size-12 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-white dark:border-white/10 shadow-sm">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex bg-slate-100 dark:bg-slate-800">
                                             <span className="material-symbols-outlined text-slate-400 m-auto">person</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-semibold truncate dark:text-white">{user?.email}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">Thành viên hệ thống</div>
                                </div>
                            </div>
                            <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium dark:text-orange-400 text-slate-600 text-center block transition-colors border border-slate-200 dark:border-white/5">
                                Đổi Ảnh Đại Diện
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                            </label>
                        </div>
                    )}
                </div>

                {/* World Editor / Zones (NEW) */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-all ${expandedGroup === 'zones' ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/10' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('zones')}>
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-[18px] text-slate-500">grid_view</span>
                             <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Quản lý không gian</h4>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-400">{Object.keys(zones || {}).length}</span>
                            <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'zones' ? 'expand_less' : 'expand_more'}</span>
                         </div>
                    </div>
                    {expandedGroup === 'zones' && (
                        <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out] space-y-4">
                            {/* Simple Add Zone Form */}
                            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-white/40 dark:border-white/5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Thêm vùng mới</p>
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        value={newZoneName}
                                        onChange={(e) => setNewZoneName(e.target.value)}
                                        placeholder="Tên vùng mới..."
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setNewZoneShape('rect')}
                                            className={`flex-1 py-1 rounded-md text-[10px] font-bold border flex items-center justify-center gap-1 transition-all ${newZoneShape === 'rect' ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700/50 border-transparent text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">rectangle</span>
                                            Chữ nhật
                                        </button>
                                        <button 
                                            onClick={() => setNewZoneShape('circle')}
                                            className={`flex-1 py-1 rounded-md text-[10px] font-bold border flex items-center justify-center gap-1 transition-all ${newZoneShape === 'circle' ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700/50 border-transparent text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">circle</span>
                                            Hình tròn
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAddZone}
                                        disabled={!newZoneName.trim()}
                                        className="w-full py-1.5 bg-slate-800 hover:bg-black text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        Tạo vùng (Zone)
                                    </button>
                                </div>
                            </div>

                            {/* Existing Zones List */}
                            <div className="space-y-1.5 pt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Danh sách các vùng</p>
                                {Object.entries(zones || {}).map(([id, z]) => (
                                    <div key={id} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`size-3 rounded-full bg-${z.color}-500 shadow-[0_0_8px_rgba(var(--color-${z.color}-rgb),0.5)]`} />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[11px] font-bold dark:text-white truncate">{z.label || id}</span>
                                                <span className="text-[9px] text-slate-500 font-mono uppercase">{z.shape}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleZoneShape(id)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                                                title="Đổi hình dạng"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{z.shape === 'circle' ? 'rectangle' : 'circle'}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteZone(id)}
                                                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded text-rose-500"
                                                title="Xóa vùng"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme & Security ... */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-all ${expandedGroup === 'theme' ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/10' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('theme')}>
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-[18px] text-slate-500">palette</span>
                             <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Giao diện (Theme)</h4>
                         </div>
                         <div className="flex flex-row items-center gap-2">
                             {expandedGroup !== 'theme' && (
                                <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500">{theme === 'dark' ? 'Tối' : 'Sáng'}</span>
                             )}
                             <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'theme' ? 'expand_less' : 'expand_more'}</span>
                         </div>
                    </div>
                    {expandedGroup === 'theme' && (
                         <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <button onClick={toggleTheme} className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium dark:text-white transition-colors border border-slate-200 dark:border-white/5">
                                Chuyển sang chế độ {theme === 'dark' ? 'Sáng' : 'Tối'}
                            </button>
                         </div>
                    )}
                </div>

                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-all ${expandedGroup === 'security' ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/10' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('security')}>
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-[18px] text-slate-500">lock</span>
                             <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Bảo mật</h4>
                         </div>
                         <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'security' ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    {expandedGroup === 'security' && (
                         <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mật khẩu mới"
                                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs mb-2 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button onClick={handlePasswordUpdate} className="w-full px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
                                Cập nhật mật khẩu
                            </button>
                         </div>
                    )}
                </div>

                {/* Space Edit Mode */}
                <div className="pt-2">
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`w-full px-3 py-2.5 ${isEditMode ? 'bg-amber-600' : 'bg-slate-800 hover:bg-black'} text-white rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-xl shadow-black/20 group`}>
                        <span className={`material-symbols-outlined text-[18px] mr-2 transition-transform duration-500 ${isEditMode ? 'rotate-180' : 'group-hover:scale-125'}`}>{isEditMode ? 'done_all' : 'layers'}</span>
                        {isEditMode ? 'LƯU & THOÁT CHỈNH SỬA' : 'CHỈNH SỬA KHÔNG GIAN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
