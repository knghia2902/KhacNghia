import React from 'react';

// Network Topology SVG Symbols
function EveDeviceIcon({ type, size = 44, isConfiguring = false }) {
    if (type === 'router') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                <circle cx="32" cy="32" r="28" fill={isConfiguring ? '#0284c7' : '#0369a1'} stroke="#ffffff" strokeWidth="2.5" />
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
                <rect x="6" y="14" width="52" height="36" rx="6" fill={isConfiguring ? '#0d9488' : '#0f766e'} stroke="#ffffff" strokeWidth="2.5" />
                <path d="M14 26H50M50 26L42 21M50 26L42 31" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M50 38H14M14 38L22 33M14 38L22 43" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === 'firewall') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                <path d="M32 6L10 14V32C10 46 19 54 32 58C45 54 54 46 54 32V14L32 6Z" fill={isConfiguring ? '#e11d48' : '#be123c'} stroke="#ffffff" strokeWidth="2.5" />
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

    if (type === 'rogue-pc') {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
                <rect x="10" y="12" width="44" height="30" rx="3" fill="#881337" stroke="#f43f5e" strokeWidth="2.5" />
                <rect x="15" y="17" width="34" height="20" fill="#e11d48" />
                <path d="M26 42H38V50H26V42Z" fill="#4c0519" />
                <line x1="18" y1="50" x2="46" y2="50" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
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

// Wrapper Component for consistent UI
function TopologyCard({ title, badge, badgeColor, description, children }) {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-[#121820] text-slate-100 overflow-hidden shadow-xl font-mono">
            {/* Header */}
            <div className="px-4 py-2.5 bg-[#1a222d] border-b border-slate-700/80 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>{title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                    {badge}
                </span>
            </div>

            {/* Canvas */}
            <div className="relative p-6 bg-[#0f141c] overflow-x-auto">
                <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                    }}
                />
                <div className="relative min-w-[540px] h-[210px]">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#161d26] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span>{description}</span>
                <span className="text-slate-500 font-mono">Cisco Lab Topology</span>
            </div>
        </div>
    );
}

