import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { supabase } from '../../lib/supabaseClient';

/**
 * RichTextEditor - WYSIWYG editor giống Word
 * Hiển thị format ngay khi gõ (không thấy Markdown syntax)
 */
const RichTextEditor = ({
    content,
    onChange,
    placeholder = 'Viết nội dung ở đây...',
    attachments = [],
    onAttachmentAdd,
    onAttachmentRemove
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight,
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[50vh] text-[#1d2624]/80 dark:text-white/80',
            },
        },
    });

    const [isUploading, setIsUploading] = useState(false);

    // Upload image to Supabase Storage
    const uploadImage = async (file) => {
        setIsUploading(true);
        try {
            const fileName = `docs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const { data, error } = await supabase.storage
                .from('docs-media')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                alert('Lỗi upload: ' + error.message);
                return null;
            }

            // Lấy public URL
            const { data: { publicUrl } } = supabase.storage
                .from('docs-media')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload thất bại');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const [isAttaching, setIsAttaching] = useState(false);

    // Allowed file types for attachments
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain'
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Upload attachment to Supabase Storage
    const uploadAttachment = async (file) => {
        if (!onAttachmentAdd) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.rar')) {
            alert('Loại file không được hỗ trợ. Chỉ cho phép: PDF, DOC, XLS, PPT, ZIP, RAR, TXT');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert('File quá lớn. Giới hạn: 10MB');
            return;
        }

        setIsAttaching(true);
        try {
            const fileName = `attachments/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const { data, error } = await supabase.storage
                .from('docs-media')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Attachment upload error:', error);
                alert('Lỗi upload: ' + error.message);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('docs-media')
                .getPublicUrl(fileName);

            // Create attachment object
            const attachment = {
                id: Date.now().toString(),
                name: file.name,
                url: publicUrl,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            };

            onAttachmentAdd(attachment);
        } catch (err) {
            console.error('Attachment upload failed:', err);
            alert('Upload thất bại');
        } finally {
            setIsAttaching(false);
        }
    };

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${isActive
                ? 'bg-[#1d2624] dark:bg-white text-white dark:text-black'
                : 'hover:bg-white/50 dark:hover:bg-white/10 text-[#1d2624]/70 dark:text-white/70'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="rich-text-editor">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-white/30 dark:bg-white/5 rounded-t-xl border border-[#1d2624]/10 dark:border-white/10 border-b-0">
                {/* Text Style */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <span className="font-bold text-sm">B</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <span className="italic text-sm">I</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <span className="underline text-sm">U</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <span className="material-symbols-outlined text-[16px]">highlight</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <span className="font-bold text-sm">H1</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <span className="font-bold text-sm">H2</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <span className="font-bold text-sm">H3</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Block Elements */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <span className="material-symbols-outlined text-[16px]">format_quote</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <span className="font-mono text-sm">{'</>'}</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Divider"
                >
                    <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Text Align */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <span className="material-symbols-outlined text-[16px]">format_align_left</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <span className="material-symbols-outlined text-[16px]">format_align_center</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <span className="material-symbols-outlined text-[16px]">format_align_right</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Image */}
                <ToolbarButton
                    onClick={() => {
                        const url = window.prompt('Nhập URL hình ảnh:');
                        if (url) {
                            editor.chain().focus().setImage({ src: url }).run();
                        }
                    }}
                    title="Chèn hình ảnh (URL)"
                >
                    <span className="material-symbols-outlined text-[16px]">image</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={async () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const publicUrl = await uploadImage(file);
                                if (publicUrl) {
                                    editor.chain().focus().setImage({ src: publicUrl }).run();
                                }
                            }
                        };
                        input.click();
                    }}
                    title={isUploading ? "Đang upload..." : "Upload hình ảnh (Supabase)"}
                >
                    {isUploading ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    ) : (
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    )}
                </ToolbarButton>

                {/* Attach File */}
                {onAttachmentAdd && (
                    <>
                        <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />
                        <ToolbarButton
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt';
                                input.onchange = (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        uploadAttachment(file);
                                    }
                                };
                                input.click();
                            }}
                            title={isAttaching ? "Đang upload..." : "Đính kèm file"}
                        >
                            {isAttaching ? (
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                            )}
                        </ToolbarButton>
                    </>
                )}

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-3 self-center" />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo (Ctrl+Z)"
                >
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo (Ctrl+Y)"
                >
                    <span className="material-symbols-outlined text-[16px]">redo</span>
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <div className="bg-white/10 dark:bg-black/10 rounded-b-xl border border-[#1d2624]/10 dark:border-white/10 border-t-0 p-6">
                <EditorContent editor={editor} />
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="mt-4 p-4 bg-white/10 dark:bg-black/10 rounded-xl border border-[#1d2624]/10 dark:border-white/10">
                    <h4 className="text-sm font-semibold text-[#1d2624]/70 dark:text-white/70 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                        Đính kèm ({attachments.length})
                    </h4>
                    <div className="space-y-2">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
                                        {attachment.type?.includes('pdf') ? 'picture_as_pdf' :
                                            attachment.type?.includes('word') || attachment.name?.endsWith('.doc') || attachment.name?.endsWith('.docx') ? 'description' :
                                                attachment.type?.includes('excel') || attachment.type?.includes('spreadsheet') || attachment.name?.endsWith('.xls') || attachment.name?.endsWith('.xlsx') ? 'table_chart' :
                                                    attachment.type?.includes('powerpoint') || attachment.type?.includes('presentation') || attachment.name?.endsWith('.ppt') || attachment.name?.endsWith('.pptx') ? 'slideshow' :
                                                        attachment.type?.includes('zip') || attachment.type?.includes('rar') ? 'folder_zip' :
                                                            'draft'}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#1d2624] dark:text-white truncate">
                                            {attachment.name}
                                        </p>
                                        <p className="text-xs text-[#1d2624]/50 dark:text-white/50">
                                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-[#1d2624]/60 dark:text-white/60 hover:text-primary transition-colors"
                                        title="Tải xuống"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                    </a>
                                    {onAttachmentRemove && (
                                        <button
                                            onClick={() => onAttachmentRemove(attachment.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[#1d2624]/60 dark:text-white/60 hover:text-red-500 transition-colors"
                                            title="Xóa"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .ProseMirror {
                    outline: none;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: rgba(0, 0, 0, 0.3);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .dark .ProseMirror p.is-editor-empty:first-child::before {
                    color: rgba(255, 255, 255, 0.3);
                }
                .ProseMirror h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror p {
                    margin-bottom: 0.75rem;
                    line-height: 1.75;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .ProseMirror li {
                    margin-bottom: 0.25rem;
                }
                .ProseMirror blockquote {
                    border-left: 4px solid rgba(78, 205, 196, 0.5);
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    background: rgba(78, 205, 196, 0.05);
                    padding: 0.5rem 1rem;
                    border-radius: 0 0.5rem 0.5rem 0;
                }
                .ProseMirror pre {
                    background: #1a1a1a;
                    color: #e0e0e0;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    margin: 1.5rem 0;
                    overflow-x: auto;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.875rem;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    word-break: break-all;
                }
                .ProseMirror code {
                    background: rgba(0, 0, 0, 0.1);
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.875rem;
                }
                .dark .ProseMirror code {
                    background: rgba(255, 255, 255, 0.1);
                }
                .ProseMirror mark {
                    background-color: #fef08a;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.125rem;
                }
                .ProseMirror u {
                    text-underline-offset: 6px;
                    text-decoration-thickness: 1px;
                    text-decoration-color: rgba(78, 205, 196, 0.5);
                }
                .ProseMirror hr {
                    border: none;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                    margin: 2rem 0;
                }
                .dark .ProseMirror hr {
                    border-top-color: rgba(255, 255, 255, 0.1);
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1rem;
                    margin: 1rem 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }
                .dark .ProseMirror img {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .ProseMirror img.ProseMirror-selectednode {
                    outline: 3px solid #4ecdc4;
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
