import React from 'react';

export default function FilterBar({
    metadata,
    selectedVendor,
    setSelectedVendor,
    selectedDeviceType,
    setSelectedDeviceType,
    selectedCategory,
    setSelectedCategory,
    favoritesOnly,
    setFavoritesOnly,
    hasActiveFilters,
    onReset,
    totalResults,
    loading
}) {
    const { vendors = [], deviceTypes = [], categories = [] } = metadata;

    return (
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
            {/* Left side: Dropdown Filters (Vendor, Device Type, Category, Favorites) */}
            <div className="flex items-center gap-2 flex-wrap">
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

                {/* Favorites Toggle */}
                <button
                    type="button"
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`h-7 px-3 flex items-center justify-center rounded-lg text-xs font-medium transition-all border ${
                        favoritesOnly
                            ? 'bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] border-[#1d2624] dark:border-white shadow-xs font-bold'
                            : 'bg-white/40 dark:bg-white/5 text-[#1d2624]/70 dark:text-white/70 border-black/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                    }`}
                >
                    Yêu thích
                </button>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="h-7 px-2.5 flex items-center justify-center rounded-lg text-xs text-[#1d2624]/50 dark:text-white/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors"
                        title="Xóa tất cả bộ lọc"
                    >
                        Đặt lại
                    </button>
                )}
            </div>

            {/* Right side: Results Count */}
            <div className="text-xs font-medium text-[#1d2624]/50 dark:text-white/50 shrink-0">
                {loading ? 'Đang tìm...' : `${totalResults} câu lệnh`}
            </div>
        </div>
    );
}
