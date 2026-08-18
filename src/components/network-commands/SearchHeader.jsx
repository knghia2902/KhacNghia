import React, { useRef, useEffect } from 'react';

export default function SearchHeader({ query, setQuery }) {
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
        <div className="relative w-full">
            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#1d2624]/40 dark:text-white/40 text-[17px] pointer-events-none">
                    search
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo lệnh, chức năng, từ khóa..."
                    className="w-full h-9 pl-9 pr-20 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-1 rounded-lg text-[#1d2624]/40 dark:text-white/40 hover:text-[#1d2624] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title="Xóa tìm kiếm"
                        >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#1d2624]/50 dark:text-white/50 bg-black/5 dark:bg-white/10 rounded-md border border-black/5 dark:border-white/10">
                        Ctrl K
                    </kbd>
                </div>
            </div>
        </div>
    );
}
