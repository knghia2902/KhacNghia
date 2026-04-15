import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ZONES = [
    {
        id: 'docs',
        label: 'DOCS',
        path: '/docs',
        icon: 'library_books',
        color: 'cyan',
        glowColor: 'rgba(6, 182, 212, 0.6)',
        bgGlow: 'rgba(6, 182, 212, 0.08)',
        model: '/models/Meshy_AI_The_Lanterned_Archive_0414101610_texture.glb',
        description: 'Tài liệu & Kiến thức'
    },
    {
        id: 'admin',
        label: 'ADMIN',
        path: '/admin',
        icon: 'admin_panel_settings',
        color: 'amber',
        glowColor: 'rgba(245, 158, 11, 0.6)',
        bgGlow: 'rgba(245, 158, 11, 0.08)',
        model: null,
        description: 'Quản trị Hệ thống'
    },
    {
        id: 'tools',
        label: 'TOOLS',
        path: '/tools',
        icon: 'construction',
        color: 'emerald',
        glowColor: 'rgba(16, 185, 129, 0.6)',
        bgGlow: 'rgba(16, 185, 129, 0.08)',
        model: null,
        description: 'Công cụ & Tiện ích'
    },
    {
        id: 'gallery',
        label: 'GALLERY',
        path: '/gallery',
        icon: 'imagesmode',
        color: 'purple',
        glowColor: 'rgba(168, 85, 247, 0.6)',
        bgGlow: 'rgba(168, 85, 247, 0.08)',
        model: null,
        description: 'Thư viện Hình ảnh'
    }
];

const COLOR_MAP = {
    cyan:    { text: '#a5f3fc', shadow: 'rgba(6, 182, 212, 0.8)',   iconColor: 'rgba(6, 182, 212, 0.9)',   border: 'rgba(6, 182, 212, 0.3)',   glow: 'rgba(6, 182, 212, 0.15)' },
    amber:   { text: '#fde68a', shadow: 'rgba(245, 158, 11, 0.8)',  iconColor: 'rgba(251, 191, 36, 0.9)',  border: 'rgba(245, 158, 11, 0.3)',  glow: 'rgba(245, 158, 11, 0.15)' },
    emerald: { text: '#a7f3d0', shadow: 'rgba(16, 185, 129, 0.8)',  iconColor: 'rgba(52, 211, 153, 0.9)',  border: 'rgba(16, 185, 129, 0.3)',  glow: 'rgba(16, 185, 129, 0.15)' },
    purple:  { text: '#d8b4fe', shadow: 'rgba(168, 85, 247, 0.8)',  iconColor: 'rgba(192, 132, 252, 0.9)', border: 'rgba(168, 85, 247, 0.3)',  glow: 'rgba(168, 85, 247, 0.15)' }
};

