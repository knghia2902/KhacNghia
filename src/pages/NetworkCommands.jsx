import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommandSearch } from '../hooks/useCommandSearch';
import { copyToClipboard } from '../utils/commandUtils';
import SearchHeader from '../components/network-commands/SearchHeader';
import FilterBar from '../components/network-commands/FilterBar';
import CommandCard from '../components/network-commands/CommandCard';
import CommandDrawer from '../components/network-commands/CommandDrawer';
import Toast from '../components/network-commands/Toast';

export default function NetworkCommands() {
    const {
        query,
        setQuery,
        selectedVendor,
        setSelectedVendor,
        selectedDeviceType,
        setSelectedDeviceType,
        selectedCategory,
        setSelectedCategory,
        favoritesOnly,
        setFavoritesOnly,
        commands,
        loading,
        error,
        metadata,
        favoriteIds,
        toggleFavorite,
        resetFilters
    } = useCommandSearch();

    const [selectedCommand, setSelectedCommand] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    const handleCopy = async (text) => {
        const success = await copyToClipboard(text);
        if (success) {
            setToastMessage('Đã copy câu lệnh vào clipboard!');
            setIsToastVisible(true);
        } else {
            setToastMessage('Không thể copy vào clipboard.');
            setIsToastVisible(true);
        }
    };

    const handleToggleFavorite = async (commandId) => {
        const res = await toggleFavorite(commandId);
        if (res?.error) {
            setToastMessage(res.error);
            setIsToastVisible(true);
        }
    };

    const hasActiveFilters = Boolean(
        query || selectedVendor || selectedDeviceType || selectedCategory || favoritesOnly
    );

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header Area */}
            <div className="shrink-0 px-8 pt-5 pb-3 border-b border-white/20 dark:border-white/5 space-y-3">
                {/* Row 1: Back + Title & Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/tools"
                            className="size-10 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 flex items-center justify-center text-[#1d2624] dark:text-white transition-all shadow-xs shrink-0"
                            title="Quay lại danh sách Tools"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1d2624] dark:text-white tracking-tight">
                            Tra cứu <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Lệnh Mạng</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-80 lg:w-96">
                        <SearchHeader
                            query={query}
                            setQuery={setQuery}
                        />
                    </div>
                </div>

                {/* Row 2: Unified Filter Toolbar */}
                <FilterBar
                    metadata={metadata}
                    selectedVendor={selectedVendor}
                    setSelectedVendor={setSelectedVendor}
                    selectedDeviceType={selectedDeviceType}
                    setSelectedDeviceType={setSelectedDeviceType}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    favoritesOnly={favoritesOnly}
                    setFavoritesOnly={setFavoritesOnly}
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                    totalResults={commands.length}
                    loading={loading}
                />
            </div>

            {/* Main Command Container */}
            <div className="flex-1 overflow-y-auto px-8 pt-6 pb-32 custom-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-36 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                        <p className="text-sm font-medium text-red-500">Lỗi tải dữ liệu: {error}</p>
                    </div>
                ) : commands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-[#1d2624]/20 dark:text-white/20 mb-3">search_off</span>
                        <h3 className="text-base font-bold text-[#1d2624]/60 dark:text-white/60">Không tìm thấy câu lệnh phù hợp</h3>
                        <p className="text-xs text-[#1d2624]/40 dark:text-white/40 mt-1 max-w-sm">
                            Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn một số bộ lọc hãng/thiết bị.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary-dark dark:text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {commands.map((cmd) => (
                            <CommandCard
                                key={cmd.id}
                                command={cmd}
                                isFavorite={favoriteIds.has(cmd.id)}
                                onToggleFavorite={handleToggleFavorite}
                                onSelect={setSelectedCommand}
                                onCopy={handleCopy}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Slide-over Detail Drawer (Contains Interactive Topology Diagram) */}
            <CommandDrawer
                command={selectedCommand}
                isOpen={Boolean(selectedCommand)}
                onClose={() => setSelectedCommand(null)}
                isFavorite={selectedCommand ? favoriteIds.has(selectedCommand.id) : false}
                onToggleFavorite={handleToggleFavorite}
                onCopy={handleCopy}
            />

            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
            />
        </div>
    );
}
