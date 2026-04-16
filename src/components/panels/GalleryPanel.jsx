import React from 'react';

const GalleryPanel = () => {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="px-3 pt-2 pb-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-display text-sm font-bold text-purple-600 dark:text-purple-400">Thư Viện</h3>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Media Assets</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 mt-2 flex flex-col items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-purple-600 text-[64px] mb-2">imagesmode</span>
                <p className="text-sm font-medium text-slate-500">Chưa có hình ảnh nào</p>
            </div>
        </div>
    );
};

export default GalleryPanel;