const Home = () => {
    const navigate = useNavigate();

    // Core state
    const [time, setTime] = useState(new Date());
    const [hoveredZone, setHoveredZone] = useState(null);
    const [zoomTarget, setZoomTarget] = useState(null);
    const gridRef = useRef(null);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayDate = time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Scroll Wheel Zoom Navigation
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        let scrollAccumulator = 0;
        const SCROLL_THRESHOLD = 150;

        const handleWheel = (e) => {
            e.preventDefault();

            if (zoomTarget) return; // Already zooming

            if (e.deltaY > 0 && hoveredZone) {
                scrollAccumulator += Math.abs(e.deltaY);

                if (scrollAccumulator >= SCROLL_THRESHOLD) {
                    scrollAccumulator = 0;
                    setZoomTarget(hoveredZone);

                    const zone = ZONES.find(z => z.id === hoveredZone);
                    if (zone) {
                        setTimeout(() => {
                            navigate(zone.path);
                        }, 650);
                    }
                }
            } else {
                scrollAccumulator = Math.max(0, scrollAccumulator - Math.abs(e.deltaY) * 0.5);
            }
        };

        grid.addEventListener('wheel', handleWheel, { passive: false });
        return () => grid.removeEventListener('wheel', handleWheel);
    }, [hoveredZone, zoomTarget, navigate]);

    // Click Navigation (fallback)
    const handleZoneClick = (zone) => {
        if (zoomTarget) return;
        setZoomTarget(zone.id);
        setTimeout(() => navigate(zone.path), 500);
    };

    // Zone cell class based on zoom state
    const getZoneCellClass = (zoneId) => {
        let cls = 'zone-cell';
        if (zoomTarget === zoneId) cls += ' zone-zooming';
        else if (zoomTarget && zoomTarget !== zoneId) cls += ' zone-fading';
        if (hoveredZone === zoneId && !zoomTarget) cls += ' zone-hovered';
        return cls;
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#101614] to-slate-900">
            {/* Header / Info HUD overlaying the Grid */}
            <div className="absolute top-6 left-8 z-50 pointer-events-none">
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 w-fit backdrop-blur-md shadow-lg">
                        <div className="size-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-white/90 uppercase tracking-widest drop-shadow-md">Digital Atrium</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-xl select-none">
                        Welcome to <br />
                        <span className="bg-gradient-to-r from-[#4ecdc4] to-cyan-300 bg-clip-text text-transparent">the System.</span>
                    </h1>
                </div>
            </div>

            <div className="absolute top-6 right-8 z-50 pointer-events-none text-right">
                <div className="mt-2 pt-2 flex gap-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 drop-shadow">Today</span>
                        <span className="text-lg font-bold text-white drop-shadow-md">{todayDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 drop-shadow">Local Time</span>
                        <span className="text-lg font-bold text-white font-variant-numeric tabular-nums drop-shadow-md">{timeString}</span>
                    </div>
                </div>
            </div>

            {/* Hint text at bottom center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none">
                <p className="text-white/50 font-medium tracking-widest uppercase text-xs animate-pulse bg-black/30 px-5 py-2 rounded-full backdrop-blur-md border border-white/5">
                    Scroll down on a zone or click to navigate
                </p>
            </div>

            {/* 4-ZONE GRID DASHBOARD */}
            <div
                ref={gridRef}
                id="zone-grid"
                className="absolute inset-0 pt-28 pb-16 px-6"
            >
                {ZONES.map((zone) => {
                    const colors = COLOR_MAP[zone.color];
                    return (
                        <div
                            key={zone.id}
                            className={getZoneCellClass(zone.id)}
                            style={{
                                '--zone-glow': colors.glow,
                                '--zone-border': colors.border,
                                '--zone-text': colors.text,
                                '--zone-shadow': colors.shadow,
                                '--zone-icon': colors.iconColor,
                            }}
                            onClick={() => handleZoneClick(zone)}
                            onMouseEnter={() => setHoveredZone(zone.id)}
                            onMouseLeave={() => setHoveredZone(null)}
                        >
                            {/* Inner glow background effect */}
                            <div
                                className="absolute inset-0 opacity-0 transition-opacity duration-500 zone-inner-glow"
                                style={{
                                    background: `radial-gradient(ellipse at center, ${zone.bgGlow} 0%, transparent 70%)`
                                }}
                            />

                            {/* Mini Isometric Scene */}
                            <div className="mini-iso-scene">
                                {/* Mini Floor */}
                                <div className="mini-iso-floor" style={{
                                    borderColor: `${zone.glowColor}`,
                                    boxShadow: `inset 0 0 30px ${zone.bgGlow}`
                                }}>
                                    {/* Grid pattern on floor */}
                                    <div className="absolute inset-0 rounded-xl" style={{
                                        backgroundImage: `
                                            linear-gradient(${zone.glowColor.replace('0.6', '0.15')} 1px, transparent 1px),
                                            linear-gradient(90deg, ${zone.glowColor.replace('0.6', '0.15')} 1px, transparent 1px)
                                        `,
                                        backgroundSize: '20px 20px'
                                    }} />
                                </div>

                                {/* 3D Content */}
                                {zone.model ? (
                                    <div className="mini-iso-model">
                                        <model-viewer
                                            src={zone.model}
                                            camera-controls={false}
                                            disable-zoom
                                            disable-tap
                                            disable-pan
                                            autoplay
                                            camera-orbit="30deg 65deg 4m"
                                            interaction-prompt="none"
                                            shadow-intensity="0.8"
                                            exposure="1.2"
                                            environment-image="neutral"
                                            style={{ width: '250px', height: '250px', pointerEvents: 'none' }}
                                        ></model-viewer>
                                    </div>
                                ) : (
                                    <div className="mini-iso-placeholder">
                                        {/* Pedestal */}
                                        <div className="placeholder-pedestal" style={{
                                            borderColor: zone.glowColor,
                                            boxShadow: `0 0 20px ${zone.bgGlow}, inset 0 0 15px ${zone.bgGlow}`
                                        }}>
                                            <div className="placeholder-ring" style={{
                                                borderColor: zone.glowColor
                                            }} />
                                        </div>
                                        {/* Floating Icon */}
                                        <div className="placeholder-icon" style={{
                                            color: colors.iconColor,
                                            textShadow: `0 0 15px ${colors.shadow}`
                                        }}>
                                            <span className="material-symbols-outlined">{zone.icon}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Zone Label (bottom-left) */}
                            <div className="zone-label">
                                <div className="zone-label-icon" style={{ color: colors.iconColor }}>
                                    <span className="material-symbols-outlined">{zone.icon}</span>
                                </div>
                                <div className="zone-label-text">
                                    <span className="zone-label-name" style={{
                                        color: colors.text,
                                        textShadow: `0 0 10px ${colors.shadow}`
                                    }}>{zone.label}</span>
                                    <span className="zone-label-desc">{zone.description}</span>
                                </div>
                            </div>

                            {/* Scroll indicator (visible on hover) */}
                            <div className="zone-scroll-hint">
                                <span className="material-symbols-outlined text-white/40 text-lg animate-bounce">
                                    expand_more
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
