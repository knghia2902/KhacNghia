import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Initial Data (Seed) ---
const SEED_FOLDERS = [
    { id: 'folder-favorites', title: 'Favorites', icon: 'star', iconColor: 'text-primary' },
    { id: 'folder-projects', title: 'Projects', icon: 'folder', iconColor: 'text-secondary' },
    { id: 'folder-personal', title: 'Personal', icon: 'folder', iconColor: 'text-gray-400' }
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

const Docs = () => {
    const { isAuthenticated } = useAuth();

    // --- State ---
    const [folders, setFolders] = useState(() => {
        const saved = localStorage.getItem('zen_folders');
        return saved ? JSON.parse(saved) : SEED_FOLDERS;
    });

    const [docs, setDocs] = useState(() => {
        const saved = localStorage.getItem('zen_docs');
        return saved ? JSON.parse(saved) : SEED_DOCS;
    });

    const [activeFolderId, setActiveFolderId] = useState('folder-favorites'); // Default folder
    const [activeDocId, setActiveDocId] = useState(null); // Initially no doc selected
    const [filterMode, setFilterMode] = useState('folder'); // 'folder' | 'doc'
    const [searchQuery, setSearchQuery] = useState('');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem('zen_folders', JSON.stringify(folders));
    }, [folders]);

    useEffect(() => {
        localStorage.setItem('zen_docs', JSON.stringify(docs));
    }, [docs]);

    // Set initial active doc when folder changes or on load
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
        setFilterMode('folder');
        setSearchQuery('');
        setIsEditing(false);
    };

    const handleDocClick = (docId) => {
        setActiveDocId(docId);
        setFilterMode('doc');
        setIsEditing(false);
    };

    const handleCreateFolder = () => {
        if (!isAuthenticated) return;
        const name = prompt("Enter folder name:");
        if (name) {
            const newFolder = {
                id: `folder-${Date.now()}`,
                title: name,
                icon: 'folder',
                iconColor: 'text-gray-400'
            };
            setFolders([...folders, newFolder]);
            setActiveFolderId(newFolder.id);
        }
    };

    const handleCreateDoc = () => {
        if (!isAuthenticated) return;
        const title = prompt("Enter note title:");
        if (title) {
            const newDoc = {
                id: `doc-${Date.now()}`,
                parentId: activeFolderId,
                title: title,
                date: 'Just now',
                tags: ['New'],
                bg: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=2070',
                content: '<p class="lead">Start writing your thoughts here...</p>'
            };
            setDocs([...docs, newDoc]);
            setActiveDocId(newDoc.id);
            setEditTitle(newDoc.title);
            setEditContent(newDoc.content);
            setIsEditing(true);
        }
    };

    const startEditing = () => {
        if (!activeDoc) return;
        setEditTitle(activeDoc.title);
        setEditContent(activeDoc.content);
        setIsEditing(true);
    };

    const saveEdit = () => {
        if (!activeDoc) return;
        const updatedDocs = docs.map(d =>
            d.id === activeDocId
                ? { ...d, title: editTitle, content: editContent, date: 'Edited now' }
                : d
        );
        setDocs(updatedDocs);
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    const handleDeleteDoc = () => {
        if (!isAuthenticated || !activeDoc) return;
        if (window.confirm(`Delete "${activeDoc.title}"?`)) {
            const newDocs = docs.filter(d => d.id !== activeDocId);
            setDocs(newDocs);
            setActiveDocId(null);
            setIsEditing(false);
        }
    };

    const handleDeleteFolder = (folderId, e) => {
        e.stopPropagation();
        if (!isAuthenticated) return;
        const folderDocs = docs.filter(d => d.parentId === folderId);
        if (folderDocs.length > 0) {
            alert("Please delete all documents in this folder first.");
            return;
        }
        if (window.confirm("Delete this folder?")) {
            const newFolders = folders.filter(f => f.id !== folderId);
            setFolders(newFolders);
            if (activeFolderId === folderId) {
                setActiveFolderId(newFolders[0]?.id || null);
            }
        }
    };

    return (
        <>
            <aside className="w-64 border-r border-white/20 dark:border-white/5 flex flex-col shrink-0 transition-width duration-300 md:w-64 hidden md:flex" id="sidebar-folders">
                <div className="p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/40 dark:text-white/30 mb-6 px-2">Workspace</h3>
                    <nav className="space-y-2">
                        {folders.map(folder => (
                            <div key={folder.id} className="group relative">
                                <button
                                    onClick={() => handleFolderClick(folder.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-colors ${activeFolderId === folder.id ? 'bg-white/40 dark:bg-white/5 text-[#1d2624] dark:text-white shadow-sm' : 'hover:bg-white/20 text-[#1d2624]/60 dark:text-white/60'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${folder.iconColor} ${activeFolderId === folder.id ? 'font-variation-settings-fill' : ''}`}>{folder.icon}</span>
                                    <span className="flex-1 truncate">{folder.title}</span>
                                </button>
                                {isAuthenticated && folder.id !== 'folder-favorites' && (
                                    <button
                                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#1d2624]/40 transition-all"
                                        title="Delete Folder"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-white/10">
                    {isAuthenticated && (
                        <button
                            onClick={handleCreateFolder}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#1d2624]/20 text-sm font-medium hover:bg-white/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                            New Folder
                        </button>
                    )}
                </div>
            </aside>

            <section className="w-72 border-r border-white/20 dark:border-white/5 flex flex-col shrink-0 bg-white/10 hidden lg:flex" id="note-list">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">Notes</h3>
                        {isAuthenticated && (
                            <button onClick={handleCreateDoc} className="p-2 rounded-lg hover:bg-white/20 text-[#1d2624]/60 dark:text-white/60 transition-colors" title="New Note">
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
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-sm line-clamp-1 ${activeDocId === doc.id ? 'text-[#1d2624]' : 'text-[#1d2624]/80'}`}>{doc.title}</h4>
                                    <span className="text-[10px] text-[#1d2624]/30 whitespace-nowrap ml-2">{doc.date}</span>
                                </div>
                                <p className="text-xs text-[#1d2624]/60 line-clamp-2 mb-3">
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
                            <div className="max-w-3xl mx-auto py-16 px-8 md:px-12 space-y-8 animate-[fadeIn_0.3s_ease-out]">
                                <h1 className="text-5xl font-extrabold tracking-tight text-[#1d2624] dark:text-white leading-[1.15]">{activeDoc.title}</h1>
                                <div className="flex items-center gap-3 pb-8 border-b border-[#1d2624]/5 dark:border-white/5">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url("${activeDoc.bg}")` }}></div>
                                        <div className="size-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-600">+1</div>
                                    </div>
                                    <span className="text-sm text-[#1d2624]/40 dark:text-white/40 font-medium">Collaborating with the Team</span>
                                </div>
                                <div
                                    className="prose prose-slate prose-lg text-[#1d2624]/80 dark:text-white/80 leading-[1.8] space-y-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:pt-4 [&>h2]:text-[#1d2624] dark:[&>h2]:text-white [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>.callout]:bg-white/40 [&>.callout]:p-6 [&>.callout]:rounded-2xl [&>.callout]:border [&>.callout]:border-primary/10 [&>.lead]:text-xl [&>.lead]:font-light [&>.lead]:italic [&>.lead]:text-[#1d2624]/60"
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
