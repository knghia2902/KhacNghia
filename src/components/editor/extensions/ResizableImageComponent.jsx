import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Resizable } from 're-resizable';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../../../lib/supabaseClient';

/**
 * ResizableImageComponent - Render ảnh với khả năng resize và inline crop
 * 
 * Features:
 * - Resize với 4 góc, handles lớn 20px
 * - Inline crop (không mở popup)
 * - minWidth/minHeight = 100px để tránh collapse
 */
const ResizableImageComponent = ({ node, updateAttributes, selected, editor }) => {
    const { src, alt, width, height, originalSrc } = node.attrs;
    const [isHovered, setIsHovered] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const imgRef = useRef(null); // For resize mode
    const cropImgRef = useRef(null); // Separate ref for crop mode
    const containerRef = useRef(null);

    // Crop state
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isSavingCrop, setIsSavingCrop] = useState(false);

    // Calculate initial size for defaultSize (uncontrolled mode)
    const initialWidth = width ? parseInt(width) : undefined;
    const initialHeight = height ? parseInt(height) : undefined;

    // Track natural (original) size for max resize limit
    const [naturalSize, setNaturalSize] = useState({ width: 2000, height: 2000 });

    // Track container width to limit resize
    const [containerWidth, setContainerWidth] = useState(800);

    // Track current size for crop mode (read from ref on demand)
    const currentSizeRef = useRef({ width: initialWidth, height: initialHeight });

    // Handle image load to get natural dimensions
    const handleImageLoad = useCallback((e) => {
        const img = e.currentTarget;
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    }, []);

    // Track container width for max size limit
    useEffect(() => {
        if (!containerRef.current) return;
        const parent = containerRef.current.closest('.ProseMirror') || containerRef.current.parentElement;
        if (parent) {
            setContainerWidth(parent.clientWidth - 40); // 40px padding
        }
    }, []);

    // Handle resize end (save to attributes)
    const handleResizeStop = useCallback((e, direction, ref, d) => {
        const newWidth = ref.offsetWidth;
        const newHeight = ref.offsetHeight;

        // Update ref for crop mode
        currentSizeRef.current = { width: newWidth, height: newHeight };

        updateAttributes({
            width: newWidth,
            height: newHeight,
        });
    }, [updateAttributes]);

    // Start cropping - Use PERCENTAGE for ReactCrop to handle coordinate mapping
    const handleCropClick = useCallback(() => {
        setIsCropping(true);
        // Percentage-based crop: 80% centered
        setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
        setCompletedCrop(null);
    }, []);

    // Cancel cropping
    const handleCropCancel = useCallback(() => {
        setIsCropping(false);
        setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
        setCompletedCrop(null);
    }, []);

    // Save cropped image
    const handleCropSave = useCallback(async () => {
        // Use cropImgRef for crop mode (it's the img inside ReactCrop)
        const image = cropImgRef.current;
        if (!completedCrop || !image) {
            console.error('Crop or image ref not available');
            return;
        }

        // Validate dimensions
        if (!image.naturalWidth || !image.naturalHeight || !image.width || !image.height) {
            console.error('Image dimensions not available:', {
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
                width: image.width,
                height: image.height
            });
            return;
        }

        console.log('Crop Debug:', {
            completedCrop,
            imageNatural: { w: image.naturalWidth, h: image.naturalHeight },
            imageRendered: { w: image.width, h: image.height }
        });

        setIsSavingCrop(true);
        try {
            // Scale factor between natural image and rendered image
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const canvas = document.createElement('canvas');

            // ReactCrop ALWAYS returns completedCrop in PIXELS relative to rendered image
            // (even if initialized with unit: '%')
            // Scale from rendered pixels to natural pixels
            const cropX = completedCrop.x * scaleX;
            const cropY = completedCrop.y * scaleY;
            const cropWidth = completedCrop.width * scaleX;
            const cropHeight = completedCrop.height * scaleY;

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context not available');
            }

            // Fill with white background to prevent black borders
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Vẽ ảnh gốc lên canvas ở vị trí crop
            ctx.drawImage(
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            // Convert canvas to blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', 0.95);
            });

            if (!blob) throw new Error('Failed to create blob');

            // Upload to Supabase
            const fileName = `docs/${Date.now()}-cropped.jpg`;
            const { data, error } = await supabase.storage
                .from('docs-media')
                .upload(fileName, blob, { cacheControl: '3600', upsert: false });

            if (error) {
                console.error('Crop upload error:', error);
                alert('Lỗi upload ảnh: ' + error.message);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from('docs-media').getPublicUrl(fileName);
            const newSrc = urlData.publicUrl;

            // Lưu originalSrc nếu chưa có (lần crop đầu tiên)
            const saveOriginal = !originalSrc ? { originalSrc: src } : {};

            // Update image src và reset kích thước về auto để tránh méo
            updateAttributes({
                src: newSrc,
                width: null, // Reset width để hiển thị theo ảnh mới
                height: null,
                ...saveOriginal
            });

            setIsCropping(false);
        } catch (err) {
            console.error('Crop error:', err);
            alert('Lỗi crop ảnh: ' + err.message);
        } finally {
            setIsSavingCrop(false);
        }
    }, [completedCrop, updateAttributes]);

    // Reset to original size
    const handleResetSize = useCallback(() => {
        updateAttributes({ width: null, height: null });
    }, [updateAttributes]);

    // Delete image
    const handleDelete = useCallback(() => {
        editor.chain().focus().deleteSelection().run();
    }, [editor]);

    // Restore original image (undo crop)
    const handleRestoreOriginal = useCallback(() => {
        if (originalSrc) {
            updateAttributes({
                src: originalSrc,
                originalSrc: null, // Clear after restore
                width: null,
                height: null
            });
        }
    }, [originalSrc, updateAttributes]);

    // Handle image load for crop mode - store ref to crop image
    const onCropImageLoad = useCallback((e) => {
        cropImgRef.current = e.currentTarget;
    }, []);

    // Common handle style
    const handleStyle = {
        width: '20px',
        height: '20px',
        background: '#3b82f6',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        opacity: isHovered || selected ? 1 : 0,
        transition: 'opacity 0.2s',
    };

    return (
        <NodeViewWrapper
            className="resizable-image-wrapper"
            style={{ display: 'block', textAlign: 'center', lineHeight: 0, margin: 0, padding: 0 }}
        >
            <div
                ref={containerRef}
                className={`relative inline-block group ${selected ? 'ring-2 ring-blue-500' : ''}`}
                style={{ lineHeight: 0, margin: '0 auto', padding: 0, fontSize: 0, verticalAlign: 'top' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !isCropping && setShowToolbar(!showToolbar)}
            >
                {isCropping ? (
                    /* Inline Crop Mode */
                    <div style={{ display: 'inline-block', lineHeight: 0, margin: 0, padding: 0 }}>
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={undefined}
                            minWidth={20}
                            minHeight={20}
                            style={{ display: 'block', lineHeight: 0 }}
                        >
                            <img
                                ref={cropImgRef}
                                src={src}
                                alt={alt || ''}
                                onLoad={onCropImageLoad}
                                className="block"
                                crossOrigin="anonymous"
                                data-drag-handle
                                style={{
                                    // CRITICAL: Use SAME size as resize mode to ensure correct crop coordinates
                                    width: initialWidth ? `${initialWidth}px` : '100%',
                                    height: initialHeight ? `${initialHeight}px` : 'auto',
                                    maxWidth: '100%',
                                    display: 'block',
                                    verticalAlign: 'top',
                                }}
                            />
                        </ReactCrop>

                        {/* Crop Toolbar */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 z-50 border border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                                Kéo để chọn vùng crop
                            </span>
                            <button
                                type="button"
                                onClick={handleCropCancel}
                                disabled={isSavingCrop}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors"
                                title="Hủy"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCropSave}
                                disabled={!completedCrop || isSavingCrop}
                                className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors disabled:opacity-50"
                                title="Lưu crop"
                            >
                                {isSavingCrop ? (
                                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Normal/Resize Mode - UNCONTROLLED with defaultSize */
                    <Resizable
                        defaultSize={{
                            width: initialWidth || 'auto',
                            height: initialHeight || 'auto'
                        }}
                        onResizeStop={handleResizeStop}
                        lockAspectRatio={true}
                        minWidth={100}
                        minHeight={100}
                        maxWidth={Math.min(naturalSize.width, containerWidth)}
                        maxHeight={naturalSize.height}
                        enable={{
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: true,
                            topLeft: true,
                        }}
                        handleStyles={{
                            topRight: {
                                ...handleStyle,
                                right: '-10px',
                                top: '-10px',
                                cursor: 'nesw-resize',
                            },
                            bottomRight: {
                                ...handleStyle,
                                right: '-10px',
                                bottom: '-10px',
                                cursor: 'nwse-resize',
                            },
                            bottomLeft: {
                                ...handleStyle,
                                left: '-10px',
                                bottom: '-10px',
                                cursor: 'nesw-resize',
                            },
                            topLeft: {
                                ...handleStyle,
                                left: '-10px',
                                top: '-10px',
                                cursor: 'nwse-resize',
                            },
                        }}
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            alt={alt || ''}
                            className="block"
                            draggable={false}
                            data-drag-handle
                            onLoad={handleImageLoad}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </Resizable>
                )}

                {/* Mini Toolbar - Only show when not cropping */}
                {!isCropping && (isHovered || showToolbar || selected) && (
                    <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-2 py-1 z-50 border border-gray-200 dark:border-gray-700"
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

                        {/* Restore Original Button - Only show if image was cropped */}
                        {originalSrc && (
                            <button
                                type="button"
                                onClick={handleRestoreOriginal}
                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-500 transition-colors"
                                title="Khôi phục ảnh gốc (Undo crop)"
                            >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                            </button>
                        )}

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
