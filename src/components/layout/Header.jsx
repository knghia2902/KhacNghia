import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Get display name from metadata or fallback to email
    const displayName = user?.user_metadata?.display_name || (user?.email ? user.email.split('@')[0] : 'Guest');
    // Capitalize first letter if it's from email/fallback (optional, but good for consistency)
    const formattedName = user?.user_metadata?.display_name
        ? displayName
        : displayName.charAt(0).toUpperCase() + displayName.slice(1);

    return (
        <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
            <div className="flex items-center gap-3">
                <div className="size-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary-dark dark:text-primary shadow-sm">
                    <span className="material-symbols-outlined">spa</span>
                </div>
                {/* Enhanced alignment with leading-none and slight negative margin if needed */}
                <h2 className="text-xl font-extrabold tracking-tight hidden md:block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none mt-0.5">Khắc Nghĩa</h2>
            </div>
            <div className="flex items-center gap-3">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors group"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <span className="material-symbols-outlined text-[#1d2624]/70 dark:text-white/70 !text-[24px]">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                <button className="relative p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors group">
                    <span className="material-symbols-outlined text-[#1d2624]/70 dark:text-white/70 !text-[26px]">notifications</span>
                    <span className="absolute top-2.5 right-2.5 size-2 bg-secondary rounded-full border border-white dark:border-[#1d2624]"></span>
                </button>

                <div className="group relative flex items-center gap-2 pl-1 pr-4 py-1.5 rounded-full bg-white dark:bg-white/10 shadow-sm border border-transparent hover:shadow-md transition-all duration-300 ml-1">
                    <div className="size-8 rounded-full bg-cover bg-center bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7MIfWuberaUaXXFS9ZIR4l7jNPGntBkLfEDhd9wENwskIcai7VW4YdsfZveHyFSPtobfgxcxjzDgdYh18AJS8nW6ttaRK3xlmwojv7lQmIhWglOE73TIbmoF2u38m5xSLb-2Semh66OxZkCKqHT9kC_E7S9VMFIKIynFISOg674-E00XY1Mlxsj3LpKufdVGXzS38DHVfq0nt6EBcNlei1rFRkHc5QpP10MU-9TLfPktz0SDoZWsv-iMOL2GRwvdVM5-IebgeGBL0')]"></div>
                    <span className="text-sm font-bold text-[#1d2624] dark:text-white hidden md:block max-w-[120px] truncate">{formattedName}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
