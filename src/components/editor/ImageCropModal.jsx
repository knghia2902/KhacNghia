import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/**
 * ImageCropModal - Hộp thoại crop ảnh
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {string} imageSrc - URL ảnh cần crop
 * @param {function} onClose - Callback đóng modal
 * @param {function} onCropComplete - Callback khi crop xong, nhận croppedImageUrl
 */
const ImageCropModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);

    // Generate cropped image blob
    const getCroppedImg = useCallback(async () => {
        if (!completedCrop || !imgRef.current) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.92);
        });
    }, [completedCrop]);

    // Handle apply crop
    const handleApply = useCallback(async () => {
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg();
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (error) {
            console.error('Crop error:', error);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    }, [getCroppedImg, onCropComplete, onClose]);

    // Handle image load
    const onImageLoad = useCallback((e) => {
        imgRef.current = e.currentTarget;
        // Auto-set initial crop to center
        const { width, height } = e.currentTarget;
        const cropSize = Math.min(width, height) * 0.8;
        setCrop({
            unit: 'px',
            width: cropSize,
            height: cropSize,
            x: (width - cropSize) / 2,
            y: (height - cropSize) / 2,
        });
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">crop</span>
                        Crop Ảnh
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Crop Area */}
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    {imageSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={undefined}
                            minWidth={20}
                            minHeight={20}
                        >
                            <img
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                className="max-h-[60vh] object-contain"
                                crossOrigin="anonymous"
                            />
                        </ReactCrop>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                            Không có ảnh để crop
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={isProcessing || !completedCrop}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Áp dụng
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
