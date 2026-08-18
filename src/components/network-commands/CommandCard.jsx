import React from 'react';
import { cleanCommandSyntax } from '../../utils/commandUtils';

export default function CommandCard({ command, isFavorite, onToggleFavorite, onSelect, onCopy }) {
    const syntaxToCopy = cleanCommandSyntax(command.full_syntax || command.command_syntax, command.prompt_mode);

    const handleCopy = (e) => {
        e.stopPropagation();
        onCopy(syntaxToCopy);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        onToggleFavorite(command.id);
    };

    return (
        <div
            onClick={() => onSelect(command)}
            className="group relative flex flex-col p-5 bg-white/50 dark:bg-[#18181b]/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white/70 dark:hover:bg-[#18181b]/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer justify-between min-h-[130px]"
        >
            {/* Header: Vendor Badge, OS Flavor, Destructive Warning & Actions */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Soft Gray Vendor Badge */}
                    <span className="h-6 px-2.5 flex items-center rounded-lg text-[11px] font-bold bg-black/5 dark:bg-white/10 text-[#1d2624] dark:text-white border border-black/10 dark:border-white/10">
                        {command.vendor?.name || 'Vendor'}
                    </span>

                    {/* OS Flavor Badge */}
                    {command.os_flavor && (
                        <span className="h-6 px-2 flex items-center rounded-lg text-[11px] font-medium bg-black/5 dark:bg-white/5 text-[#1d2624]/60 dark:text-white/60 border border-black/5 dark:border-white/5">
                            {command.os_flavor}
                        </span>
                    )}

                    {/* Destructive Warning Badge */}
                    {command.is_destructive && (
                        <span className="h-6 px-2 flex items-center rounded-lg text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            Nguy hiểm
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Favorite Button */}
                    <button
                        type="button"
                        onClick={handleFavorite}
                        className={`size-8 flex items-center justify-center rounded-lg transition-colors ${
                            isFavorite
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-[#1d2624]/30 dark:text-white/30 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        title={isFavorite ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {isFavorite ? 'star' : 'star_border'}
                        </span>
                    </button>

                    {/* Quick Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="size-8 flex items-center justify-center rounded-lg text-[#1d2624]/40 dark:text-white/40 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Copy toàn bộ kịch bản cấu hình"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                </div>
            </div>

            {/* Title & Description */}
            <div>
                <h3 className="text-base font-bold text-[#1d2624] dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                    {command.title_vi}
                </h3>
                <p className="text-xs text-[#1d2624]/60 dark:text-white/60 mt-1.5 line-clamp-2 leading-relaxed">
                    {command.description_vi}
                </p>
            </div>
        </div>
    );
}
