import React from 'react';

// Network Topology SVG Symbols
function EveDeviceIcon({ type, size = 44, isConfiguring = false }) {
    if (type === 'router') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                {/* Router Body (Cylinder / Circle) */}
                <circle cx="32" cy="32" r="28" fill={isConfiguring ? '#0284c7' : '#0369a1'} stroke="#ffffff" strokeWidth="2.5" />
                {/* Classic 4 Cross Arrows */}
                <path d="M18 26L32 18L46 26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 38L32 46L46 38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26 18L18 32L26 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M38 18L46 32L38 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="32" cy="32" r="4" fill="#ffffff" />
            </svg>
        );
    }

    if (type === 'switch') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                {/* Switch Body (Rectangle Box) */}
                <rect x="6" y="14" width="52" height="36" rx="6" fill={isConfiguring ? '#0d9488' : '#0f766e'} stroke="#ffffff" strokeWidth="2.5" />
                {/* 4 Opposing Horizontal Arrows */}
                <path d="M14 26H50M50 26L42 21M50 26L42 31" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M50 38H14M14 38L22 33M14 38L22 43" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === 'firewall') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                {/* Firewall Body (Shield / Brick) */}
                <path d="M32 6L10 14V32C10 46 19 54 32 58C45 54 54 46 54 32V14L32 6Z" fill={isConfiguring ? '#e11d48' : '#be123c'} stroke="#ffffff" strokeWidth="2.5" />
                {/* Brick Lines */}
                <line x1="18" y1="24" x2="46" y2="24" stroke="#ffffff" strokeWidth="2" />
                <line x1="14" y1="36" x2="50" y2="36" stroke="#ffffff" strokeWidth="2" />
                <line x1="32" y1="24" x2="32" y2="36" stroke="#ffffff" strokeWidth="2" />
                <line x1="22" y1="36" x2="22" y2="48" stroke="#ffffff" strokeWidth="2" />
                <line x1="42" y1="36" x2="42" y2="48" stroke="#ffffff" strokeWidth="2" />
            </svg>
        );
    }

    if (type === 'server') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                <rect x="12" y="10" width="40" height="44" rx="4" fill="#334155" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="18" y1="22" x2="46" y2="22" stroke="#64748b" strokeWidth="2" />
                <line x1="18" y1="34" x2="46" y2="34" stroke="#64748b" strokeWidth="2" />
                <circle cx="22" cy="16" r="2.5" fill="#10b981" />
                <circle cx="22" cy="28" r="2.5" fill="#10b981" />
                <circle cx="22" cy="40" r="2.5" fill="#10b981" />
            </svg>
        );
    }

    if (type === 'pc') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                <rect x="10" y="12" width="44" height="30" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
                <rect x="15" y="17" width="34" height="20" fill="#0284c7" />
                <path d="M26 42H38V50H26V42Z" fill="#334155" />
                <line x1="18" y1="50" x2="46" y2="50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        );
    }

    // Cloud / Internet
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
            <path d="M48 44H18C12.4772 44 8 39.5228 8 34C8 28.9488 11.751 24.7744 16.6348 24.0993C18.2323 16.9933 24.5126 12 32 12C40.6693 12 47.854 18.3976 49.0706 26.7327C53.5358 27.5255 57 31.4286 57 36.1429C57 41.3105 52.8105 44 48 44Z" fill="#475569" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
    );
}

