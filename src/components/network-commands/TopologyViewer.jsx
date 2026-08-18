import React from 'react';

const TOPOLOGY_NODES = [
    {
        id: 'router',
        slug: 'router',
        name: 'Edge Router',
        subtext: 'WAN Gateway & Routing',
        icon: 'router',
        protocols: ['BGP', 'OSPF', 'Static Route', 'NAT'],
        col: 1,
        row: 1,
        desc: 'Định tuyến diện rộng, BGP đa nhà mạng, OSPF Core, NAT và Static Route'
    },
    {
        id: 'firewall',
        slug: 'firewall',
        name: 'Next-Gen Firewall',
        subtext: 'Security & Policy Engine',
        icon: 'shield',
        protocols: ['Security Policy', 'NAT Source', 'Zone', 'VPN IPsec'],
        col: 2,
        row: 1,
        desc: 'Tường lửa kiểm soát truy cập, phân vùng bảo mật Zone, NAT và mã hóa VPN'
    },
    {
        id: 'core-switch',
        slug: 'switch',
        name: 'Core / Distribution Switch',
        subtext: 'L3 Backbone Switching',
        icon: 'hub',
        protocols: ['L3 Routing', 'Inter-VLAN', 'LACP / EtherChannel', 'OSPF Area 0'],
        col: 3,
        row: 1,
        desc: 'Chuyển mạch trung tâm Layer 3, định tuyến Inter-VLAN, gom kênh LACP tốc độ cao'
    },
    {
        id: 'access-switch',
        slug: 'switch',
        name: 'Access Switch',
        subtext: 'L2 Edge & Security',
        icon: 'lan',
        protocols: ['VLAN Access', 'Trunk 802.1Q', 'DHCP Snooping', 'Port Security', 'STP'],
        col: 2,
        row: 2,
        desc: 'Chuyển mạch lớp biên, gán VLAN Access/Trunk, DHCP Snooping chống Rogue DHCP, Port Security'
    },
    {
        id: 'ap-wlc',
        slug: 'ap_wlc',
        name: 'Access Point / WLC',
        subtext: 'Enterprise Wireless',
        icon: 'wifi',
        protocols: ['SSID / VLAN', 'WLC Tunnel', '802.1X Auth'],
        col: 3,
        row: 2,
        desc: 'Điểm truy cập không dây doanh nghiệp và bộ điều khiển tập trung'
    }
];

export default function TopologyViewer({ selectedDeviceType, setSelectedDeviceType }) {
    const handleNodeClick = (slug) => {
        if (selectedDeviceType === slug) {
            setSelectedDeviceType(null); // Toggle off
        } else {
            setSelectedDeviceType(slug);
        }
    };

    return (
        <div className="w-full bg-white/40 dark:bg-[#141a18]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-5 shadow-xs transition-all">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">account_tree</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#1d2624] dark:text-white flex items-center gap-2">
                            Sơ đồ Kiến trúc Mạng Doanh nghiệp (Enterprise Topology)
                        </h3>
                        <p className="text-[11px] text-[#1d2624]/60 dark:text-white/60">
                            Bấm trực tiếp vào từng vị trí thiết bị trong sơ đồ để xem các câu lệnh cấu hình tương ứng
                        </p>
                    </div>
                </div>

                {selectedDeviceType && (
                    <button
                        type="button"
                        onClick={() => setSelectedDeviceType(null)}
                        className="h-6 px-2.5 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                        Xem tất cả thiết bị
                    </button>
                )}
            </div>

            {/* Topology Interactive Layout */}
            <div className="relative">
                {/* Connecting SVG Bus / Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
                    {TOPOLOGY_NODES.map((node) => {
                        const isSelected = selectedDeviceType === node.slug;
                        return (
                            <div
                                key={node.id}
                                onClick={() => handleNodeClick(node.slug)}
                                className={`group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                    isSelected
                                        ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary dark:bg-primary/15'
                                        : 'bg-white/60 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 hover:border-black/20 hover:-translate-y-0.5'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`size-9 rounded-lg flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-white'
                                                    : 'bg-black/5 dark:bg-white/10 text-[#1d2624] dark:text-white group-hover:bg-primary/10 group-hover:text-primary'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{node.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-[#1d2624] dark:text-white leading-tight">
                                                {node.name}
                                            </h4>
                                            <span className="text-[10px] text-[#1d2624]/50 dark:text-white/50 block">
                                                {node.subtext}
                                            </span>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <span className="size-2 rounded-full bg-primary animate-pulse shrink-0 mt-1"></span>
                                    )}
                                </div>

                                <p className="text-[11px] text-[#1d2624]/70 dark:text-white/70 line-clamp-2 mb-2.5 leading-relaxed">
                                    {node.desc}
                                </p>

                                {/* Protocols / Features Tag Pills */}
                                <div className="flex items-center gap-1 flex-wrap">
                                    {node.protocols.map((p, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                                                isSelected
                                                    ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-white'
                                                    : 'bg-black/5 dark:bg-white/5 text-[#1d2624]/60 dark:text-white/60'
                                            }`}
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
