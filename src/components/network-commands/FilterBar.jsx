import React, { useRef, useEffect } from 'react';

export default function FilterBar({
    query,
    setQuery,
    metadata,
    selectedVendor,
    setSelectedVendor,
    selectedDeviceType,
    setSelectedDeviceType,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    onReset,
    totalResults,
    loading
}) {
    const { vendors = [], deviceTypes = [], categories = [] } = metadata;
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex items-center justify-end gap-2 flex-wrap text-xs">
            {/* Search Input (same row, h-7) */}
            <div className="relative w-48 sm:w-56 md:w-64">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#1d2624]/40 dark:text-white/40 text-[12px] pointer-events-none">
                    search
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm câu lệnh, từ khóa..."
                    className="w-full h-7 pl-6.5 pr-14 bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-0.5 rounded text-[#1d2624]/40 dark:text-white/40 hover:text-[#1d2624] dark:hover:text-white transition-colors"
                            title="Xóa tìm kiếm"
                        >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center px-1 py-0.2 text-[9px] font-semibold text-[#1d2624]/40 dark:text-white/40 bg-black/5 dark:bg-white/10 rounded border border-black/5 dark:border-white/10">
                        Ctrl K
                    </kbd>
                </div>
            </div>

            {/* Vendor Dropdown */}
            <div className="relative">
                <select
                    value={selectedVendor || ''}
                    onChange={(e) => setSelectedVendor(e.target.value || null)}
                    className="h-7 appearance-none pl-2.5 pr-6 bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#1d2624] dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                >
                    <option value="" className="dark:bg-[#18181b]">Tất cả hãng</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id} className="dark:bg-[#18181b]">
                            {v.name}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-[#1d2624]/40 dark:text-white/40 pointer-events-none">
                    expand_more
                </span>
            </div>

            {/* Device Type Dropdown */}
            <div className="relative">
                <select
                    value={selectedDeviceType || ''}
                    onChange={(e) => setSelectedDeviceType(e.target.value || null)}
                    className="h-7 appearance-none pl-2.5 pr-6 bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#1d2624] dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                >
                    <option value="" className="dark:bg-[#18181b]">Tất cả thiết bị</option>
                    {deviceTypes.map((dt) => (
                        <option key={dt.id} value={dt.slug} className="dark:bg-[#18181b]">
                            {dt.name}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-[#1d2624]/40 dark:text-white/40 pointer-events-none">
                    expand_more
                </span>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
                <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="h-7 appearance-none pl-2.5 pr-6 bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#1d2624] dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                >
                    <option value="" className="dark:bg-[#18181b]">Tất cả danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug} className="dark:bg-[#18181b]">
                            {cat.name_vi}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-[#1d2624]/40 dark:text-white/40 pointer-events-none">
                    expand_more
                </span>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="h-7 px-2 flex items-center justify-center rounded-lg text-xs text-[#1d2624]/50 dark:text-white/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors"
                    title="Xóa tất cả bộ lọc"
                >
                    Đặt lại
                </button>
            )}

            {/* Results Count */}
            <div className="text-xs font-medium text-[#1d2624]/50 dark:text-white/50 shrink-0 ml-1">
                {loading ? 'Đang tìm...' : `${totalResults} câu lệnh`}
            </div>
        </div>
    );
}
