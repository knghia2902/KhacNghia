import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const DockItem = ({ to, icon, exact = false }) => {
    return (
        <NavLink
            to={to}
            end={exact}
            className={({ isActive }) =>
                isActive
                    ? "flex items-center justify-center size-10 bg-gradient-to-r from-primary to-secondary rounded-full text-white shadow-lg shadow-primary/20 cursor-default transition-all"
                    : "flex items-center justify-center size-10 text-[#1d2624]/60 dark:text-white/60 hover:text-primary transition-all hover:scale-110"
            }
        >
            {({ isActive }) => (
                <span className="material-symbols-outlined text-xl">{icon}</span>
            )}
        </NavLink>
    );
};

const Dock = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Note: Scroll detection implementation depends on where the scrolling happens (window vs specific element).
    // For now assuming we will handle this via context or prop if needed, or window scroll.
    // However, in the design, the main content area scrolls, not the window. 
    // We will leave the auto-hide logic for later integration or when we finalize the scroll container.

    return (
        <div
            className={`dock-container fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-1.5 frosted-glass rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12)] max-w-[90vw] overflow-x-auto custom-scrollbar-hide ${isVisible ? '' : 'dock-hidden'}`}
            id="bottom-dock"
        >
            <DockItem to="/" icon="home" label="Home" exact />
            <DockItem to="/docs" icon="description" label="Docs" />
            <DockItem to="/tools" icon="construction" label="Tools" />
            <DockItem to="/gallery" icon="image" label="Gallery" />

            <div className="w-px h-6 bg-[#1d2624]/10 dark:bg-white/10 mx-1"></div>

            <DockItem to="/admin" icon="settings" label="Admin" />


        </div>
    );
};

export default Dock;
