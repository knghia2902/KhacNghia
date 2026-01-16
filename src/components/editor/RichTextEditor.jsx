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
const RichTextEditor = ({ content, onChange, placeholder = 'Viết nội dung ở đây...' }) => {
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
            onChange(editor.getHTML());
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
                // Nếu bucket không tồn tại, thử tạo hoặc báo lỗi
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
            <div className="flex flex-wrap gap-1 p-2 bg-white/30 dark:bg-white/5 rounded-t-xl border border-[#1d2624]/10 dark:border-white/10 border-b-0">
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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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

                <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1 self-center" />

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
                    margin: 1rem 0;
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
                    margin: 0.75rem 0;
                    overflow-x: auto;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.875rem;
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
                .ProseMirror hr {
                    border: none;
                    border-top: 2px solid rgba(0, 0, 0, 0.1);
                    margin: 1.5rem 0;
                }
                .dark .ProseMirror hr {
                    border-top-color: rgba(255, 255, 255, 0.1);
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.75rem;
                    margin: 1rem 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
