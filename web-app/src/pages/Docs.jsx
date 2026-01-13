import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// --- Initial Data (Seed) ---
const SEED_FOLDERS = [
    { id: 'folder-docs', title: 'Docs', icon: 'folder', iconColor: 'text-amber-500', parentId: null },
    { id: 'folder-proxmox', title: 'Proxmox', icon: 'dns', iconColor: 'text-gray-500', parentId: 'folder-docs' },
    { id: 'folder-nextcloud', title: 'Nextcloud', icon: 'cloud', iconColor: 'text-blue-500', parentId: 'folder-docs' },
    { id: 'folder-test', title: 'Test Folder', icon: 'folder_open', iconColor: 'text-gray-400', parentId: null }
];

const SEED_DOCS = [
    {
        id: 'doc-zen',
        parentId: 'folder-docs',
        title: 'Zen Workspace Guide',
        date: '2m ago',
        tags: ['Guide', 'Zen'],
        bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpKXDKChxqUovbkTSPfoSPbbFMA-n0w5_gdW5x-0yx3ZBWs0nD1JFWI-6HFeEuCGrgbGPkrt8NpTfFcSCzJwOLUQMN5nDZArcfIJoVgyeXh15nbQguX_E2wtn0vVm0Dc15OChBD_P4Scwa5OQ3alHmrE3wSPjPsCU36kDFQiPMvo6WtLm0Ltear1ksNwD4C1SWiRYt-8FHbc2PH8OB6X8PsNzyxM9s7CSAuh8yfHU2tnQ0gGY7BwRMyqn292UbmSB4hEY0N6xMtiwN',
        content: `
            <p class="lead">This document outlines the fundamental design language for Khắc Nghĩa workspace.</p>
            <h2>1. Core Philosophy</h2>
            <p>Minimalism isn't about the absence of content, but the presence of focus.</p>
        `
    },
    {
        id: 'doc-proxmox-config',
        parentId: 'folder-proxmox',
        title: 'Cấu hình Proxmox với Ceph Storage',
        date: '1d ago',
        tags: ['SysAdmin', 'Storage'],
        bg: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Hướng dẫn chi tiết cấu hình Ceph trên Proxmox VE 8.1.</p>
        `
    },
    {
        id: 'doc-proxmox-ha',
        parentId: 'folder-proxmox',
        title: 'HA Proxmox Cluster',
        date: '5h ago',
        tags: ['HA', 'Cluster'],
        bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Thiết lập High Availability cho Cluster 3 node.</p>
        `
    },
    {
        id: 'doc-nextcloud',
        parentId: 'folder-nextcloud',
        title: 'Cấu hình NextCloud',
        date: '1w ago',
        tags: ['Cloud', 'Self-hosted'],
        bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Tối ưu hiệu năng Nextcloud với Redis và PHP-FPM.</p>
        `
    },
    {
        id: 'doc-brand',
        parentId: 'folder-docs',
        title: 'Brand Guidelines',
        date: '2d ago',
        tags: ['Design', 'Brand'],
        bg: 'https://images.unsplash.com/photo-1626785774573-4b79931bfd95?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Brand identity guide.</p>
        `
    }
];

// --- Available Icons for Icon Picker ---
const AVAILABLE_ICONS = [
    'folder', 'description', 'star', 'favorite', 'bookmark', 'label',
    'home', 'work', 'school', 'science', 'code', 'terminal',
    'folder_open', 'inventory_2', 'category', 'dashboard', 'widgets', 'extension',
    'lightbulb', 'emoji_objects', 'psychology', 'hub', 'rocket_launch', 'auto_awesome',
    'edit_note', 'note_add', 'article', 'newspaper', 'menu_book', 'library_books',
    'task', 'checklist', 'event', 'schedule', 'timer', 'alarm',
    'photo_camera', 'image', 'palette', 'brush', 'design_services', 'architecture',
    'music_note', 'headphones', 'mic', 'movie', 'videocam', 'podcasts',
    'shopping_cart', 'payments', 'account_balance', 'savings', 'credit_card', 'receipt',
    'flight', 'directions_car', 'train', 'sailing', 'hiking', 'sports_esports'
];

