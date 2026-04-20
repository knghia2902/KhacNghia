import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

const AdminSecondaryPanel = ({ 
    isOpen, onClose, activeView, zones, setZones,
    customModels, selectedMesh, setSelectedMesh, setSelectedZone, 
    handleDeleteCustomModel, onUpdateCustomModels
}) => {
    const { user, updatePassword, uploadAvatar } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { 
        isEditMode, 
        setIsEditMode, 
        addWorldZone, 
        deleteWorldZone, 
        updateWorldZone, 
        updateWorldObject,
        worldConfig,
        updateWorldConfig
    } = useSettings();

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // New Zone Form State
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneShape, setNewZoneShape] = useState('rect');

    const handleModelZoneChange = (model, newZoneKey) => {
        if (!newZoneKey || newZoneKey === model.zone) return;
        
        const targetZone = zones[newZoneKey];
        if (!targetZone) return;

        // Update locally only
        if (onUpdateCustomModels) {
            onUpdateCustomModels(prev => prev.map(m => {
                if (m.id === model.id) {
                    return {
                        ...m,
                        zone: newZoneKey,
                        x: targetZone.x + targetZone.w / 2 - 150, // Center roughly
                        y: targetZone.y + targetZone.h / 2 - 150
                    };
                }
                return m;
            }));
        }
    };

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

    const handleAddZone = async () => {
        if (!newZoneName.trim()) return;
        
        // Generate a clean slug for URL usage
        const zoneKey = newZoneName.toLowerCase()
            .replace(/ /g, '_')
            .replace(/[^\w-]+/g, '');
        
        const colors = ['cyan', 'emerald', 'purple', 'amber', 'rose', 'indigo', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newZone = {
            zone_key: zoneKey,
            x: 1600, // Place it further away by default
            y: 0,
            w: 700,
            h: 700,
            label: newZoneName,
            shape: newZoneShape,
            color: randomColor
        };

        const res = await addWorldZone(newZone);
        if (res.success) {
            setNewZoneName('');
            setMessage(`Đã tạo vùng "${newZoneName}" thành công! URL: ?zone=${zoneKey}`);
        } else {
            setMessage('Lỗi khi lưu vùng mới vào Database.');
        }
    };

    const handleDeleteZone = async (id, zoneKey) => {
        if (['docs', 'tools', 'gallery', 'admin'].includes(zoneKey)) {
            setMessage('Không thể xóa các vùng hệ thống mặc định!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn xóa vùng này?')) {
            const res = await deleteWorldZone(id);
            if (res.success) {
                setMessage('Đã xóa vùng không gian.');
            } else {
                setMessage('Lỗi khi xóa vùng khỏi Database.');
            }
        }
    };

    const toggleZoneShape = async (id, currentZoneKey) => {
        const zone = zones[currentZoneKey];
        const newShape = zone.shape === 'rect' ? 'circle' : 'rect';
        
        const res = await updateWorldZone({
            id: zone.id,
            shape: newShape
        });

        if (res.success) {
            setMessage(`Đã đổi hình dạng vùng "${zone.label}"`);
        }
    };

    return (
        <div
            id="admin-secondary-panel"
            className={`h-full glass-panel dark:bg-black/30 rounded-[1.5rem] shadow-float z-20 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
                isOpen ? 'w-[340px] translate-x-0 opacity-100 border border-white dark:border-white/10 ml-6' : 'w-0 -translate-x-10 opacity-0 pointer-events-none border-transparent'
            }`}
        >
            <div className="px-6 pt-6 pb-4 flex justify-between items-center">
                <h3 className="font-display text-sm font-bold text-amber-600 dark:text-amber-400 capitalize">
                    {activeView === 'profile' && 'Hồ Sơ Của Bạn'}
                    {activeView === 'zones' && 'Quản Lý Không Gian'}
                    {activeView === 'models' && 'Quản Lý Mô Hình 3D'}
                    {activeView === 'theme' && 'Tuỳ Chỉnh Giao Diện'}
                    {activeView === 'security' && 'Bảo Mật Hệ Thống'}
                    {!activeView && 'Cài Đặt'}
                </h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            <div className="px-4 shrink-0">
                {message && <div className="p-2 text-[11px] leading-relaxed bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 animate-[fadeIn_0.3s_ease-out] mb-3">{message}</div>}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-4">
                {/* PROFILE VIEW */}
                {activeView === 'profile' && (
                    <div className="animate-[fadeIn_0.3s_ease-out_0.1s] fill-mode-both">
                        <div className="flex flex-col items-center mb-6 mt-4">
                            <div className="size-16 rounded-full overflow-hidden bg-slate-200 border-4 border-white dark:border-[#1d2624] shadow-xl mb-4 relative group">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex bg-slate-100 dark:bg-slate-800">
                                         <span className="material-symbols-outlined text-slate-400 text-3xl m-auto">person</span>
                                    </div>
                                )}
                                <label className="absolute inset-x-0 bottom-0 py-1 bg-black/60 text-white text-[9px] font-bold text-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    ĐỔI
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                                </label>
                            </div>
                            <div className="text-sm font-bold dark:text-white">{user?.email}</div>
                            <div className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded mt-2 font-mono uppercase tracking-wider">Administrator</div>
                        </div>
                    </div>
                )}

                {/* ZONES VIEW */}
                {activeView === 'zones' && (
                    <div className="animate-[fadeIn_0.3s_ease-out_0.1s] fill-mode-both space-y-5">
                        {/* Edit Space Toggle Button */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mb-3 uppercase tracking-wide">Chế độ tương tác trên bản đồ</p>
                            <button onClick={() => setIsEditMode(isEditMode === 'zones' ? false : 'zones')} className={`w-full px-4 py-3 ${isEditMode === 'zones' ? 'bg-amber-600' : 'bg-[#1d2624] dark:bg-white'} text-white dark:text-[#1d2624] rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-md group`}>
                                <span className={`material-symbols-outlined text-[18px] mr-2 transition-transform duration-500 ${isEditMode === 'zones' ? 'rotate-180' : 'group-hover:scale-125'}`}>{isEditMode === 'zones' ? 'done_all' : 'drag_pan'}</span>
                                {isEditMode === 'zones' ? 'LƯU & KẾT THÚC KÉO THẢ' : 'BẬT KÉO THẢ VÙNG'}
                            </button>
                        </div>

                        {/* VÙNG KHỞI ĐẦU MẶC ĐỊNH */}
                        {isEditMode !== 'zones' && (
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">home_pin</span>
                                    Vùng khởi đầu mặc định
                                </p>
                                <select 
                                    value={worldConfig?.defaultLandingZone || ''}
                                    onChange={(e) => updateWorldConfig({ defaultLandingZone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1a1f1e] border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                                >
                                    <option value="">-- Mặc định (Trang chủ) --</option>
                                    {Object.entries(zones || {}).map(([key, z]) => (
                                        <option key={key} value={key}>
                                            {z.label || key}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-slate-500 mt-2 leading-relaxed italic">
                                    Agent sẽ tự động đứng tại vùng này khi bạn vừa truy cập vào trang web.
                                </p>
                            </div>
                        )}

                        {/* THÊM VÙNG MỚI (Chỉ hiện khi KHÔNG edit mode để tránh rối) */}
                        {isEditMode !== 'zones' && (
                            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/40 dark:border-white/5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">add_circle</span>Thêm vùng mới</p>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        value={newZoneName}
                                        onChange={(e) => setNewZoneName(e.target.value)}
                                        placeholder="Tên vùng mới..."
                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#1a1f1e] border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setNewZoneShape('rect')}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${newZoneShape === 'rect' ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">rectangle</span>Chữ nhật
                                        </button>
                                        <button 
                                            onClick={() => setNewZoneShape('circle')}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${newZoneShape === 'circle' ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">circle</span>Hình tròn
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAddZone}
                                        disabled={!newZoneName.trim()}
                                        className="w-full py-2.5 bg-[#1d2624] hover:bg-black dark:bg-white/20 dark:hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 mt-2"
                                    >
                                        Tạo vùng nhanh
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 pt-2">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex justify-between items-center">
                                <span>Danh sách vùng gốc</span>
                                <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded font-mono">{Object.keys(zones || {}).length}</span>
                            </p>
                            {Object.entries(zones || {}).map(([id, z], index) => (
                                <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-white/60 dark:border-white/5 group hover:border-amber-500/30 transition-colors" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`size-3.5 rounded-full bg-${z.color}-500 shadow-[0_0_8px_rgba(var(--color-${z.color}-rgb),0.5)] shrink-0`} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{z.label || id}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{z.shape}</span>
                                                <span className="text-[10px] text-slate-400">ID: {z.id?.slice(0, 4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button 
                                            onClick={() => toggleZoneShape(z.id, id)}
                                            className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-lg text-amber-600 transition-colors"
                                            title="Đổi hình dạng"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{z.shape === 'circle' ? 'rectangle' : 'circle'}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteZone(z.id, id)}
                                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg text-rose-500 transition-colors"
                                            title="Xóa vùng này"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MODELS VIEW */}
                {activeView === 'models' && (
                    <div className="animate-[fadeIn_0.3s_ease-out_0.1s] fill-mode-both space-y-5">
                        {/* Edit Space Toggle Button */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mb-3 uppercase tracking-wide">Chế độ tương tác trên bản đồ</p>
                            <button onClick={() => setIsEditMode(isEditMode === 'models' ? false : 'models')} className={`w-full px-4 py-3 ${isEditMode === 'models' ? 'bg-purple-600' : 'bg-[#1d2624] dark:bg-white'} text-white dark:text-[#1d2624] rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-md group`}>
                                <span className={`material-symbols-outlined text-[18px] mr-2 transition-transform duration-500 ${isEditMode === 'models' ? 'rotate-180' : 'group-hover:scale-125'}`}>{isEditMode === 'models' ? 'done_all' : 'drag_pan'}</span>
                                {isEditMode === 'models' ? 'LƯU & KẾT THÚC KÉO THẢ' : 'BẬT KÉO THẢ MÔ HÌNH'}
                            </button>
                        </div>

                        {/* MÔ HÌNH ĐÃ NHẬP */}
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/40 dark:border-white/5 flex flex-col h-[50vh]">
                            <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between shrink-0">
                                Mô Hình Đã Nhập
                                <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 rounded-full text-[10px]">{customModels?.length || 0}</span>
                            </h3>

                            {isEditMode !== 'models' && (
                                <div className="mb-3 text-[11px] text-purple-600 dark:text-purple-400 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20 leading-relaxed font-medium">
                                    💡 Bật "Kéo Thả Mô Hình" ở trên để tương tác và di chuyển các mô hình này trên bản đồ.
                                </div>
                            )}

                            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                {(!customModels || customModels.length === 0) ? (
                                    <div className="text-[11px] text-slate-400 italic text-center py-4 bg-white/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        Chưa có mô hình nào được nhập vào hệ thống.
                                    </div>
                                ) : customModels.map(model => (
                                    <div
                                        key={model.id}
                                        onClick={() => {
                                            if (setSelectedMesh) setSelectedMesh(model.id);
                                            if (setSelectedZone) setSelectedZone(null);
                                        }}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs font-medium transition-all ${selectedMesh === model.id
                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-white dark:bg-black/30 hover:bg-slate-50 dark:hover:bg-black/50 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className="flex flex-col flex-1 truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="material-symbols-outlined text-[16px] opacity-70">view_in_ar</span>
                                                <span className="truncate">{model.name}</span>
                                            </div>
                                            
                                            {selectedMesh === model.id && (
                                                <div className="mt-2 flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                                                    <p className="text-[10px] uppercase opacity-50 font-bold ml-6">Khu vực hiển thị</p>
                                                    <div className="flex items-center gap-1 ml-6">
                                                        <select 
                                                            value={model.zone || 'docs'}
                                                            onChange={(e) => handleModelZoneChange(model, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex-1 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-md py-1 px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                                                        >
                                                            {Object.keys(zones).map(zk => (
                                                                <option key={zk} value={zk} className="bg-white dark:bg-[#1d2624] text-slate-900 dark:text-white">
                                                                    {zones[zk].label || zk}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 self-start">
                                            {selectedMesh === model.id && handleDeleteCustomModel && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomModel(model.id); }}
                                                    className="p-1 hover:bg-rose-500/20 text-white/50 hover:text-rose-200 transition-colors rounded-lg"
                                                    title="Xóa"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* THEME VIEW */}
                {activeView === 'theme' && (
                    <div className="animate-[fadeIn_0.3s_ease-out_0.1s] fill-mode-both mt-4">
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-center mb-6">
                             <span className="material-symbols-outlined text-4xl mb-3 text-amber-500">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                             <h5 className="text-sm font-bold dark:text-white mb-2">Chế độ đang bật: {theme === 'dark' ? 'Dark' : 'Light'}</h5>
                             <p className="text-xs text-slate-500">Giảm mỏi mắt hoặc tăng tương phản</p>
                        </div>
                        <button onClick={toggleTheme} className="w-full px-4 py-3 bg-[#1d2624] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#1d2624] rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">routine</span>
                            Chuyển sang {theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}
                        </button>
                    </div>
                )}

                {/* SECURITY VIEW */}
                {activeView === 'security' && (
                    <div className="animate-[fadeIn_0.3s_ease-out_0.1s] fill-mode-both mt-2">
                        <div className="space-y-4 bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/60 dark:border-white/5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white dark:bg-[#1a1f1e] border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                                />
                            </div>
                            <button onClick={handlePasswordUpdate} disabled={!password} className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-colors shadow-md mt-2">
                                Cập nhật bảo mật
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSecondaryPanel;
