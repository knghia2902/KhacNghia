import React, { useRef, useEffect, useState } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const INITIAL_TOOLS = [
    { title: "Analytics", desc: "Track metrics", icon: "monitoring" },
    { title: "Calendar", desc: "Manage events", icon: "calendar_month" },
    { title: "Tasks", desc: "Organize lists", icon: "check_circle" },
    { title: "Messages", desc: "Connect team", icon: "chat_bubble" }
];

const ToolsPanel = ({ isOpen, onClose }) => {
    const navRef = useRef(null);
    const [tools, setTools] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { isAuthenticated } = useAuth();

    useOnClickOutside(navRef, () => {
        if (isOpen) onClose();
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        const fetchTools = async () => {
            const { data, error } = await supabase.from('tools').select('*').order('created_at', { ascending: true });
            if (!error && data.length > 0) setTools(data);
            else setTools(INITIAL_TOOLS); // fallback
        };
        fetchTools();
    }, []);

    const filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.desc && tool.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleLaunch = (tool) => {
        if (tool.link && tool.link !== '#') window.open(tool.link, '_blank');
        else alert(`Launching ${tool.title}...`);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="px-3 pt-2 pb-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">Công Cụ</h3>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Workspace Tools</span>
                </div>
            </div>

            <div className="px-3 pb-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
                    <input
                        type="text"
                        placeholder="Tìm công cụ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-emerald-500/5 dark:bg-black/20 border border-emerald-500/20 rounded-lg text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2 mt-2 custom-scrollbar">
                {filteredTools.map((tool, idx) => (
                    <div key={idx} className="group relative flex items-center p-2 h-auto bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer" onClick={() => handleLaunch(tool)}>
                        <div className="size-8 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-2 shrink-0 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined !text-[16px]">{tool.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{tool.title}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolsPanel;
