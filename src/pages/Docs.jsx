import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';
// import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabaseClient';
import RichTextEditor from '../components/editor/RichTextEditor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CascadingNav from '../components/layout/CascadingNav';
import ToolsPanel from '../components/panels/ToolsPanel';
import GalleryPanel from '../components/panels/GalleryPanel';
import AdminPanel from '../components/panels/AdminPanel';

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
        content: `*This document outlines the fundamental design language for Khắc Nghĩa workspace.*

## 1. Core Philosophy

Minimalism isn't about the absence of content, but the presence of focus. In a data-rich environment, we prioritize information hierarchy using generous whitespace and subtle elevation.

## 2. Design Principles

- **Clarity**: Every element serves a purpose
- **Consistency**: Unified visual language across all touchpoints
- **Calm**: Reduce cognitive load with thoughtful spacing

## 3. Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #4ecdc4 | Actions, links |
| Background | #f8f9fa | Main surfaces |
| Text | #1d2624 | Body text |
`
    },
    {
        id: 'doc-proxmox-config',
        parentId: 'folder-proxmox',
        title: 'Cấu hình Proxmox với Ceph Storage',
        date: '1d ago',
        tags: ['SysAdmin', 'Storage'],
        bg: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=2070',
        content: `*Hướng dẫn chi tiết cấu hình Ceph trên Proxmox VE 8.1.*

## Yêu cầu hệ thống

- Tối thiểu 3 node Proxmox
- Mỗi node có ít nhất 1 OSD disk
- Network 10Gbps recommended

## Các bước cấu hình

1. Cài đặt Ceph packages trên tất cả nodes
2. Khởi tạo Ceph cluster từ node đầu tiên
3. Thêm các node còn lại vào cluster
4. Tạo OSDs trên mỗi disk

\`\`\`bash
pveceph install
pveceph init --network 10.0.0.0/24
\`\`\`
`
    },
    {
        id: 'doc-proxmox-ha',
        parentId: 'folder-proxmox',
        title: 'HA Proxmox Cluster',
        date: '5h ago',
        tags: ['HA', 'Cluster'],
        bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070',
        content: `*Thiết lập High Availability cho Cluster 3 node.*

## Tổng quan HA

High Availability đảm bảo VMs tự động migrate khi node gặp sự cố.

> **Lưu ý**: HA yêu cầu shared storage (Ceph, NFS, iSCSI)

## Cấu hình HA Group

1. Tạo HA Group trong Datacenter → HA
2. Thêm VMs cần HA vào group
3. Set priority và restrictions
`
    },
    {
        id: 'doc-nextcloud',
        parentId: 'folder-nextcloud',
        title: 'Cấu hình NextCloud',
        date: '1w ago',
        tags: ['Cloud', 'Self-hosted'],
        bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070',
        content: `*Tối ưu hiệu năng Nextcloud với Redis và PHP-FPM.*

## Stack khuyến nghị

- **Web Server**: Nginx
- **Database**: MariaDB 10.6+
- **Cache**: Redis
- **PHP**: 8.2 với OPcache

## Cấu hình Redis

\`\`\`php
'memcache.local' => '\\OC\\Memcache\\APCu',
'memcache.distributed' => '\\OC\\Memcache\\Redis',
'redis' => [
    'host' => 'localhost',
    'port' => 6379,
],
\`\`\`
`
    },
    {
        id: 'doc-brand',
        parentId: 'folder-docs',
        title: 'Brand Guidelines',
        date: '2d ago',
        tags: ['Design', 'Brand'],
        bg: 'https://images.unsplash.com/photo-1626785774573-4b79931bfd95?auto=format&fit=crop&q=80&w=2070',
        content: `*Brand identity guide for Khắc Nghĩa.*

## Logo Usage

- Minimum size: 32px height
- Clear space: 1x logo height around all sides
- Never distort or rotate

## Typography

**Headings**: Inter Bold
**Body**: Inter Regular
**Code**: JetBrains Mono
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
const ContextMenu = ({ isOpen, position, onClose, onRename, onDelete, onDuplicate, onAddSubfolder, onMove, onEdit, onAddNote, onImportWord, onExport, onToggleLock, onToggleHide, isLocked, isHidden, itemType, isRootFolder }) => {
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
        ...(itemType === 'doc' && onEdit ? [{ icon: 'edit_note', label: 'Chỉnh sửa', action: onEdit }] : []),
        ...(itemType === 'folder' ? [{ icon: 'edit', label: 'Đổi tên', action: onRename }] : []),
        { icon: 'drive_file_move', label: 'Di chuyển', action: onMove },
        { icon: 'content_copy', label: 'Sao chép', action: onDuplicate },
        ...(itemType === 'doc' && onExport ? [{ icon: 'ios_share', label: 'Export', action: onExport }] : []),
        ...(itemType === 'doc' && onToggleLock ? [{
            icon: isLocked ? 'lock_open' : 'lock',
            label: isLocked ? 'Unlock' : 'Lock',
            action: onToggleLock
        }] : []),
        ...(itemType === 'doc' && onToggleHide ? [{
            icon: isHidden ? 'visibility' : 'visibility_off',
            label: isHidden ? 'Unhide' : 'Hide',
            action: onToggleHide
        }] : []),
        { icon: 'delete', label: 'Xóa', action: onDelete, danger: true },
    ];

    // Chỉ cho phép tạo subfolder trong ROOT folder (parentId === null)
    // Không cho tạo trong subfolder (tối đa 2 cấp)
    if (itemType === 'folder' && isRootFolder && onAddSubfolder) {
        menuItems.splice(2, 0, { icon: 'create_new_folder', label: 'Thêm folder', action: onAddSubfolder });
    }

    // Add Note option cho folders
    if (itemType === 'folder' && onAddNote) {
        menuItems.splice(2, 0, { icon: 'note_add', label: 'Thêm trang', action: onAddNote });
    }

    // Import Word option cho folders
    if ((itemType === 'folder' || isRootFolder) && onImportWord) {
        menuItems.splice(3, 0, { icon: 'system_update_alt', label: 'Import', action: onImportWord });
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
            className="fixed z-[100] min-w-48 py-2 bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#1d2624]/10 dark:border-white/10 animate-[fadeIn_0.15s_ease-out]"
            style={{ top: adjustedY, left: adjustedX }}
        >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1d2624]/40 dark:text-white/60 border-b border-[#1d2624]/10 dark:border-white/10 mb-1">
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

// --- Export Modal ---
const ExportModal = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
                <h2 className="text-lg font-bold text-[#1d2624] dark:text-white mb-4">Export Document</h2>
                <div className="space-y-2">
                    <button onClick={() => onExport('html')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/10 transition-colors text-left font-medium text-[#1d2624] dark:text-white">
                        <span className="material-symbols-outlined text-orange-500">html</span>
                        HTML
                    </button>
                    <button onClick={() => onExport('word')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/10 transition-colors text-left font-medium text-[#1d2624] dark:text-white">
                        <span className="material-symbols-outlined text-blue-500">description</span>
                        Word (.docx)
                    </button>
                    <button onClick={() => onExport('pdf')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/10 transition-colors text-left font-medium text-[#1d2624] dark:text-white">
                        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Rename Modal with Icon Picker ---
const ICON_COLORS = [
    { name: 'Mặc định', class: '', bgClass: 'bg-gray-200 dark:bg-gray-700' },
    { name: 'Red', class: 'text-red-500', bgClass: 'bg-red-500' },
    { name: 'Orange', class: 'text-orange-500', bgClass: 'bg-orange-500' },
    { name: 'Amber', class: 'text-amber-500', bgClass: 'bg-amber-500' },
    { name: 'Yellow', class: 'text-yellow-500', bgClass: 'bg-yellow-500' },
    { name: 'Lime', class: 'text-lime-500', bgClass: 'bg-lime-500' },
    { name: 'Green', class: 'text-green-500', bgClass: 'bg-green-500' },
    { name: 'Emerald', class: 'text-emerald-500', bgClass: 'bg-emerald-500' },
    { name: 'Teal', class: 'text-teal-500', bgClass: 'bg-teal-500' },
    { name: 'Cyan', class: 'text-cyan-500', bgClass: 'bg-cyan-500' },
    { name: 'Sky', class: 'text-sky-500', bgClass: 'bg-sky-500' },
    { name: 'Blue', class: 'text-blue-500', bgClass: 'bg-blue-500' },
    { name: 'Indigo', class: 'text-indigo-500', bgClass: 'bg-indigo-500' },
    { name: 'Violet', class: 'text-violet-500', bgClass: 'bg-violet-500' },
    { name: 'Purple', class: 'text-purple-500', bgClass: 'bg-purple-500' },
    { name: 'Fuchsia', class: 'text-fuchsia-500', bgClass: 'bg-fuchsia-500' },
    { name: 'Pink', class: 'text-pink-500', bgClass: 'bg-pink-500' },
    { name: 'Rose', class: 'text-rose-500', bgClass: 'bg-rose-500' },
    { name: 'Slate', class: 'text-slate-500', bgClass: 'bg-slate-500' },
];

const RenameModal = ({ isOpen, onClose, onSubmit, initialName, initialIcon, initialColor, itemType }) => {
    const [name, setName] = useState(initialName || '');
    const [selectedIcon, setSelectedIcon] = useState(initialIcon || 'folder');
    const [selectedColor, setSelectedColor] = useState(initialColor || ''); // Default empty
    const [showIconPicker, setShowIconPicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName || '');
            setSelectedIcon(initialIcon || 'folder');
            setSelectedColor(initialColor || '');
            setShowIconPicker(false);
        }
    }, [isOpen, initialName, initialIcon, initialColor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim(), selectedIcon, selectedColor);
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
                            <span className={`material-symbols-outlined text-2xl ${selectedColor || 'text-[#1d2624]/70 dark:text-white/80'}`}>{selectedIcon}</span>
                        </button>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên..."
                            className="flex-1 px-4 py-3 bg-white/50 dark:bg-black/20 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                        />
                    </div>

                    {/* Icon & Color Picker */}
                    {showIconPicker && (
                        <div className="mb-4 p-3 bg-[#1d2624]/5 rounded-xl max-h-80 overflow-y-auto custom-scrollbar">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/40 mb-2">Chọn màu</div>

                            {/* Color Grid */}
                            <div className="grid grid-cols-10 gap-1.5 mb-4">
                                {ICON_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setSelectedColor(color.class)}
                                        className={`size-7 rounded-full transition-all flex items-center justify-center ${color.bgClass} ${selectedColor === color.class ? 'ring-2 ring-offset-2 ring-[#1d2624]/20 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                        title={color.name}
                                    >
                                        {!color.class && <span className="material-symbols-outlined text-[10px] text-black/50">block</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/40 mb-2">Chọn biểu tượng</div>
                            <div className="grid grid-cols-8 gap-1">
                                {AVAILABLE_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => { setSelectedIcon(icon); }}
                                        className={`size-9 rounded-lg flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-black/5 dark:bg-white/10 ring-1 ring-inset ring-[#1d2624]/10 dark:ring-white/10' : 'hover:bg-white/50'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${selectedIcon === icon ? (selectedColor || 'text-[#1d2624]/80 dark:text-white/80') : 'text-[#1d2624]/60 dark:text-white/60'}`}>{icon}</span>
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
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
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
            <div className="relative w-full max-w-md bg-white/90 dark:bg-[#1d2624]/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.2s_ease-out]">
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
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
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


// --- Import Modal ---
const ImportModal = ({ isOpen, onClose, onImportWord, onImportHtmlFile, onImportHtmlCode }) => {
    const [mode, setMode] = useState('menu'); // menu, code
    const [htmlCode, setHtmlCode] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMode('menu');
            setHtmlCode('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white/90 dark:bg-[#1d2624]/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">
                        {mode === 'menu' ? 'Import' : 'Nhập HTML Code'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-[#1d2624]/50 hover:bg-[#1d2624]/5 dark:text-white/50 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {mode === 'menu' ? (
                    <div className="space-y-3">
                        <button onClick={onImportWord} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/5 border border-[#1d2624]/5 dark:border-white/5 transition-all text-left group">
                            <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1d2624] dark:text-white">Word Document</h4>
                                <p className="text-xs text-[#1d2624]/60 dark:text-white/60">Import từ file .docx</p>
                            </div>
                        </button>
                        <button onClick={onImportHtmlFile} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/5 border border-[#1d2624]/5 dark:border-white/5 transition-all text-left group">
                            <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">html</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1d2624] dark:text-white">HTML File</h4>
                                <p className="text-xs text-[#1d2624]/60 dark:text-white/60">Import từ file .html</p>
                            </div>
                        </button>
                        <button onClick={() => setMode('code')} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#1d2624]/5 dark:hover:bg-white/5 border border-[#1d2624]/5 dark:border-white/5 transition-all text-left group">
                            <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">code</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1d2624] dark:text-white">HTML Code</h4>
                                <p className="text-xs text-[#1d2624]/60 dark:text-white/60">Dán trực tiếp mã HTML</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            value={htmlCode}
                            onChange={(e) => setHtmlCode(e.target.value)}
                            placeholder="<div>Nội dung...</div>"
                            className="w-full h-48 bg-[#1d2624]/5 dark:bg-black/20 border border-[#1d2624]/10 dark:border-white/10 rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setMode('menu')} className="flex-1 py-2.5 rounded-xl border border-[#1d2624]/10 dark:border-white/10 hover:bg-[#1d2624]/5 dark:hover:bg-white/5 font-medium text-sm">
                                Quay lại
                            </button>
                            <button
                                onClick={() => onImportHtmlCode(htmlCode)}
                                disabled={!htmlCode.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
                            >
                                Import
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

// --- Sortable Folder Item for Drag & Drop ---
const SortableFolderItem = ({ folder, children, isAuthenticated }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: folder.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative touch-none"
            {...(isAuthenticated ? { ...attributes, ...listeners } : {})}
        >
            {children}
        </div>
    );
};


const Docs = () => {
    const { isAuthenticated } = useAuth();
    console.log('[Docs] Component rendering - AUTO SAVE VERSION 2.0');

    const navigate = useNavigate();

    // --- State ---
    const [folders, setFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('zen_folders');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [docs, setDocs] = useState(() => {
        try {
            const saved = localStorage.getItem('zen_docs');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [loading, setLoading] = useState(() => {
        // If we have cached data, don't show initial loading screen
        const hasData = localStorage.getItem('zen_folders') || localStorage.getItem('zen_docs');
        return !hasData;
    });

    const [activeFolderId, setActiveFolderId] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('zen_expanded_folders');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [activeDocId, setActiveDocId] = useState(null);
    const [isDocContentLoading, setIsDocContentLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [importTargetId, setImportTargetId] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Modal Import
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportTargetId, setExportTargetId] = useState(null);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editAttachments, setEditAttachments] = useState([]);

    // Modal State
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isSecondaryPanelOpen, setIsSecondaryPanelOpen] = useState(false);
    
    // --- Unified SPA State ---
    const [activeZone, setActiveZone] = useState('docs'); // docs | tools | gallery | admin
    const [isAgentSelected, setIsAgentSelected] = useState(false);
    const [agentPos, setAgentPos] = useState({ left: 300, top: 310 });
    const [agentFacingAngle, setAgentFacingAngle] = useState(0);
    const [showEditor, setShowEditor] = useState(false);
    const [clickEffects, setClickEffects] = useState([]);
    const [isTeleporting, setIsTeleporting] = useState(false);

    // Edit mode drag state
    const { isEditMode, setIsEditMode, updateWorldConfig, worldConfig } = useSettings();
    const [selectedMesh, setSelectedMesh] = useState(null);
    const [draggingMesh, setDraggingMesh] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    
    // Model transforms draft
    const [modelsTransform, setModelsTransform] = useState({
        archive: { x: 450, y: -140, scale: 1, rotation: 0 },
        bed: { x: 460, y: 460, scale: 1, rotation: 0 },
        cabinet: { x: 50, y: 50, scale: 1, rotation: 0 },
        tools: { x: 30, y: 30, scale: 1, rotation: 0 }
    });

    // Zone transforms draft
    const [zonesTransform, setZonesTransform] = useState({
        docs: { x: 0, y: 0, w: 700, h: 700 },
        tools: { x: 800, y: 0, w: 700, h: 700 },
        gallery: { x: 0, y: 800, w: 700, h: 700 },
        admin: { x: 800, y: 800, w: 700, h: 700 }
    });

    const [selectedZone, setSelectedZone] = useState(null);
    const [draggingZone, setDraggingZone] = useState(null);
    const [resizingZone, setResizingZone] = useState(null);
    const [resizeType, setResizeType] = useState(null); // 'w', 'h', 'se'

    // Sync from worldConfig
    useEffect(() => {
        if (worldConfig?.modelsTransform) {
            setModelsTransform(p => ({ ...p, ...worldConfig.modelsTransform }));
        }
        if (worldConfig?.zonesTransform) {
            setZonesTransform(p => ({ ...p, ...worldConfig.zonesTransform }));
        }
    }, [worldConfig]);

    const handleMeshPointerDown = (e, meshId) => {
        if (!isEditMode) return;
        e.stopPropagation(); // Prevent floor click teleport
        setSelectedMesh(meshId);
        setSelectedZone(null);
        setDraggingMesh(meshId);
        setDraggingZone(null);
        setResizingZone(null);
        dragOffset.current = { x: e.clientX, y: e.clientY };
    };

    const handleZoneSelect = (zoneKey) => {
        if (!isEditMode) return;
        setSelectedZone(zoneKey);
        setSelectedMesh(null);
    };

    const handleFloorPointerDown = (e, zoneKey) => {
        if (!isEditMode) return;
        e.stopPropagation();
        handleZoneSelect(zoneKey);
        setDraggingZone(zoneKey);
        setDraggingMesh(null);
        setResizingZone(null);
        dragOffset.current = { x: e.clientX, y: e.clientY };
    };

    const handleResizePointerDown = (e, zoneKey, type) => {
        if (!isEditMode) return;
        e.stopPropagation();
        setResizingZone(zoneKey);
        setResizeType(type);
        setDraggingMesh(null);
        setDraggingZone(null);
        dragOffset.current = { x: e.clientX, y: e.clientY };
    };

    const [activeSettingGroup, setActiveSettingGroup] = useState('profile');

    const handleSettingObjectClick = (e, group, targetX, targetY) => {
        e.stopPropagation();
        setActiveSettingGroup(group);
        handleFloorClickGlobal(e, targetX, targetY, 'admin');
    };

    // Teleport logic
    const navigateToZone = (zone, targetPos) => {
        // Biến mất (Blink Teleport)
        setIsTeleporting(true);

        // Sau khi mờ đi (400ms), dịch chuyển tọa độ và Camera
        setTimeout(() => {
            setAgentPos(targetPos);
            setActiveZone(zone);
            
            if (zone !== 'docs') {
                setIsSecondaryPanelOpen(false);
            }
            setShowEditor(false);

            // Center camera precisely on the center of the zone and reset zoom
            if (zone === 'docs') setCameraPos({ tx: -zonesTransform.docs.x * cameraPos.scale, ty: -zonesTransform.docs.y * cameraPos.scale, scale: 1 });
            else if (zone === 'tools') setCameraPos({ tx: -zonesTransform.tools.x * cameraPos.scale, ty: -zonesTransform.tools.y * cameraPos.scale, scale: 1 });
            else if (zone === 'gallery') setCameraPos({ tx: -zonesTransform.gallery.x * cameraPos.scale, ty: -zonesTransform.gallery.y * cameraPos.scale, scale: 1 });
            else if (zone === 'admin') setCameraPos({ tx: -zonesTransform.admin.x * cameraPos.scale, ty: -zonesTransform.admin.y * cameraPos.scale, scale: 1 });

            // Hiện lại
            setTimeout(() => setIsTeleporting(false), 100);
        }, 400);
    };

    // --- One-Map Camera State ---
    const [cameraPos, setCameraPos] = useState({ tx: 0, ty: 0, scale: 1 });
    const isDragging = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const modelViewerRef = useRef(null);

    const handleWheel = (e) => {
        // Prevent default only if hovering the canvas
        if (e.target.closest('article') || e.target.closest('aside') || e.target.closest('.cascading-nav')) return;
        
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        setCameraPos(p => ({ ...p, scale: Math.max(0.3, Math.min(3, p.scale * zoomDelta)) }));
    };

    const handlePointerDown = (e) => {
        if (e.target.closest('article') || e.target.closest('aside') || e.target.closest('.cascading-nav')) return;
        isDragging.current = true;
        startPoint.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
        if (draggingMesh || draggingZone || resizingZone) {
            const dX = e.clientX - dragOffset.current.x;
            const dY = e.clientY - dragOffset.current.y;
            
            // Isometric Coordinate Transformation Logic
            const scale = cameraPos.scale;
            
            // Screen to Isometric (rotated -45, pitched 60)
            const A = dX / (scale * 0.7071);
            const B = dY / (scale * 0.7071 * 0.5);

            const dx = (A - B) / 2;
            const dy = (A + B) / 2;

            if (draggingMesh) {
                setModelsTransform(p => ({
                    ...p,
                    [draggingMesh]: {
                        ...p[draggingMesh],
                        x: p[draggingMesh].x + dx,
                        y: p[draggingMesh].y + dy
                    }
                }));
            } else if (draggingZone) {
                setZonesTransform(p => ({
                    ...p,
                    [draggingZone]: {
                        ...p[draggingZone],
                        x: p[draggingZone].x + dx,
                        y: p[draggingZone].y + dy
                    }
                }));
            } else if (resizingZone) {
                setZonesTransform(p => {
                    const zone = p[resizingZone];
                    let newW = zone.w;
                    let newH = zone.h;
                    
                    if (resizeType === 'w' || resizeType === 'se') newW += dx;
                    if (resizeType === 'h' || resizeType === 'se') newH += dy;

                    return {
                        ...p,
                        [resizingZone]: {
                            ...zone,
                            w: Math.max(100, newW),
                            h: Math.max(100, newH)
                        }
                    };
                });
            }

            dragOffset.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (!isDragging.current) return;
        const dx = e.clientX - startPoint.current.x;
        const dy = e.clientY - startPoint.current.y;
        setCameraPos(p => ({ ...p, tx: p.tx + dx, ty: p.ty + dy }));
        startPoint.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        isDragging.current = false;
        setDraggingMesh(null);
        setDraggingZone(null);
        setResizingZone(null);
    };

    // Escape key to close secondary panel
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSecondaryPanelOpen) {
                setIsSecondaryPanelOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSecondaryPanelOpen]);

    // Toggle body class for focus mode global styling
    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('focus-mode-active');
        } else {
            document.body.classList.remove('focus-mode-active');
        }
        return () => document.body.classList.remove('focus-mode-active');
    }, [isFocusMode]);

    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    // --- Drag & Drop Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end - reorder folders and save to database
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = folders.findIndex(f => f.id === active.id);
            const newIndex = folders.findIndex(f => f.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedFolders = arrayMove(folders, oldIndex, newIndex);

                // Update sort_order for ALL folders to reflect new array position
                // This ensures the .sort() in renderFolderTree respects the new order
                const newFolders = reorderedFolders.map((f, index) => ({
                    ...f,
                    sort_order: index
                }));

                // Update local state immediately for smooth UX
                setFolders(newFolders);

                // Update order in database
                try {
                    const updates = newFolders.map(folder => ({
                        id: folder.id,
                        sort_order: folder.sort_order,
                    }));

                    for (const update of updates) {
                        await supabase
                            .from('folders')
                            .update({ sort_order: update.sort_order })
                            .eq('id', update.id);
                    }

                    showToast('Đã lưu thứ tự folder');
                } catch (error) {
                    console.error('Error saving order:', error);
                    showToast('Lỗi khi lưu thứ tự');
                }
            }
        }
    };

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, itemId: null, itemType: null, parentId: null });
    const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [renameModal, setRenameModal] = useState({ isOpen: false, itemId: null, itemType: null, name: '', icon: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openContextMenu = (e, itemId, itemType, parentId = null) => {
        if (!isAuthenticated) return;
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
            setRenameModal({ isOpen: true, itemId, itemType, name: folder?.title || '', icon: folder?.icon || 'folder', color: folder?.color || 'text-primary' });
        } else {
            const doc = docs.find(d => d.id === itemId);
            setRenameModal({ isOpen: true, itemId, itemType, name: doc?.title || '', icon: doc?.icon || 'description', color: doc?.color || 'text-primary' });
        }
        closeContextMenu();
    };

    const handleRename = async (newName, newIcon, newColor) => {
        const { itemId, itemType } = renameModal;
        const table = itemType === 'folder' ? 'folders' : 'docs';

        try {
            const { error } = await supabase
                .from(table)
                .update({ title: newName, icon: newIcon, color: newColor })
                .eq('id', itemId);

            if (error) throw error;

            if (itemType === 'folder') {
                setFolders(folders.map(f => f.id === itemId ? { ...f, title: newName, icon: newIcon, color: newColor } : f));
            } else {
                setDocs(docs.map(d => d.id === itemId ? { ...d, title: newName, icon: newIcon, color: newColor } : d));
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

    // Toggle Lock - requires login to view
    const handleToggleLock = async () => {
        if (!contextMenu.itemId || contextMenu.itemType !== 'doc') return;

        const doc = docs.find(d => d.id === contextMenu.itemId);
        if (!doc) return;

        const newLockedState = !doc.isLocked;

        // Optimistic update
        const updatedDocs = docs.map(d =>
            d.id === contextMenu.itemId ? { ...d, isLocked: newLockedState } : d
        );
        setDocs(updatedDocs);
        closeContextMenu();
        showToast(newLockedState ? 'Đã khóa tài liệu' : 'Đã mở khóa tài liệu');

        // Sync with DB
        const { error } = await supabase
            .from('docs')
            .update({ is_locked: newLockedState })
            .eq('id', contextMenu.itemId);

        if (error) {
            console.error('Error toggling lock:', error);
        }
    };

    // Toggle Hide - only visible to admin
    const handleToggleHide = async () => {
        if (!contextMenu.itemId || contextMenu.itemType !== 'doc') return;

        const doc = docs.find(d => d.id === contextMenu.itemId);
        if (!doc) return;

        const newHiddenState = !doc.isHidden;

        // Optimistic update
        const updatedDocs = docs.map(d =>
            d.id === contextMenu.itemId ? { ...d, isHidden: newHiddenState } : d
        );
        setDocs(updatedDocs);
        closeContextMenu();
        showToast(newHiddenState ? 'Đã ẩn tài liệu' : 'Đã hiện tài liệu');

        // Sync with DB
        const { error } = await supabase
            .from('docs')
            .update({ is_hidden: newHiddenState })
            .eq('id', contextMenu.itemId);

        if (error) {
            console.error('Error toggling hide:', error);
        }
    };

    // --- Effects ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                { data: foldersData, error: fError },
                { data: docsData, error: dError }
            ] = await Promise.all([
                supabase.from('folders').select('*').order('sort_order', { ascending: true }),
                // Fetch lightweight metadata only, content is lazy-loaded
                supabase.from('docs').select('id, title, parentId, date, tags, bg, is_locked, is_hidden, icon, color').order('date', { ascending: false })
            ]);

            if (fError || dError) throw fError || dError;

            // Map snake_case DB columns to camelCase for frontend
            const mappedDocs = docsData.map(doc => ({
                ...doc,
                isLocked: doc.is_locked || false,
                isHidden: doc.is_hidden || false,
                icon: doc.icon || 'description', // Ensure default icon
                color: doc.color || ''
            }));

            if (foldersData.length === 0 && docsData.length === 0) {
                // Seed if empty
                await supabase.from('folders').insert(SEED_FOLDERS);
                await supabase.from('docs').insert(SEED_DOCS);
                setFolders(SEED_FOLDERS);
                setDocs(SEED_DOCS);
            } else {
                setFolders(foldersData);
                setDocs(mappedDocs);

                // Cache data for instant load on next visit
                try {
                    localStorage.setItem('zen_folders', JSON.stringify(foldersData));
                    localStorage.setItem('zen_docs', JSON.stringify(mappedDocs));
                } catch (e) {
                    console.warn('LocalStorage quota exceeded or error:', e);
                }
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

    // Default Expansion: If no preference saved, expand all folders
    useEffect(() => {
        if (folders.length > 0) {
            const saved = localStorage.getItem('zen_expanded_folders');
            if (saved === null) {
                setExpandedFolders(folders.map(f => f.id));
            }
        }
    }, [folders]);

    useEffect(() => {
        localStorage.setItem('zen_expanded_folders', JSON.stringify(expandedFolders));
    }, [expandedFolders]);

    useEffect(() => {
        if (!activeDocId && docs.length > 0) {
            const firstDocInFolder = docs.find(d => d.parentId === activeFolderId);
            if (firstDocInFolder) setActiveDocId(firstDocInFolder.id);
        }
    }, [activeFolderId, docs, activeDocId]);

    // OPTIMIZATION: Lazy Load Document Content
    useEffect(() => {
        const loadContent = async () => {
            if (!activeDocId) return;
            // Check if content is already loaded
            const currentDoc = docs.find(d => d.id === activeDocId);
            if (!currentDoc || currentDoc.content !== undefined) return;

            setIsDocContentLoading(true);
            try {
                const { data, error } = await supabase
                    .from('docs')
                    .select('content, attachments')
                    .eq('id', activeDocId)
                    .single();

                if (error) throw error;

                // Update docs with fetched content
                setDocs(prev => prev.map(d => 
                    d.id === activeDocId 
                        ? { ...d, content: data.content || '', attachments: data.attachments || [] }
                        : d
                ));
            } catch (error) {
                console.error('Error fetching doc content:', error);
                showToast('Lỗi tải nội dung tài liệu');
            } finally {
                setIsDocContentLoading(false);
            }
        };

        loadContent();
    }, [activeDocId, docs]);

    // --- Computed ---
    const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);

    const filteredDocs = useMemo(() => {
        let result = docs;

        // Filter out hidden docs for non-authenticated users
        if (!isAuthenticated) {
            result = result.filter(doc => !doc.isHidden);
        }

        if (searchQuery) {
            result = result.filter(doc =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        } else {
            if (activeFolderId) {
                // Logic hiển thị đệ quy cho Root Folder
                const activeFolder = folders.find(f => f.id === activeFolderId);
                if (activeFolder && activeFolder.parentId === null) {
                    // Nếu là Root Folder: Hiển thị docs của chính nó + docs của các subfolders
                    const subFolderIds = folders.filter(f => f.parentId === activeFolderId).map(f => f.id);
                    const authorizedParentIds = [activeFolderId, ...subFolderIds];
                    result = result.filter(doc => authorizedParentIds.includes(doc.parentId));
                } else {
                    // Nếu là Subfolder: Chỉ hiển thị docs của chính nó
                    result = result.filter(doc => doc.parentId === activeFolderId);
                }
            }
        }
        return result;
    }, [docs, activeFolderId, searchQuery, folders, isAuthenticated]);

    // --- Handlers ---
    const handleFolderClick = (folderId) => {
        setActiveFolderId(folderId);
        setSearchQuery('');
        setIsEditing(false);
        setIsSecondaryPanelOpen(true);
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
        if (docId !== activeDocId) {
            const half = 50;
            const agentCenterX = agentPos.left + half;
            const agentCenterY = agentPos.top + half;
            const dx = 30 - agentCenterX;
            const dy = 30 - agentCenterY;
            // Floor direction → Screen direction
            const screenDx = (dx + dy) * 0.7071;
            const screenDy = (-dx + dy) * 0.3536; // Y goes down natively
            const screenAngle = Math.atan2(screenDy, screenDx) * (180 / Math.PI);
            setAgentFacingAngle(screenAngle - 90);
            setAgentPos({ left: 600, top: 100 }); // Đi về phía tủ ở top vertex

            // Đổi sang Running qua DOM
            if (modelViewerRef.current) {
                modelViewerRef.current.setAttribute('src', '/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Running_withSkin.glb');
            }

            setIsAgentSelected(false);
            setTimeout(() => {
                setActiveDocId(docId);
                setIsEditing(false);
                setShowEditor(true);
                // Đổi về Walking
                if (modelViewerRef.current) {
                    modelViewerRef.current.setAttribute('src', '/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Walking_withSkin.glb');
                }
            }, 1200);
        }
    };

    const handleCloseDoc = () => {
        setShowEditor(false);
        setActiveDocId(null);
        setAgentPos({ left: 300, top: 310 });
        setAgentFacingAngle(0);
    };

    const handleFloorClickGlobal = (e, zoneOffsetX, zoneOffsetY, zoneName) => {
        const localX = e.nativeEvent.offsetX;
        const localY = e.nativeEvent.offsetY;
        const half = 50;
        const size = 100;
        const clampedLocalX = Math.max(0, Math.min(700 - size, localX - half));
        const clampedLocalY = Math.max(0, Math.min(700 - size, localY - half));
        const targetPos = { left: clampedLocalX + zoneOffsetX, top: clampedLocalY + zoneOffsetY };

        // Nếu click khác vùng -> Teleport sang vùng đó, xuất hiện đúng chỗ click
        if (activeZone !== zoneName) {
             if (isEditMode) {
                 handleZoneSelect(zoneName);
                 return;
             }
             navigateToZone(zoneName, targetPos);
             return;
        }
        
        if (isEditMode) {
            handleZoneSelect(zoneName);
        }

        const globalX = localX + zoneOffsetX;
        const globalY = localY + zoneOffsetY;

        // Tính hướng đi trên sàn
        const agentCenterX = agentPos.left + half;
        const agentCenterY = agentPos.top + half;
        const dx = globalX - agentCenterX;
        const dy = globalY - agentCenterY;

        // Chuyển floor direction → screen direction chuẩn (Y hướng xuống)
        const screenDx = (dx + dy) * 0.7071;
        const screenDy = (-dx + dy) * 0.3536;
        const screenAngle = Math.atan2(screenDy, screenDx) * (180 / Math.PI);

        // Orbit: screenAngle - 90 để quay đúng hướng
        setAgentFacingAngle(screenAngle - 90);

        // Đổi sang model Running qua DOM (không re-render React)
        if (modelViewerRef.current) {
            modelViewerRef.current.setAttribute('src', '/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Running_withSkin.glb');
        }

        setAgentPos(targetPos);

        // Hiệu ứng click (Ripple)
        const effectId = Date.now();
        setClickEffects(prev => [...prev, { id: effectId, x: globalX, y: globalY }]);
        setTimeout(() => {
            setClickEffects(prev => prev.filter(e => e.id !== effectId));
        }, 1000);
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

    const startEditing = async () => {
        if (!activeDoc) return;
        
        let contentToEdit = activeDoc.content;
        let attachmentsToEdit = activeDoc.attachments;

        if (contentToEdit === undefined) {
            showToast('Loading document content...');
            try {
                const { data, error } = await supabase.from('docs').select('content, attachments').eq('id', activeDoc.id).single();
                if (!error) {
                    contentToEdit = data.content || '';
                    attachmentsToEdit = data.attachments || [];
                    setDocs(prev => prev.map(d => d.id === activeDoc.id ? { ...d, content: contentToEdit, attachments: attachmentsToEdit } : d));
                }
            } catch (err) {
                console.error("Error loading content for edit", err);
            }
        }

        setEditTitle(activeDoc.title);
        setEditContent(contentToEdit || '');
        setEditAttachments(attachmentsToEdit || []);
        setIsEditing(true);
    };

    const saveEdit = async () => {
        if (!activeDoc) return;
        try {
            // Optimistic UI update
            const updatedDocs = docs.map(d =>
                d.id === activeDocId ? { ...d, title: editTitle, content: editContent, attachments: editAttachments, date: 'Edited now' } : d
            );
            setDocs(updatedDocs);
            setIsEditing(false);
            showToast('Changes saved successfully!');

            // Optimistic Update Completed - Sync with DB in background
            const { error } = await supabase
                .from('docs')
                .update({ title: editTitle, content: editContent, attachments: editAttachments, date: 'Edited now' })
                .eq('id', activeDocId);

            if (error) {
                console.error('Error saving doc in background:', error);
            }
        } catch (error) {
            console.error('Error in save flow:', error);
            showToast('Lỗi khi lưu');
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
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
        const currentFolders = folders
            .filter(f => f.parentId === parentId)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        const folderItems = currentFolders.map(folder => {
            const isExpanded = expandedFolders.includes(folder.id);
            const isActive = activeFolderId === folder.id;

            const folderContent = (
                <div className="select-none" data-testid={`folder-${folder.id}`} data-depth={depth}>
                    <div className="group relative flex items-center min-w-0 overflow-hidden">
                        <div
                            className={`relative flex items-center w-full rounded-lg transition-colors group/row ${isActive ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                            data-active={isActive}
                            onContextMenu={(e) => openContextMenu(e, folder.id, 'folder', folder.parentId)}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-atrium-primary rounded-r-full"></div>}
                            <div style={{ width: `${depth * 8}px` }} className="shrink-0" data-testid="spacer" />
                            <button
                                onClick={(e) => toggleFolderExpand(folder.id, e)}
                                className="size-5 flex items-center justify-center rounded-sm hover:bg-gray-300 dark:hover:bg-white/10 transition-colors shrink-0 mr-0.5 cursor-pointer ml-1"
                                data-testid="toggle-btn"
                            >
                                {/* State 1: Folder Icon (Default) - Visible when NOT hovered OR if depth > 0 */}
                                <span
                                    className={`material-symbols-outlined text-[18px] ${folder.color || ''} ${depth === 0 ? 'group-hover/row:!hidden' : ''}`}
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
                                className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm font-sans font-medium text-left transition-colors min-w-0 w-full overflow-hidden ${isActive ? 'text-atrium-primary font-semibold' : 'text-[#1d2624]/70 dark:text-white/80'}`}
                            >
                                <span className="flex-1 min-w-0 block whitespace-nowrap overflow-hidden transition-all duration-200 group-hover/row:text-ellipsis">{folder.title}</span>
                                {isAuthenticated && (
                                    <div className="w-0 group-hover/row:w-6 overflow-hidden transition-all duration-200 flex items-center shrink-0">
                                        <span
                                            onClick={(e) => openContextMenu(e, folder.id, 'folder', folder.parentId)}
                                            className="material-symbols-outlined text-[16px] hover:text-[#1d2624] dark:hover:text-white cursor-pointer p-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
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

            if (isAuthenticated) {
                return (
                    <SortableFolderItem key={folder.id} folder={folder} isAuthenticated={isAuthenticated}>
                        {folderContent}
                    </SortableFolderItem>
                );
            }

            return <div key={folder.id}>{folderContent}</div>;
        });

        // Wrap with SortableContext regardless of depth
        if (isAuthenticated && currentFolders.length > 0) {
            return (
                <SortableContext items={currentFolders.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5" key={parentId || 'root'}>
                        {folderItems}
                    </div>
                </SortableContext>
            );
        }

        return (
            <div className="space-y-0.5" key={parentId || 'root'}>
                {folderItems}
            </div>
        );
    };

    // --- Generic Import Logic ---
    const sanitizeHtml = (html) => {
        if (!html) return '';

        // 1. Extract content within <body> tags if present
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let content = bodyMatch ? bodyMatch[1] : html;

        // 2. Remove <script> tags
        content = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "");

        // 3. Remove <style> tags (CSS gây vỡ layout thường nằm ở đây)
        content = content.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "");

        // 4. Remove <link rel="stylesheet">
        content = content.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gmi, "");

        // 5. Remove 'position: absolute/fixed' and sizing from inline styles
        content = content.replace(/position:\s*(absolute|fixed);?/gi, "");
        content = content.replace(/(width|height|margin-left|margin-right|min-width):\s*[^;]+;/gi, "");

        return content;
    };

    // --- Export Logic ---
    const handleExport = async (format, docId = null) => {
        const targetDoc = docId ? docs.find(d => d.id === docId) : activeDoc;
        if (!targetDoc) return;
        showToast(`Đang chuẩn bị xuất file ${format.toUpperCase()}...`);

        try {
            // 1. Prepare Content (Convert images to base64)
            const wrapper = document.createElement('div');
            wrapper.innerHTML = targetDoc.content;

            const images = wrapper.getElementsByTagName('img');
            for (let img of images) {
                if (img.src.startsWith('http')) {
                    try {
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => {
                                img.src = reader.result;
                                resolve();
                            };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.warn('Cannot fetch image for export:', img.src);
                    }
                }
            }

            const processedContent = wrapper.innerHTML;
            const fileName = (targetDoc.title || 'document').replace(/[^a-z0-9\u00C0-\u024F]/gi, '_');

            if (format === 'html') {
                const htmlStruct = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${targetDoc.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 20px auto; padding: 20px; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
    <h1>${targetDoc.title}</h1>
    ${processedContent}
</body>
</html>`;
                const blob = new Blob([htmlStruct], { type: 'text/html;charset=utf-8' });
                saveAs(blob, `${fileName}.html`);
            } else if (format === 'word') {
                // Wrap for html-docx-js
                const htmlStruct = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${targetDoc.title}</title>
</head>
<body>
    <h1>${targetDoc.title}</h1>
    ${processedContent}
</body>
</html>`;
                // Use html-docx-js to convert (loaded via script tag in index.html)
                if (window.htmlDocx) {
                    const converted = window.htmlDocx.asBlob(htmlStruct);
                    saveAs(converted, `${fileName}.docx`);
                } else {
                    showToast('Lỗi: Thư viện export chưa được tải.');
                }
            } else if (format === 'pdf') {
                const htmlStruct = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${targetDoc.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
        img { max-width: 100%; height: auto; }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <h1>${targetDoc.title}</h1>
    ${processedContent}
    <script>
        window.onload = () => {
             setTimeout(() => {
                 window.print();
             }, 500);
        }
    </script>
</body>
</html>`;
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlStruct);
                    printWindow.document.close();
                } else {
                    showToast('Popup blocked! Please allow popups.');
                }
            }

            showToast('Xuất file thành công!');
        } catch (err) {
            console.error('Export Failed:', err);
            showToast('Lỗi xuất file: ' + err.message);
        }
    };

    const createImportedDoc = async (title, content) => {
        try {
            // Clean content before saving to avoid layout breakage
            const cleanContent = sanitizeHtml(content);

            if (!cleanContent || !cleanContent.trim()) {
                throw new Error('Nội dung sau khi xử lý bị trống!');
            }

            const newDoc = {
                id: crypto.randomUUID(),
                title,
                content: cleanContent,
                parentId: importTargetId || activeFolderId || (folders.length > 0 ? folders[0].id : 'folder-docs'),
                date: new Date().toISOString(),
                is_locked: false,
                is_hidden: false
            };

            const { error } = await supabase.from('docs').insert(newDoc);
            if (error) throw error;

            showToast(`Đã import "${title}"`);
            fetchData();
        } catch (err) {
            console.error('Import Error:', err);
            showToast('Lỗi: ' + err.message);
        } finally {
            setImportTargetId(null);
            setIsImportModalOpen(false);
        }
    };

    const handleImportWord = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('Đang xử lý Word...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const options = {
                convertImage: mammoth.images.imgElement(function (image) {
                    return image.read("base64").then(function (imageBuffer) {
                        return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                        };
                    });
                })
            };
            const result = await mammoth.convertToHtml({ arrayBuffer }, options);

            // Check warnings
            if (result.messages && result.messages.length > 0) {
                console.warn('Mammoth Warnings:', result.messages);
                // Show raw warnings to user if debug mode or help them understand why empty
                if (!result.value) {
                    alert('Cảnh báo Import: File Word này có cấu trúc phức tạp hoặc không chuẩn.\nChi tiết: ' + result.messages.map(m => m.message).join('\n'));
                }
            }

            if (!result.value) {
                // FALLBACK: Try to extract raw text if HTML conversion fails completely
                const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
                if (rawTextResult.value && rawTextResult.value.trim()) {
                    // Ask user if they want raw text
                    if (confirm('Mammoth không thể chuyển đổi định dạng này sang HTML, nhưng tìm thấy văn bản thô. Bạn có muốn nhập văn bản thô không?')) {
                        await createImportedDoc(file.name.replace(/\.docx?$/, '') + ' (Raw)', `<pre>${rawTextResult.value}</pre>`);
                        return; // Done
                    }
                }
                throw new Error('Không thể đọc nội dung file Word (File trống hoặc định dạng không hỗ trợ).');
            }

            await createImportedDoc(file.name.replace(/\.docx?$/, ''), result.value);
        } catch (err) {
            showToast('Lỗi đọc file: ' + err.message);
        } finally {
            e.target.value = '';
        }
    };

    const handleImportHtmlFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('Đang xử lý HTML...');

        try {
            const text = await file.text();
            await createImportedDoc(file.name.replace(/\.html?$/, ''), text);
        } catch (err) {
            showToast('Lỗi đọc file: ' + err.message);
        } finally {
            e.target.value = '';
        }
    };

    const handleImportHtmlCode = async (code) => {
        if (!code) return;
        await createImportedDoc('Imported HTML Code', code);
    };


    return (
        <>
            <style>{`
                /* ISOMETRIC CSS */
                .isometric-container {
                    perspective: 2000px;
                    transform-style: preserve-3d;
                }
                .isometric-world {
                    transform: rotateX(60deg) rotateZ(-45deg);
                    transform-style: preserve-3d;
                    transition: transform 1s ease-in-out;
                }
                .iso-floor {
                    width: 100%;
                    height: 100%;
                    background: rgba(13, 148, 136, 0.05);
                    border: 2px dashed rgba(13, 148, 136, 0.2);
                    position: absolute;
                    transform-style: preserve-3d;
                    border-radius: 20px;
                    box-shadow: inset 0 0 50px rgba(13, 148, 136, 0.1);
                }

                .iso-cabinet {
                    position: absolute;
                    top: 50px;
                    left: 50px;
                    width: 100px;
                    height: 80px;
                    transform-style: preserve-3d;
                    transform: translateZ(0);
                }

                .iso-archive {
                    position: absolute;
                    top: -140px;   /* Đỉnh "Top vertex" của isometric floor */
                    left: 450px;
                    width: 450px;
                    height: 450px;
                    transform: translateZ(40px) rotateZ(45deg) rotateX(-60deg);
                    transform-style: preserve-3d;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .iso-bed {
                    position: absolute;
                    top: 460px;
                    left: 460px;
                    width: 200px;
                    height: 200px;
                    border: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                    background: transparent !important;
                    transform: translateZ(20px) rotateZ(45deg) rotateX(-60deg);
                    transform-style: preserve-3d;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }
                .cab-face { position: absolute; border: 1px solid rgba(255,255,255,0.5); }
                .cab-front  { width: 100px; height: 120px; transform: rotateX(-90deg) translateZ(0px); background: #0d9488; transform-origin: bottom; bottom: 0;}
                .cab-back   { width: 100px; height: 120px; transform: rotateX(-90deg) translateZ(-80px); background: #0f766e; transform-origin: bottom; bottom: 0;}
                .cab-top    { width: 100px; height: 80px;  transform: translateZ(120px); background: #2dd4c2; }
                .cab-left   { width: 80px;  height: 120px; transform: rotateY(90deg) rotateZ(90deg) translateZ(-40px) translateX(-40px); background: #115e59; transform-origin: left; left:0; bottom:0;}
                .cab-right  { width: 80px;  height: 120px; transform: rotateY(90deg) rotateZ(90deg) translateZ(60px) translateX(-40px); background: #14b8a6; transform-origin: left; left:0; bottom:0;}

                .cab-drawer { width: 90px; height: 32px; background: rgba(255,255,255,0.2); margin: 5px auto; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); }

                .iso-agent {
                    position: absolute;
                    top: 310px;
                    left: 300px;
                    width: 100px;
                    height: 100px;
                    transform: translateZ(40px) rotateZ(45deg) rotateX(-60deg);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: visible;
                }
                
                model-viewer, model-viewer:focus, model-viewer:focus-visible {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }

                model-viewer::part(default-progress-bar),
                model-viewer::part(default-progress-mask) {
                    display: none !important;
                }

                .iso-agent.selected {
                    filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.8));
                }

                .selection-ring {
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    border: 4px solid #06b6d4;
                    border-radius: 50%;
                    opacity: 0;
                    transform: translateZ(-10px) scale(0.8);
                    transition: all 0.3s ease;
                    pointer-events: none;
                }

                .iso-agent.selected .selection-ring {
                    opacity: 1;
                    transform: translateZ(-10px) scale(1.1);
                    animation: pulse-ring 2s infinite;
                }

                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(6, 182, 212, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
                }

                model-viewer {
                    width: 100%;
                    height: 100%;
                    --poster-color: transparent;
                    filter: drop-shadow(0px 20px 10px rgba(0,0,0,0.3));
                    pointer-events: none;
                }

                .agent-run {
                    /* Chỉ nâng nhẹ khi chạy - KHÔNG override position */
                    transform: translateZ(50px) rotateZ(45deg) rotateX(-60deg) !important;
                }

                #editor-content { opacity: 0; pointer-events: none; transition: opacity 0.5s, transform 0.5s; transform: translateY(20px); }
                #editor-content.active { opacity: 1; pointer-events: auto; transform: translateY(0); }

                .world-shifted {
                    transform: rotateX(60deg) rotateZ(-45deg) scale(0.45) translateX(550px) translateY(-280px);
                    opacity: 0.3;
                }

                .imported-content-wrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow-x: auto !important;
                }
                .imported-content-wrapper * {
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
                .imported-content-wrapper table {
                    display: block !important;
                    width: 100% !important;
                    overflow-x: auto !important;
                }
                .imported-content-wrapper img {
                    height: auto !important;
                }
            `}</style>
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
                onEdit={() => { startEditing(); closeContextMenu(); }}
                onAddNote={() => { setActiveFolderId(contextMenu.itemId); setIsNoteModalOpen(true); closeContextMenu(); }}

                onImportWord={() => { setImportTargetId(contextMenu.itemId || (contextMenu.parentId === null ? null : contextMenu.parentId)); setIsImportModalOpen(true); closeContextMenu(); }}
                onExport={() => { setExportTargetId(contextMenu.itemId); setIsExportModalOpen(true); closeContextMenu(); }}
                onToggleLock={isAuthenticated ? handleToggleLock : null}
                onToggleHide={isAuthenticated ? handleToggleHide : null}
                isLocked={contextMenu.itemType === 'doc' ? docs.find(d => d.id === contextMenu.itemId)?.isLocked : false}
                isHidden={contextMenu.itemType === 'doc' ? docs.find(d => d.id === contextMenu.itemId)?.isHidden : false}
                itemType={contextMenu.itemType}
                isRootFolder={contextMenu.parentId === null}
            />

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportWord={() => document.getElementById('import-word-input').click()}
                onImportHtmlFile={() => document.getElementById('import-html-input').click()}
                onImportHtmlCode={handleImportHtmlCode}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={(format) => { handleExport(format, exportTargetId); setIsExportModalOpen(false); }}
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
                initialColor={renameModal.color}
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

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex overflow-hidden relative px-8 pb-8 gap-6">
                {/* Sidebar (Folders) - Hides when not in docs zone */}
                <aside className={`
                    w-[240px] h-full flex flex-col py-6 px-3 z-20 glass-panel dark:bg-black/30 dark:border-white/10 rounded-[1.5rem] shadow-float shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 md:static
                    ${isFocusMode ? 'md:hidden' : ''}
                    ${isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0' : 'hidden md:flex'}
                `}>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 md:hidden"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="flex flex-col h-full">
                        {activeZone === 'docs' && (
                            <>
                                {/* Header Row */}
                                <div className="mb-4 px-3 flex items-center shrink-0">
                                    <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase truncate">Cấu trúc tài liệu</p>
                                    {/* Hidden Inputs */}
                                    <input
                                        type="file"
                                        id="import-word-input"
                                        hidden
                                        accept=".docx"
                                        onChange={handleImportWord}
                                    />
                                    <input
                                        type="file"
                                        id="import-html-input"
                                        hidden
                                        accept=".html,.htm"
                                        onChange={handleImportHtmlFile}
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-6">
                                    <nav className="space-y-1">
                                        {loading ? (
                                            <div className="space-y-2 animate-pulse mt-2">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="h-8 bg-white/40 dark:bg-white/5 rounded-lg w-full"></div>
                                                ))}
                                            </div>
                                        ) : isAuthenticated ? (
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                {renderFolderTree(null)}
                                            </DndContext>
                                        ) : (
                                            renderFolderTree(null)
                                        )}
                                    </nav>
                                </div>
                                {isAuthenticated && (
                                    <div className="mt-auto p-2 flex justify-center shrink-0">
                                        <button
                                            onClick={() => setIsFolderModalOpen(true)}
                                            className="w-full py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
                                            Thư mục mới
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {activeZone === 'tools' && (
                            <ToolsPanel />
                        )}
                        
                        {activeZone === 'gallery' && (
                            <GalleryPanel />
                        )}
                        
                        {activeZone === 'admin' && (
                            <AdminPanel activeSettingGroup={activeSettingGroup} />
                        )}
                    </div>
                </aside>

                <div className="flex h-full">
                    <CascadingNav
                        isOpen={isSecondaryPanelOpen && activeZone === 'docs'}
                        onClose={() => setIsSecondaryPanelOpen(false)}
                        items={filteredDocs}
                        folderName={activeFolderId ? folders.find(f => f.id === activeFolderId)?.title : 'Tài liệu'}
                        loading={loading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeDocId={activeDocId}
                        onDocClick={handleDocClick}
                        onContextMenu={openContextMenu}
                        isFocusMode={isFocusMode}
                        onAddNote={() => setIsNoteModalOpen(true)}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 relative overflow-hidden flex items-center justify-center">
                    
                    {/* THE 3D ISOMETRIC EMPTY STATE */}
                    <div id="isometric-view" 
                        className={`fixed top-0 bottom-0 right-0 z-0 flex items-center justify-center transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] left-0 ${!showEditor && isSecondaryPanelOpen ? 'md:left-[660px]' : ''} ${showEditor ? 'opacity-50' : ''}`}
                        onWheel={handleWheel}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                        <div style={{ 
                            transform: `translate(${cameraPos.tx}px, ${cameraPos.ty}px) scale(${cameraPos.scale})`,
                            transition: isDragging.current ? 'none' : (isTeleporting ? 'transform 1.2s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.1s ease-out'),
                            transformStyle: 'preserve-3d'
                        }}>
                            <div id="isometric-world" className="isometric-world w-[700px] h-[700px] relative pointer-events-auto">
                                
                                {/* Edit Mode Grid (Global - fixed position) */}
                                {isEditMode && (
                                    <div className="absolute top-[-500px] left-[-500px] w-[3000px] h-[3000px] pointer-events-none opacity-40 z-[-1]"
                                         style={{
                                             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(6, 182, 212, 0.4) 2px, transparent 2px)',
                                             backgroundSize: '100px 100px'
                                         }}>
                                    </div>
                                )}

                                {/* Global Click Ripples */}
                                {clickEffects.map(effect => (
                                    <div 
                                        key={effect.id} 
                                        className="absolute pointer-events-none rounded-full"
                                        style={{
                                            left: effect.x - 20,
                                            top: effect.y - 20,
                                            width: '40px',
                                            height: '40px',
                                            border: '3px solid #06b6d4',
                                            background: 'rgba(6, 182, 212, 0.2)',
                                            animation: 'floor-ripple 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                            transform: 'translateZ(1px)',
                                            zIndex: 10
                                        }}
                                    />
                                ))}

                                {/* ==== REGION 1: DOCS (Untouched Original) ==== */}
                                <div className={`absolute ${isEditMode && selectedZone === 'docs' ? 'ring-4 ring-cyan-500 shadow-2xl z-30' : ''}`} 
                                     style={{ 
                                         top: `${zonesTransform.docs.y}px`, 
                                         left: `${zonesTransform.docs.x}px`, 
                                         width: `${zonesTransform.docs.w}px`, 
                                         height: `${zonesTransform.docs.h}px`,
                                         transformStyle: 'preserve-3d' 
                                     }}>
                                    {/* Floor grid */}
                                    <div className={`iso-floor flex items-center justify-center cursor-pointer ${isEditMode && draggingZone === 'docs' ? 'opacity-80' : ''}`} 
                                         onPointerDown={(e) => handleFloorPointerDown(e, 'docs')}
                                         onClick={(e) => handleFloorClickGlobal(e, zonesTransform.docs.x, zonesTransform.docs.y, 'docs')}>
                                        <p className="text-cyan-700/30 font-display font-bold text-2xl transform rotate-90 -translate-x-12 opacity-50 pointer-events-none">KHU VỰC TÀI LIỆU</p>
                                    </div>
                                    
                                    {/* Resize Handles for selected zone */}
                                    {isEditMode && selectedZone === 'docs' && (
                                        <>
                                            <div className="zone-resize-handle handle-right" onPointerDown={(e) => handleResizePointerDown(e, 'docs', 'w')} />
                                            <div className="zone-resize-handle handle-bottom" onPointerDown={(e) => handleResizePointerDown(e, 'docs', 'h')} />
                                            <div className="zone-resize-handle handle-corner" onPointerDown={(e) => handleResizePointerDown(e, 'docs', 'se')} />
                                        </>
                                    )}
                                    


                                    {/* The Archive 3D Model */}
                                    <div 
                                        className={`iso-archive ${isEditMode && selectedMesh === 'archive' ? '!ring-4 !ring-cyan-500 !bg-cyan-500/10 !rounded-3xl' : ''}`}
                                        style={{
                                            left: `${modelsTransform.archive.x}px`,
                                            top: `${modelsTransform.archive.y}px`,
                                            transform: `translateZ(40px) rotateZ(${45 + modelsTransform.archive.rotation}deg) rotateX(-60deg) scale(${modelsTransform.archive.scale})`,
                                            pointerEvents: isEditMode ? 'auto' : 'none',
                                            cursor: isEditMode ? 'move' : 'default'
                                        }}
                                        onPointerDown={(e) => handleMeshPointerDown(e, 'archive')}
                                    >
                                        <model-viewer 
                                            src="/models/Meshy_AI_The_Lanterned_Archive_0414101610_texture.glb" 
                                            alt="3D Archive"
                                            disable-zoom="true"
                                            disable-tap="true"
                                            disable-pan="true"
                                            interaction-prompt="none"
                                            shadow-intensity="1">
                                        </model-viewer>
                                    </div>

                                    {/* The Bed 3D Model */}
                                    <div 
                                        className={`iso-bed ${isEditMode && selectedMesh === 'bed' ? '!ring-4 !ring-emerald-500 !bg-emerald-500/10 !rounded-3xl' : ''}`}
                                        style={{
                                            left: `${modelsTransform.bed.x}px`,
                                            top: `${modelsTransform.bed.y}px`,
                                            transform: `translateZ(20px) rotateZ(${45 + modelsTransform.bed.rotation}deg) rotateX(-60deg) scale(${modelsTransform.bed.scale})`,
                                            pointerEvents: isEditMode ? 'auto' : 'none',
                                            cursor: isEditMode ? 'move' : 'default'
                                        }}
                                        onPointerDown={(e) => handleMeshPointerDown(e, 'bed')}
                                    >
                                        <model-viewer 
                                            src="/models/Meshy_AI_shoddy_bed_0414162740_texture.glb" 
                                            alt="3D Bed"
                                            camera-orbit="135deg 55deg auto"
                                            field-of-view="10deg"
                                            disable-zoom="true"
                                            disable-tap="true"
                                            disable-pan="true"
                                            interaction-prompt="none"
                                            shadow-intensity="1">
                                        </model-viewer>
                                    </div>

                                    {/* The Cabinet 3D Model */}
                                    <div 
                                        className={`iso-cabinet ${isEditMode && selectedMesh === 'cabinet' ? '!ring-4 !ring-teal-500 !bg-teal-500/10 !rounded-xl' : ''}`}
                                        style={{
                                            left: `${modelsTransform.cabinet.x}px`,
                                            top: `${modelsTransform.cabinet.y}px`,
                                            transform: `translateZ(0px) scale(${modelsTransform.cabinet.scale})`,
                                            pointerEvents: isEditMode ? 'auto' : 'auto',
                                            cursor: isEditMode ? 'move' : 'default'
                                        }}
                                        onPointerDown={(e) => handleMeshPointerDown(e, 'cabinet')}
                                    >
                                        <div className="cab-face cab-front"><div className="cab-drawer"></div><div className="cab-drawer"></div><div className="cab-drawer"></div></div>
                                        <div className="cab-face cab-back"></div>
                                        <div className="cab-face cab-top"></div>
                                        <div className="cab-face cab-left"></div>
                                        <div className="cab-face cab-right"></div>
                                    </div>

                                </div>

                                {/* ==== REGION 2: TOOLS (Top Right) ==== */}
                                <div className={`absolute ${isEditMode && selectedZone === 'tools' ? 'ring-4 ring-emerald-500 shadow-2xl z-30' : ''}`} 
                                     style={{ 
                                         top: `${zonesTransform.tools.y}px`, 
                                         left: `${zonesTransform.tools.x}px`, 
                                         width: `${zonesTransform.tools.w}px`, 
                                         height: `${zonesTransform.tools.h}px`,
                                         transformStyle: 'preserve-3d' 
                                     }}>
                                    <div className={`iso-floor flex items-center justify-center cursor-pointer ${isEditMode && draggingZone === 'tools' ? 'opacity-80' : ''}`} 
                                         style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }} 
                                         onPointerDown={(e) => handleFloorPointerDown(e, 'tools')}
                                         onClick={(e) => handleFloorClickGlobal(e, zonesTransform.tools.x, zonesTransform.tools.y, 'tools')}>
                                        <p className="text-emerald-700/30 font-display font-bold text-2xl transform rotate-90 -translate-x-12 opacity-50 pointer-events-none">CÔNG CỤ & TIỆN ÍCH</p>
                                    </div>
                                    
                                    {/* Resize Handles */}
                                    {isEditMode && selectedZone === 'tools' && (
                                        <>
                                            <div className="zone-resize-handle handle-right" onPointerDown={(e) => handleResizePointerDown(e, 'tools', 'w')} />
                                            <div className="zone-resize-handle handle-bottom" onPointerDown={(e) => handleResizePointerDown(e, 'tools', 'h')} />
                                            <div className="zone-resize-handle handle-corner" onPointerDown={(e) => handleResizePointerDown(e, 'tools', 'se')} />
                                        </>
                                    )}

                                    {/* The Tools Model */}
                                    <div className={`absolute w-[350px] h-[350px] ${isEditMode && selectedMesh === 'tools' ? 'ring-4 ring-amber-500 bg-amber-500/10 rounded-3xl' : ''}`}
                                         style={{ 
                                             left: `${modelsTransform.tools.x}px`,
                                             top: `${modelsTransform.tools.y}px`,
                                             transform: `translateZ(40px) rotateZ(${45 + modelsTransform.tools.rotation}deg) rotateX(-60deg) scale(${modelsTransform.tools.scale})`,
                                             pointerEvents: isEditMode ? 'auto' : 'none',
                                             cursor: isEditMode ? 'move' : 'default'
                                         }}
                                         onPointerDown={(e) => handleMeshPointerDown(e, 'tools')}
                                    >
                                        <model-viewer 
                                            src="/models/LoRen.glb" 
                                            alt="3D Tools"
                                            disable-zoom="true"
                                            disable-tap="true"
                                            disable-pan="true"
                                            interaction-prompt="none"
                                            shadow-intensity="1"
                                            camera-orbit="auto auto auto"
                                            autoplay="true"
                                            style={{ width: '100%', height: '100%', filter: 'drop-shadow(0px 20px 10px rgba(0,0,0,0.5))' }}>
                                        </model-viewer>
                                    </div>
                                </div>

                                {/* ==== REGION 3: GALLERY (Bottom Left) ==== */}
                                <div className={`absolute ${isEditMode && selectedZone === 'gallery' ? 'ring-4 ring-purple-500 shadow-2xl z-30' : ''}`} 
                                     style={{ 
                                         top: `${zonesTransform.gallery.y}px`, 
                                         left: `${zonesTransform.gallery.x}px`, 
                                         width: `${zonesTransform.gallery.w}px`, 
                                         height: `${zonesTransform.gallery.h}px`,
                                         transformStyle: 'preserve-3d' 
                                     }}>
                                    <div className={`iso-floor flex items-center justify-center cursor-pointer ${isEditMode && draggingZone === 'gallery' ? 'opacity-80' : ''}`} 
                                         style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.3)' }} 
                                         onPointerDown={(e) => handleFloorPointerDown(e, 'gallery')}
                                         onClick={(e) => handleFloorClickGlobal(e, zonesTransform.gallery.x, zonesTransform.gallery.y, 'gallery')}>
                                        <p className="text-purple-700/30 font-display font-bold text-2xl transform rotate-90 -translate-x-12 opacity-50 pointer-events-none">THƯ VIỆN HÌNH ẢNH</p>
                                    </div>
                                    
                                    {/* Resize Handles */}
                                    {isEditMode && selectedZone === 'gallery' && (
                                        <>
                                            <div className="zone-resize-handle handle-right" onPointerDown={(e) => handleResizePointerDown(e, 'gallery', 'w')} />
                                            <div className="zone-resize-handle handle-bottom" onPointerDown={(e) => handleResizePointerDown(e, 'gallery', 'h')} />
                                            <div className="zone-resize-handle handle-corner" onPointerDown={(e) => handleResizePointerDown(e, 'gallery', 'se')} />
                                        </>
                                    )}
                                    
                                    <div className="absolute top-[50%] left-[50%] w-[120px] h-[120px] flex items-center justify-center" style={{ transform: 'translate(-50%, -50%) translateZ(20px) rotateZ(45deg) rotateX(-60deg)' }}>
                                        <span className="material-symbols-outlined text-6xl animate-bounce" style={{ color: 'rgba(192, 132, 252, 0.9)', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))' }}>imagesmode</span>
                                    </div>
                                </div>

                                {/* ==== REGION 4: ADMIN (Bottom Right) ==== */}
                                <div className={`absolute ${isEditMode && selectedZone === 'admin' ? 'ring-4 ring-amber-500 shadow-2xl z-30' : ''}`} 
                                     style={{ 
                                         top: `${zonesTransform.admin.y}px`, 
                                         left: `${zonesTransform.admin.x}px`, 
                                         width: `${zonesTransform.admin.w}px`, 
                                         height: `${zonesTransform.admin.h}px`,
                                         transformStyle: 'preserve-3d' 
                                     }}>
                                    <div className={`iso-floor flex items-center justify-center cursor-pointer ${isEditMode && draggingZone === 'admin' ? 'opacity-80' : ''}`} 
                                         style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.3)' }} 
                                         onPointerDown={(e) => handleFloorPointerDown(e, 'admin')}
                                         onClick={(e) => handleFloorClickGlobal(e, zonesTransform.admin.x, zonesTransform.admin.y, 'admin')}>
                                        <p className="text-amber-700/30 font-display font-bold text-2xl transform rotate-90 -translate-x-12 opacity-50 pointer-events-none">QUẢN TRỊ HỆ THỐNG</p>
                                    </div>
                                    
                                    {/* Resize Handles */}
                                    {isEditMode && selectedZone === 'admin' && (
                                        <>
                                            <div className="zone-resize-handle handle-right" onPointerDown={(e) => handleResizePointerDown(e, 'admin', 'w')} />
                                            <div className="zone-resize-handle handle-bottom" onPointerDown={(e) => handleResizePointerDown(e, 'admin', 'h')} />
                                            <div className="zone-resize-handle handle-corner" onPointerDown={(e) => handleResizePointerDown(e, 'admin', 'se')} />
                                        </>
                                    )}
                                    
                                    {/* 3 Interactive Setting Objects */}
                                    
                                    {/* Profile Shortcut */}
                                    <div className="absolute top-[30%] left-[30%] w-[100px] h-[100px] flex items-center justify-center cursor-pointer hover:-translate-y-4 transition-transform duration-300" 
                                         style={{ transform: 'translate(-50%, -50%) translateZ(40px) rotateZ(45deg) rotateX(-60deg)' }}
                                         onClick={(e) => handleSettingObjectClick(e, 'profile', 800 + 240, 800 + 240)}>
                                        <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-tr from-pink-500/80 to-rose-400/80 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-[0_10px_20px_rgba(244,63,94,0.4)] relative">
                                             <span className="material-symbols-outlined text-4xl text-white">person</span>
                                             <div className="absolute -bottom-6 w-[60px] h-2 bg-black/40 blur-md rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                                        </div>
                                    </div>

                                    {/* Theme Shortcut */}
                                    <div className="absolute top-[60%] left-[30%] w-[100px] h-[100px] flex items-center justify-center cursor-pointer hover:-translate-y-4 transition-transform duration-300" 
                                         style={{ transform: 'translate(-50%, -50%) translateZ(40px) rotateZ(45deg) rotateX(-60deg)' }}
                                         onClick={(e) => handleSettingObjectClick(e, 'theme', 800 + 240, 800 + 480)}>
                                        <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-tr from-purple-500/80 to-indigo-400/80 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-[0_10px_20px_rgba(168,85,247,0.4)] relative">
                                             <span className="material-symbols-outlined text-4xl text-white">palette</span>
                                             <div className="absolute -bottom-6 w-[60px] h-2 bg-black/40 blur-md rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                                        </div>
                                    </div>

                                    {/* Edit Space Shortcut */}
                                    <div className="absolute top-[45%] left-[60%] w-[100px] h-[100px] flex items-center justify-center cursor-pointer hover:-translate-y-4 transition-transform duration-300" 
                                         style={{ transform: 'translate(-50%, -50%) translateZ(40px) rotateZ(45deg) rotateX(-60deg)' }}
                                         onClick={(e) => handleSettingObjectClick(e, 'security', 800 + 480, 800 + 360)}>
                                        <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-tr from-cyan-500/80 to-blue-400/80 backdrop-blur flex items-center justify-center border-2 border-white/20 shadow-[0_10px_20px_rgba(6,182,212,0.4)] relative">
                                             <span className="material-symbols-outlined text-4xl text-white">security</span>
                                             <div className="absolute -bottom-6 w-[60px] h-2 bg-black/40 blur-md rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                                        </div>
                                    </div>

                                </div>

                                {/* ==== THE RUNNING AGENT (Hoisted to global map coordinates) ==== */}
                                <div 
                                    id="chibi-agent" 
                                    className={`iso-agent ${isAgentSelected ? 'selected' : ''} cursor-pointer`}
                                    style={{ 
                                        left: agentPos.left, 
                                        top: agentPos.top, 
                                        position: 'absolute',
                                        willChange: 'left, top',
                                        opacity: isTeleporting ? 0 : 1,
                                        transition: isTeleporting 
                                            ? 'opacity 0.4s ease-in-out' 
                                            : 'left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-in-out'
                                    }}
                                    onTransitionEnd={(e) => {
                                        // Khi CSS transition kết thúc (agent đã đến đích), đổi về Walking
                                        if (e.propertyName === 'left' && modelViewerRef.current) {
                                            modelViewerRef.current.setAttribute('src', '/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Walking_withSkin.glb');
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAgentSelected(!isAgentSelected);
                                    }}
                                >
                                    <model-viewer 
                                        ref={modelViewerRef}
                                        src="/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Walking_withSkin.glb"
                                        alt="3D AI Agent"
                                        camera-orbit={`${agentFacingAngle}deg 90deg auto`}
                                        min-camera-orbit={`${agentFacingAngle}deg 90deg auto`}
                                        max-camera-orbit={`${agentFacingAngle}deg 90deg auto`}
                                        disable-zoom="true"
                                        disable-tap="true"
                                        disable-pan="true"
                                        interaction-prompt="none"
                                        shadow-intensity="1"
                                        autoplay="true">
                                    </model-viewer>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* World Editor Panel */}
                    {isEditMode && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-2xl p-4 z-50 flex flex-col md:flex-row items-center gap-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col mr-2">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-widest uppercase mb-1">World Editor</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Kéo thả object, nhập thông số.</p>
                            </div>

                            {selectedMesh ? (
                                <div className="flex gap-4 items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">X</label>
                                        <input type="number" 
                                            value={Math.round(modelsTransform[selectedMesh].x)} 
                                            onChange={(e) => setModelsTransform(p => ({...p, [selectedMesh]: {...p[selectedMesh], x: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Y</label>
                                        <input type="number" 
                                            value={Math.round(modelsTransform[selectedMesh].y)} 
                                            onChange={(e) => setModelsTransform(p => ({...p, [selectedMesh]: {...p[selectedMesh], y: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Rot (°)</label>
                                        <input type="number" 
                                            value={modelsTransform[selectedMesh].rotation} 
                                            onChange={(e) => setModelsTransform(p => ({...p, [selectedMesh]: {...p[selectedMesh], rotation: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Scale</label>
                                        <input type="number" step="0.1" 
                                            value={modelsTransform[selectedMesh].scale} 
                                            onChange={(e) => setModelsTransform(p => ({...p, [selectedMesh]: {...p[selectedMesh], scale: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <button onClick={() => setSelectedMesh(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ) : selectedZone ? (
                                <div className="flex gap-4 items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Zone X</label>
                                        <input type="number" 
                                            value={zonesTransform[selectedZone].x} 
                                            onChange={(e) => setZonesTransform(p => ({...p, [selectedZone]: {...p[selectedZone], x: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Zone Y</label>
                                        <input type="number" 
                                            value={zonesTransform[selectedZone].y} 
                                            onChange={(e) => setZonesTransform(p => ({...p, [selectedZone]: {...p[selectedZone], y: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Width</label>
                                        <input type="number" 
                                            value={zonesTransform[selectedZone].w} 
                                            onChange={(e) => setZonesTransform(p => ({...p, [selectedZone]: {...p[selectedZone], w: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none dark:text-slate-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Height</label>
                                        <input type="number" 
                                            value={zonesTransform[selectedZone].h} 
                                            onChange={(e) => setZonesTransform(p => ({...p, [selectedZone]: {...p[selectedZone], h: Number(e.target.value)}}))}
                                            className="w-16 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none dark:text-slate-200" />
                                    </div>
                                    <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-400 italic md:w-[320px] text-center">Chọn Model hoặc Vùng (Sàn) để chỉnh sửa...</div>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <button onClick={() => { setIsEditMode(false); setSelectedMesh(null); setSelectedZone(null); }} className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                                    Hủy
                                </button>
                                <button onClick={async () => {
                                    setIsEditMode(false);
                                    const result = await updateWorldConfig({ modelsTransform, zonesTransform });
                                    if (result.error) {
                                        showToast('Lỗi lưu Supabase: ' + (result.error.message || 'Xem Console'));
                                    } else {
                                        showToast('Đã lưu cấu hình không gian!');
                                    }
                                }} className="px-4 py-2 text-xs font-bold bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg shadow-cyan-500/30 transition whitespace-nowrap">
                                    Lưu Thay Đổi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ACTUAL EDITOR CONTENT */}
                    <article id="editor-content" className={`max-w-5xl w-full mx-auto p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-none relative z-20 overflow-y-auto h-full border border-white/60 dark:border-white/5 bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-[#131b19]/90 dark:to-[#0f1412]/95 backdrop-blur-3xl flex flex-col transition-colors duration-500 delay-100 ${showEditor ? 'active' : ''}`}>
                        
                        {/* Header actions */}
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="inline-block px-3 py-1 rounded-full bg-cyan-100/80 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-[0.65rem] font-bold tracking-widest uppercase border border-cyan-200 dark:border-cyan-800/50">
                                Documentation
                            </div>
                            <div className="flex items-center gap-3">
                                {isAuthenticated && activeDoc && isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                            className="px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-all"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                                            className="px-4 py-1.5 rounded-full bg-cyan-600 text-white text-xs font-bold shadow-md hover:bg-cyan-500 transition-all"
                                        >
                                            Lưu
                                        </button>
                                    </>
                                ) : activeDoc && (
                                    <button
                                        type="button"
                                        onClick={() => { setExportTargetId(activeDoc.id); setIsExportModalOpen(true); }}
                                        className="px-4 py-1.5 rounded-full bg-slate-200/50 hover:bg-slate-300 text-slate-600 text-xs font-bold transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">ios_share</span> Export
                                    </button>
                                )}
                                {isAuthenticated && activeDoc && !isEditing && (
                                    <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-300 text-slate-600 transition-colors"
                                        onClick={(e) => openContextMenu(e, activeDoc.id, 'doc', activeDoc.parentId)}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                    </button>
                                )}
                                <button onClick={handleCloseDoc} className="px-4 py-1.5 rounded-full bg-slate-200/50 hover:bg-slate-300 text-slate-600 text-xs font-bold transition-colors ml-2">
                                    Đóng tài liệu
                                </button>
                            </div>
                        </div>
                        
                        {/* Document Content */}
                        {activeDoc ? (
                            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                {activeDoc.isLocked && !isAuthenticated ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-6">
                                            <span className="material-symbols-outlined text-4xl text-amber-500">lock</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#1d2624] dark:text-white mb-2">Tài liệu được bảo vệ</h2>
                                        <p className="text-[#1d2624]/60 dark:text-white/60 mb-6 max-w-md">
                                            Tài liệu này yêu cầu đăng nhập để xem nội dung. Vui lòng đăng nhập để truy cập.
                                        </p>
                                        <button
                                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg"
                                            onClick={() => navigate('/login')}
                                        >
                                            Đăng nhập
                                        </button>
                                    </div>
                                ) : isEditing ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-2">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="font-display text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300 w-full"
                                            placeholder="Tiêu đề"
                                        />
                                        <div className="h-px w-full bg-gradient-to-r from-cyan-200 via-emerald-100 to-transparent mb-8"></div>
                                        <RichTextEditor
                                            content={editContent}
                                            onChange={setEditContent}
                                            placeholder="Viết nội dung ở đây..."
                                            attachments={editAttachments}
                                            onAttachmentAdd={(attachment) => setEditAttachments(prev => [...prev, attachment])}
                                            onAttachmentRemove={(id) => setEditAttachments(prev => prev.filter(a => a.id !== id))}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-2">
                                        <h1 id="doc-title" className="font-display text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-teal-500 dark:from-cyan-400 dark:via-teal-300 dark:to-cyan-200 mb-4 tracking-tight drop-shadow-sm">{activeDoc.title}</h1>
                                        <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 dark:from-cyan-500 dark:to-teal-400 mb-8 shadow-sm"></div>
                                        
                                        {activeDoc.content === undefined ? (
                                            <div className="animate-pulse space-y-4 mt-8">
                                                <div className="h-4 bg-slate-200/60 dark:bg-white/10 rounded w-3/4"></div>
                                                <div className="h-4 bg-slate-200/60 dark:bg-white/10 rounded w-full"></div>
                                                <div className="h-4 bg-slate-200/60 dark:bg-white/10 rounded w-5/6"></div>
                                            </div>
                                        ) : (
                                            <div
                                                className="prose prose-slate prose-lg max-w-none text-slate-600 dark:text-slate-300
                                                prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-800 dark:prose-headings:text-slate-100
                                                prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200/60 dark:prose-h2:border-slate-700/60
                                                prose-p:leading-relaxed prose-p:mb-5 
                                                prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-700 dark:hover:prose-a:text-cyan-300
                                                prose-strong:font-bold prose-strong:text-slate-800 dark:prose-strong:text-slate-100
                                                prose-code:text-cyan-700 dark:prose-code:text-cyan-300 prose-code:bg-cyan-50/80 dark:prose-code:bg-cyan-950/40 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                                                prose-pre:bg-slate-800/95 dark:prose-pre:bg-black/60 prose-pre:backdrop-blur-2xl prose-pre:border prose-pre:border-slate-700 dark:prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-2xl prose-pre:text-slate-50
                                                prose-blockquote:border-l-4 prose-blockquote:border-cyan-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-cyan-50/50 dark:prose-blockquote:from-cyan-900/20 prose-blockquote:to-transparent prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:font-medium
                                                prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-slate-100 dark:prose-img:border-white/10
                                                prose-ul:list-disc prose-ul:pl-6 prose-ul:marker:text-cyan-400
                                                prose-ol:list-decimal prose-ol:pl-6 prose-ol:marker:text-cyan-600 dark:prose-ol:marker:text-cyan-400 prose-ol:marker:font-semibold
                                                prose-hr:border-slate-200/60 dark:prose-hr:border-slate-700/60
                                                imported-content-wrapper transition-colors duration-500 delay-100"
                                                dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                                            />
                                        )}

                                        {activeDoc.attachments && activeDoc.attachments.length > 0 && (
                                            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                                    Đính kèm ({activeDoc.attachments.length})
                                                </h4>
                                                <div className="grid gap-2">
                                                    {activeDoc.attachments.map((attachment) => (
                                                        <a
                                                            key={attachment.id}
                                                            href={attachment.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 group"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px] text-cyan-600 shrink-0">description</span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-slate-700 truncate">{attachment.name}</p>
                                                                <p className="text-xs text-slate-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <p>Select a note to view or create a new one.</p>
                            </div>
                        )}
                    </article>
                </main>
            </div>
        </>
    );
};

export default Docs;
// force vite reload