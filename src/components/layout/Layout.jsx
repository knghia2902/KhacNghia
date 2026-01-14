import React from 'react';
import Header from './Header';
import Dock from './Dock';

const Layout = ({ children }) => {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-background-light dark:bg-background-dark text-[#1d2624] dark:text-white font-display selection:bg-primary/30">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20 blur-3xl scale-110" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSurl_rJXeZMa1QBJEVRe4iBvQEawiVc3X4LWn6cw84-iQOtGYyDXxRrAxAaFgj53y_sgcfy5J6NVI7Z-tKr443HyRXtp4zOzAfmfi1619vpkEFzMwDMDw_GCGBnnnpdiBVknE6DJnLLe2U_f1JHfa5qHWne-yt7SJnvxxSPzdrd3kqYMGI20nHyqwqrVfox_DizPKYupzh9ePzkexiW7zzmVVzNsVJo88XOv4bCSU146g4VbI-tPoSamJ697SlcfDTGghx42324A")' }}></div>
                {/* Light Mode Gradients */}
                <div className="absolute -top-[30%] -left-[8%] w-[80vw] h-[70vw] bg-[#36E29B] rounded-full blur-[150px] opacity-32 mix-blend-multiply dark:opacity-0"></div>
                <div className="absolute -top-[10%] -right-[20%] w-[70vw] h-[60vw] bg-[#FBE5CF] rounded-full blur-[160px] opacity-100 mix-blend-multiply dark:opacity-0"></div>
                <div className="absolute -bottom-[30%] -left-[5%] w-[70vw] h-[45vw] bg-[#F2E9D1] rounded-full blur-[160px] opacity-40 mix-blend-multiply dark:opacity-0"></div>
                <div className="absolute -bottom-[40%] -right-[10%] w-[70vw] h-[60vw] bg-[#FBF1E6] rounded-full blur-[180px] opacity-5 mix-blend-multiply dark:opacity-0"></div>
                {/* Dark Mode Gradients */}
                <div className="absolute -top-[30%] -left-[8%] w-[75vw] h-[65vw] bg-[#1a5c3a] rounded-full blur-[180px] opacity-0 dark:opacity-90"></div>
                <div className="absolute -top-[15%] -right-[15%] w-[60vw] h-[55vw] bg-[#4a3728] rounded-full blur-[160px] opacity-0 dark:opacity-70"></div>
                <div className="absolute -bottom-[30%] -left-[5%] w-[55vw] h-[50vw] bg-[#655944] rounded-full blur-[150px] opacity-0 dark:opacity-20"></div>
                <div className="absolute -bottom-[30%] -right-[10%] w-[65vw] h-[55vw] bg-[#655944] rounded-full blur-[180px] opacity-0 dark:opacity-90"></div>
            </div>

            <Header />

            <main className="relative z-10 flex items-center justify-center h-full w-full pt-16 pb-24 md:pt-20 md:pb-[80px] px-4 md:px-0">
                <div className="relative w-full max-w-[1400px] h-full frosted-glass rounded-2xl md:rounded-[3rem] border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_20px_50px_-15px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row p-0">
                    {children}
                </div>
            </main>

            <Dock />
        </div>
    );
};

export default Layout;
