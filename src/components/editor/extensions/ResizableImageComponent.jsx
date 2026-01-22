import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Resizable } from 're-resizable';

/**
 * ResizableImageComponent - Render ảnh với khả năng resize và toolbar
 */
const ResizableImageComponent = ({ node, updateAttributes, selected, editor }) => {
    const { src, alt, width, height } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const imgRef = useRef(null);
    const containerRef = useRef(null);

    // Calculate initial size
    const initialWidth = width ? parseInt(width) : undefined;
    const initialHeight = height ? parseInt(height) : undefined;

    // Handle resize end
    const handleResizeStop = useCallback((e, direction, ref, d) => {
        const newWidth = (initialWidth || ref.offsetWidth) + d.width;
        const newHeight = (initialHeight || ref.offsetHeight) + d.height;
        updateAttributes({
            width: newWidth,
            height: newHeight,
        });
    }, [initialWidth, initialHeight, updateAttributes]);

    // Open crop modal (dispatch custom event)
    const handleCropClick = useCallback(() => {
        const event = new CustomEvent('openImageCropModal', {
            detail: { src, nodePos: editor.state.selection.from }
        });
        window.dispatchEvent(event);
    }, [src, editor]);

    // Reset to original size
    const handleResetSize = useCallback(() => {
        updateAttributes({ width: null, height: null });
    }, [updateAttributes]);

    // Delete image
    const handleDelete = useCallback(() => {
        editor.chain().focus().deleteSelection().run();
    }, [editor]);

    return (
        <NodeViewWrapper
            className="resizable-image-wrapper"
            data-drag-handle
        >
            <div
                ref={containerRef}
                className={`relative inline-block group ${selected ? 'ring-2 ring-blue-500' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setShowToolbar(!showToolbar)}
            >
                <Resizable
                    size={{
                        width: initialWidth || 'auto',
                        height: initialHeight || 'auto',
                    }}
                    onResizeStop={handleResizeStop}
                    lockAspectRatio={true}
                    minWidth={50}
                    minHeight={50}
                    maxWidth="100%"
                    enable={{
                        top: false,
                        right: true,
                        bottom: true,
                        left: false,
                        topRight: false,
                        bottomRight: true,
                        bottomLeft: false,
                        topLeft: false,
                    }}
                    handleStyles={{
                        right: { width: '8px', right: '-4px', cursor: 'ew-resize' },
                        bottom: { height: '8px', bottom: '-4px', cursor: 'ns-resize' },
                        bottomRight: {
                            width: '12px',
                            height: '12px',
                            right: '-6px',
                            bottom: '-6px',
                            cursor: 'nwse-resize',
                            background: '#3b82f6',
                            borderRadius: '50%',
                            opacity: isHovered || selected ? 1 : 0,
                            transition: 'opacity 0.2s',
                        },
                    }}
                    handleClasses={{
                        right: 'opacity-0 group-hover:opacity-100 transition-opacity',
                        bottom: 'opacity-0 group-hover:opacity-100 transition-opacity',
                    }}
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt={alt || ''}
                        className="max-w-full h-auto block rounded"
                        draggable={false}
                        style={{
                            width: initialWidth ? `${initialWidth}px` : 'auto',
                            height: initialHeight ? `${initialHeight}px` : 'auto',
                        }}
                    />
                </Resizable>

                {/* Mini Toolbar */}
                {(isHovered || showToolbar || selected) && (
                    <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-2 py-1 z-50 border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Crop Button */}
                        <button
                            type="button"
                            onClick={handleCropClick}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors"
                            title="Crop ảnh"
                        >
                            <span className="material-symbols-outlined text-[18px]">crop</span>
                        </button>

                        {/* Reset Size Button */}
                        <button
                            type="button"
                            onClick={handleResetSize}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors"
                            title="Kích thước gốc"
                        >
                            <span className="material-symbols-outlined text-[18px]">aspect_ratio</span>
                        </button>

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors"
                            title="Xóa ảnh"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export default ResizableImageComponent;
