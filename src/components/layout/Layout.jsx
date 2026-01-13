import React from 'react';
import Header from './Header';
import Dock from './Dock';

const Layout = ({ children }) => {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-background-light dark:bg-background-dark text-[#1d2624] dark:text-white font-display selection:bg-primary/30">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20 blur-3xl scale-110" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSurl_rJXeZMa1QBJEVRe4iBvQEawiVc3X4LWn6cw84-iQOtGYyDXxRrAxAaFgj53y_sgcfy5J6NVI7Z-tKr443HyRXtp4zOzAfmfi1619vpkEFzMwDMDw_GCGBnnnpdiBVknE6DJnLLe2U_f1JHfa5qHWne-yt7SJnvxxSPzdrd3kqYMGI20nHyqwqrVfox_DizPKYupzh9ePzkexiW7zzmVVzNsVJo88XOv4bCSU146g4VbI-tPoSamJ697SlcfDTGghx42324A")' }}></div>
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-[#4ecdc4]/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal opacity-50"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#ffbe76]/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal opacity-50"></div>
            </div>

            <Header />

            <main className="relative z-10 flex items-center justify-center h-full w-full pt-16 pb-24 md:pt-20 md:pb-[80px] px-4 md:px-0">
                <div className="relative w-full max-w-[1400px] h-full frosted-glass rounded-2xl md:rounded-[3rem] border border-white/40 dark:border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row p-2 md:p-3 lg:p-4">
                    {children}
                </div>
            </main>

            <Dock />
        </div>
    );
};

export default Layout;
