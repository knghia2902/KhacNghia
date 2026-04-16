import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

const AdminPanel = ({ activeSettingGroup }) => {
    const { user, updatePassword, uploadAvatar } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isEditMode, setIsEditMode } = useSettings();

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [expandedGroup, setExpandedGroup] = useState('profile');

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
            setMessage('Avatar updated successfully!');
        } else {
            setMessage(`Error: ${result.error.message}`);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!password) return;
        const result = await updatePassword(password);
        if (result.success) {
            setMessage('Password updated successfully!');
            setPassword('');
        } else {
            setMessage(`Error: ${result.error.message}`);
        }
    };

    const toggleGroup = (group) => {
        setExpandedGroup(prev => prev === group ? null : group);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="px-3 pt-2 pb-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">Cài Đặt</h3>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">System Settings</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                {message && <div className="p-2 text-xs bg-amber-100 text-amber-800 rounded">{message}</div>}
                
                {/* Profile */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-colors overflow-hidden ${expandedGroup === 'profile' ? 'border-amber-500/50 shadow-md' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('profile')}>
                         <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hồ sơ</h4>
                         <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'profile' ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    {expandedGroup === 'profile' && (
                        <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="size-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-400 m-auto mt-2">person</span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-semibold truncate dark:text-white">{user?.email}</div>
                                </div>
                            </div>
                            <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium dark:text-white text-center block transition-colors">
                                Đổi Avatar
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                            </label>
                        </div>
                    )}
                </div>

                {/* Theme */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-colors overflow-hidden ${expandedGroup === 'theme' ? 'border-amber-500/50 shadow-md' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('theme')}>
                         <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Giao diện (Theme)</h4>
                         <div className="flex flex-row items-center gap-2">
                             {expandedGroup !== 'theme' && (
                                <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500">{theme === 'dark' ? 'Tối' : 'Sáng'}</span>
                             )}
                             <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'theme' ? 'expand_less' : 'expand_more'}</span>
                         </div>
                    </div>
                    {expandedGroup === 'theme' && (
                         <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <button onClick={toggleTheme} className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium dark:text-white transition-colors">
                                Giao diện hiện tại: {theme === 'dark' ? 'Sáng' : 'Tối'}
                            </button>
                         </div>
                    )}
                </div>

                {/* Security */}
                <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl border transition-colors overflow-hidden ${expandedGroup === 'security' ? 'border-amber-500/50 shadow-md' : 'border-white/60 dark:border-white/10'}`}>
                    <div className="px-3 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleGroup('security')}>
                         <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Bảo mật</h4>
                         <span className="material-symbols-outlined text-[16px] text-slate-500">{expandedGroup === 'security' ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    {expandedGroup === 'security' && (
                         <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out]">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mật khẩu mới"
                                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-xs mb-2 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button onClick={handlePasswordUpdate} className="w-full px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors">
                                Đổi mật khẩu
                            </button>
                         </div>
                    )}
                </div>

                {/* Space Edit Mode - Always visible outside accordion */}
                <div className="pt-2">
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`w-full px-3 py-2 ${isEditMode ? 'bg-amber-600' : 'bg-slate-800 hover:bg-slate-700'} text-white rounded-lg text-xs font-bold flex items-center justify-center transition-colors shadow-lg shadow-black/20`}>
                        <span className="material-symbols-outlined text-[16px] mr-1">build</span>
                        {isEditMode ? 'Chế độ xem' : 'Chỉnh sửa không gian'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
