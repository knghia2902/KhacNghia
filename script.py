import sys

with open('src/pages/Docs.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '{/* Mobile Sidebar Overlay */}'
start_idx = content.find(start_str)

if start_idx == -1:
    print('Could not find start string')
    sys.exit(1)

prefix = content[:start_idx]

new_layout = """{/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex overflow-hidden relative px-8 pb-8 gap-6">
                {/* Sidebar */}
                <aside className={`
                    w-[240px] h-full flex flex-col py-6 px-3 z-20 glass-panel rounded-[1.5rem] shadow-float shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 md:static
                    ${isFocusMode ? 'md:hidden' : ''}
                    ${isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0' : 'hidden md:flex'}
                `}>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 text-slate-500 md:hidden"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="flex flex-col h-full">
                        {/* Header Row */}
                        <div className="mb-4 px-3 flex items-center shrink-0">
                            <p className="text-[0.65rem] font-bold text-slate-500 tracking-widest uppercase truncate">Cấu trúc tài liệu</p>
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
                                            <div key={i} className="h-8 bg-white/40 rounded-lg w-full"></div>
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
                            <div className="mt-auto p-2 flex justify-center">
                                <button
                                    onClick={() => setIsFolderModalOpen(true)}
                                    className="w-full py-2.5 text-xs font-bold text-slate-600 bg-white/50 border border-white/60 hover:bg-white/80 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
                                    Thư mục mới
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                <CascadingNav
                    isOpen={isSecondaryPanelOpen}
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

                {/* Main Content */}
                <main className="flex-1 relative overflow-hidden flex items-center justify-center">
                    
                    {/* THE 3D ISOMETRIC EMPTY STATE */}
                    <div id="isometric-view" className={`absolute inset-0 flex items-center justify-center isometric-container z-10 transition-all duration-1000 ${showEditor ? 'world-shifted' : ''}`}>
                        <div id="isometric-world" className="isometric-world w-[400px] h-[400px] relative">
                            {/* Floor grid */}
                            <div className="iso-floor flex items-center justify-center">
                                <p className="text-cyan-700/30 font-display font-bold text-2xl transform rotate-90 -translate-x-12 opacity-50">KHU VỰC TÀI LIỆU</p>
                            </div>
                            
                            {/* File Cabinet 3D */}
                            <div className="iso-cabinet shadow-2xl">
                                <div className="cab-face cab-top flex items-center justify-center">
                                    <div className="w-16 h-12 border-2 border-white/30 rounded-md"></div>
                                </div>
                                <div className="cab-face cab-front flex flex-col pt-2">
                                    <div className="cab-drawer flex items-center justify-center"><div className="w-8 h-1 bg-white/50 rounded"></div></div>
                                    <div className="cab-drawer flex items-center justify-center"><div className="w-8 h-1 bg-white/50 rounded"></div></div>
                                    <div className="cab-drawer flex items-center justify-center"><div className="w-8 h-1 bg-white/50 rounded"></div></div>
                                </div>
                                <div className="cab-face cab-right"></div>
                                <div className="cab-face cab-left"></div>
                                <div className="cab-face cab-back"></div>
                            </div>

                            {/* REAL 3D GLB AGENT using Model-Viewer */}
                            <div id="chibi-agent" className={`iso-agent ${isAgentRunning ? 'agent-run' : ''}`}>
                                <model-viewer 
                                    src="Meshy_AI_Bookworm_Parrot_0414030438_texture.glb" 
                                    alt="3D AI Agent"
                                    auto-rotate="true" 
                                    camera-controls="true"
                                    disable-zoom="true"
                                    interaction-prompt="none"
                                    shadow-intensity="1">
                                </model-viewer>
                            </div>
                        </div>
                    </div>

                    {/* ACTUAL EDITOR CONTENT */}
                    <article id="editor-content" className={`max-w-4xl w-full mx-auto glass-panel p-8 md:p-12 rounded-[1.5rem] shadow-heavy-float relative z-20 overflow-y-auto h-full border border-white flex flex-col ${showEditor ? 'active' : ''}`}>
                        
                        {/* Header actions */}
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="inline-block px-3 py-1 rounded-full bg-cyan-100/80 text-cyan-700 text-[0.65rem] font-bold tracking-widest uppercase border border-cyan-200">
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
                                            className="font-display text-4xl font-bold text-slate-800 mb-6 tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300 w-full"
                                            placeholder="Tiêu đề"
                                        />
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
                                        <h1 id="doc-title" className="font-display text-4xl font-bold text-slate-800 mb-6 tracking-tight">{activeDoc.title}</h1>
                                        {activeDoc.content === undefined ? (
                                            <div className="animate-pulse space-y-4 mt-8">
                                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            </div>
                                        ) : (
                                            <div
                                                className="prose prose-slate max-w-none text-slate-600 [&>h1]:font-display [&>h2]:font-display [&>h3]:font-display imported-content-wrapper"
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

export default Docs;"""

new_content = prefix + new_layout
with open('src/pages/Docs.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Successfully replaced Docs.jsx layout')