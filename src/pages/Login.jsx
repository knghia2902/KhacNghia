import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay for effect
        setTimeout(() => {
            const success = login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid email or password');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/40 dark:bg-white/5 backdrop-blur-[40px] border border-white/50 dark:border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center">
                <div className="size-16 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/10 text-primary-dark dark:text-primary shadow-sm mb-6">
                    <span className="material-symbols-outlined text-[32px]">spa</span>
                </div>
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1d2624] dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-[#1d2624]/60 dark:text-white/60 text-sm font-medium">
                        Log in to <span className="font-bold bg-gradient-to-br from-[#2cb3aa] to-[#e09345] dark:from-[#4ecdc4] dark:to-[#ffbe76] bg-clip-text text-transparent">Khắc Nghĩa</span>
                    </p>
                </div>
                {error && (
                    <div className="w-full mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold text-center">
                        {error}
                    </div>
                )}
                <form className="w-full space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/50 dark:text-white/40 ml-4">Email</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1d2624]/30 dark:text-white/30 text-[20px]">mail</span>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-[1.25rem] text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 focus:bg-white/60 dark:focus:bg-black/40 text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/30 dark:placeholder:text-white/20 transition-all" 
                                placeholder="admin@khacnghia.com" 
                                type="email" 
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1d2624]/50 dark:text-white/40 ml-4">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1d2624]/30 dark:text-white/30 text-[20px]">lock</span>
                            <input 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-[1.25rem] text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 focus:bg-white/60 dark:focus:bg-black/40 text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/30 dark:placeholder:text-white/20 transition-all" 
                                placeholder="••••••••" 
                                type="password" 
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-full bg-gradient-to-br from-[#4ecdc4] to-[#ffbe76] text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                        {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : 'Login'}
                    </button>
                </form>
                <div className="mt-8 flex flex-col items-center gap-2">
                    <a className="text-xs font-bold text-[#1d2624]/50 dark:text-white/40 hover:text-primary transition-colors cursor-pointer">Forgot Password?</a>
                    <p className="text-xs font-medium text-[#1d2624]/40 dark:text-white/30">
                        Default: admin@khacnghia.com / admin123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