export default function CommandTopologyDiagram({ command }) {
    if (!command) return null;

    const titleLower = (command.title_vi || '').toLowerCase();
    const syntaxLower = (command.command_syntax || command.full_syntax || '').toLowerCase();
    const tagsStr = (command.tags || []).join(' ').toLowerCase();

    // 1. ETHERCHANNEL (LACP / PORT-CHANNEL)
    if (titleLower.includes('etherchannel') || syntaxLower.includes('channel-group') || tagsStr.includes('lacp')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • EtherChannel / LACP (Port-Channel)"
                badge="Layer 2 Link Aggregation"
                badgeColor="bg-teal-500/20 text-teal-300 border-teal-500/30"
                description="Gộp 2 đường vật lý Gi0/1 + Gi0/2 thành 1 link logic Port-Channel 1 (2 Gbps)"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="140" y1="85" x2="380" y2="85" stroke="#14b8a6" strokeWidth="3" />
                    <line x1="140" y1="125" x2="380" y2="125" stroke="#14b8a6" strokeWidth="3" />
                    <ellipse cx="260" cy="105" rx="22" ry="32" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                </svg>

                {/* Switch 1 (CONFIGURING) */}
                <div className="absolute left-[70px] top-[45px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">SW-Access-01</span>
                        <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">CONFIGURING</span>
                    </div>
                </div>

                {/* Ports SW1 */}
                <div className="absolute left-[155px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-teal-500 text-[9px] text-teal-300 font-bold">
                    Gi0/1 [Active]
                </div>
                <div className="absolute left-[155px] top-[125px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-teal-500 text-[9px] text-teal-300 font-bold">
                    Gi0/2 [Active]
                </div>

                {/* Center Bundle Tag */}
                <div className="absolute left-[205px] top-[15px] z-10 px-2.5 py-1 rounded bg-teal-950/90 border border-teal-400 text-center shadow">
                    <span className="text-[10px] text-teal-300 font-bold">Port-Channel 1</span>
                    <div className="text-[9px] text-teal-400">LACP Active Mode (802.3ad)</div>
                </div>

                {/* Ports SW2 */}
                <div className="absolute left-[305px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-teal-500 text-[9px] text-teal-300 font-bold">
                    Gi0/1 [Active]
                </div>
                <div className="absolute left-[305px] top-[125px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-teal-500 text-[9px] text-teal-300 font-bold">
                    Gi0/2 [Active]
                </div>

                {/* Switch 2 */}
                <div className="absolute left-[370px] top-[50px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="switch" size={50} />
                    <span className="mt-1 text-[11px] font-bold text-white">SW-Dist-01</span>
                    <span className="text-[9px] text-slate-400">LACP Peer</span>
                </div>
            </TopologyCard>
        );
    }

    // 2. HSRP / VRRP (FIRST HOP REDUNDANCY PROTOCOL)
    if (titleLower.includes('hsrp') || titleLower.includes('vrrp') || syntaxLower.includes('standby') || syntaxLower.includes('vrrp')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Dự phòng Gateway ảo HSRP / VRRP"
                badge="High Availability / FHRP"
                badgeColor="bg-sky-500/20 text-sky-300 border-sky-500/30"
                description="2 Router chạy song song chia sẻ Virtual IP Gateway 192.168.1.254 tự động chuyển mạch khi đứt kết nối"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Link R1 to PC */}
                    <line x1="140" y1="80" x2="260" y2="155" stroke="#10b981" strokeWidth="2.5" />
                    {/* Link R2 to PC */}
                    <line x1="380" y1="80" x2="260" y2="155" stroke="#64748b" strokeWidth="2.5" strokeDasharray="5 3" />
                    {/* Heartbeat link between R1 and R2 */}
                    <line x1="150" y1="50" x2="370" y2="50" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                </svg>

                {/* Router 1 - Active (CONFIGURING) */}
                <div className="absolute left-[70px] top-[15px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-sky-950/60 border-2 border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={48} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">R1-Active (Pri: 150)</span>
                        <span className="text-[9px] text-emerald-400">192.168.1.1</span>
                    </div>
                </div>

                {/* Virtual IP Tag Center */}
                <div className="absolute left-[185px] top-[15px] z-10 px-2.5 py-1 rounded bg-sky-950/90 border border-sky-400 text-center shadow">
                    <span className="text-[10px] text-cyan-300 font-bold">Virtual Gateway IP</span>
                    <div className="text-[10px] text-emerald-400 font-extrabold">192.168.1.254</div>
                </div>

                {/* Router 2 - Standby */}
                <div className="absolute left-[360px] top-[20px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="router" size={46} />
                    <span className="mt-1 text-[11px] font-bold text-white">R2-Standby (Pri: 100)</span>
                    <span className="text-[9px] text-slate-400">192.168.1.2</span>
                </div>

                {/* PC Client below */}
                <div className="absolute left-[225px] top-[135px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="pc" size={40} />
                    <span className="text-[10px] text-slate-200 font-bold">Client PC (192.168.1.50)</span>
                    <span className="text-[9px] text-sky-400">Default Gateway: 192.168.1.254</span>
                </div>
            </TopologyCard>
        );
    }

    // 3. INTER-VLAN (ROUTER-ON-A-STICK & SVI)
    if (titleLower.includes('inter-vlan') || titleLower.includes('router-on-a-stick') || syntaxLower.includes('encapsulation dot1q') || syntaxLower.includes('interface vlan')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Inter-VLAN Routing (Router-on-a-Stick & SVI)"
                badge="Layer 3 Inter-VLAN"
                badgeColor="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                description="Định tuyến giữa VLAN 10 và VLAN 20 qua sub-interface 802.1Q hoặc SVI Core Switch"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Router to Switch Trunk */}
                    <line x1="270" y1="65" x2="270" y2="120" stroke="#818cf8" strokeWidth="4" />
                    {/* Switch to PC1 (VLAN 10) */}
                    <line x1="230" y1="140" x2="100" y2="160" stroke="#38bdf8" strokeWidth="2.5" />
                    {/* Switch to PC2 (VLAN 20) */}
                    <line x1="310" y1="140" x2="440" y2="160" stroke="#f43f5e" strokeWidth="2.5" />
                </svg>

                {/* Router (CONFIGURING) */}
                <div className="absolute left-[220px] top-[5px] flex flex-col items-center z-10">
                    <div className="p-1.5 rounded-2xl bg-indigo-950/60 border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={46} isConfiguring={true} />
                        <span className="text-[10px] font-bold text-white">R1 (ROAS / SVI)</span>
                        <div className="text-[8px] text-indigo-300">G0/0.10: 192.168.10.1 • G0/0.20: 192.168.20.1</div>
                    </div>
                </div>

                {/* Switch Layer 2 */}
                <div className="absolute left-[235px] top-[105px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="switch" size={44} />
                    <span className="text-[9px] font-bold text-white">SW-Access</span>
                </div>

                {/* PC1 VLAN 10 */}
                <div className="absolute left-[30px] top-[130px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="pc" size={38} />
                    <span className="text-[10px] text-sky-400 font-bold">PC-01 (VLAN 10)</span>
                    <span className="text-[8px] text-slate-400">192.168.10.50 (GW: .1)</span>
                </div>

                {/* PC2 VLAN 20 */}
                <div className="absolute left-[400px] top-[130px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="pc" size={38} />
                    <span className="text-[10px] text-rose-400 font-bold">PC-02 (VLAN 20)</span>
                    <span className="text-[8px] text-slate-400">192.168.20.50 (GW: .1)</span>
                </div>
            </TopologyCard>
        );
    }

    // 4. STP (SPANNING TREE, ROOT BRIDGE, PORTFAST, BPDU GUARD)
    if (titleLower.includes('spanning-tree') || titleLower.includes('stp') || titleLower.includes('portfast') || titleLower.includes('bpdu') || syntaxLower.includes('spanning-tree')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Spanning Tree (STP / Rapid-PVST+ & BPDU Guard)"
                badge="Loop Prevention"
                badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
                description="Root Bridge điều phối topology, tự động block cổng vòng lặp và bảo vệ cổng Access bằng PortFast + BPDU Guard"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* SW1 to SW2 */}
                    <line x1="270" y1="50" x2="110" y2="125" stroke="#10b981" strokeWidth="3" />
                    {/* SW1 to SW3 */}
                    <line x1="270" y1="50" x2="430" y2="125" stroke="#10b981" strokeWidth="3" />
                    {/* SW2 to SW3 (Blocked Loop Link) */}
                    <line x1="125" y1="135" x2="415" y2="135" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
                    {/* SW2 to PC */}
                    <line x1="90" y1="145" x2="50" y2="175" stroke="#38bdf8" strokeWidth="2" />
                </svg>

                {/* SW1 - ROOT BRIDGE (CONFIGURING) */}
                <div className="absolute left-[210px] top-[10px] flex flex-col items-center z-10">
                    <div className="p-1.5 rounded-2xl bg-amber-950/60 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={46} isConfiguring={true} />
                        <span className="text-[10px] font-bold text-amber-300">SW-Root (Pri: 24576)</span>
                        <span className="text-[8px] px-1 rounded bg-amber-400 text-slate-950 font-bold">ROOT BRIDGE</span>
                    </div>
                </div>

                {/* SW2 Non-Root */}
                <div className="absolute left-[70px] top-[105px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="switch" size={44} />
                    <span className="text-[10px] font-bold text-white">SW-Access-01</span>
                    <span className="text-[8px] text-emerald-400">Root Port [Gi0/1]</span>
                </div>

                {/* Center Blocked Tag */}
                <div className="absolute left-[220px] top-[120px] z-10 px-2 py-0.5 rounded bg-red-950/90 border border-red-500 text-[9px] text-red-300 font-bold shadow">
                    ❌ BLOCKED PORT [Gi0/2] (Loop Free)
                </div>

                {/* SW3 Non-Root */}
                <div className="absolute left-[390px] top-[105px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="switch" size={44} />
                    <span className="text-[10px] font-bold text-white">SW-Access-02</span>
                    <span className="text-[8px] text-emerald-400">Root Port [Gi0/1]</span>
                </div>

                {/* PC Client with PortFast */}
                <div className="absolute left-[15px] top-[145px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="pc" size={32} />
                    <span className="text-[8px] text-sky-400 font-bold">PortFast + BPDU Guard</span>
                </div>
            </TopologyCard>
        );
    }

    // 5. PORT SECURITY (MAC FILTERING)
    if (titleLower.includes('port-security') || titleLower.includes('port security') || syntaxLower.includes('port-security')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Bảo mật cổng Switch Port-Security (Khóa MAC)"
                badge="Access Layer Security"
                badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
                description="Cho phép máy tính hợp lệ (Sticky MAC) và lập tức Shutdown/Drop kết nối khi cắm máy lạ"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Authorized Link */}
                    <line x1="230" y1="90" x2="90" y2="90" stroke="#10b981" strokeWidth="3" />
                    {/* Rogue Link */}
                    <line x1="310" y1="90" x2="450" y2="90" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
                </svg>

                {/* Authorized PC */}
                <div className="absolute left-[30px] top-[50px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center">
                        <EveDeviceIcon type="pc" size={42} />
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">PC-Hợp lệ (Sticky)</span>
                        <span className="text-[8px] text-slate-300">MAC: aaaa.bbbb.0001</span>
                    </div>
                </div>

                {/* Port Tag Left */}
                <div className="absolute left-[140px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-500 text-[9px] text-emerald-300 font-bold">
                    Gi0/1 [PERMIT]
                </div>

                {/* Switch (CONFIGURING) */}
                <div className="absolute left-[225px] top-[40px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">SW-Access-01</span>
                        <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">Max MAC: 1</span>
                    </div>
                </div>

                {/* Port Tag Right */}
                <div className="absolute left-[330px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-rose-500 text-[9px] text-rose-300 font-bold">
                    Gi0/2 [ERR-DISABLE]
                </div>

                {/* Rogue Laptop */}
                <div className="absolute left-[420px] top-[50px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/50 flex flex-col items-center">
                        <EveDeviceIcon type="rogue-pc" size={42} />
                        <span className="text-[10px] text-rose-400 font-bold mt-1">Thiết bị lạ (Rogue)</span>
                        <span className="text-[8px] text-rose-300">MAC: xxxx.yyyy.9999 [VIOLATION]</span>
                    </div>
                </div>
            </TopologyCard>
        );
    }

    // 6. DHCP SNOOPING & DAI
    if (titleLower.includes('dhcp snooping') || titleLower.includes('dai') || titleLower.includes('arp inspection') || syntaxLower.includes('ip dhcp snooping') || syntaxLower.includes('ip arp inspection')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • DHCP Snooping & Dynamic ARP Inspection (DAI)"
                badge="Layer 2 Security"
                badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                description="Chỉ cho phép DHCP Offer từ Trust Port và kiểm tra tính hợp lệ của gói tin ARP qua bảng DHCP Binding"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="90" y1="100" x2="270" y2="100" stroke="#10b981" strokeWidth="3" strokeDasharray="6 3" />
                    <line x1="330" y1="80" x2="480" y2="45" stroke="#0ea5e9" strokeWidth="2.5" />
                    <line x1="330" y1="120" x2="480" y2="160" stroke="#0ea5e9" strokeWidth="2.5" />
                </svg>

                {/* DHCP Server */}
                <div className="absolute left-[30px] top-[55px] flex flex-col items-center">
                    <EveDeviceIcon type="server" size={48} />
                    <span className="mt-1 text-[11px] font-bold text-white">DHCP-SRV</span>
                    <span className="text-[9px] text-emerald-400">192.168.10.1</span>
                </div>

                <div className="absolute left-[130px] top-[68px] z-10 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500 text-[10px] text-emerald-300 font-bold shadow">
                    TRUST PORT [Gi0/1]
                </div>

                {/* Switch (CONFIGURING) */}
                <div className="absolute left-[245px] top-[45px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={52} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">Cisco-SW01</span>
                        <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">DAI + Snooping Active</span>
                    </div>
                </div>

                <div className="absolute left-[335px] top-[45px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-sky-500 text-[9px] text-sky-300 font-bold">
                    Gi0/2 [UNTRUST]
                </div>
                <div className="absolute left-[335px] top-[140px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-sky-500 text-[9px] text-sky-300 font-bold">
                    Gi0/3 [UNTRUST]
                </div>

                {/* PC1 */}
                <div className="absolute left-[470px] top-[15px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={40} />
                    <span className="text-[10px] font-bold text-slate-200">PC-01 (VLAN 10)</span>
                </div>

                {/* PC2 */}
                <div className="absolute left-[470px] top-[130px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={40} />
                    <span className="text-[10px] font-bold text-slate-200">PC-02 (VLAN 10)</span>
                </div>
            </TopologyCard>
        );
    }

    // 7. GRE TUNNEL
    if (titleLower.includes('gre') || titleLower.includes('tunnel') || syntaxLower.includes('interface tunnel')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • GRE Tunnel over Internet (Site-to-Site)"
                badge="WAN / Tunneling"
                badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                description="Đóng gói gói tin IP trong đường hầm ảo Tunnel 0 kết nối thông suốt 2 mạng LAN chi nhánh"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Tunnel Curve over Cloud */}
                    <path d="M120 70 Q270 15 420 70" stroke="#06b6d4" strokeWidth="3.5" strokeDasharray="8 4" fill="none" />
                    {/* Physical WAN lines */}
                    <line x1="120" y1="90" x2="230" y2="120" stroke="#64748b" strokeWidth="2" />
                    <line x1="310" y1="120" x2="420" y2="90" stroke="#64748b" strokeWidth="2" />
                </svg>

                {/* Router HQ (CONFIGURING) */}
                <div className="absolute left-[60px] top-[45px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-sky-950/60 border-2 border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={48} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">R1-HQ (WAN: 203.0.113.1)</span>
                        <span className="text-[9px] text-cyan-300 font-bold">Tunnel 0: 192.168.100.1</span>
                    </div>
                </div>

                {/* Tunnel Header Tag */}
                <div className="absolute left-[200px] top-[10px] z-10 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-center shadow">
                    <span className="text-[10px] text-cyan-300 font-bold">GRE Tunnel (192.168.100.0/30)</span>
                </div>

                {/* Internet Cloud */}
                <div className="absolute left-[245px] top-[85px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="cloud" size={50} />
                    <span className="text-[9px] text-slate-300 font-bold">Public Internet</span>
                </div>

                {/* Router Branch */}
                <div className="absolute left-[370px] top-[45px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="router" size={48} />
                    <span className="mt-1 text-[11px] font-bold text-white">R2-Branch (WAN: 198.51.100.2)</span>
                    <span className="text-[9px] text-cyan-300 font-bold">Tunnel 0: 192.168.100.2</span>
                </div>
            </TopologyCard>
        );
    }

    // 8. BGP (EBGP / IBGP PEERING)
    if (titleLower.includes('bgp') || syntaxLower.includes('router bgp') || tagsStr.includes('bgp')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Định tuyến biên BGP Peering (eBGP)"
                badge="Service Provider & WAN"
                badgeColor="bg-orange-500/20 text-orange-300 border-orange-500/30"
                description="Thiết lập quan hệ láng giềng eBGP qua cổng TCP 179 quảng bá AS Prefix ra Internet"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="150" y1="90" x2="380" y2="90" stroke="#f97316" strokeWidth="4" />
                </svg>

                {/* Enterprise Router (CONFIGURING) */}
                <div className="absolute left-[50px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-orange-950/60 border-2 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">R1-Enterprise</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500 text-slate-950 font-extrabold">AS 65000</span>
                    </div>
                </div>

                {/* Peering Tag Center */}
                <div className="absolute left-[190px] top-[50px] z-10 px-2 py-1 rounded bg-orange-950/90 border border-orange-400 text-center shadow">
                    <span className="text-[10px] text-orange-300 font-bold">eBGP Peering (TCP 179)</span>
                    <div className="text-[9px] text-orange-200">Prefix-list / Route-map Policy</div>
                </div>

                {/* ISP Gateway */}
                <div className="absolute left-[370px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center">
                        <EveDeviceIcon type="router" size={50} />
                        <span className="mt-1 text-[11px] font-bold text-white">ISP-Border-R02</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-white font-extrabold">AS 65001</span>
                    </div>
                </div>
            </TopologyCard>
        );
    }

    // 9. NAT / PAT (NETWORK ADDRESS TRANSLATION)
    if (titleLower.includes('nat') || titleLower.includes('pat') || syntaxLower.includes('ip nat') || tagsStr.includes('nat')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Dịch địa chỉ mạng NAT / PAT (Overload)"
                badge="IP Services & Translation"
                badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                description="Biên dịch dải IP riêng Inside Local 192.168.1.0/24 sang IP công cộng Outside 203.0.113.5 để ra Internet"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="120" y1="90" x2="250" y2="90" stroke="#10b981" strokeWidth="3" />
                    <line x1="330" y1="90" x2="450" y2="90" stroke="#0ea5e9" strokeWidth="3" />
                </svg>

                {/* Inside LAN PC */}
                <div className="absolute left-[30px] top-[40px] flex flex-col items-center">
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center">
                        <EveDeviceIcon type="pc" size={42} />
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">Inside Local</span>
                        <span className="text-[8px] text-slate-300">192.168.1.50:49152</span>
                    </div>
                </div>

                {/* Port Tag Inside */}
                <div className="absolute left-[150px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-500 text-[9px] text-emerald-300 font-bold">
                    Gi0/0 (ip nat inside)
                </div>

                {/* NAT Router (CONFIGURING) */}
                <div className="absolute left-[245px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-sky-950/60 border-2 border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">NAT-Gateway-R1</span>
                        <span className="text-[9px] px-1 rounded bg-sky-500 text-slate-950 font-bold">NAT Table Active</span>
                    </div>
                </div>

                {/* Port Tag Outside */}
                <div className="absolute left-[335px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-sky-500 text-[9px] text-sky-300 font-bold">
                    Gi0/1 (ip nat outside)
                </div>

                {/* Internet Cloud */}
                <div className="absolute left-[440px] top-[40px] flex flex-col items-center">
                    <EveDeviceIcon type="cloud" size={48} />
                    <span className="text-[10px] text-sky-400 font-bold mt-1">Inside Global (Public)</span>
                    <span className="text-[8px] text-slate-300">203.0.113.5:49152</span>
                </div>
            </TopologyCard>
        );
    }

    // 10. AAA / 802.1X / RADIUS / TACACS+
    if (titleLower.includes('radius') || titleLower.includes('tacacs') || titleLower.includes('802.1x') || titleLower.includes('aaa') || syntaxLower.includes('radius server') || syntaxLower.includes('tacacs server') || syntaxLower.includes('dot1x')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Xác thực bảo mật AAA (802.1X / RADIUS / TACACS+)"
                badge="Identity & Access Control"
                badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                description="Xác thực tập trung người dùng và thiết bị qua máy chủ RADIUS (Port 1812) / TACACS+ (Port 49)"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="120" y1="90" x2="250" y2="90" stroke="#a855f7" strokeWidth="3" />
                    <line x1="330" y1="90" x2="450" y2="90" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 3" />
                </svg>

                {/* Supplicant / User */}
                <div className="absolute left-[30px] top-[45px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={42} />
                    <span className="text-[10px] text-purple-300 font-bold mt-1">Supplicant / Client</span>
                    <span className="text-[8px] text-slate-400">EAPoL Authentication</span>
                </div>

                {/* Switch Authenticator (CONFIGURING) */}
                <div className="absolute left-[245px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">SW-Authenticator</span>
                        <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">AAA New-Model</span>
                    </div>
                </div>

                {/* RADIUS / TACACS Server */}
                <div className="absolute left-[440px] top-[40px] flex flex-col items-center">
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/50 flex flex-col items-center">
                        <EveDeviceIcon type="server" size={46} />
                        <span className="text-[10px] text-purple-300 font-bold mt-1">Cisco ISE / RADIUS</span>
                        <span className="text-[8px] text-emerald-400">10.10.10.10 (UDP 1812)</span>
                    </div>
                </div>
            </TopologyCard>
        );
    }

    // 11. SPAN / PORT MIRRORING
    if (titleLower.includes('span') || titleLower.includes('mirroring') || syntaxLower.includes('monitor session')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Giám sát lưu lượng SPAN (Port Mirroring)"
                badge="Packet Capture & Analysis"
                badgeColor="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                description="Nhân bản lưu lượng từ cổng nguồn Gi1/0/1 sang cổng đích Gi1/0/2 để máy tính Wireshark bắt gói tin"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Normal Traffic Link */}
                    <line x1="80" y1="90" x2="250" y2="90" stroke="#38bdf8" strokeWidth="3" />
                    {/* Mirroring Copy Link */}
                    <line x1="320" y1="90" x2="450" y2="90" stroke="#eab308" strokeWidth="3" strokeDasharray="5 3" />
                </svg>

                {/* Monitored Host */}
                <div className="absolute left-[30px] top-[45px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={42} />
                    <span className="text-[10px] text-sky-400 font-bold mt-1">Source PC</span>
                    <span className="text-[8px] text-slate-400">Normal Network Traffic</span>
                </div>

                {/* Switch (CONFIGURING) */}
                <div className="absolute left-[245px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">SW-Core-01</span>
                        <span className="text-[9px] px-1 rounded bg-yellow-500 text-slate-950 font-bold">SPAN Session 1</span>
                    </div>
                </div>

                {/* Wireshark PC */}
                <div className="absolute left-[440px] top-[40px] flex flex-col items-center">
                    <div className="p-2 rounded-xl bg-yellow-950/40 border border-yellow-500/50 flex flex-col items-center">
                        <EveDeviceIcon type="pc" size={42} />
                        <span className="text-[10px] text-yellow-400 font-bold mt-1">Wireshark Analyzer</span>
                        <span className="text-[8px] text-yellow-300">Destination Port [Gi1/0/2]</span>
                    </div>
                </div>
            </TopologyCard>
        );
    }

    // 12. ROUTING / OSPF / STATIC / DEFAULT ROUTE
    if (titleLower.includes('route') || titleLower.includes('ospf') || syntaxLower.includes('ip route') || syntaxLower.includes('router ospf')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Định tuyến IP & Giao thức Routing (OSPF / Static)"
                badge="Layer 3 Routing"
                badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
                description="Quảng bá mạng và chuyển tiếp gói tin qua Next-Hop IP / OSPF Area 0 tới đích"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="140" y1="90" x2="380" y2="90" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="8 4" />
                    <line x1="440" y1="90" x2="490" y2="90" stroke="#64748b" strokeWidth="2.5" />
                </svg>

                {/* Router 1 (CONFIGURING) */}
                <div className="absolute left-[70px] top-[35px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-sky-950/60 border-2 border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="router" size={52} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">R1-Router</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-bold">CONFIGURING</span>
                    </div>
                </div>

                <div className="absolute left-[165px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-[9px] text-amber-300 font-bold">
                    Gi0/0 (10.0.0.1/30)
                </div>

                <div className="absolute left-[230px] top-[105px] z-10 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500 text-[10px] text-amber-300 font-bold">
                    10.0.0.0/30 (Area 0)
                </div>

                <div className="absolute left-[310px] top-[65px] z-10 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500 text-[9px] text-amber-300 font-bold">
                    Gi0/0 (10.0.0.2/30)
                </div>

                {/* Router 2 */}
                <div className="absolute left-[370px] top-[40px] flex flex-col items-center z-10">
                    <EveDeviceIcon type="router" size={50} />
                    <span className="mt-1 text-[11px] font-bold text-white">R2-Gateway</span>
                    <span className="text-[9px] text-amber-400">Next-Hop 10.0.0.2</span>
                </div>

                {/* Internet Cloud */}
                <div className="absolute left-[480px] top-[50px] flex flex-col items-center">
                    <EveDeviceIcon type="cloud" size={44} />
                    <span className="text-[10px] text-slate-300 font-bold">Internet</span>
                    <span className="text-[8px] text-slate-400">0.0.0.0/0</span>
                </div>
            </TopologyCard>
        );
    }

    // 13. VLAN & TRUNK
    if (titleLower.includes('vlan') || titleLower.includes('trunk') || syntaxLower.includes('switchport')) {
        return (
            <TopologyCard
                title="Sơ đồ Topo • Phân đoạn VLAN & Đường truyền Trunk (802.1Q)"
                badge="Layer 2 Switching"
                badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                description="Đường truyền Trunk gộp nhiều VLAN (10, 20) qua 1 kết nối vật lý nối giữa 2 Switch"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="160" y1="95" x2="380" y2="95" stroke="#a855f7" strokeWidth="4" />
                    <line x1="110" y1="120" x2="60" y2="160" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="430" y1="120" x2="480" y2="160" stroke="#f43f5e" strokeWidth="2" />
                </svg>

                {/* Switch 1 (CONFIGURING) */}
                <div className="absolute left-[90px] top-[40px] flex flex-col items-center z-10">
                    <div className="p-2 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type="switch" size={50} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">SW-Access-01</span>
                        <span className="text-[9px] px-1 rounded bg-teal-500 text-slate-950 font-bold">CONFIGURING</span>
                    </div>
                </div>

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

                {/* PC1 */}
                <div className="absolute left-[20px] top-[125px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={38} />
                    <span className="text-[10px] text-sky-400 font-bold">PC-VLAN10</span>
                </div>

                {/* PC2 */}
                <div className="absolute left-[450px] top-[125px] flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={38} />
                    <span className="text-[10px] text-rose-400 font-bold">PC-VLAN20</span>
                </div>
            </TopologyCard>
        );
    }

    // 14. DEFAULT LAB SESSION (MANAGEMENT / SSH / HOSTNAME / ACL / ETC.)
    return (
        <TopologyCard
            title="Sơ đồ Topo • Phiên quản trị & Thực thi lệnh thiết bị"
            badge="Console / SSH Session"
            badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
            description="Thiết bị mạng đang nhận và thực thi câu lệnh trực tiếp từ phiên quản trị CLI"
        >
            <div className="w-full h-full flex items-center justify-around">
                {/* Management Terminal */}
                <div className="flex flex-col items-center">
                    <EveDeviceIcon type="pc" size={46} />
                    <span className="mt-1 text-[11px] font-bold text-slate-200">Admin Terminal</span>
                    <span className="text-[9px] text-slate-400">SSH / Console Port</span>
                </div>

                {/* Connection Stream */}
                <div className="flex-1 mx-4 flex flex-col items-center">
                    <span className="text-[10px] text-cyan-400 font-bold mb-1 font-mono">
                        {command.prompt_mode || 'CLI Prompt'}
                    </span>
                    <div className="w-full h-0.5 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 relative">
                        <span className="size-2 rounded-full bg-cyan-400 absolute -top-[3px] left-1/2 -translate-x-1/2 animate-ping" />
                    </div>
                </div>

                {/* Target Device */}
                <div className="flex flex-col items-center z-10">
                    <div className="p-2.5 rounded-2xl bg-teal-950/60 border-2 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex flex-col items-center">
                        <EveDeviceIcon type={titleLower.includes('router') ? 'router' : titleLower.includes('firewall') ? 'firewall' : 'switch'} size={52} isConfiguring={true} />
                        <span className="mt-1 text-[11px] font-bold text-white">Cisco-Device</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500 text-slate-950 font-bold">CONFIGURING</span>
                    </div>
                </div>
            </div>
        </TopologyCard>
    );
}
