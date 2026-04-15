import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // One-time migration: force dark mode for Digital Atrium redesign
        const migrated = localStorage.getItem('theme_v2_migrated');
        if (!migrated) {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('theme_v2_migrated', 'true');
            return 'dark';
        }
        // After migration, respect user preference
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
