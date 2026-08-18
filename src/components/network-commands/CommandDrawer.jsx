import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { cleanCommandSyntax } from '../../utils/commandUtils';
import CommandTopologyDiagram from './CommandTopologyDiagram';

export default function CommandDrawer({ command, isOpen, onClose, onCopy, isFavorite, onToggleFavorite }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !command) return null;

    const cleanCmd = cleanCommandSyntax(command.full_syntax || command.command_syntax, command.prompt_mode);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[250] flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-full max-w-2xl h-full bg-[#fcfdfd] dark:bg-[#141a18] shadow-2xl border-l border-white/20 dark:border-white/10 flex flex-col z-10 animate-[slideLeft_0.25s_ease-out] overflow-hidden">
                {/* Header */}
                <div className="shrink-0 p-6 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="h-6 px-2.5 flex items-center rounded-lg text-[11px] font-bold bg-black/5 dark:bg-white/10 text-[#1d2624] dark:text-white border border-black/10 dark:border-white/10">
                                {command.vendor?.name || 'Vendor'}
                            </span>
                            {command.os_flavor && (
                                <span className="h-6 px-2 flex items-center rounded-lg text-[11px] font-medium bg-black/5 dark:bg-white/5 text-[#1d2624]/60 dark:text-white/60 border border-black/5 dark:border-white/5">
                                    {command.os_flavor}
                                </span>
                            )}
                            {command.is_destructive && (
                                <span className="h-6 px-2 flex items-center rounded-lg text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                    Cảnh báo tác động
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#1d2624] dark:text-white font-display">
                            {command.title_vi}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => onToggleFavorite(command.id)}
                            className={`p-2 rounded-xl transition-colors ${
                                isFavorite
                                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                    : 'text-[#1d2624]/40 dark:text-white/40 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                            title={isFavorite ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {isFavorite ? 'star' : 'star_border'}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-[#1d2624]/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title="Đóng"
                        >
                            <span className="material-symbols-outlined text-[22px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Primary Syntax Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60">
                                Cú pháp câu lệnh ({command.prompt_mode || 'CLI Mode'})
                            </span>
                            <button
                                type="button"
                                onClick={() => onCopy(cleanCmd)}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                Copy lệnh thực thi
                            </button>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-sm border border-black/20 relative group">
                            {command.prompt_mode && (
                                <span className="text-gray-500 select-none block mb-2 text-xs font-semibold">
                                    Prompt: {command.prompt_mode}
                                </span>
                            )}
                            <pre className="text-emerald-400 font-mono text-xs md:text-sm font-semibold whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                {(command.full_syntax || command.command_syntax || '').replace(/\\n/g, '\n')}
                            </pre>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                            Mô tả chi tiết
                        </h4>
                        <p className="text-sm text-[#1d2624]/80 dark:text-white/80 leading-relaxed">
                            {command.description_vi}
                        </p>
                    </div>

                    {/* Visual Topology Diagram */}
                    <CommandTopologyDiagram command={command} />

                    {/* Parameters Table */}
                    {command.parameters && Array.isArray(command.parameters) && command.parameters.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                                Danh sách tham số (Parameters)
                            </h4>
                            <div className="overflow-hidden border border-black/10 dark:border-white/10 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-black/5 dark:bg-white/5 text-[#1d2624]/70 dark:text-white/70">
                                        <tr>
                                            <th className="p-2.5 font-bold">Tham số</th>
                                            <th className="p-2.5 font-bold">Kiểu</th>
                                            <th className="p-2.5 font-bold">Mô tả</th>
                                            <th className="p-2.5 font-bold">Mặc định</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {command.parameters.map((param, idx) => (
                                            <tr key={idx} className="hover:bg-black/2 dark:hover:bg-white/2">
                                                <td className="p-2.5 font-mono font-bold text-primary">{param.name}</td>
                                                <td className="p-2.5 text-[#1d2624]/60 dark:text-white/60">{param.type || 'string'}</td>
                                                <td className="p-2.5 text-[#1d2624]/80 dark:text-white/80">{param.description_vi}</td>
                                                <td className="p-2.5 font-mono text-[#1d2624]/50 dark:text-white/50">{param.default_value || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Practical Examples */}
                    {command.examples && Array.isArray(command.examples) && command.examples.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                                Ví dụ thực tế
                            </h4>
                            <div className="space-y-3">
                                {command.examples.map((ex, idx) => (
                                    <div key={idx} className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        <div className="text-xs font-bold text-[#1d2624] dark:text-white mb-1.5 flex items-center justify-between">
                                            <span>{ex.scenario_vi || `Ví dụ ${idx + 1}`}</span>
                                            {ex.command && (
                                                <button
                                                    type="button"
                                                    onClick={() => onCopy(cleanCommandSyntax(ex.command))}
                                                    className="text-primary hover:text-primary-dark text-[11px] font-semibold flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                        {ex.command && (
                                            <pre className="p-2.5 rounded-lg bg-gray-900 text-emerald-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                                {(ex.command || '').replace(/\\n/g, '\n')}
                                            </pre>
                                        )}
                                        {ex.output_sample && (
                                            <pre className="mt-2 p-2.5 rounded-lg bg-black/20 dark:bg-black/50 text-gray-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                                {(ex.output_sample || '').replace(/\\n/g, '\n')}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Safety Warnings & Commit Requirements */}
                    {(command.is_destructive || command.requires_commit || (command.warnings && command.warnings.length > 0)) && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                            <div className="flex items-center gap-2 font-bold text-xs mb-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-500">warning</span>
                                <span>Lưu ý an toàn & Vận hành</span>
                            </div>
                            <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
                                {command.requires_commit && (
                                    <li>Lệnh yêu cầu thực hiện <span className="font-mono font-bold">commit</span> để có hiệu lực.</li>
                                )}
                                {command.is_destructive && (
                                    <li className="font-bold text-red-600 dark:text-red-400">
                                        Lệnh có khả năng làm gián đoạn kết nối hoặc xóa cấu hình.
                                    </li>
                                )}
                                {Array.isArray(command.warnings) && command.warnings.map((w, i) => (
                                    <li key={i}>{typeof w === 'string' ? w : w.message_vi}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Verification & Rollback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {command.verification_command && (
                            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 block mb-1.5">
                                    Lệnh kiểm tra (Verify)
                                </span>
                                <div className="p-2.5 rounded-lg bg-gray-900 text-cyan-400 font-mono text-xs flex justify-between items-start gap-2">
                                    <pre className="font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed flex-1">
                                        {(command.verification_command || '').replace(/\\n/g, '\n')}
                                    </pre>
                                    <button
                                        type="button"
                                        onClick={() => onCopy(cleanCommandSyntax(command.verification_command))}
                                        className="text-white/50 hover:text-white shrink-0 mt-0.5"
                                        title="Copy"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {command.rollback_command && (
                            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 block mb-1.5">
                                    Lệnh hoàn tác (Rollback)
                                </span>
                                <div className="p-2.5 rounded-lg bg-gray-900 text-rose-400 font-mono text-xs flex justify-between items-start gap-2">
                                    <pre className="font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed flex-1">
                                        {(command.rollback_command || '').replace(/\\n/g, '\n')}
                                    </pre>
                                    <button
                                        type="button"
                                        onClick={() => onCopy(cleanCommandSyntax(command.rollback_command))}
                                        className="text-white/50 hover:text-white shrink-0 mt-0.5"
                                        title="Copy"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="shrink-0 p-4 border-t border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[#1d2624]/70 dark:text-white/70 font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        onClick={() => onCopy(cleanCmd)}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        Copy câu lệnh
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
