import React from 'react';
import MDEditor from '@uiw/react-md-editor';

/**
 * MarkdownEditor - Split view editor with live preview
 * Supports: heading, bold, italic, lists, links, code blocks, quotes, tables
 */
const MarkdownEditor = ({
    value,
    onChange,
    height = 500,
    preview = 'live', // 'edit' | 'live' | 'preview'
    hideToolbar = false,
    className = ''
}) => {
    return (
        <div className={`markdown-editor-wrapper ${className}`} data-color-mode="light">
            <MDEditor
                value={value}
                onChange={onChange}
                height={height}
                preview={preview}
                hideToolbar={hideToolbar}
                visibleDragbar={false}
                textareaProps={{
                    placeholder: 'Viết nội dung ở đây...\n\n# Heading 1\n## Heading 2\n\n**Bold** và *italic*\n\n- List item 1\n- List item 2\n\n```javascript\nconst code = "example";\n```'
                }}
            />
            <style>{`
                .markdown-editor-wrapper .w-md-editor {
                    border-radius: 1rem;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .markdown-editor-wrapper .w-md-editor-toolbar {
                    background: rgba(0, 0, 0, 0.02);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                    padding: 8px;
                }
                .markdown-editor-wrapper .w-md-editor-content {
                    background: white;
                }
                .markdown-editor-wrapper .w-md-editor-text-pre > code,
                .markdown-editor-wrapper .w-md-editor-text-input {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .markdown-editor-wrapper .w-md-editor-preview {
                    padding: 20px;
                    background: #fafafa;
                }
                /* Dark mode styles */
                .dark .markdown-editor-wrapper .w-md-editor {
                    border-color: rgba(255, 255, 255, 0.1);
                    background: #1a1a1a;
                }
                .dark .markdown-editor-wrapper .w-md-editor-toolbar {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .dark .markdown-editor-wrapper .w-md-editor-content {
                    background: #1a1a1a;
                }
                .dark .markdown-editor-wrapper .w-md-editor-text-pre > code,
                .dark .markdown-editor-wrapper .w-md-editor-text-input {
                    color: #e0e0e0;
                }
                .dark .markdown-editor-wrapper .w-md-editor-preview {
                    background: #111;
                    color: #e0e0e0;
                }
            `}</style>
        </div>
    );
};

export default MarkdownEditor;
