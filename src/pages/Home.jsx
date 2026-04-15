import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    
    // Core state
    const [time, setTime] = useState(new Date());
    
    // Agent positioning and animation state
    // Sàn có kích thước 700x700, tâm lý thuyết là (350, 350)
    // Trừ đi một nửa kích thước agent (50, 50) để căn giữa chuẩn.
    const [agentPos, setAgentPos] = useState({ left: 300, top: 310 }); 
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const [activeNode, setActiveNode] = useState(null);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayDate = time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle clicking a node (Walk-to-Navigate)
    const handleNodeClick = (targetPath, targetLeft, targetTop, nodeName) => {
        if (isAgentRunning) return; // Prevent double clicking while walking
        
        setActiveNode(nodeName);
        setIsAgentRunning(true);
        // Di chuyển nhân vật (điều chỉnh offset cho khớp tâm mặt phẳng)
        setAgentPos({ left: targetLeft, top: targetTop });

        // Đợi bằng đúng thời gian CSS transition của agent (1.5s ~ 2s)
        setTimeout(() => {
            setIsAgentRunning(false);
            // Chờ nhân vật đứng lại rồi chuyển trang
            setTimeout(() => {
                navigate(targetPath);
            }, 300);
        }, 1200); // 1.2s transition
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#101614] to-slate-900">
            {/* Header / Info HUD overlaying the 3D scene */}
            <div className="absolute top-8 left-8 z-50 pointer-events-none">
                <div className="flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 w-fit backdrop-blur-md shadow-lg">
                        <div className="size-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-white/90 uppercase tracking-widest drop-shadow-md">Digital Atrium</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-xl select-none">
                        Welcome to <br />
                        <span className="bg-gradient-to-r from-[#4ecdc4] to-cyan-300 bg-clip-text text-transparent">the System.</span>
                    </h1>
                </div>
            </div>

            <div className="absolute top-8 right-8 z-50 pointer-events-none text-right">
                <div className="mt-2 pt-4 flex gap-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 drop-shadow">Today</span>
                        <span className="text-xl font-bold text-white drop-shadow-md">{todayDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 drop-shadow">Local Time</span>
                        <span className="text-xl font-bold text-white font-variant-numeric tabular-nums drop-shadow-md">{timeString}</span>
                    </div>
                </div>
            </div>

            {/* Hint text at bottom center */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none">
                <p className="text-white/60 font-medium tracking-widest uppercase text-sm animate-pulse bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
                    Select a zone to navigate
                </p>
            </div>

            {/* 3D ISOMETRIC WORLD */}
            <div id="isometric-view" className="fixed inset-0 flex items-center justify-center z-0">
                <div id="isometric-world" className="isometric-world w-[700px] h-[700px] relative">
                    
                    {/* Glowing Floor Grid */}
                    <div className="iso-floor flex items-center justify-center">
                        <div className="absolute w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl animate-pulse"></div>
                    </div>

                    {/* ZONE 1: DOCS (Góc Trái Trên) */}
                    <div 
                        className={`cyber-pedestal ${activeNode === 'docs' ? 'ring-4 ring-cyan-400 rounded-2xl shadow-[0_0_30px_#22d3ee]' : ''}`}
                        style={{ left: '100px', top: '100px' }}
                        onClick={() => handleNodeClick('/docs', 110, 80, 'docs')}
                    >
                        <div className="pedestal-base"></div>
                        <div className="pedestal-ring"></div>
                        <div className="hologram-text">
                            <span className="material-symbols-outlined">library_books</span>
                            DOCS
                        </div>
                    </div>

                    {/* ZONE 2: ADMIN (Góc Phải Trên) */}
                    <div 
                        className={`cyber-pedestal ${activeNode === 'admin' ? 'ring-4 ring-cyan-400 rounded-2xl shadow-[0_0_30px_#22d3ee]' : ''}`}
                        style={{ left: '480px', top: '100px' }}
                        onClick={() => handleNodeClick('/admin', 490, 80, 'admin')}
                    >
                        <div className="pedestal-base"></div>
                        <div className="pedestal-ring" style={{ animationDelay: '-2s' }}></div>
                        <div className="hologram-text text-amber-300">
                            <span className="material-symbols-outlined text-amber-400">admin_panel_settings</span>
                            ADMIN
                        </div>
                    </div>

                    {/* ZONE 3: TOOLS (Góc Trái Dưới) */}
                    <div 
                        className={`cyber-pedestal ${activeNode === 'tools' ? 'ring-4 ring-cyan-400 rounded-2xl shadow-[0_0_30px_#22d3ee]' : ''}`}
                        style={{ left: '100px', top: '480px' }}
                        onClick={() => handleNodeClick('/tools', 110, 460, 'tools')}
                    >
                        <div className="pedestal-base"></div>
                        <div className="pedestal-ring" style={{ animationDelay: '-5s' }}></div>
                        <div className="hologram-text text-emerald-300">
                            <span className="material-symbols-outlined text-emerald-400">build_circle</span>
                            TOOLS
                        </div>
                    </div>

                    {/* ZONE 4: GALLERY (Góc Phải Dưới) */}
                    <div 
                        className={`cyber-pedestal ${activeNode === 'gallery' ? 'ring-4 ring-cyan-400 rounded-2xl shadow-[0_0_30px_#22d3ee]' : ''}`}
                        style={{ left: '480px', top: '480px' }}
                        onClick={() => handleNodeClick('/gallery', 490, 460, 'gallery')}
                    >
                        <div className="pedestal-base"></div>
                        <div className="pedestal-ring" style={{ animationDelay: '-7s' }}></div>
                        <div className="hologram-text text-purple-300">
                            <span className="material-symbols-outlined text-purple-400">imagesmode</span>
                            GALLERY
                        </div>
                    </div>

                    {/* CHIBI AGENT */}
                    <div 
                        className={`iso-agent ${isAgentRunning ? 'agent-run' : ''}`}
                        style={{ 
                            left: `${agentPos.left}px`, 
                            top: `${agentPos.top}px`,
                            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}
                    >
                        {/* Shadow blob dưới chân */}
                        <div className="absolute bottom-[-10px] w-20 h-6 bg-black/40 rounded-full blur-md"></div>
                        
                        <model-viewer 
                            src={isAgentRunning 
                                ? "/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Running_withSkin.glb" 
                                : "/models/Meshy_AI_Bamboo_Chef_Chibi_biped_Animation_Walking_withSkin.glb"} 
                            camera-controls={false}
                            disable-zoom
                            disable-tap
                            disable-pan
                            autoplay 
                            animation-name={isAgentRunning ? "Running" : "Walking"}
                            camera-orbit="-45deg 75deg 5m"
                            interaction-prompt="none"
                            shadow-intensity="1"
                            exposure="1.2"
                            environment-image="neutral"
                        ></model-viewer>
                    </div>

                </div>
            </div>
            
            {/* Global Styles cho overrides riêng của Home nếu cần */}
            <style>{`
                /* Vô hiệu hóa hover của model container */
                .iso-agent { pointer-events: none; }
                
                /* Riêng cho Home, nền đen mượt hơn Docs nên ta đổi gradient text của hologram admin/tools */
                .hologram-text.text-amber-300 { color: rgba(253, 230, 138, 0.9); text-shadow: 0 0 10px rgba(245, 158, 11, 0.8); }
                .hologram-text.text-emerald-300 { color: rgba(167, 243, 208, 0.9); text-shadow: 0 0 10px rgba(16, 185, 129, 0.8); }
                .hologram-text.text-purple-300 { color: rgba(216, 180, 254, 0.9); text-shadow: 0 0 10px rgba(168, 85, 247, 0.8); }
                
                .hologram-text.text-amber-300 .material-symbols-outlined { color: rgba(251, 191, 36, 0.9); }
                .hologram-text.text-emerald-300 .material-symbols-outlined { color: rgba(52, 211, 153, 0.9); }
                .hologram-text.text-purple-300 .material-symbols-outlined { color: rgba(192, 132, 252, 0.9); }
            `}</style>
        </div>
    );
};

export default Home;
