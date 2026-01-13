import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatsCard = ({ icon, iconBg, iconColor, value, label, trend, trendUp = true }) => {
    return (
        <div className="group p-6 rounded-[1.5rem] bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${iconBg} ${iconColor}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                    {trend.includes('%') || trend.includes('New') ? (
                        <span className="material-symbols-outlined text-[14px] mr-1">{trendUp ? 'trending_up' : 'trending_down'}</span>
                    ) : null}
                    {trend}
                </span>
            </div>
            <div className="text-4xl font-extrabold text-[#1d2624] dark:text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-[#1d2624]/50 dark:text-white/50">{label}</div>
        </div>
    );
};

const ProjectItem = ({ icon, iconBg, iconColor, name, progress, colorClass, shadowClass }) => {
    return (
        <div className="flex items-center gap-4 group relative pr-4">
            <div className={`size-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} shadow-sm border border-white/40`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#1d2624] dark:text-white truncate">{name}</span>
                    <span className="text-xs font-bold text-[#1d2624]/50 dark:text-white/50">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#1d2624]/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full w-[${progress}%] ${colorClass} ${shadowClass}`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};
const SettingsForm = () => {
    const { user, updateProfile } = useAuth();
    const [displayName, setDisplayName] = React.useState(user?.user_metadata?.display_name || '');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    React.useEffect(() => {
        if (user?.user_metadata?.display_name) {
            setDisplayName(user.user_metadata.display_name);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const { success, error } = await updateProfile(displayName);

        if (success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Display Name</label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/10 dark:border-white/10 rounded-xl text-[#1d2624] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                    placeholder="Enter your name"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">Email</label>
                <div className="w-full px-4 py-3 bg-[#1d2624]/5 dark:bg-white/5 border border-[#1d2624]/5 dark:border-white/5 rounded-xl text-[#1d2624]/50 dark:text-white/50 text-sm font-medium cursor-not-allowed">
                    {user?.email}
                </div>
            </div>

            {message.text && (
                <div className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] font-bold text-sm shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
};

const Overview = () => {
    return (
        <>
            <nav className="hidden md:flex flex-col w-64 border-r border-white/20 dark:border-white/5 py-8 px-6 gap-2 shrink-0">
                <div className="mb-6 px-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/40 dark:text-white/40">Workspace</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/5 shadow-sm text-primary-dark dark:text-primary font-bold cursor-default">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Overview</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-[#1d2624]/70 dark:text-white/70 font-medium cursor-pointer">
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span>Analytics</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-[#1d2624]/70 dark:text-white/70 font-medium cursor-pointer">
                    <span className="material-symbols-outlined">group</span>
                    <span>Team</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-[#1d2624]/70 dark:text-white/70 font-medium cursor-pointer">
                    <span className="material-symbols-outlined">folder_open</span>
                    <span>Projects</span>
                </div>
                <div className="mt-8 mb-4 px-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/40 dark:text-white/40">System</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-[#1d2624]/70 dark:text-white/70 font-medium cursor-pointer">
                    <span className="material-symbols-outlined">dns</span>
                    <span>Resources</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-[#1d2624]/70 dark:text-white/70 font-medium cursor-pointer">
                    <span className="material-symbols-outlined">settings</span>
                    <span>Settings</span>
                </div>
                <div className="mt-auto">
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all text-[#1d2624] dark:text-white font-bold cursor-pointer">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sign Out</span>
                    </Link>
                </div>
            </nav>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 space-y-8 no-scrollbar" id="main-scroll-area">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[#1d2624] dark:text-white mb-1">Overview</h1>
                    <p className="text-[#1d2624]/60 dark:text-white/60 mb-8">System health and workspace metrics at a glance.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            icon="person_add"
                            iconBg="bg-primary/10"
                            iconColor="text-primary-dark dark:text-primary"
                            value="1,248"
                            label="Total Active Users"
                            trend="+12%"
                        />
                        <StatsCard
                            icon="folder"
                            iconBg="bg-secondary/10"
                            iconColor="text-secondary-dark dark:text-secondary"
                            value="86"
                            label="Projects in Progress"
                            trend="24 New"
                            trendUp={null} // Shows trend flat icon logic if needed but design has flat icon
                        />
                        {/* Adjusting last card manually for specific styling if needed */}
                        <div className="group p-6 rounded-[1.5rem] bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300">
                                    <span className="material-symbols-outlined">timer</span>
                                </div>
                                <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">98%</span>
                            </div>
                            <div className="text-4xl font-extrabold text-[#1d2624] dark:text-white mb-1">98.2%</div>
                            <div className="text-sm font-medium text-[#1d2624]/50 dark:text-white/50">System Uptime</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Profile Settings Card */}
                        <div className="p-6 md:p-8 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-[#1d2624] dark:text-white mb-6">Profile Settings</h3>
                            <SettingsForm />
                        </div>

                        {/* Active Projects */}
                        <div className="p-6 md:p-8 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">Active Projects</h3>
                                <button className="text-sm font-bold text-primary-dark dark:text-primary hover:text-secondary transition-colors">View All</button>
                            </div>
                            <div className="space-y-6">
                                <ProjectItem
                                    icon="spa" iconBg="bg-mint-soft dark:bg-white/10" iconColor="text-primary-dark dark:text-primary"
                                    name="Website Rebrand" progress={75}
                                    colorClass="bg-primary" shadowClass="shadow-[0_0_10px_rgba(78,205,196,0.3)]"
                                />
                                <ProjectItem
                                    icon="smartphone" iconBg="bg-peach-soft dark:bg-white/10" iconColor="text-secondary-dark dark:text-secondary"
                                    name="Mobile App Beta" progress={40}
                                    colorClass="bg-secondary" shadowClass="shadow-[0_0_10px_rgba(255,190,118,0.3)]"
                                />
                                <ProjectItem
                                    icon="cloud_queue" iconBg="bg-blue-50 dark:bg-white/10" iconColor="text-blue-500"
                                    name="Cloud Migration" progress={90}
                                    colorClass="bg-blue-400" shadowClass="shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="flex-1 p-6 md:p-8 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-[#1d2624] dark:text-white">System Status</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Live</span>
                                        <div className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/50 dark:text-white/50">CPU Load</span>
                                            <span className="text-xs font-bold text-[#1d2624] dark:text-white">32%</span>
                                        </div>
                                        <div className="flex gap-1 h-2">
                                            {[...Array(3)].map((_, i) => <div key={i} className="w-1 flex-1 bg-primary rounded-full opacity-100"></div>)}
                                            <div className="w-1 flex-1 bg-primary rounded-full opacity-40"></div>
                                            <div className="w-1 flex-1 bg-primary rounded-full opacity-20"></div>
                                            <div className="w-1 flex-1 bg-primary rounded-full opacity-10"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/50 dark:text-white/50">Memory</span>
                                            <span className="text-xs font-bold text-[#1d2624] dark:text-white">64%</span>
                                        </div>
                                        <div className="flex gap-1 h-2">
                                            {[...Array(5)].map((_, i) => <div key={i} className="w-1 flex-1 bg-secondary rounded-full opacity-100"></div>)}
                                            <div className="w-1 flex-1 bg-secondary rounded-full opacity-20"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/50 dark:text-white/50">Storage</span>
                                            <span className="text-xs font-bold text-[#1d2624] dark:text-white">89%</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#1d2624]/5 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#1d2624]/70 dark:bg-white/70 w-[89%] rounded-full relative overflow-hidden"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3 rounded-xl border border-[#1d2624]/10 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-[#1d2624] dark:text-white">
                                Run Diagnostics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Overview;
