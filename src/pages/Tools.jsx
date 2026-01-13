import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const INITIAL_TOOLS = [
    {
        id: 1,
        title: "Analytics",
        desc: "Track your progress and productivity metrics.",
        icon: "monitoring",
        iconBg: "bg-gradient-to-br from-mint-soft to-white/50 dark:from-white/10 dark:to-transparent",
        link: "#"
    },
    {
        id: 2,
        title: "Calendar",
        desc: "Manage events and set reminders.",
        icon: "calendar_month",
        iconBg: "bg-gradient-to-br from-peach-soft to-white/50 dark:from-white/10 dark:to-transparent",
        link: "#"
    },
    {
        id: 3,
        title: "Tasks",
        desc: "Organize your daily to-do list.",
        icon: "check_circle",
        iconBg: "bg-gradient-to-br from-mint-soft to-white/50 dark:from-white/10 dark:to-transparent",
        link: "#"
    },
    {
        id: 4,
        title: "Messages",
        desc: "Connect with your team instantly.",
        icon: "chat_bubble",
        iconBg: "bg-gradient-to-br from-mint-soft to-white/50 dark:from-white/10 dark:to-transparent",
        link: "#"
    }
];

const ToolCard = ({ tool, onLaunch, isAdd = false, onClick }) => {
    if (isAdd) {
        return (
            <div onClick={onClick} className="group relative flex flex-col items-center justify-center p-6 h-64 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-dashed border-white/40 dark:border-white/20 rounded-[2rem] hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="size-16 rounded-full bg-white/30 dark:bg-white/5 flex items-center justify-center text-[#1d2624]/60 dark:text-white/60 mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">add</span>
                </div>
                <h3 className="text-lg font-bold text-[#1d2624]/60 dark:text-white/60">Add Tool</h3>
            </div>
        );
    }
    return (
        <div className="group relative flex flex-col p-6 h-64 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2rem] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`size-12 rounded-2xl ${tool.icon_bg || tool.iconBg} flex items-center justify-center text-[#1d2624] dark:text-white border border-white/50 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined !text-[28px] font-light">{tool.icon}</span>
                </div>
                <button className="text-[#1d2624]/40 dark:text-white/40 hover:text-secondary transition-colors" title="Quick Favorite">
                    <span className="material-symbols-outlined !text-[20px]">star</span>
                </button>
            </div>
            <div>
                <h3 className="text-xl font-bold text-[#1d2624] dark:text-white">{tool.title}</h3>
                <p className="text-sm font-medium text-[#1d2624]/50 dark:text-white/50 mt-1 line-clamp-2">{tool.description || tool.desc}</p>
            </div>
            <div className="mt-auto">
                <button onClick={() => onLaunch(tool)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1d2624]/5 dark:bg-white/5 text-[#1d2624] dark:text-white font-bold text-sm transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-md cursor-pointer">
                    <span>Launch</span>
                    <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

const AddToolModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({ title: '', desc: '', icon: 'extension', link: '' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ title: '', desc: '', icon: 'extension', link: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div onClick={onClose} className="absolute inset-0"></div>
            <div className="relative w-full max-w-md bg-[#fcfdfd] dark:bg-[#18181b] rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/10">
                <div className="p-8">
                    <h2 className="text-2xl font-bold font-display text-[#1d2624] dark:text-white mb-6">Add New Tool</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Tool Name</label>
                            <input
                                autoFocus
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Jira"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Description</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Brief description..."
                                value={formData.desc}
                                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Link (URL)</label>
                            <input
                                type="url"
                                className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="https://..."
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Material Icon Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. work, code, terminal"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            />
                            <p className="text-[10px] text-[#1d2624]/40 dark:text-white/40 mt-1">Check Google Fonts Material Symbols for names.</p>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm text-[#1d2624]/60 dark:text-white/60 hover:bg-[#1d2624]/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">Add Tool</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Tools = () => {
    const [tools, setTools] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuthenticated } = useAuth(); // Destructure for cleaner access

    // Fetch tools from Supabase
    useEffect(() => {
        const fetchTools = async () => {
            const { data, error } = await supabase
                .from('tools')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching tools:', error);
            } else {
                // Auto-seed if empty
                if (data.length === 0) {
                    seedTools();
                } else {
                    setTools(data);
                }
            }
        };

        fetchTools();

        // Real-time subscription
        const channel = supabase
            .channel('tools_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTools(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'DELETE') {
                    setTools(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const seedTools = async () => {
        const mappedTools = INITIAL_TOOLS.map(t => ({
            title: t.title,
            description: t.desc,
            icon: t.icon,
            icon_bg: t.iconBg,
            link: t.link
        }));

        const { data, error } = await supabase.from('tools').insert(mappedTools).select();
        if (error) console.error('Error seeding tools:', error);
        else setTools(data);
    };

    const handleAddTool = async (newTool) => {
        if (!isAuthenticated) return;

        const toolToInsert = {
            title: newTool.title,
            description: newTool.desc, // Map 'desc' from form to 'description' in DB
            icon: newTool.icon,
            icon_bg: "bg-gradient-to-br from-mint-soft to-white/50 dark:from-white/10 dark:to-transparent", // Default style
            link: newTool.link
        };

        const { error } = await supabase.from('tools').insert([toolToInsert]);
        if (error) {
            console.error('Error adding tool:', error);
            alert('Failed to add tool');
        }
        // State update handled by subscription
    };

    const handleLaunch = (tool) => {
        if (tool.link && tool.link !== '#') {
            window.open(tool.link, '_blank');
        } else {
            alert(`Launching ${tool.title}... (No URL configured)`);
        }
    };

    const filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col w-full h-full relative">
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-8 pt-6 pb-2 border-b border-white/20 dark:border-white/5">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1d2624] dark:text-white tracking-tight">
                        Your <span className="bg-gradient-to-r from-[#4ecdc4] to-[#ffbe76] bg-clip-text text-transparent">Tools</span>
                    </h1>
                    <p className="text-[#1d2624]/60 dark:text-white/60 text-sm md:text-base font-medium mt-2">
                        Manage your workflow with essential precision tools.
                    </p>
                </div>
                <div className="relative w-full md:w-64 group/search">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1d2624]/40 dark:text-white/40 text-[20px]">search</span>
                    <input
                        className="w-full pl-11 pr-4 py-2 bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-[#1d2624]/40"
                        placeholder="Search tools..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pt-4 custom-scrollbar pb-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} onLaunch={handleLaunch} />
                    ))}
                    {/* Add Tool Card - Only for Admin */}
                    {isAuthenticated && <ToolCard isAdd onClick={() => setIsModalOpen(true)} />}
                </div>
            </div>

            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTool}
            />
        </div>
    );
};

export default Tools;