export default function CommandTopologyDiagram({ command }) {
    if (!command) return null;

    const titleLower = (command.title_vi || '').toLowerCase();
    const syntaxLower = (command.command_syntax || command.full_syntax || '').toLowerCase();
    const vendorName = command.vendor?.name || 'Device';

    // 1. DHCP SNOOPING TOPO
    if (titleLower.includes('dhcp snooping') || syntaxLower.includes('dhcp snooping') || syntaxLower.includes('dhcp-snooping')) {
        return (
            <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
                {/* Title Bar */}
                <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 font-bold text-cyan-400">
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Sơ đồ Topo • DHCP Snooping</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Layer 2 Security
                    </span>
                </div>

                {/* SVG Canvas Board */}
                <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                    {/* Background Dot Grid */}
                    <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}
                    />

                    <div className="relative min-w-[540px] h-[220px]">
                        {/* SVG Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* Wire: DHCP Server -> Switch (Trusted Link) */}
                            <line x1="90" y1="100" x2="270" y2="100" stroke="#10b981" strokeWidth="3" strokeDasharray="6 3" />
                            
                            {/* Wire: Switch -> PC1 (Untrusted Link) */}
                            <line x1="330" y1="80" x2="480" y2="45" stroke="#0ea5e9" strokeWidth="2.5" />

                            {/* Wire: Switch -> PC2 (Untrusted Link) */}
                            <line x1="330" y1="120" x2="480" y2="160" stroke="#0ea5e9" strokeWidth="2.5" />
                        </svg>

                        {/* Node 1: DHCP Server / Router */}
                        <div className="absolute left-[30px] top-[55px] flex flex-col items-center group">
                            <EveDeviceIcon type="server" size={50} />
                            <span className="mt-1.5 text-[11px] font-bold text-white">DHCP-SRV</span>
                            <span className="text-[9px] text-emerald-400">192.168.10.1</span>
                            {/* Port Badge */}
                            <div className="absolute right-[-30px] top-[40px] px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-500 text-[9px] text-emerald-300 font-bold">
                                e0/0
                            </div>
                        </div>

                        {/* Link Label: TRUSTED */}
                        <div className="absolute left-[140px] top-[68px] z-10 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500 text-[10px] text-emerald-300 font-bold shadow">
                            TRUST PORT [Gi0/1]
                        </div>

                        {/* Node 2: Target Switch (CONFIGURING HERE) */}
                        <div className="absolute left-[245px] top-[45px] flex flex-col items-center z-10">
                            <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                                <EveDeviceIcon type="switch" size={54} isConfiguring={true} />
                                <span className="mt-1 text-[11px] font-bold text-white">{vendorName}-SW01</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500 text-slate-950 font-extrabold mt-0.5">
                                    CONFIGURING
                                </span>
                            </div>
                        </div>

                        {/* Port Badges on Switch Right */}
                        <div className="absolute left-[345px] top-[45px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-sky-500 text-[9px] text-sky-300 font-bold">
                            Gi0/2 [UNTRUST]
                        </div>
                        <div className="absolute left-[345px] top-[140px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-sky-500 text-[9px] text-sky-300 font-bold">
                            Gi0/3 [UNTRUST]
                        </div>

                        {/* Node 3: PC1 */}
                        <div className="absolute left-[470px] top-[15px] flex flex-col items-center">
                            <EveDeviceIcon type="pc" size={42} />
                            <span className="mt-1 text-[11px] font-bold text-slate-200">PC-01 (VLAN 10)</span>
                            <span className="text-[9px] text-slate-400">Rate Limit: 15pps</span>
                        </div>

                        {/* Node 4: PC2 */}
                        <div className="absolute left-[470px] top-[130px] flex flex-col items-center">
                            <EveDeviceIcon type="pc" size={42} />
                            <span className="mt-1 text-[11px] font-bold text-slate-200">PC-02 (VLAN 10)</span>
                            <span className="text-[9px] text-slate-400">Rate Limit: 15pps</span>
                        </div>
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500"></span>
                            Trusted Port (Cho phép DHCP Offer)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-sky-500"></span>
                            Untrusted Port (Chặn Rogue Server)
                        </span>
                    </div>
                    <span className="text-slate-500 font-mono">Topology Diagram</span>
                </div>
            </div>
        );
    }

    // 2. VLAN TRUNK & ACCESS TOPO
    if (titleLower.includes('trunk') || syntaxLower.includes('trunk') || titleLower.includes('vlan')) {
        return (
            <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
                <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 font-bold text-purple-400">
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Sơ đồ Topo • VLAN & 802.1Q Trunking</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Layer 2 Switching
                    </span>
                </div>

                <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                    <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}
                    />

                    <div className="relative min-w-[540px] h-[200px]">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* Trunk Cable between Switch 1 and Switch 2 */}
                            <line x1="160" y1="95" x2="380" y2="95" stroke="#a855f7" strokeWidth="4" />
                            {/* Access links */}
                            <line x1="110" y1="120" x2="60" y2="160" stroke="#38bdf8" strokeWidth="2" />
                            <line x1="430" y1="120" x2="480" y2="160" stroke="#f43f5e" strokeWidth="2" />
                        </svg>

                        {/* Switch 1 (Configuring) */}
                        <div className="absolute left-[90px] top-[40px] flex flex-col items-center z-10">
                            <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                                <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                                <span className="mt-1 text-[11px] font-bold text-white">{vendorName}-SW01</span>
                                <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">CONFIGURING</span>
                            </div>
                        </div>

                        {/* Trunk Link Tag */}
                        <div className="absolute left-[205px] top-[60px] z-10 flex flex-col items-center px-2 py-1 rounded bg-purple-950/90 border border-purple-500 shadow text-center">
                            <span className="text-[10px] text-purple-300 font-bold">TRUNK (802.1Q)</span>
                            <span className="text-[9px] text-purple-200">VLAN 10, 20 Allowed</span>
                        </div>

                        {/* Switch 2 */}
                        <div className="absolute left-[360px] top-[40px] flex flex-col items-center z-10">
                            <EveDeviceIcon type="switch" size={50} />
                            <span className="mt-1 text-[11px] font-bold text-white">SW-Core-02</span>
                            <span className="text-[9px] text-slate-400">Trunk Peer</span>
                        </div>

                        {/* PC1 (VLAN 10) */}
                        <div className="absolute left-[20px] top-[125px] flex flex-col items-center">
                            <EveDeviceIcon type="pc" size={38} />
                            <span className="text-[10px] text-sky-400 font-bold">PC-VLAN10</span>
                            <span className="text-[8px] text-slate-400">Port Gi0/1 (Access)</span>
                        </div>

                        {/* PC2 (VLAN 20) */}
                        <div className="absolute left-[450px] top-[125px] flex flex-col items-center">
                            <EveDeviceIcon type="pc" size={38} />
                            <span className="text-[10px] text-rose-400 font-bold">PC-VLAN20</span>
                            <span className="text-[8px] text-slate-400">Port Gi0/2 (Access)</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>Đường truyền Trunk gộp nhiều VLAN qua 1 kết nối vật lý</span>
                    <span className="text-slate-500 font-mono">Topology Diagram</span>
                </div>
            </div>
        );
    }

    // 3. ROUTING / OSPF / BGP / STATIC ROUTE TOPO
    if (titleLower.includes('route') || titleLower.includes('ospf') || titleLower.includes('bgp') || syntaxLower.includes('ip route') || syntaxLower.includes('router ospf')) {
        return (
            <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
                <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Sơ đồ Topo • Định tuyến IP & Giao thức Routing</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Layer 3 Forwarding
                    </span>
                </div>

                <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                    <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}
                    />

                    <div className="relative min-w-[540px] h-[190px]">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* Serial / Ethernet WAN link */}
                            <line x1="140" y1="90" x2="380" y2="90" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="8 4" />
                            {/* Cloud link */}
                            <line x1="440" y1="90" x2="490" y2="90" stroke="#64748b" strokeWidth="2.5" />
                        </svg>

                        {/* Router 1 (Local - CONFIGURING) */}
                        <div className="absolute left-[70px] top-[35px] flex flex-col items-center z-10">
                            <div className="p-2 rounded-2xl bg-sky-950/60 border-2 border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)] flex flex-col items-center">
                                <EveDeviceIcon type="router" size={52} isConfiguring={true} />
                                <span className="mt-1 text-[11px] font-bold text-white">{vendorName}-R01</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-bold">CONFIGURING</span>
                            </div>
                        </div>

                        {/* Port Tag Router 1 */}
                        <div className="absolute left-[165px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-[9px] text-amber-300 font-bold">
                            Gi0/0 (10.0.0.1/30)
                        </div>

                        {/* Hop / Subnet Box */}
                        <div className="absolute left-[230px] top-[105px] z-10 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500 text-[10px] text-amber-300 font-bold">
                            10.0.0.0/30 (Area 0)
                        </div>

                        {/* Port Tag Router 2 */}
                        <div className="absolute left-[310px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-[9px] text-amber-300 font-bold">
                            Gi0/0 (10.0.0.2/30)
                        </div>

                        {/* Router 2 (Next Hop / Peer) */}
                        <div className="absolute left-[370px] top-[40px] flex flex-col items-center z-10">
                            <EveDeviceIcon type="router" size={50} />
                            <span className="mt-1 text-[11px] font-bold text-white">ISP-Gateway-R02</span>
                            <span className="text-[9px] text-amber-400">Next-Hop 10.0.0.2</span>
                        </div>

                        {/* Internet Cloud */}
                        <div className="absolute left-[480px] top-[50px] flex flex-col items-center">
                            <EveDeviceIcon type="cloud" size={44} />
                            <span className="text-[10px] text-slate-300 font-bold">Internet</span>
                            <span className="text-[8px] text-slate-400">0.0.0.0/0</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>Chuyển tiếp gói tin qua Next-Hop IP tới mạng đích</span>
                    <span className="text-slate-500 font-mono">Topology Diagram</span>
                </div>
            </div>
        );
    }

    // 4. FIREWALL POLICY & NAT TOPO
    if (titleLower.includes('firewall') || titleLower.includes('policy') || titleLower.includes('nat') || titleLower.includes('acl') || syntaxLower.includes('firewall policy')) {
        return (
            <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
                <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Sơ đồ Topo • Next-Gen Firewall & NAT</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Security Zone Inspection
                    </span>
                </div>

                <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                    <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}
                    />

                    <div className="relative min-w-[540px] h-[190px]">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* Inside / LAN link */}
                            <line x1="120" y1="90" x2="250" y2="90" stroke="#10b981" strokeWidth="3" />
                            {/* Outside / WAN link */}
                            <line x1="320" y1="90" x2="460" y2="90" stroke="#f43f5e" strokeWidth="3" />
                        </svg>

                        {/* LAN Zone */}
                        <div className="absolute left-[30px] top-[40px] flex flex-col items-center">
                            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center">
                                <EveDeviceIcon type="pc" size={42} />
                                <span className="text-[10px] text-emerald-400 font-bold mt-1">TRUST ZONE</span>
                                <span className="text-[8px] text-slate-400">192.168.1.0/24</span>
                            </div>
                        </div>

                        {/* Port Tag LAN */}
                        <div className="absolute left-[165px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-500 text-[9px] text-emerald-300 font-bold">
                            port2 (LAN)
                        </div>

                        {/* Firewall (CONFIGURING) */}
                        <div className="absolute left-[245px] top-[35px] flex flex-col items-center z-10">
                            <div className="p-2 rounded-2xl bg-rose-950/60 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex flex-col items-center">
                                <EveDeviceIcon type="firewall" size={52} isConfiguring={true} />
                                <span className="mt-1 text-[11px] font-bold text-white">{vendorName}-FW01</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">CONFIGURING</span>
                            </div>
                        </div>

                        {/* Port Tag WAN */}
                        <div className="absolute left-[345px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-rose-500 text-[9px] text-rose-300 font-bold">
                            port1 (WAN / NAT)
                        </div>

                        {/* WAN / Internet Zone */}
                        <div className="absolute left-[450px] top-[40px] flex flex-col items-center">
                            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/50 flex flex-col items-center">
                                <EveDeviceIcon type="cloud" size={44} />
                                <span className="text-[10px] text-rose-400 font-bold mt-1">UNTRUST ZONE</span>
                                <span className="text-[8px] text-slate-400">Internet Traffic</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>Lọc gói tin theo Source/Destination Zone và kích hoạt Source NAT</span>
                    <span className="text-slate-500 font-mono">Topology Diagram</span>
                </div>
            </div>
        );
    }

    // 5. DEFAULT DEVICE LAB TOPO
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
            <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Sơ đồ Topo • Kết nối thiết bị mạng</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Active Session
                </span>
            </div>

            <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                    }}
                />

                <div className="relative min-w-[500px] h-[170px] flex items-center justify-around">
                    {/* Management Terminal */}
                    <div className="flex flex-col items-center">
                        <EveDeviceIcon type="pc" size={46} />
                        <span className="mt-1 text-[11px] font-bold text-slate-200">Admin-Console</span>
                        <span className="text-[9px] text-slate-400">SSH / Console Port</span>
                    </div>

                    {/* Connection Line */}
                    <div className="flex-1 mx-4 flex flex-col items-center">
                        <span className="text-[10px] text-cyan-400 font-bold mb-1 font-mono">
                            {command.prompt_mode || 'CLI Session'}
                        </span>
                        <div className="w-full h-0.5 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 relative">
                            <span className="size-2 rounded-full bg-cyan-400 absolute -top-[3px] left-1/2 -translate-x-1/2 animate-ping" />
                        </div>
                    </div>

                    {/* Target Node (CONFIGURING) */}
                    <div className="flex flex-col items-center z-10">
                        <div className="p-2.5 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                            <EveDeviceIcon type={titleLower.includes('router') ? 'router' : titleLower.includes('firewall') ? 'firewall' : 'switch'} size={52} isConfiguring={true} />
                            <span className="mt-1 text-[11px] font-bold text-white">{vendorName}-Node01</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500 text-slate-950 font-bold">CONFIGURING</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span>Thiết bị mạng đang nhận cấu hình trực tiếp từ CLI</span>
                <span className="text-slate-500 font-mono">Topology Diagram</span>
            </div>
        </div>
    );
}
