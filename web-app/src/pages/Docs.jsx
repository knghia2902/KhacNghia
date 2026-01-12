import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// --- Initial Data (Seed) ---
const SEED_FOLDERS = [
    { id: 'folder-favorites', title: 'Favorites', icon: 'star', iconColor: 'text-primary', parentId: null },
    { id: 'folder-projects', title: 'Projects', icon: 'folder', iconColor: 'text-secondary', parentId: null },
    { id: 'folder-personal', title: 'Personal', icon: 'folder', iconColor: 'text-gray-400', parentId: null }
];

const SEED_DOCS = [
    {
        id: 'doc-zen',
        parentId: 'folder-favorites',
        title: 'Zen Workspace Guide',
        date: '2m ago',
        tags: ['Guide', 'Zen'],
        bg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpKXDKChxqUovbkTSPfoSPbbFMA-n0w5_gdW5x-0yx3ZBWs0nD1JFWI-6HFeEuCGrgbGPkrt8NpTfFcSCzJwOLUQMN5nDZArcfIJoVgyeXh15nbQguX_E2wtn0vVm0Dc15OChBD_P4Scwa5OQ3alHmrE3wSPjPsCU36kDFQiPMvo6WtLm0Ltear1ksNwD4C1SWiRYt-8FHbc2PH8OB6X8PsNzyxM9s7CSAuh8yfHU2tnQ0gGY7BwRMyqn292UbmSB4hEY0N6xMtiwN',
        content: `
            <p class="lead">This document outlines the fundamental design language for Khắc Nghĩa workspace, ensuring consistent visual storytelling across all digital touchpoints.</p>
            <h2>1. Core Philosophy</h2>
            <p>Minimalism isn't about the absence of content, but the presence of focus. In a data-rich environment, we prioritize information hierarchy using generous whitespace and subtle elevation. Our goal is to reduce cognitive load while providing all necessary tools for complex document management.</p>
            <h2>2. The Zen Immersive Style</h2>
            <p>The immersive style uses frosted glass (glassmorphism) as a metaphor for clarity. Backgrounds should feel expansive, utilizing soft gradients that reflect a calming natural environment. Every interaction should feel tactile and weighted, yet fluid.</p>
            <div class="callout">
                <h4>Key Takeaway</h4>
                <p>Functionality follows serenity. If a feature disrupts the visual calm, it must be reimagined or tucked away behind thoughtful progressive disclosure.</p>
            </div>
            <h2>3. Content Structuring</h2>
            <p>Document hierarchy should follow a logical flow:</p>
            <ul>
                <li><strong>H1</strong> for primary topics only.</li>
                <li><strong>H2-H3</strong> for sectional breakdowns.</li>
                <li><strong>Callouts</strong> for mission-critical observations.</li>
            </ul>
        `
    },
    {
        id: 'doc-brand',
        parentId: 'folder-favorites',
        title: 'Brand Guidelines',
        date: '1d ago',
        tags: ['Design', 'Brand'],
        bg: 'https://images.unsplash.com/photo-1626785774573-4b79931bfd95?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Our brand identity is rooted in simplicity and elegance. This guide ensures that our visual communication remains consistent across all channels.</p>
            <h2>1. Logo Usage</h2>
            <p>The logo should always be used with sufficient clear space. Do not distort, colorize, or rotate the logo in unauthorized ways.</p>
            <h2>2. Color Palette</h2>
            <p>Our primary palette consists of soothing pastels and deep, grounding neutrals. These colors work together to create a sense of balance and harmony.</p>
            <ul>
                <li><strong>Mint Soft</strong>: Represents growth and calm.</li>
                <li><strong>Peach Soft</strong>: Adds warmth and humanity.</li>
            </ul>
        `
    },
    {
        id: 'doc-roadmap',
        parentId: 'folder-projects',
        title: 'Q1 Roadmap 2026',
        date: '5h ago',
        tags: ['Planning'],
        bg: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Focus for Q1 is stabilization and performance optimization of the core platform.</p>
            <h2>January: Foundation</h2>
            <p>Complete the core architecture migration and ensure 99.9% uptime for the new API services.</p>
            <h2>February: Features</h2>
            <p>Roll out the new "Zen Mode" dashboard to beta testers. Collect feedback and iterate on visual density.</p>
            <h2>March: Scale</h2>
            <p>Open public registration and launch the marketing campaign "Find Your Focus".</p>
        `
    },
    {
        id: 'doc-meeting',
        parentId: 'folder-projects',
        title: 'Sprint Retro Q4',
        date: 'Oct 24',
        tags: ['Agile'],
        bg: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Reviewing the major milestones achieved during the Zen launch phase.</p>
            <h2>What went well</h2>
            <ul>
                <li>Team velocity increased by 15%.</li>
                <li>Design system adoption reached 100%.</li>
            </ul>
            <h2>What can improve</h2>
            <p>QA turnaround time was slower than expected due to device fragmentation.</p>
        `
    },
    {
        id: 'doc-ideas',
        parentId: 'folder-personal',
        title: 'App Ideas',
        date: '1w ago',
        tags: ['Draft'],
        bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070',
        content: `
            <p class="lead">Rough sketches and sticky notes for future modules.</p>
            <h2>1. Focus Timer</h2>
            <p>A simple Pomodoro timer integrated directly into the sidebar.</p>
            <h2>2. Ambient Sound</h2>
            <p>Background noise generator (rain, cafe, forest) to boost concentration.</p>
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
const ContextMenu = ({ isOpen, position, onClose, onRename, onDelete, onDuplicate, onAddSubfolder, itemType }) => {
    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = () => onClose();
            setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const menuItems = [
        { icon: 'edit', label: 'Đổi tên', action: onRename },
        { icon: 'content_copy', label: 'Sao chép', action: onDuplicate },
        { icon: 'delete', label: 'Xóa', action: onDelete, danger: true },
    ];

    if (itemType === 'folder' && onAddSubfolder) {
        menuItems.splice(1, 0, { icon: 'create_new_folder', label: 'Thêm folder con', action: onAddSubfolder });
    }

    return (
        <div
            className="fixed z-[100] min-w-48 py-2 bg-white/95 dark:bg-[#1d2624]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-[#1d2624]/10 animate-[fadeIn_0.15s_ease-out]"
            style={{ top: position.y, left: position.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1d2624]/40 border-b border-[#1d2624]/5 mb-1">
                {itemType === 'folder' ? 'Folder' : 'Trang'}
            </div>
            {menuItems.map((item, idx) => (
                <button
                    key={idx}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-[#1d2624]/5'}`}
                >
                    <span className={`material-symbols-outlined text-[18px] ${item.danger ? 'text-red-400' : 'text-[#1d2624]/50'}`}>{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
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
    const [renameModal, setRenameModal] = useState({ isOpen: false, itemId: null, itemType: null, name: '', icon: '' });

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
        const { itemId, itemType } = contextMenu;
        try {
            if (itemType === 'folder') {
                const folderDocs = docs.filter(d => d.parentId === itemId);
                if (folderDocs.length > 0) {
                    alert("Vui lòng xóa hết tài liệu trong folder trước.");
                    closeContextMenu();
                    return;
                }
                const folder = folders.find(f => f.id === itemId);
                if (window.confirm(`Xóa folder "${folder?.title}"?`)) {
                    const { error } = await supabase.from('folders').delete().eq('id', itemId);
                    if (error) throw error;
                    setFolders(folders.filter(f => f.id !== itemId));
                    if (activeFolderId === itemId) setActiveFolderId(folders[0]?.id || null);
                    showToast(`Đã xóa folder "${folder?.title}"`);
                }
            } else {
                const doc = docs.find(d => d.id === itemId);
                if (window.confirm(`Xóa trang "${doc?.title}"?`)) {
                    const { error } = await supabase.from('docs').delete().eq('id', itemId);
                    if (error) throw error;
                    setDocs(docs.filter(d => d.id !== itemId));
                    if (activeDocId === itemId) setActiveDocId(null);
                    showToast(`Đã xóa "${doc?.title}"`);
                }
            }
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Lỗi khi xóa');
        }
        closeContextMenu();
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
            const { error } = await supabase
                .from('docs')
                .update({ title: editTitle, content: editContent, date: 'Edited now' })
                .eq('id', activeDocId);

            if (error) throw error;

            const updatedDocs = docs.map(d =>
                d.id === activeDocId
                    ? { ...d, title: editTitle, content: editContent, date: 'Edited now' }
                    : d
            );
            setDocs(updatedDocs);
            setIsEditing(false);
            showToast('Changes saved successfully!');
        } catch (error) {
            console.error('Error saving doc:', error);
            showToast('Lỗi khi lưu');
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    const handleDeleteDoc = async () => {
        if (!isAuthenticated || !activeDoc) return;
        if (window.confirm(`Delete "${activeDoc.title}"?`)) {
            try {
                const docTitle = activeDoc.title;
                const { error } = await supabase.from('docs').delete().eq('id', activeDocId);
                if (error) throw error;

                const newDocs = docs.filter(d => d.id !== activeDocId);
                setDocs(newDocs);
                setActiveDocId(null);
                setIsEditing(false);
                showToast(`Note "${docTitle}" deleted.`);
            } catch (error) {
                console.error('Error deleting doc:', error);
                showToast('Lỗi khi xóa');
            }
        }
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
        const currentDocs = docs.filter(d => d.parentId === parentId);

        return (
            <div className="space-y-0.5" key={parentId || 'root'}>
                {currentFolders.map(folder => {
                    const isExpanded = expandedFolders.includes(folder.id);
                    return (
                        <div key={folder.id} className="select-none">
                            <div className="group relative flex items-center min-w-0 overflow-hidden">
                                <div style={{ width: `${depth * 12}px` }} className="shrink-0" />
                                <button
                                    onClick={(e) => toggleFolderExpand(folder.id, e)}
                                    className="size-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors shrink-0"
                                >
                                    <span className={`material-symbols-outlined text-[14px] text-[#1d2624]/40 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                        expand_more
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleFolderClick(folder.id)}
                                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-left transition-colors min-w-0 w-full overflow-hidden ${activeFolderId === folder.id ? 'bg-white/30 text-[#1d2624]' : 'hover:bg-white/15 text-[#1d2624]/70'}`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${folder.iconColor} shrink-0`}>{folder.icon}</span>
                                    <span className="flex-1 truncate block min-w-0">{folder.title}</span>
                                    {isAuthenticated && (
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
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
                            {isExpanded && (
                                <div className="mt-0.5">
                                    {renderFolderTree(folder.id, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
                {currentDocs.map(doc => (
                    <div key={doc.id} className="group/doc relative flex items-center min-w-0 overflow-hidden">
                        <div style={{ width: `${depth * 12 + 24}px` }} className="shrink-0" />
                        <button
                            onClick={() => { setActiveDocId(doc.id); }}
                            className={`flex-1 flex items-center gap-2 px-2 py-1.2 rounded-lg text-sm text-left transition-colors min-w-0 w-full overflow-hidden ${activeDocId === doc.id ? 'bg-white/30 text-[#1d2624] font-medium' : 'hover:bg-white/15 text-[#1d2624]/60'}`}
                        >
                            <span className="material-symbols-outlined text-[16px] text-amber-600/70 shrink-0">{doc.icon || 'description'}</span>
                            <span className="flex-1 truncate block min-w-0">{doc.title}</span>
                            {isAuthenticated && (
                                <span
                                    onClick={(e) => openContextMenu(e, doc.id, 'doc')}
                                    className="material-symbols-outlined text-[14px] opacity-0 group-hover/doc:opacity-100 hover:text-[#1d2624] cursor-pointer"
                                    title="Tùy chọn"
                                >more_horiz</span>
                            )}
                        </button>
                    </div>
                ))}
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
                        <>
                            <button
                                onClick={() => setIsFolderModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#1d2624]/20 text-sm font-medium hover:bg-white/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                                New Folder
                            </button>
                            <button
                                onClick={handleResetWorkspace}
                                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/30 hover:text-red-500 transition-colors"
                                title="Reset to default data"
                            >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                Reset Workspace
                            </button>
                        </>
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
                                        <button onClick={cancelEdit} className="px-4 py-1.5 rounded-lg text-sm font-bold text-[#1d2624]/60 hover:bg-white/20 transition-colors">Cancel</button>
                                        <button onClick={saveEdit} className="px-4 py-1.5 rounded-lg bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] text-sm font-bold shadow-md hover:scale-105 transition-all">Save Changes</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleDeleteDoc} className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all text-[#1d2624]/60 hover:text-red-500" title="Delete">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                        <button onClick={startEditing} className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all text-[#1d2624]/60 hover:text-primary-dark" title="Edit">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        <button className="size-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/20 hover:bg-white/80 transition-all">
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
