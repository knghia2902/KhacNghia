import React from 'react';

const Landing = () => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayDate = time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-full h-full md:p-8 flex items-center justify-center">
            <div className="relative w-full max-w-[1400px] h-full flex flex-col md:flex-row">
                <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 relative z-20">
                    <div className="flex flex-col gap-6 md:gap-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 w-fit backdrop-blur-sm shadow-sm">
                            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-xs font-bold text-[#1d2624]/70 dark:text-white/70 uppercase tracking-widest">Zen Mode</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-[#1d2624] dark:text-white leading-[1.1] tracking-tight drop-shadow-sm">
                            Design your <br />
                            <span className="bg-gradient-to-r from-[#4ecdc4] to-[#ffbe76] bg-clip-text text-transparent">peace of mind.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#1d2624]/70 dark:text-white/60 font-medium leading-relaxed max-w-lg">
                            Everything you need is right here. Distraction-free, calm, and ready for your best work.
                        </p>
                        <div className="mt-4 relative w-full max-w-md group/search">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#1d2624]/40 dark:text-white/40 group-focus-within/search:text-primary transition-colors">search</span>
                            </div>
                            <input className="w-full pl-14 pr-14 py-5 bg-white/60 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/80 dark:focus:bg-black/40 transition-all shadow-sm text-lg" placeholder="What are you creating today?" type="text" />
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                <button className="size-10 rounded-xl flex items-center justify-center bg-white/50 dark:bg-white/10 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all text-[#1d2624]/60 dark:text-white/60">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-[#1d2624]/5 dark:border-white/5 flex gap-12">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/40 dark:text-white/40">Today</span>
                                <span className="text-xl font-bold text-[#1d2624] dark:text-white">{todayDate}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/40 dark:text-white/40">Local Time</span>
                                <span className="text-xl font-bold text-[#1d2624] dark:text-white font-variant-numeric tabular-nums">{timeString}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:w-[45%] h-full relative overflow-hidden hidden md:block group/visual">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover/visual:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSurl_rJXeZMa1QBJEVjRe4iBvQEawiVc3X4LWn6cw84-iQOtGYyDXxRrAxAaFgj53y_sgcfy5J6NVI7Z-tKr443HyRXtp4zOzAfmfi1619vpkEFzMwDMDw_GCGBnnnpdiBVknE6DJnLLe2U_f1JHfa5qHWne-yt7SJnvxxSPzdrd3kqYMGI20nHyqwqrVfox_DizPKYupzh9ePzkexiW7zzmVVzNsVJo88XOv4bCSU146g4VbI-tPoSamJ697SlcfDTGghx42324A")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent dark:from-[#101614]/40 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-64 aspect-[3/4] bg-white/20 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl rotate-[-8deg] translate-x-[-20px] translate-y-[20px] transition-transform duration-700 group-hover/visual:translate-x-[-30px] group-hover/visual:rotate-[-12deg]"></div>
                        <div className="absolute w-64 aspect-[3/4] bg-white/40 dark:bg-black/60 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.2)] rotate-[4deg] flex flex-col p-6 transition-transform duration-700 group-hover/visual:rotate-[0deg] group-hover/visual:scale-105">
                            <div className="flex justify-between items-start mb-auto">
                                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#4ecdc4] to-[#ffbe76] flex items-center justify-center text-white shadow-lg">
                                    <span className="material-symbols-outlined">spa</span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"></div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="h-2 w-2/3 bg-[#1d2624]/10 dark:bg-white/20 rounded-full"></div>
                                <div className="h-2 w-full bg-[#1d2624]/10 dark:bg-white/20 rounded-full"></div>
                                <div className="h-2 w-1/2 bg-[#1d2624]/10 dark:bg-white/20 rounded-full"></div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-8 rounded-full bg-cover bg-center border border-white" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB7MIfWuberaUaXXFS9ZIR4l7jNPGntBkLfEDhd9wENwskIcai7VW4YdsfZveHyFSPtobfgxcxjzDgdYh18AJS8nW6ttaRK3xlmwojv7lQmIhWglOE73TIbmoF2u38m5xSLb-2Semh66OxZkCKqHT9kC_E7S9VMFIKIynFISOg674-E00XY1Mlxsj3LpKufdVGXzS38DHVfq0nt6EBcNlei1rFRkHc5QpP10MU-9TLfPktz0SDoZWsv-iMOL2GRwvdVM5-IebgeGBL0")' }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[#1d2624] dark:text-white">Alex M.</span>
                                        <span className="text-[10px] text-[#1d2624]/60 dark:text-white/60">Admin</span>
                                    </div>
                                </div>
                                <button className="w-full py-2 rounded-lg bg-[#1d2624]/5 dark:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#1d2624] dark:text-white hover:bg-primary hover:text-white transition-colors">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