// --- Context Menu Component ---
const ContextMenu = ({ isOpen, position, onClose, onRename, onDelete, onDuplicate, onAddSubfolder, onMove, itemType, isRootFolder }) => {
    const menuRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = (e) => {
                // Chỉ đóng nếu click BÊN NGOÀI menu
                if (menuRef.current && !menuRef.current.contains(e.target)) {
                    onClose();
                }
            };
            // Delay để tránh trigger ngay lập tức
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 10);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const menuItems = [
        { icon: 'edit', label: 'Đổi tên', action: onRename },
        { icon: 'drive_file_move', label: 'Di chuyển', action: onMove },
        { icon: 'content_copy', label: 'Sao chép', action: onDuplicate },
        { icon: 'delete', label: 'Xóa', action: onDelete, danger: true },
    ];

    // Chỉ cho phép tạo subfolder trong ROOT folder (parentId === null)
    // Không cho tạo trong subfolder (tối đa 2 cấp)
    if (itemType === 'folder' && isRootFolder && onAddSubfolder) {
        menuItems.splice(1, 0, { icon: 'create_new_folder', label: 'Thêm folder con', action: onAddSubfolder });
    }

    // Smart positioning - đảm bảo menu không bị cắt ở cạnh màn hình
    const menuWidth = 200;
    const menuHeight = 250;
    const adjustedX = Math.min(Math.max(10, position.x), window.innerWidth - menuWidth - 20);
    const adjustedY = Math.min(Math.max(10, position.y), window.innerHeight - menuHeight - 20);

    const handleItemClick = (action) => {
        if (action) {
            action();
        }
    };

    // Render vào document.body bằng Portal để tránh vấn đề vị trí với parent container
    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="fixed z-[100] min-w-48 py-2 bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#1d2624]/10 animate-[fadeIn_0.15s_ease-out]"
            style={{ top: adjustedY, left: adjustedX }}
        >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1d2624]/40 border-b border-[#1d2624]/5 mb-1">
                {itemType === 'folder' ? 'Folder' : 'Trang'}
            </div>
            {menuItems.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => handleItemClick(item.action)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-[#1d2624]/5'}`}
                >
                    <span className={`material-symbols-outlined text-[18px] ${item.danger ? 'text-red-400' : 'text-[#1d2624]/50'}`}>{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
};

// --- Rename Modal with Icon Picker ---
const RenameModal = ({ isOpen, onClose, onSubmit, initialName, initialIcon, itemType }) => {
    const [name, setName] = useState(initialName || '');
    const [selectedIcon, setSelectedIcon] = useState(initialIcon || 'folder');
    const [showIconPicker, setShowIconPicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName || '');
            setSelectedIcon(initialIcon || 'folder');
            setShowIconPicker(false);
        }
    }, [isOpen, initialName, initialIcon]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim(), selectedIcon);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
                <h2 className="text-lg font-bold text-[#1d2624] dark:text-white mb-4">
                    Đổi tên {itemType === 'folder' ? 'Folder' : 'Trang'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Icon + Name Input Row */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="size-12 shrink-0 rounded-xl bg-[#1d2624]/5 hover:bg-[#1d2624]/10 flex items-center justify-center transition-colors border border-[#1d2624]/10"
                            title="Chọn icon"
                        >
                            <span className="material-symbols-outlined text-2xl text-primary">{selectedIcon}</span>
                        </button>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên..."
                            className="flex-1 px-4 py-3 bg-white/50 dark:bg-black/20 border border-[#1d2624]/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                        />
                    </div>

                    {/* Icon Picker */}
                    {showIconPicker && (
                        <div className="mb-4 p-3 bg-[#1d2624]/5 rounded-xl max-h-48 overflow-y-auto">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/40 mb-2">Chọn biểu tượng</div>
                            <div className="grid grid-cols-8 gap-1">
                                {AVAILABLE_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }}
                                        className={`size-9 rounded-lg flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-primary text-white' : 'hover:bg-white/50'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1d2624]/20 text-[#1d2624]/60 font-semibold hover:bg-white/50 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#1d2624] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all">
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Toast Component ---
const Toast = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 px-5 py-3 bg-[#1d2624] text-white rounded-xl shadow-2xl">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
};

// --- Confirm Modal Component ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xóa', cancelText = 'Hủy' }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        console.log('[DEBUG] ConfirmModal - Confirm clicked');
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        console.log('[DEBUG] ConfirmModal - Cancel clicked');
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-[#1d2624] rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.15s_ease-out]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">{title}</h3>
                </div>
                <p className="text-sm text-[#1d2624]/70 dark:text-white/70 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-[#1d2624]/70 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Modal Component ---
const InputModal = ({ isOpen, onClose, onSubmit, title, placeholder, icon }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmit(inputValue.trim());
            setInputValue('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white/90 dark:bg-[#1d2624]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1d2624] dark:text-white">{title}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        autoFocus
                    />
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-[#1d2624]/20 text-[#1d2624]/60 dark:text-white/60 font-semibold hover:bg-white/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] font-semibold shadow-lg hover:scale-[1.02] transition-all"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Move Note Modal ---
const MoveNoteModal = ({ isOpen, onClose, onSubmit, folders, currentParentId, itemType }) => {
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const handleSubmit = () => {
        if (selectedFolderId) {
            onSubmit(selectedFolderId);
            onClose();
        }
    };

    if (!isOpen) return null;

    // Filter folders:
    // - Nếu di chuyển FOLDER: chỉ hiển thị ROOT folders (parentId === null) để giữ giới hạn 2 cấp
    // - Nếu di chuyển DOC: hiển thị tất cả folders
    let availableFolders = folders.filter(f => f.id !== currentParentId);
    if (itemType === 'folder') {
        // Chỉ cho di chuyển folder vào root folders
        availableFolders = availableFolders.filter(f => f.parentId === null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
                <h2 className="text-lg font-bold text-[#1d2624] dark:text-white mb-4">Di chuyển tới...</h2>

                <div className="max-h-60 overflow-y-auto mb-6 bg-[#1d2624]/5 rounded-xl p-2 min-h-[100px]">
                    {availableFolders.length === 0 ? (
                        <div className="text-center py-8 text-[#1d2624]/40 text-sm">Không có thư mục nào khác</div>
                    ) : (
                        <div className="space-y-1">
                            {availableFolders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${selectedFolderId === folder.id ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/30' : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#1d2624] dark:text-white'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${folder.iconColor || 'opacity-70'}`}>{folder.icon || 'folder'}</span>
                                    <span className="text-sm">{folder.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1d2624]/20 text-[#1d2624]/60 font-semibold hover:bg-white/50 transition-colors">Hủy</button>
                    <button onClick={handleSubmit} disabled={!selectedFolderId} className="flex-1 py-2.5 rounded-xl bg-[#1d2624] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Di chuyển
                    </button>
                </div>
            </div>
        </div>
    );
};


const Docs = () => {
    const { isAuthenticated } = useAuth();

    // --- State ---
    const [folders, setFolders] = useState([]);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFolderId, setActiveFolderId] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(['folder-favorites', 'folder-projects', 'folder-personal']);
    const [activeDocId, setActiveDocId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // Modal State
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, itemId: null, itemType: null, parentId: null });
    const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [renameModal, setRenameModal] = useState({ isOpen: false, itemId: null, itemType: null, name: '', icon: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openContextMenu = (e, itemId, itemType, parentId = null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            itemId,
            itemType,
            parentId
        });
    };

    const closeContextMenu = () => setContextMenu({ ...contextMenu, isOpen: false });

    const openRenameModal = () => {
        const { itemId, itemType } = contextMenu;
        if (itemType === 'folder') {
            const folder = folders.find(f => f.id === itemId);
            setRenameModal({ isOpen: true, itemId, itemType, name: folder?.title || '', icon: folder?.icon || 'folder' });
        } else {
            const doc = docs.find(d => d.id === itemId);
            setRenameModal({ isOpen: true, itemId, itemType, name: doc?.title || '', icon: doc?.icon || 'description' });
        }
        closeContextMenu();
    };

    const handleRename = async (newName, newIcon) => {
        const { itemId, itemType } = renameModal;
        const table = itemType === 'folder' ? 'folders' : 'docs';

        try {
            const { error } = await supabase
                .from(table)
                .update({ title: newName, icon: newIcon })
                .eq('id', itemId);

            if (error) throw error;

            if (itemType === 'folder') {
                setFolders(folders.map(f => f.id === itemId ? { ...f, title: newName, icon: newIcon } : f));
            } else {
                setDocs(docs.map(d => d.id === itemId ? { ...d, title: newName, icon: newIcon } : d));
            }
            showToast(`Đã đổi tên thành "${newName}"`);
        } catch (error) {
            console.error('Error renaming:', error);
            showToast('Lỗi khi đổi tên');
        }
    };

    const handleDuplicate = async () => {
        const { itemId, itemType } = contextMenu;
        try {
            if (itemType === 'folder') {
                const folder = folders.find(f => f.id === itemId);
                if (folder) {
                    const newFolder = { ...folder, id: `folder-${Date.now()}`, title: `${folder.title} (Copy)` };
                    const { error } = await supabase.from('folders').insert([newFolder]);
                    if (error) throw error;
                    setFolders([...folders, newFolder]);
                    showToast(`Đã sao chép "${folder.title}"`);
                }
            } else {
                const doc = docs.find(d => d.id === itemId);
                if (doc) {
                    const newDoc = { ...doc, id: `doc-${Date.now()}`, title: `${doc.title} (Copy)` };
                    const { error } = await supabase.from('docs').insert([newDoc]);
                    if (error) throw error;
                    setDocs([...docs, newDoc]);
                    showToast(`Đã sao chép "${doc.title}"`);
                }
            }
        } catch (error) {
            console.error('Error duplicating:', error);
            showToast('Lỗi khi sao chép');
        }
        closeContextMenu();
    };

    const handleContextDelete = async () => {
        console.log('[DEBUG] handleContextDelete CALLED');
        // Lưu giá trị vào biến local TRƯỚC KHI đóng menu
        const { itemId, itemType } = contextMenu;
        console.log('[DEBUG] itemId:', itemId, 'itemType:', itemType);
        closeContextMenu();

        if (itemType === 'folder') {
            const folderDocs = docs.filter(d => d.parentId === itemId);
            const subFolders = folders.filter(f => f.parentId === itemId);
            if (folderDocs.length > 0 || subFolders.length > 0) {
                // Hiển warning modal thay vì alert
                setConfirmModal({
                    isOpen: true,
                    title: 'Không thể xóa!',
                    message: `Folder này chứa ${folderDocs.length} tài liệu và ${subFolders.length} thư mục con. Vui lòng xóa hết trước.`,
                    confirmText: 'Đã hiểu',
                    onConfirm: () => { } // Chỉ đóng modal
                });
                return;
            }
            const folder = folders.find(f => f.id === itemId);

            setConfirmModal({
                isOpen: true,
                title: 'Xóa folder?',
                message: `Bạn có chắc muốn xóa folder "${folder?.title}"?`,
                onConfirm: async () => {
                    console.log('[DEBUG] ConfirmModal confirmed - Deleting folder:', itemId);
                    // Optimistic UI
                    setFolders(prev => prev.filter(f => f.id !== itemId));
                    if (activeFolderId === itemId) {
                        const remaining = folders.filter(f => f.id !== itemId);
                        setActiveFolderId(remaining[0]?.id || null);
                    }
                    showToast(`Đã xóa folder "${folder?.title}"`);
                    // Sync with DB
                    const { error } = await supabase.from('folders').delete().eq('id', itemId);
                    if (error) console.error('DB Error:', error);
                }
            });
        } else {
            const doc = docs.find(d => d.id === itemId);

            setConfirmModal({
                isOpen: true,
                title: 'Xóa trang?',
                message: `Bạn có chắc muốn xóa "${doc?.title}"?`,
                onConfirm: async () => {
                    console.log('[DEBUG] ConfirmModal confirmed - Deleting doc:', itemId);
                    // Optimistic UI
                    setDocs(prev => prev.filter(d => d.id !== itemId));
                    if (activeDocId === itemId) setActiveDocId(null);
                    showToast(`Đã xóa "${doc?.title}"`);
                    // Sync with DB
                    const { error } = await supabase.from('docs').delete().eq('id', itemId);
                    if (error) console.error('DB Error:', error);
                }
            });
        }
    };

    const handleMoveItem = async (targetFolderId) => {
        const { itemId, itemType } = contextMenu;
        console.log('[DEBUG] handleMoveItem:', itemId, itemType, 'to', targetFolderId);

        try {
            if (itemType === 'folder') {
                // Di chuyển folder (subfolder)
                // Kiểm tra: không cho di chuyển vào chính nó hoặc con của nó
                if (itemId === targetFolderId) {
                    showToast('Không thể di chuyển folder vào chính nó');
                    return;
                }

                // Optimistic Update
                setFolders(prev => prev.map(f => f.id === itemId ? { ...f, parentId: targetFolderId } : f));
                showToast('Đã di chuyển folder thành công');
                setIsMoveModalOpen(false);

                // Sync with DB
                const { error } = await supabase.from('folders').update({ parentId: targetFolderId }).eq('id', itemId);
                if (error) {
                    console.error('Error moving folder:', error);
                }
            } else {
                // Di chuyển doc
                // Optimistic Update
                setDocs(prev => prev.map(d => d.id === itemId ? { ...d, parentId: targetFolderId } : d));
                showToast('Đã di chuyển thành công');
                setIsMoveModalOpen(false);

                // Sync with DB
                const { error } = await supabase.from('docs').update({ parentId: targetFolderId }).eq('id', itemId);
                if (error) {
                    console.error('Error moving doc:', error);
                }
            }
        } catch (error) {
            console.error('Error moving:', error);
            showToast('Lỗi khi di chuyển');
        }
    };

    // --- Effects ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: foldersData, error: fError } = await supabase.from('folders').select('*').order('created_at', { ascending: true });
            const { data: docsData, error: dError } = await supabase.from('docs').select('*').order('created_at', { ascending: true });

            if (fError || dError) throw fError || dError;

            if (foldersData.length === 0 && docsData.length === 0) {
                // Seed if empty
                await supabase.from('folders').insert(SEED_FOLDERS);
                await supabase.from('docs').insert(SEED_DOCS);
                setFolders(SEED_FOLDERS);
                setDocs(SEED_DOCS);
            } else {
                setFolders(foldersData);
                setDocs(docsData);
            }
            if (foldersData.length > 0 && !activeFolderId) {
                setActiveFolderId(foldersData[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('zen_expanded_folders', JSON.stringify(expandedFolders));
    }, [expandedFolders]);

    useEffect(() => {
        if (!activeDocId && docs.length > 0) {
            const firstDocInFolder = docs.find(d => d.parentId === activeFolderId);
            if (firstDocInFolder) setActiveDocId(firstDocInFolder.id);
        }
    }, [activeFolderId, docs, activeDocId]);

    // --- Computed ---
    const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);

    const filteredDocs = useMemo(() => {
        let result = docs;
        if (searchQuery) {
            result = result.filter(doc =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        } else {
            if (activeFolderId) {
                result = result.filter(doc => doc.parentId === activeFolderId);
            }
        }
        return result;
    }, [docs, activeFolderId, searchQuery]);

    // --- Handlers ---
    const handleFolderClick = (folderId) => {
        setActiveFolderId(folderId);
        setSearchQuery('');
        setIsEditing(false);
    };

    const toggleFolderExpand = (folderId, e) => {
        e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };

    const handleDocClick = (docId) => {
        setActiveDocId(docId);
        setIsEditing(false);
    };

    const handleCreateFolder = async (name, parentId = null) => {
        const newFolder = {
            id: `folder-${Date.now()}`,
            title: name,
            icon: 'folder',
            iconColor: 'text-gray-400',
            parentId: parentId
        };
        try {
            const { error } = await supabase.from('folders').insert([newFolder]);
            if (error) throw error;

            setFolders([...folders, newFolder]);
            setActiveFolderId(newFolder.id);
            if (parentId) {
                setExpandedFolders(prev => prev.includes(parentId) ? prev : [...prev, parentId]);
            }
            showToast(`Folder "${name}" created!`);
        } catch (error) {
            console.error('Error creating folder:', error);
            showToast('Lỗi khi tạo folder');
        }
    };

    const handleCreateDoc = async (title) => {
        const newDoc = {
            id: `doc-${Date.now()}`,
            parentId: activeFolderId,
            title: title,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            tags: ['New'],
            bg: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=2070',
            content: '<p class="lead">Start writing your thoughts here...</p>'
        };
        try {
            const { error } = await supabase.from('docs').insert([newDoc]);
            if (error) throw error;

            setDocs([...docs, newDoc]);
            setActiveDocId(newDoc.id);
            setEditTitle(newDoc.title);
            setEditContent(newDoc.content);
            setIsEditing(true);
            showToast(`Note "${title}" created!`);
        } catch (error) {
            console.error('Error creating doc:', error);
            showToast('Lỗi khi tạo note');
        }
    };

    const startEditing = () => {
        if (!activeDoc) return;
        setEditTitle(activeDoc.title);
        setEditContent(activeDoc.content);
        setIsEditing(true);
    };

    const saveEdit = async () => {
        if (!activeDoc) return;
        try {
            // Optimistic UI update
            const updatedDocs = docs.map(d =>
                d.id === activeDocId ? { ...d, title: editTitle, content: editContent, date: 'Edited now' } : d
            );
            setDocs(updatedDocs);
            setIsEditing(false);
            showToast('Changes saved successfully!');

            // Optimistic Update Completed - Sync with DB in background
            const { error } = await supabase
                .from('docs')
                .update({ title: editTitle, content: editContent, date: 'Edited now' })
                .eq('id', activeDocId);

            if (error) {
                console.error('Error saving doc in background:', error);
                // Silent fail or subtle toast could be added here, but keeping it "optimistic"
            }
        } catch (error) {
            console.error('Error in save flow:', error);
            showToast('Lỗi khi lưu');
        }
    };

    const cancelEdit = () => {
        console.log('[DEBUG] cancelEdit called, isEditing:', isEditing);
        setIsEditing(false);
        console.log('[DEBUG] cancelEdit completed, isEditing set to false');
    };

    const handleDeleteDoc = async () => {
        console.log('[DEBUG] handleDeleteDoc CALLED');
        console.log('[DEBUG] isAuthenticated:', isAuthenticated);
        console.log('[DEBUG] activeDoc:', activeDoc);
        console.log('[DEBUG] activeDocId:', activeDocId);

        if (!isAuthenticated || !activeDoc) {
            console.log('[DEBUG] handleDeleteDoc RETURNED EARLY');
            return;
        }

        // Lưu vào biến local TRƯỚC khi thay đổi state
        const docIdToDelete = activeDocId;
        const docTitle = activeDoc.title;
        console.log('[DEBUG] About to show ConfirmModal for:', docTitle);

        // Sử dụng ConfirmModal thay vì window.confirm
        setConfirmModal({
            isOpen: true,
            title: 'Xóa trang?',
            message: `Bạn có chắc muốn xóa "${docTitle}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                console.log('[DEBUG] ConfirmModal confirmed - Deleting doc:', docIdToDelete);
                try {
                    // Optimistic UI - Remove immediately
                    setDocs(prev => prev.filter(d => d.id !== docIdToDelete));
                    setActiveDocId(null);
                    setIsEditing(false);
                    showToast(`Đã xóa "${docTitle}"`);

                    // Sync with DB
                    const { error } = await supabase.from('docs').delete().eq('id', docIdToDelete);
                    if (error) {
                        console.error('Error deleting doc:', error);
                    }
                } catch (error) {
                    console.error('Error deleting doc:', error);
                    showToast('Lỗi khi xóa');
                }
            }
        });
    };

    const handleDeleteFolder = async (folderId, e) => {
        e.stopPropagation();
        if (!isAuthenticated) return;
        const folderDocs = docs.filter(d => d.parentId === folderId);
        if (folderDocs.length > 0) {
            alert("Please delete all documents in this folder first.");
            return;
        }
        if (window.confirm("Delete this folder?")) {
            try {
                const { error } = await supabase.from('folders').delete().eq('id', folderId);
                if (error) throw error;

                const folder = folders.find(f => f.id === folderId);
                const newFolders = folders.filter(f => f.id !== folderId);
                setFolders(newFolders);
                if (activeFolderId === folderId) {
                    setActiveFolderId(newFolders[0]?.id || null);
                }
                showToast(`Folder "${folder?.title}" deleted.`);
            } catch (error) {
                console.error('Error deleting folder:', error);
                showToast('Lỗi khi xóa folder');
            }
        }
    };

    const handleResetWorkspace = async () => {
        if (window.confirm('Cảnh báo: Hành động này sẽ xóa toàn bộ dữ liệu hiện tại và khôi phục về mặc thực tế trên Database. Bạn có chắc chắn muốn tiếp tục?')) {
            try {
                // Clear existing
                await supabase.from('docs').delete().neq('id', 'dummy');
                await supabase.from('folders').delete().neq('id', 'dummy');

                // Seed
                await supabase.from('folders').insert(SEED_FOLDERS);
                await supabase.from('docs').insert(SEED_DOCS);

                await fetchData();
                showToast('Workspace has been reset to default.');
            } catch (error) {
                console.error('Error resetting:', error);
                showToast('Lỗi khi reset');
            }
        }
    };

    // --- Recursive Sidebar Render ---
    const renderFolderTree = (parentId, depth = 0) => {
        const currentFolders = folders.filter(f => f.parentId === parentId);

        return (
            <div className="space-y-0.5" key={parentId || 'root'}>
                {currentFolders.map(folder => {
                    const isExpanded = expandedFolders.includes(folder.id);
                    const isActive = activeFolderId === folder.id;
                    return (
                        <div key={folder.id} className="select-none" data-testid={`folder-${folder.id}`} data-depth={depth}>
                            <div className="group relative flex items-center min-w-0 overflow-hidden">
                                <div
                                    className={`flex items-center w-full rounded-lg transition-colors group/row ${isActive ? 'bg-white/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    data-active={isActive}
                                    onContextMenu={(e) => openContextMenu(e, folder.id, 'folder', folder.parentId)}
                                >
                                    <div style={{ width: `${depth * 8}px` }} className="shrink-0" data-testid="spacer" />
                                    <button
                                        onClick={(e) => toggleFolderExpand(folder.id, e)}
                                        className="size-5 flex items-center justify-center rounded-sm hover:bg-gray-300 dark:hover:bg-white/10 transition-colors shrink-0 mr-0.5 cursor-pointer ml-1"
                                        data-testid="toggle-btn"
                                    >
                                        {/* State 1: Folder Icon (Default) - Visible when NOT hovered OR if depth > 0 */}
                                        <span
                                            className={`material-symbols-outlined text-[18px] ${folder.iconColor} ${depth === 0 ? 'group-hover/row:!hidden' : ''}`}
                                            data-testid="folder-icon"
                                        >
                                            {folder.icon}
                                        </span>

                                        {/* State 2: Chevron Icon (Hover) - Visible ONLY when hovered AND depth == 0 */}
                                        <span
                                            className={`material-symbols-outlined text-[16px] text-[#9ca3af] !hidden ${depth === 0 ? 'group-hover/row:!block' : ''} transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                                            data-testid="chevron-icon"
                                        >
                                            chevron_right
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleFolderClick(folder.id)}
                                        className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-left transition-colors min-w-0 w-full overflow-hidden ${isActive ? 'text-[#1d2624]' : 'text-[#1d2624]/70'}`}
                                    >
                                        <span className="flex-1 truncate block min-w-0">{folder.title}</span>
                                        {isAuthenticated && (
                                            <div className="opacity-0 group-hover/row:opacity-100 flex items-center gap-0.5">
                                                <span
                                                    onClick={(e) => { e.stopPropagation(); setActiveFolderId(folder.id); setIsNoteModalOpen(true); }}
                                                    className="material-symbols-outlined text-[16px] hover:text-primary cursor-pointer p-0.5"
                                                    title="Thêm trang"
                                                >add</span>
                                                <span
                                                    onClick={(e) => openContextMenu(e, folder.id, 'folder', folder.parentId)}
                                                    className="material-symbols-outlined text-[16px] hover:text-[#1d2624] cursor-pointer p-0.5"
                                                    title="Tùy chọn"
                                                >more_horiz</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-0.5">
                                    {renderFolderTree(folder.id, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };


    return (
        <>
            {/* Modals */}
            <InputModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onSubmit={handleCreateFolder}
                title="New Folder"
                placeholder="Enter folder name..."
                icon="create_new_folder"
            />
            <InputModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSubmit={handleCreateDoc}
                title="New Note"
                placeholder="Enter note title..."
                icon="note_add"
            />

            {/* Confirm Modal for Delete */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText || 'Xóa'}
            />

            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
            />

            {/* Context Menu */}
            <ContextMenu
                isOpen={contextMenu.isOpen}
                position={contextMenu.position}
                onClose={closeContextMenu}
                onRename={openRenameModal}
                onDelete={handleContextDelete}
                onDuplicate={handleDuplicate}
                onAddSubfolder={() => { setIsSubfolderModalOpen(true); closeContextMenu(); }}
                onMove={() => { setIsMoveModalOpen(true); closeContextMenu(); }}
                itemType={contextMenu.itemType}
                isRootFolder={contextMenu.parentId === null}
            />

            <MoveNoteModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                onSubmit={handleMoveItem}
                folders={folders}
                currentParentId={contextMenu.parentId}
                itemType={contextMenu.itemType}
            />

            {/* Rename Modal */}
            <RenameModal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ ...renameModal, isOpen: false })}
                onSubmit={handleRename}
                initialName={renameModal.name}
                initialIcon={renameModal.icon}
                itemType={renameModal.itemType}
            />

            {/* Sub-folder Modal */}
            <InputModal
                isOpen={isSubfolderModalOpen}
                onClose={() => setIsSubfolderModalOpen(false)}
                onSubmit={(name) => handleCreateFolder(name, contextMenu.itemId)}
                title="Thư mục con mới"
                placeholder="Nhập tên thư mục con..."
                icon="create_new_folder"
            />

            <aside className="w-64 border-r border-white/20 dark:border-white/5 flex flex-col shrink-0 transition-width duration-300 md:w-64 hidden md:flex" id="sidebar-folders">
                <div className="p-6 overflow-hidden">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/40 dark:text-white/30 mb-6 px-2 truncate">Workspace</h3>
                    <nav className="space-y-1 overflow-hidden">
                        {renderFolderTree(null)}
                    </nav>
                </div>
                <div className="mt-auto p-4 space-y-2 border-t border-white/10">
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsFolderModalOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1d2624]/70 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                            <span>Thư mục mới</span>
                        </button>
                    )}
                </div>
            </aside>

            <section className="w-72 border-r border-white/20 dark:border-white/5 flex flex-col shrink-0 bg-white/10 hidden lg:flex min-w-0" id="note-list">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">Notes</h3>
                        {isAuthenticated && (
                            <button onClick={() => setIsNoteModalOpen(true)} className="p-2 rounded-lg hover:bg-white/20 text-[#1d2624]/60 dark:text-white/60 transition-colors" title="New Note">
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#1d2624]/40">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/10 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#1d2624]/40 dark:placeholder:text-white/40"
                            placeholder="Search in folder..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {filteredDocs.length === 0 ? (
                        <div className="text-center py-10 text-[#1d2624]/40 text-sm">No notes here</div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => handleDocClick(doc.id)}
                                onContextMenu={(e) => openContextMenu(e, doc.id, 'doc', doc.parentId)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${activeDocId === doc.id ? 'bg-white shadow-sm border-primary/10' : 'hover:bg-white/40 border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1 min-w-0 gap-2">
                                    <h4 className={`font-bold text-sm line-clamp-1 flex-1 min-w-0 break-words ${activeDocId === doc.id ? 'text-[#1d2624]' : 'text-[#1d2624]/80'}`}>
                                        {doc.title}
                                    </h4>
                                    <span className="text-[10px] text-[#1d2624]/30 whitespace-nowrap shrink-0 mt-0.5">{doc.date}</span>
                                </div>
                                <p className="text-xs text-[#1d2624]/60 line-clamp-2 mb-3 break-words overflow-hidden">
                                    {doc.content.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                                </p>
                                <div className="flex items-center gap-2">
                                    {doc.tags.map((tag, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-white/50 text-[#1d2624]/60 border border-[#1d2624]/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="flex-1 flex flex-col bg-white/5 relative h-full overflow-hidden">
                <div className="h-16 px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md z-10">
                    <span className="text-sm font-medium text-[#1d2624]/40">
                        {isEditing ? 'Editing Mode' : activeDoc ? `Last saved ${activeDoc.date}` : 'Select a note'}
                    </span>
                    <div className="flex items-center gap-3">
                        {isAuthenticated && activeDoc && (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                            className="px-4 py-1.5 rounded-lg text-sm font-bold text-[#1d2624]/70 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                                            className="px-4 py-1.5 rounded-lg bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] text-sm font-bold shadow-md hover:scale-105 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteDoc(); }}
                                            className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all text-[#1d2624]/60 hover:text-red-500"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); startEditing(); }}
                                            className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all text-[#1d2624]/60 hover:text-primary-dark"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        <button type="button" className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all">
                            <span className="material-symbols-outlined text-[20px]">share</span>
                        </button>
                    </div>
                </div>

                {activeDoc ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {isEditing ? (
                            <div className="max-w-3xl mx-auto py-16 px-8 md:px-12 h-full flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-5xl font-extrabold tracking-tight text-[#1d2624] dark:text-white bg-transparent border-b border-transparent focus:border-[#1d2624]/20 focus:outline-none placeholder:text-[#1d2624]/20 w-full pb-2"
                                    placeholder="Note Title"
                                />
                                <div className="flex-1 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 p-1">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full h-full bg-transparent border-none p-6 resize-none focus:outline-none text-lg text-[#1d2624]/80 dark:text-white/80 font-serif leading-relaxed"
                                        placeholder="Start typing your story..."
                                    ></textarea>
                                </div>
                                <p className="text-xs text-center text-[#1d2624]/40">HTML tags are supported for formatting.</p>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto py-16 px-8 md:px-12 space-y-8 animate-[fadeIn_0.3s_ease-out] overflow-hidden min-w-0">
                                <h1 className="text-5xl font-extrabold tracking-tight text-[#1d2624] dark:text-white leading-[1.15] break-words [overflow-wrap:anywhere]">{activeDoc.title}</h1>
                                <div className="flex items-center gap-3 pb-8 border-b border-[#1d2624]/5 dark:border-white/5">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url("${activeDoc.bg}")` }}></div>
                                        <div className="size-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-600">+1</div>
                                    </div>
                                    <span className="text-sm text-[#1d2624]/40 dark:text-white/40 font-medium">Collaborating with the Team</span>
                                </div>
                                <div
                                    className="prose prose-slate prose-lg text-[#1d2624]/80 dark:text-white/80 leading-[1.8] space-y-6 break-words [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:pt-4 [&>h2]:text-[#1d2624] dark:[&>h2]:text-white [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>.callout]:bg-white/40 [&>.callout]:p-6 [&>.callout]:rounded-2xl [&>.callout]:border [&>.callout]:border-primary/10 [&>.lead]:text-xl [&>.lead]:font-light [&>.lead]:italic [&>.lead]:text-[#1d2624]/60"
                                    dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#1d2624]/40">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">article</span>
                        <p>Select a note to view or create a new one.</p>
                    </div>
                )}
            </section>
        </>
    );
};

export default Docs;
