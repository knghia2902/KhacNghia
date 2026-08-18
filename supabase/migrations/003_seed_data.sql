-- ==============================================================================
-- Migration: 003_seed_data.sql
-- Description: Seed initial data for Vendors, Device Types, Categories,
--              Canonical Actions, and 50+ Production Network Commands
-- ==============================================================================

-- 1. SEED VENDORS (DB-01)
INSERT INTO vendors (name, slug, os_flavors, icon_name, badge_color, display_order)
VALUES
    ('Cisco', 'cisco', ARRAY['IOS', 'IOS-XE', 'NX-OS'], 'router', '#005073', 1),
    ('Fortinet', 'fortinet', ARRAY['FortiOS 7.x', 'FortiOS 6.x'], 'security', '#EE3124', 2),
    ('Juniper', 'juniper', ARRAY['Junos OS'], 'hub', '#84BD00', 3),
    ('Palo Alto Networks', 'palo_alto', ARRAY['PAN-OS 10.x', 'PAN-OS 11.x'], 'shield', '#FA582D', 4),
    ('MikroTik', 'mikrotik', ARRAY['RouterOS v7', 'RouterOS v6'], 'settings_ethernet', '#222222', 5),
    ('Aruba / HPE', 'aruba_hpe', ARRAY['AOS-CX', 'ProCurve'], 'wifi', '#FF8300', 6),
    ('Huawei', 'huawei', ARRAY['VRP v8', 'VRP v5'], 'lan', '#CF0A2C', 7)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    os_flavors = EXCLUDED.os_flavors,
    icon_name = EXCLUDED.icon_name,
    badge_color = EXCLUDED.badge_color,
    display_order = EXCLUDED.display_order;

-- 2. SEED DEVICE TYPES (DB-02)
INSERT INTO device_types (name, slug, icon_name, description_vi, display_order)
VALUES
    ('Switch', 'switch', 'lan', 'Thiết bị chuyển mạch Layer 2 / Layer 3', 1),
    ('Router', 'router', 'router', 'Bộ định tuyến mạng diện rộng (WAN / LAN)', 2),
    ('Firewall', 'firewall', 'security', 'Tường lửa bảo mật mạng Next-Gen', 3),
    ('Access Point / WLC', 'ap_wlc', 'wifi', 'Điểm truy cập không dây và bộ điều khiển tập trung', 4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    description_vi = EXCLUDED.description_vi,
    display_order = EXCLUDED.display_order;

-- 3. SEED COMMAND CATEGORIES (DB-03)
INSERT INTO command_categories (slug, name_vi, name_en, description_vi, icon_name, display_order)
VALUES
    ('interface-port', 'Interface & Port', 'Interface & Port', 'Cấu hình cổng, tốc độ, duplex, shutdown, mô tả cổng', 'settings_ethernet', 1),
    ('vlan', 'VLAN', 'VLAN', 'Tạo/xóa VLAN, gán port access, cấu hình trunk, native VLAN', 'layers', 2),
    ('routing', 'Routing', 'Routing', 'Định tuyến tĩnh (Static Route), OSPF, BGP, RIP, Default Route', 'alt_route', 3),
    ('switching', 'Switching', 'Switching', 'STP (Spanning Tree), EtherChannel / LACP, Port-Security, LLDP/CDP', 'hub', 4),
    ('security-acl', 'Security & ACL', 'Security & ACL', 'Access-list, Firewall Policy, NAT, Security Zone, Service Object', 'shield', 5),
    ('system-mgmt', 'System & Management', 'System & Management', 'Hostname, NTP, SNMP, Syslog, SSH/Telnet, Lưu cấu hình, Backup', 'terminal', 6),
    ('aaa-user', 'AAA & User Management', 'AAA & User Management', 'Tài khoản người dùng cục bộ, RADIUS, TACACS+, phân quyền role', 'group', 7),
    ('monitoring-troubleshooting', 'Monitoring & Troubleshooting', 'Monitoring & Troubleshooting', 'Show commands, Ping, Traceroute, Debug, Packet Capture, Log view', 'monitoring', 8)
ON CONFLICT (slug) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    description_vi = EXCLUDED.description_vi,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order;

-- 4. SEED CANONICAL ACTIONS (DB-04)
INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
VALUES
    ((SELECT id FROM command_categories WHERE slug = 'interface-port'), 'interface.ip_set', 'Đặt địa chỉ IP cho Interface', 'Set Interface IP Address', 'Gán địa chỉ IPv4 và subnet mask cho cổng giao tiếp vật lý hoặc logic'),
    ((SELECT id FROM command_categories WHERE slug = 'interface-port'), 'interface.shutdown', 'Tắt/Bật Interface (Shutdown/No Shutdown)', 'Shutdown / Enable Interface', 'Vô hiệu hóa hoặc kích hoạt cổng giao tiếp'),
    ((SELECT id FROM command_categories WHERE slug = 'interface-port'), 'interface.description_set', 'Đặt mô tả cho Interface', 'Set Interface Description', 'Thêm chú thích nhận diện mục đích sử dụng cổng'),
    ((SELECT id FROM command_categories WHERE slug = 'interface-port'), 'interface.show_status', 'Xem trạng thái Interface', 'Show Interface Status', 'Kiểm tra trạng thái UP/DOWN, tốc độ, IP và thông số cổng'),

    ((SELECT id FROM command_categories WHERE slug = 'vlan'), 'vlan.create', 'Tạo VLAN mới', 'Create VLAN', 'Tạo một VLAN ID mới trên thiết bị với ID và tên'),
    ((SELECT id FROM command_categories WHERE slug = 'vlan'), 'vlan.port_access', 'Gán cổng vào VLAN (Access Port)', 'Assign Access Port to VLAN', 'Cấu hình cổng ở chế độ Access và gán vào VLAN cụ thể'),
    ((SELECT id FROM command_categories WHERE slug = 'vlan'), 'vlan.port_trunk', 'Cấu hình cổng Trunk', 'Configure Trunk Port', 'Đặt cổng hoạt động ở chế độ Trunk để truyền nhiều VLAN (802.1Q)'),
    ((SELECT id FROM command_categories WHERE slug = 'vlan'), 'vlan.show', 'Xem danh sách VLAN', 'Show VLANs', 'Hiển thị danh sách VLAN và các cổng đang gán vào'),

    ((SELECT id FROM command_categories WHERE slug = 'routing'), 'route.static_add', 'Thêm Static Route (Định tuyến tĩnh)', 'Add Static Route', 'Cấu hình đường định tuyến tĩnh tới mạng đích qua Next-Hop IP hoặc Exit Interface'),
    ((SELECT id FROM command_categories WHERE slug = 'routing'), 'route.default_add', 'Cấu hình Default Route (0.0.0.0/0)', 'Add Default Route', 'Đặt cổng thoát mặc định (Gateway of Last Resort)'),
    ((SELECT id FROM command_categories WHERE slug = 'routing'), 'route.ospf_enable', 'Bật định tuyến OSPF', 'Enable OSPF Routing', 'Khởi tạo tiến trình OSPF và quảng bá mạng vào Area'),
    ((SELECT id FROM command_categories WHERE slug = 'routing'), 'route.bgp_neighbor', 'Cấu hình BGP Neighbor', 'Configure BGP Neighbor', 'Thiết lập quan hệ hàng xóm BGP với Remote AS'),
    ((SELECT id FROM command_categories WHERE slug = 'routing'), 'route.show_table', 'Xem bảng định tuyến (Routing Table)', 'Show IP Route', 'Hiển thị bảng định tuyến IP hiện tại'),

    ((SELECT id FROM command_categories WHERE slug = 'switching'), 'switching.lacp_create', 'Cấu hình LACP / EtherChannel', 'Configure LACP / Port Channel', 'Gộp nhiều cổng vật lý thành 1 link logic tăng băng thông và dự phòng'),
    ((SELECT id FROM command_categories WHERE slug = 'switching'), 'switching.stp_mode', 'Cấu hình chế độ Spanning Tree (STP/RSTP/MSTP)', 'Configure STP Mode', 'Chọn giải thuật chống lặp vòng cho hệ thống chuyển mạch'),
    ((SELECT id FROM command_categories WHERE slug = 'switching'), 'switching.port_security', 'Cấu hình Port Security (Khóa MAC)', 'Configure Port Security', 'Giới hạn địa chỉ MAC cho phép kết nối vào cổng switch'),

    ((SELECT id FROM command_categories WHERE slug = 'security-acl'), 'security.acl_create', 'Tạo Access Control List (ACL)', 'Create ACL Rule', 'Định nghĩa tập luật lọc gói tin IP theo Source, Destination, Port'),
    ((SELECT id FROM command_categories WHERE slug = 'security-acl'), 'security.firewall_policy', 'Tạo Firewall Policy / Rule', 'Create Firewall Policy', 'Cho phép hoặc chặn lưu lượng qua lại giữa các Zone/Interface'),
    ((SELECT id FROM command_categories WHERE slug = 'security-acl'), 'security.nat_source', 'Cấu hình Source NAT (PAT / Masquerade)', 'Configure Source NAT', 'Dịch địa chỉ IP nội bộ sang IP công cộng để truy cập Internet'),

    ((SELECT id FROM command_categories WHERE slug = 'system-mgmt'), 'system.hostname_set', 'Đổi tên thiết bị (Hostname)', 'Set Hostname', 'Đặt tên định danh nhận diện thiết bị'),
    ((SELECT id FROM command_categories WHERE slug = 'system-mgmt'), 'system.config_save', 'Lưu cấu hình (Save / Commit)', 'Save Configuration / Commit', 'Lưu cấu hình đang chạy vào bộ nhớ cố định (NVRAM/Startup/Commit)'),
    ((SELECT id FROM command_categories WHERE slug = 'system-mgmt'), 'system.ntp_server_set', 'Cấu hình máy chủ NTP', 'Set NTP Server', 'Đồng bộ thời gian hệ thống với máy chủ NTP'),
    ((SELECT id FROM command_categories WHERE slug = 'system-mgmt'), 'system.reboot', 'Khởi động lại thiết bị (Reboot / Reload)', 'Reboot System', 'Tải lại hệ điều hành thiết bị'),

    ((SELECT id FROM command_categories WHERE slug = 'aaa-user'), 'aaa.user_create', 'Tạo tài khoản quản trị cục bộ', 'Create Local Admin User', 'Tạo User và Password phân quyền admin/operator'),
    ((SELECT id FROM command_categories WHERE slug = 'aaa-user'), 'aaa.radius_server_set', 'Cấu hình xác thực RADIUS', 'Configure RADIUS Server', 'Khai báo máy chủ RADIUS để xác thực người dùng tập trung'),

    ((SELECT id FROM command_categories WHERE slug = 'monitoring-troubleshooting'), 'monitoring.ping', 'Kiểm tra kết nối IP (Ping)', 'Ping Test', 'Gửi gói tin ICMP Echo Request để kiểm tra độ thông mạng'),
    ((SELECT id FROM command_categories WHERE slug = 'monitoring-troubleshooting'), 'monitoring.traceroute', 'Dò đường đi gói tin (Traceroute)', 'Traceroute', 'Xác định từng hop mà gói tin đi qua đến đích'),
    ((SELECT id FROM command_categories WHERE slug = 'monitoring-troubleshooting'), 'monitoring.show_version', 'Xem thông tin phiên bản OS & Phần cứng', 'Show Version / System Info', 'Hiển thị firmware version, model, serial number, uptime')
ON CONFLICT (action_key) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    description_vi = EXCLUDED.description_vi;


-- 5. SEED 50+ NETWORK COMMANDS & JUNCTIONS (DB-05 & DB-06)
DO $$
DECLARE
    -- Vendor IDs
    v_cisco UUID := (SELECT id FROM vendors WHERE slug = 'cisco');
    v_fortinet UUID := (SELECT id FROM vendors WHERE slug = 'fortinet');
    v_juniper UUID := (SELECT id FROM vendors WHERE slug = 'juniper');
    v_palo_alto UUID := (SELECT id FROM vendors WHERE slug = 'palo_alto');
    v_mikrotik UUID := (SELECT id FROM vendors WHERE slug = 'mikrotik');
    v_aruba UUID := (SELECT id FROM vendors WHERE slug = 'aruba_hpe');
    v_huawei UUID := (SELECT id FROM vendors WHERE slug = 'huawei');

    -- Device Type IDs
    dt_switch UUID := (SELECT id FROM device_types WHERE slug = 'switch');
    dt_router UUID := (SELECT id FROM device_types WHERE slug = 'router');
    dt_firewall UUID := (SELECT id FROM device_types WHERE slug = 'firewall');
    dt_ap UUID := (SELECT id FROM device_types WHERE slug = 'ap_wlc');

    -- Helper procedure-like insert function logic
    cmd_id UUID;
BEGIN

    -- -------------------------------------------------------------
    -- 1. CISCO COMMANDS
    -- -------------------------------------------------------------

    -- 1.1 Cisco: vlan.create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.create'),
        'vlan <vlan_id>',
        'vlan <vlan_id>\n name <vlan_name>',
        'Switch(config)#',
        'IOS-XE',
        'Tạo VLAN trên Cisco Switch',
        'Tạo một VLAN ID mới trong database VLAN và chuyển sang chế độ đặt tên VLAN (config-vlan).',
        'VLAN ID nằm trong dải 1-4094. VLAN 1, 1002-1005 là mặc định không thể xóa.',
        'show vlan brief',
        'no vlan <vlan_id>',
        false, false,
        ARRAY['vlan', 'cisco', 'switch', 'l2', 'tao vlan'],
        '[{"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "Số hiệu VLAN từ 1 đến 4094"}, {"name": "vlan_name", "type": "string", "required": false, "default": null, "description_vi": "Tên định danh cho VLAN"}]'::jsonb,
        '[{"scenario_vi": "Tạo VLAN 10 đặt tên là DATA", "cli_input": "Switch(config)# vlan 10\nSwitch(config-vlan)# name DATA\nSwitch(config-vlan)# exit", "cli_output": "", "notes_vi": "Gõ exit để áp dụng tên"}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 1.2 Cisco: vlan.port_access
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.port_access'),
        'switchport mode access\nswitchport access vlan <vlan_id>',
        'interface <interface_id>\n switchport mode access\n switchport access vlan <vlan_id>',
        'Switch(config-if)#',
        'IOS-XE',
        'Gán cổng Switch vào VLAN Access (Cisco)',
        'Chuyển cổng sang chế độ Access và gán VLAN ID tương ứng cho end-user hoặc máy chủ.',
        'Cổng access chỉ truyền tải 1 VLAN duy nhất (untagged).',
        'show interface <interface_id> switchport',
        'no switchport access vlan',
        false, false,
        ARRAY['vlan', 'access port', 'cisco', 'switch', 'gan vlan'],
        '[{"name": "interface_id", "type": "string", "required": true, "default": null, "description_vi": "Tên cổng, ví dụ Gi0/1 hoặc Gi1/0/1"}, {"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "VLAN ID cần gán"}]'::jsonb,
        '[{"scenario_vi": "Gán port Gi0/1 vào VLAN 20", "cli_input": "Switch(config)# interface Gi0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 20", "cli_output": "", "notes_vi": "Kiểm tra bằng show vlan brief"}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 1.3 Cisco: vlan.port_trunk
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.port_trunk'),
        'switchport mode trunk\nswitchport trunk allowed vlan <vlan_list>',
        'interface <interface_id>\n switchport encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan <vlan_list>',
        'Switch(config-if)#',
        'IOS-XE',
        'Cấu hình cổng Trunk 802.1Q (Cisco)',
        'Cấu hình cổng switch ở chế độ Trunk để chuyển tiếp lưu lượng nhiều VLAN qua lại giữa các switch hoặc router.',
        'Trên các dòng switch cũ (như Catalyst 3750/3560), cần thêm lệnh switchport trunk encapsulation dot1q trước khi set mode trunk.',
        'show interfaces trunk',
        'no switchport mode trunk',
        false, false,
        ARRAY['trunk', 'dot1q', 'vlan', 'cisco', 'switch'],
        '[{"name": "vlan_list", "type": "string", "required": true, "default": "all", "description_vi": "Danh sách VLAN cho phép, ví dụ 10,20,30 hoặc 1-100"}]'::jsonb,
        '[{"scenario_vi": "Cấu hình cổng Gi0/24 làm Trunk cho VLAN 10,20", "cli_input": "Switch(config)# interface Gi0/24\nSwitch(config-if)# switchport trunk encapsulation dot1q\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk allowed vlan 10,20", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '["Cẩn thận không dùng lệnh switchport trunk allowed vlan <id> mà quên từ khóa add vì sẽ ghi đè toàn bộ danh sách VLAN hiện tại."]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 1.4 Cisco: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        'ip address <ip_address> <subnet_mask>',
        'interface <interface_id>\n ip address <ip_address> <subnet_mask>\n no shutdown',
        'Router(config-if)#',
        'IOS-XE',
        'Đặt địa chỉ IP cho Interface (Cisco Router/L3 Switch)',
        'Gán địa chỉ IP và Subnet Mask cho cổng vật lý hoặc cổng ảo SVI (interface Vlan).',
        'Trên Switch L3, cổng vật lý cần chạy lệnh no switchport trước khi gán IP.',
        'show ip interface brief',
        'no ip address',
        false, false,
        ARRAY['ip address', 'interface', 'cisco', 'router', 'dat ip'],
        '[{"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IPv4 của cổng"}, {"name": "subnet_mask", "type": "subnet_mask", "required": true, "default": null, "description_vi": "Subnet mask dạng thập phân (ví dụ 255.255.255.0)"}]'::jsonb,
        '[{"scenario_vi": "Đặt IP 192.168.1.1/24 cho cổng Gi0/0/0", "cli_input": "Router(config)# interface Gi0/0/0\nRouter(config-if)# ip address 192.168.1.1 255.255.255.0\nRouter(config-if)# no shutdown", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 1.5 Cisco: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        'ip route <destination_network> <subnet_mask> <next_hop_or_interface>',
        'ip route <destination_network> <subnet_mask> <next_hop_or_interface> [<administrative_distance>]',
        'Router(config)#',
        'IOS-XE',
        'Cấu hình Static Route (Cisco)',
        'Tạo một tuyến đường định tuyến tĩnh tới dải mạng đích thông qua Next-Hop IP hoặc cổng ra.',
        'Mặc định Administrative Distance (AD) của static route là 1.',
        'show ip route static',
        'no ip route <destination_network> <subnet_mask> <next_hop_or_interface>',
        false, false,
        ARRAY['routing', 'static route', 'cisco', 'dinh tuyen tinh'],
        '[{"name": "destination_network", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ mạng đích"}, {"name": "subnet_mask", "type": "subnet_mask", "required": true, "default": null, "description_vi": "Subnet mask mạng đích"}, {"name": "next_hop_or_interface", "type": "string", "required": true, "default": null, "description_vi": "Địa chỉ IP gateway tiếp theo hoặc interface"}]'::jsonb,
        '[{"scenario_vi": "Định tuyến tới mạng 10.10.20.0/24 qua 192.168.1.254", "cli_input": "Router(config)# ip route 10.10.20.0 255.255.255.0 192.168.1.254", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 1.6 Cisco: route.ospf_enable
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.ospf_enable'),
        'router ospf <process_id>\n network <network_ip> <wildcard_mask> area <area_id>',
        'router ospf <process_id>\n router-id <router_id>\n network <network_ip> <wildcard_mask> area <area_id>',
        'Router(config)#',
        'IOS-XE',
        'Kích hoạt OSPF Routing (Cisco)',
        'Khởi tạo tiến trình OSPF và quảng bá mạng vào OSPF Area tương ứng sử dụng Wildcard Mask.',
        'Wildcard mask = 255.255.255.255 - Subnet Mask. Ví dụ /24 là 0.0.0.255.',
        'show ip ospf neighbor\nshow ip route ospf',
        'no router ospf <process_id>',
        false, false,
        ARRAY['ospf', 'routing', 'dynamic routing', 'cisco'],
        '[{"name": "process_id", "type": "integer", "required": true, "default": "1", "description_vi": "OSPF Process ID cục bộ"}, {"name": "network_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ mạng"}, {"name": "wildcard_mask", "type": "wildcard_mask", "required": true, "default": null, "description_vi": "Wildcard mask"}, {"name": "area_id", "type": "string", "required": true, "default": "0", "description_vi": "Số hiệu Area (Area 0 là Backbone)"}]'::jsonb,
        '[{"scenario_vi": "Bật OSPF process 1 cho mạng 10.0.0.0/24 vào Area 0", "cli_input": "Router(config)# router ospf 1\nRouter(config-router)# router-id 1.1.1.1\nRouter(config-router)# network 10.0.0.0 0.0.0.255 area 0", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 1.7 Cisco: system.config_save
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        'write memory',
        'copy running-config startup-config',
        'Switch#',
        'IOS-XE',
        'Lưu cấu hình đang chạy (Cisco)',
        'Ghi đè cấu hình trong RAM (running-config) vào bộ nhớ cố định NVRAM (startup-config) để giữ lại sau khi reboot.',
        'Lệnh viết tắt phổ biến: wr hoặc copy run start.',
        'show startup-config',
        null,
        false, false,
        ARRAY['save config', 'write memory', 'cisco', 'luu cau hinh', 'wr'],
        '[]'::jsonb,
        '[{"scenario_vi": "Lưu cấu hình", "cli_input": "Switch# write memory", "cli_output": "[OK]", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 1.8 Cisco: monitoring.show_version
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'monitoring.show_version'),
        'show version',
        'show version',
        'Switch#',
        'IOS-XE',
        'Xem thông tin phiên bản phần mềm Cisco (Show Version)',
        'Hiển thị thông tin hệ điều hành Cisco IOS/IOS-XE, Model thiết bị, Serial number, Uptime và dung lượng RAM/Flash.',
        'Phím tắt: sh ver',
        null, null,
        false, false,
        ARRAY['show version', 'sh ver', 'cisco', 'monitoring', 'uptime'],
        '[]'::jsonb,
        '[{"scenario_vi": "Xem phiên bản OS", "cli_input": "Switch# show version", "cli_output": "Cisco IOS XE Software, Version 17.03.04...", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 2. FORTINET COMMANDS
    -- -------------------------------------------------------------

    -- 2.1 Fortinet: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_fortinet,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        'config system interface\n edit <port_name>\n  set ip <ip_address> <subnet_mask>\n  set allowaccess <services>\n next\nend',
        'config system interface\n edit <port_name>\n  set mode static\n  set ip <ip_address> <subnet_mask>\n  set allowaccess ping https ssh\n next\nend',
        'FortiGate #',
        'FortiOS 7.x',
        'Đặt IP và quyền truy cập cho Interface FortiGate',
        'Cấu hình IP tĩnh cho cổng mạng FortiGate và mở các dịch vụ quản trị (ping, https, ssh).',
        'Gõ end để lưu cấu hình.',
        'get system interface physical\ndiagnose ip address list',
        'config system interface\n edit <port_name>\n  unset ip\n next\nend',
        false, false,
        ARRAY['fortigate', 'fortinet', 'interface', 'ip', 'allowaccess', 'firewall'],
        '[{"name": "port_name", "type": "string", "required": true, "default": "port1", "description_vi": "Tên cổng, ví dụ port1, port2, lan, wan1"}, {"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP"}, {"name": "subnet_mask", "type": "subnet_mask", "required": true, "default": "255.255.255.0", "description_vi": "Subnet Mask"}]'::jsonb,
        '[{"scenario_vi": "Đặt IP 192.168.100.1/24 cho port2 và bật ping, https", "cli_input": "FortiGate # config system interface\nFortiGate (interface) # edit port2\nFortiGate (port2) # set ip 192.168.100.1 255.255.255.0\nFortiGate (port2) # set allowaccess ping https ssh\nFortiGate (port2) # next\nFortiGate (interface) # end", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 2.2 Fortinet: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_fortinet,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        'config router static\n edit 0\n  set dst <dst_subnet>\n  set gateway <gateway_ip>\n  set device <interface_name>\n next\nend',
        'config router static\n edit 0\n  set dst <dst_subnet>\n  set gateway <gateway_ip>\n  set device <interface_name>\n  set comment <comment_text>\n next\nend',
        'FortiGate #',
        'FortiOS 7.x',
        'Thêm Static Route trên FortiGate',
        'Tạo một route tĩnh tới dải mạng đích hoặc Default Route (0.0.0.0/0) qua cổng WAN/Gateway.',
        'Lệnh edit 0 tự động tạo sequence ID tiếp theo.',
        'get router info routing-table all',
        'config router static\n delete <id>\nend',
        false, false,
        ARRAY['fortinet', 'fortigate', 'static route', 'default route', 'routing'],
        '[{"name": "dst_subnet", "type": "cidr", "required": true, "default": "0.0.0.0 0.0.0.0", "description_vi": "Địa chỉ mạng và mask đích (ví dụ 10.0.0.0 255.0.0.0 hoặc 0.0.0.0 0.0.0.0)"}, {"name": "gateway_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "IP Gateway / Next-hop"}, {"name": "interface_name", "type": "string", "required": true, "default": "wan1", "description_vi": "Tên cổng ra"}]'::jsonb,
        '[{"scenario_vi": "Tạo Default Route ra Internet qua gateway 203.0.113.1 trên port1", "cli_input": "FortiGate # config router static\nFortiGate (static) # edit 0\nFortiGate (1) # set dst 0.0.0.0 0.0.0.0\nFortiGate (1) # set gateway 203.0.113.1\nFortiGate (1) # set device port1\nFortiGate (1) # next\nFortiGate (static) # end", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 2.3 Fortinet: security.firewall_policy
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_fortinet,
        (SELECT id FROM canonical_actions WHERE action_key = 'security.firewall_policy'),
        'config firewall policy\n edit 0\n  set name <policy_name>\n  set srcintf <src_interface>\n  set dstintf <dst_interface>\n  set action accept\n  set srcaddr <src_address>\n  set dstaddr <dst_address>\n  set schedule always\n  set service <service_name>\n  set nat enable\n next\nend',
        'config firewall policy\n edit 0\n  set name <policy_name>\n  set srcintf <src_interface>\n  set dstintf <dst_interface>\n  set action accept\n  set srcaddr <src_address>\n  set dstaddr <dst_address>\n  set schedule always\n  set service <service_name>\n  set utm-status enable\n  set ssl-ssh-profile "certificate-inspection"\n  set av-profile "default"\n  set nat enable\n next\nend',
        'FortiGate #',
        'FortiOS 7.x',
        'Tạo Firewall Policy / Rule trên FortiGate',
        'Thiết lập chính sách cho phép luồng lưu lượng di chuyển giữa các Interface (ví dụ LAN ra WAN) và kích hoạt NAT.',
        'Lệnh edit 0 tự chọn ID chưa sử dụng.',
        'show firewall policy\ndiagnose firewall iprope list',
        'config firewall policy\n delete <policy_id>\nend',
        false, false,
        ARRAY['fortigate', 'fortinet', 'firewall policy', 'nat', 'acl', 'security'],
        '[{"name": "policy_name", "type": "string", "required": true, "default": null, "description_vi": "Tên định danh Policy"}, {"name": "src_interface", "type": "string", "required": true, "default": "lan", "description_vi": "Interface nguồn"}, {"name": "dst_interface", "type": "string", "required": true, "default": "wan1", "description_vi": "Interface đích"}]'::jsonb,
        '[{"scenario_vi": "Tạo Policy cho phép LAN ra WAN Internet", "cli_input": "FortiGate # config firewall policy\nFortiGate (policy) # edit 0\nFortiGate (1) # set name \"LAN_TO_INTERNET\"\nFortiGate (1) # set srcintf \"port2\"\nFortiGate (1) # set dstintf \"port1\"\nFortiGate (1) # set action accept\nFortiGate (1) # set srcaddr \"all\"\nFortiGate (1) # set dstaddr \"all\"\nFortiGate (1) # set schedule \"always\"\nFortiGate (1) # set service \"ALL\"\nFortiGate (1) # set nat enable\nFortiGate (1) # next\nFortiGate (policy) # end", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 2.4 Fortinet: monitoring.ping
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_fortinet,
        (SELECT id FROM canonical_actions WHERE action_key = 'monitoring.ping'),
        'execute ping <target_ip>',
        'execute ping-options source <source_ip>\nexecute ping <target_ip>',
        'FortiGate #',
        'FortiOS 7.x',
        'Ping kiểm tra kết nối trên FortiGate',
        'Gửi gói tin ICMP từ FortiGate tới địa chỉ đích. Có thể chỉ định IP nguồn qua ping-options.',
        'Sử dụng execute ping-options để tùy chỉnh số lượng gói, kích thước gói, IP nguồn.',
        null, null,
        false, false,
        ARRAY['fortinet', 'fortigate', 'ping', 'icmp', 'troubleshooting'],
        '[{"name": "target_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP hoặc tên miền cần ping"}]'::jsonb,
        '[{"scenario_vi": "Ping 8.8.8.8 từ FortiGate", "cli_input": "FortiGate # execute ping 8.8.8.8", "cli_output": "PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=118 time=14.2 ms...", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 3. JUNIPER COMMANDS (Junos OS)
    -- -------------------------------------------------------------

    -- 3.1 Juniper: vlan.create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_juniper,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.create'),
        'set vlans <vlan_name> vlan-id <vlan_id>',
        'set vlans <vlan_name> vlan-id <vlan_id>\nset vlans <vlan_name> description <description_text>',
        'user@switch#',
        'Junos OS',
        'Tạo VLAN trên Juniper Junos Switch',
        'Định nghĩa VLAN mới với tên và ID trong hệ thống Junos (ELS syntax).',
        'Junos yêu cầu lệnh commit để áp dụng cấu hình.',
        'show vlans',
        'delete vlans <vlan_name>',
        false, true,
        ARRAY['juniper', 'junos', 'vlan', 'els', 'switch'],
        '[{"name": "vlan_name", "type": "string", "required": true, "default": null, "description_vi": "Tên định danh VLAN"}, {"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "VLAN ID từ 1-4094"}]'::jsonb,
        '[{"scenario_vi": "Tạo VLAN Corporate (ID: 100) trên EX Switch", "cli_input": "user@switch# set vlans CORPORATE vlan-id 100\nuser@switch# commit", "cli_output": "commit complete", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 3.2 Juniper: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_juniper,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        'set interfaces <interface_name> unit 0 family inet address <ip_address>/<prefix>',
        'set interfaces <interface_name> description <desc>\nset interfaces <interface_name> unit 0 family inet address <ip_address>/<prefix>',
        'user@router#',
        'Junos OS',
        'Đặt địa chỉ IP cho Interface (Juniper)',
        'Gán địa chỉ IP và prefix length cho logical unit 0 của cổng giao tiếp trong Junos.',
        'Junos sử dụng định dạng CIDR (ví dụ /24) thay vì subnet mask dạng thập phân.',
        'show interfaces terse <interface_name>',
        'delete interfaces <interface_name> unit 0 family inet address <ip_address>/<prefix>',
        false, true,
        ARRAY['juniper', 'junos', 'ip address', 'interface', 'router'],
        '[{"name": "interface_name", "type": "string", "required": true, "default": "ge-0/0/0", "description_vi": "Tên cổng (ví dụ ge-0/0/0 hoặc xe-0/0/1)"}, {"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IPv4"}, {"name": "prefix", "type": "integer", "required": true, "default": "24", "description_vi": "Prefix length (ví dụ 24, 30)"}]'::jsonb,
        '[{"scenario_vi": "Đặt IP 10.0.1.1/30 cho cổng ge-0/0/0", "cli_input": "user@router# set interfaces ge-0/0/0 unit 0 family inet address 10.0.1.1/30\nuser@router# commit", "cli_output": "commit complete", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 3.3 Juniper: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_juniper,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        'set routing-options static route <dst_network>/<prefix> next-hop <next_hop_ip>',
        'set routing-options static route <dst_network>/<prefix> next-hop <next_hop_ip>',
        'user@router#',
        'Junos OS',
        'Thêm Static Route (Juniper Junos)',
        'Cấu hình tuyến đường tĩnh trong routing-options của Junos OS.',
        'Mặc định Next-Hop phải reachable trong bảng routing.',
        'show route <dst_network>',
        'delete routing-options static route <dst_network>/<prefix>',
        false, true,
        ARRAY['juniper', 'junos', 'static route', 'routing'],
        '[{"name": "dst_network", "type": "ipv4", "required": true, "default": "0.0.0.0", "description_vi": "Mạng đích"}, {"name": "prefix", "type": "integer", "required": true, "default": "0", "description_vi": "Prefix mask"}, {"name": "next_hop_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP Next-hop"}]'::jsonb,
        '[{"scenario_vi": "Tạo Default Route qua 172.16.1.1", "cli_input": "user@router# set routing-options static route 0.0.0.0/0 next-hop 172.16.1.1\nuser@router# commit", "cli_output": "commit complete", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 3.4 Juniper: system.config_save (commit)
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_juniper,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        'commit',
        'commit check\ncommit comment "<change_note>"\ncommit confirmed <minutes>',
        'user@switch#',
        'Junos OS',
        'Áp dụng và lưu cấu hình Junos (Commit / Commit Confirmed)',
        'Áp dụng cấu hình candidate vào running configuration. Hỗ trợ commit confirmed tự động rollback nếu mất kết nối.',
        'Dùng commit confirmed 5 để tự rollback sau 5 phút nếu kỹ sư bị ngắt kết nối.',
        'show system commit',
        'rollback 1\ncommit',
        false, false,
        ARRAY['commit', 'juniper', 'junos', 'save', 'rollback'],
        '[]'::jsonb,
        '[{"scenario_vi": "Commit cấu hình an toàn với confirmed 5 phút", "cli_input": "user@switch# commit confirmed 5", "cli_output": "commit confirmed will be automatically rolled back in 5 minutes unless confirmed", "notes_vi": "Gõ commit một lần nữa để xác nhận hoàn tất"}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 4. PALO ALTO NETWORKS COMMANDS (PAN-OS)
    -- -------------------------------------------------------------

    -- 4.1 Palo Alto: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_palo_alto,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        'set network interface ethernet <interface_name> layer3 ip <ip_address>/<prefix>',
        'set network interface ethernet <interface_name> layer3 ip <ip_address>/<prefix>',
        'admin@PA-FW#',
        'PAN-OS 11.x',
        'Đặt IP cho Interface Layer 3 trên Palo Alto',
        'Cấu hình IP CIDR cho cổng Ethernet hoạt động ở chế độ Layer 3 trong PAN-OS.',
        'PAN-OS yêu cầu commit sau khi thay đổi.',
        'show interface <interface_name>',
        'delete network interface ethernet <interface_name> layer3 ip <ip_address>/<prefix>',
        false, true,
        ARRAY['palo alto', 'pan-os', 'interface', 'layer3', 'firewall'],
        '[{"name": "interface_name", "type": "string", "required": true, "default": "ethernet1/1", "description_vi": "Tên cổng, ví dụ ethernet1/1"}, {"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP"}, {"name": "prefix", "type": "integer", "required": true, "default": "24", "description_vi": "Prefix length"}]'::jsonb,
        '[{"scenario_vi": "Đặt IP 192.168.50.1/24 cho ethernet1/2", "cli_input": "admin@PA-FW# set network interface ethernet ethernet1/2 layer3 ip 192.168.50.1/24\nadmin@PA-FW# commit", "cli_output": "Configuration committed successfully", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 4.2 Palo Alto: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_palo_alto,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        'set network virtual-router <vr_name> routing-table ip static-route <route_name> destination <dst_cidr> nexthop ip-address <gateway_ip>',
        'set network virtual-router <vr_name> routing-table ip static-route <route_name> destination <dst_cidr> interface <interface_name> nexthop ip-address <gateway_ip>',
        'admin@PA-FW#',
        'PAN-OS 11.x',
        'Thêm Static Route trong Virtual Router (Palo Alto)',
        'Khai báo tuyến đường định tuyến tĩnh bên trong Virtual Router (mặc định là "default").',
        'Cần commit để có hiệu lực.',
        'show routing route virtual-router <vr_name>',
        'delete network virtual-router <vr_name> routing-table ip static-route <route_name>',
        false, true,
        ARRAY['palo alto', 'pan-os', 'virtual router', 'static route', 'firewall'],
        '[{"name": "vr_name", "type": "string", "required": true, "default": "default", "description_vi": "Tên Virtual Router"}, {"name": "route_name", "type": "string", "required": true, "default": "Default-Gateway", "description_vi": "Tên định danh route"}, {"name": "dst_cidr", "type": "cidr", "required": true, "default": "0.0.0.0/0", "description_vi": "Dải mạng đích"}, {"name": "gateway_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Next-hop IP"}]'::jsonb,
        '[{"scenario_vi": "Thêm Default Route qua 203.0.113.1", "cli_input": "admin@PA-FW# set network virtual-router default routing-table ip static-route Internet destination 0.0.0.0/0 nexthop ip-address 203.0.113.1\nadmin@PA-FW# commit", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 4.3 Palo Alto: security.firewall_policy
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_palo_alto,
        (SELECT id FROM canonical_actions WHERE action_key = 'security.firewall_policy'),
        'set rulebase security rules <rule_name> from <from_zone> to <to_zone> source <src_addr> destination <dst_addr> application <app_name> service <service_name> action allow',
        'set rulebase security rules <rule_name> from <from_zone> to <to_zone> source <src_addr> destination <dst_addr> application <app_name> service <service_name> action allow log-end yes',
        'admin@PA-FW#',
        'PAN-OS 11.x',
        'Tạo Security Policy Rule trên Palo Alto',
        'Khai báo quy tắc kiểm soát truy cập Zone-based trên tường lửa Next-Gen Palo Alto.',
        'Hỗ trợ App-ID (như web-browsing, ssl, dns).',
        'show rulebase security rules',
        'delete rulebase security rules <rule_name>',
        false, true,
        ARRAY['palo alto', 'pan-os', 'security rule', 'zone', 'app-id', 'firewall'],
        '[{"name": "rule_name", "type": "string", "required": true, "default": null, "description_vi": "Tên policy rule"}, {"name": "from_zone", "type": "string", "required": true, "default": "Trust", "description_vi": "Zone nguồn"}, {"name": "to_zone", "type": "string", "required": true, "default": "Untrust", "description_vi": "Zone đích"}]'::jsonb,
        '[{"scenario_vi": "Cho phép Trust sang Untrust truy cập web-browsing và ssl", "cli_input": "admin@PA-FW# set rulebase security rules Allow-Internet from Trust to Untrust source any destination any application [ web-browsing ssl ] service application-default action allow\nadmin@PA-FW# commit", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 5. MIKROTIK COMMANDS (RouterOS v7)
    -- -------------------------------------------------------------

    -- 5.1 MikroTik: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_mikrotik,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        '/ip address add address=<ip_address>/<prefix> interface=<interface_name>',
        '/ip address add address=<ip_address>/<prefix> interface=<interface_name> comment="<comment_text>"',
        '[admin@MikroTik] >',
        'RouterOS v7',
        'Đặt địa chỉ IP trên MikroTik (RouterOS)',
        'Gán địa chỉ IP và dải mạng dạng CIDR cho interface trên RouterOS.',
        'Lệnh có hiệu lực ngay lập tức, không cần commit.',
        '/ip address print',
        '/ip address remove [find address="<ip_address>/<prefix>"]',
        false, false,
        ARRAY['mikrotik', 'routeros', 'ip address', 'interface', 'router'],
        '[{"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP"}, {"name": "prefix", "type": "integer", "required": true, "default": "24", "description_vi": "Prefix length"}, {"name": "interface_name", "type": "string", "required": true, "default": "ether1", "description_vi": "Tên cổng"}]'::jsonb,
        '[{"scenario_vi": "Gán IP 192.168.88.1/24 cho cổng ether2", "cli_input": "[admin@MikroTik] > /ip address add address=192.168.88.1/24 interface=ether2 comment=\"LAN Gateway\"", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 5.2 MikroTik: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_mikrotik,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        '/ip route add dst-address=<dst_network>/<prefix> gateway=<gateway_ip>',
        '/ip route add dst-address=<dst_network>/<prefix> gateway=<gateway_ip> distance=<distance_val> comment="<comment_text>"',
        '[admin@MikroTik] >',
        'RouterOS v7',
        'Thêm Route trên MikroTik RouterOS',
        'Tạo định tuyến tĩnh hoặc Default Route (0.0.0.0/0) trong bảng IP Route của MikroTik.',
        'Khoảng cách distance mặc định là 1.',
        '/ip route print',
        '/ip route remove [find dst-address="<dst_network>/<prefix>"]',
        false, false,
        ARRAY['mikrotik', 'routeros', 'ip route', 'static route', 'gateway'],
        '[{"name": "dst_network", "type": "ipv4", "required": true, "default": "0.0.0.0", "description_vi": "Địa chỉ mạng đích"}, {"name": "prefix", "type": "integer", "required": true, "default": "0", "description_vi": "Prefix length"}, {"name": "gateway_ip", "type": "string", "required": true, "default": null, "description_vi": "IP Gateway hoặc tên interface"}]'::jsonb,
        '[{"scenario_vi": "Đặt Default Route ra Internet qua gateway 192.168.1.1", "cli_input": "[admin@MikroTik] > /ip route add dst-address=0.0.0.0/0 gateway=192.168.1.1", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 5.3 MikroTik: security.nat_source
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_mikrotik,
        (SELECT id FROM canonical_actions WHERE action_key = 'security.nat_source'),
        '/ip firewall nat add chain=srcnat out-interface=<out_interface> action=masquerade',
        '/ip firewall nat add chain=srcnat src-address=<src_cidr> out-interface=<out_interface> action=masquerade comment="NAT Internet"',
        '[admin@MikroTik] >',
        'RouterOS v7',
        'Cấu hình Source NAT Masquerade trên MikroTik',
        'Dịch địa chỉ mạng LAN sang IP của cổng WAN (Masquerade) để cho phép client truy cập Internet.',
        'Masquerade phù hợp nhất cho các cổng WAN IP động (DHCP/PPPoE).',
        '/ip firewall nat print',
        '/ip firewall nat remove [find action=masquerade]',
        false, false,
        ARRAY['mikrotik', 'routeros', 'nat', 'masquerade', 'firewall'],
        '[{"name": "out_interface", "type": "string", "required": true, "default": "ether1", "description_vi": "Cổng WAN kết nối Internet"}]'::jsonb,
        '[{"scenario_vi": "Bật NAT Masquerade ra cổng ether1", "cli_input": "[admin@MikroTik] > /ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 6. ARUBA / HPE COMMANDS (AOS-CX)
    -- -------------------------------------------------------------

    -- 6.1 Aruba: vlan.create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_aruba,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.create'),
        'vlan <vlan_id>\n name <vlan_name>',
        'vlan <vlan_id>\n name <vlan_name>\n description <desc>',
        'switch(config)#',
        'AOS-CX',
        'Tạo VLAN trên Aruba AOS-CX Switch',
        'Tạo VLAN ID và đặt tên định danh trên dòng switch Aruba AOS-CX (CX 6000, 6100, 6200, 6300).',
        'AOS-CX có cú pháp hiện đại dạng CLI tương tự Cisco IOS.',
        'show vlan',
        'no vlan <vlan_id>',
        false, false,
        ARRAY['aruba', 'hpe', 'aos-cx', 'vlan', 'switch'],
        '[{"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "VLAN ID"}, {"name": "vlan_name", "type": "string", "required": true, "default": null, "description_vi": "Tên VLAN"}]'::jsonb,
        '[{"scenario_vi": "Tạo VLAN 30 VOICE trên Aruba CX", "cli_input": "switch(config)# vlan 30\nswitch(config-vlan-30)# name VOICE\nswitch(config-vlan-30)# exit", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 6.2 Aruba: vlan.port_access
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_aruba,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.port_access'),
        'interface <interface_id>\n vlan access <vlan_id>',
        'interface <interface_id>\n no shutdown\n vlan access <vlan_id>',
        'switch(config)#',
        'AOS-CX',
        'Gán Access Port vào VLAN (Aruba AOS-CX)',
        'Chuyển cổng sang chế độ Access và gán VLAN ID tương ứng.',
        'Trong AOS-CX lệnh là vlan access <id>.',
        'show interface <interface_id> brief',
        'interface <interface_id>\n no vlan access',
        false, false,
        ARRAY['aruba', 'aos-cx', 'vlan access', 'switch'],
        '[{"name": "interface_id", "type": "string", "required": true, "default": "1/1/1", "description_vi": "Tên cổng, ví dụ 1/1/1"}, {"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "VLAN ID"}]'::jsonb,
        '[{"scenario_vi": "Gán cổng 1/1/5 vào VLAN 30", "cli_input": "switch(config)# interface 1/1/5\nswitch(config-if)# vlan access 30", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 7. HUAWEI COMMANDS (VRP)
    -- -------------------------------------------------------------

    -- 7.1 Huawei: vlan.create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_huawei,
        (SELECT id FROM canonical_actions WHERE action_key = 'vlan.create'),
        'vlan <vlan_id>\n description <vlan_name>',
        'vlan <vlan_id>\n description <vlan_name>',
        '<Huawei> system-view\n[Huawei]',
        'VRP v8',
        'Tạo VLAN trên Huawei Switch (VRP)',
        'Tạo một VLAN mới trong hệ điều hành Huawei VRP và đặt tên mô tả.',
        'Chế độ cấu hình toàn cục trong Huawei gọi là system-view (phím tắt sys).',
        'display vlan',
        'undo vlan <vlan_id>',
        false, false,
        ARRAY['huawei', 'vrp', 'vlan', 'switch', 'system-view'],
        '[{"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "Số hiệu VLAN"}]'::jsonb,
        '[{"scenario_vi": "Tạo VLAN 50 trên Huawei Switch", "cli_input": "<Huawei> system-view\n[Huawei] vlan 50\n[Huawei-vlan50] description GUEST_WIFI\n[Huawei-vlan50] quit", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 7.2 Huawei: interface.ip_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_huawei,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.ip_set'),
        'interface <interface_name>\n ip address <ip_address> <subnet_mask_or_prefix>',
        'interface <interface_name>\n undo shutdown\n ip address <ip_address> <subnet_mask_or_prefix>',
        '[Huawei]',
        'VRP v8',
        'Đặt IP cho Interface trên Huawei Router/Switch',
        'Gán địa chỉ IPv4 cho cổng GigabitEthernet hoặc VLANIF trong Huawei VRP.',
        'Huawei hỗ trợ cả subnet mask thập phân và prefix length (ví dụ 24). Để xóa dùng lệnh undo ip address.',
        'display ip interface brief',
        'undo ip address',
        false, false,
        ARRAY['huawei', 'vrp', 'ip address', 'interface', 'router'],
        '[{"name": "interface_name", "type": "string", "required": true, "default": "GigabitEthernet0/0/1", "description_vi": "Tên cổng"}, {"name": "ip_address", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP"}, {"name": "subnet_mask_or_prefix", "type": "string", "required": true, "default": "24", "description_vi": "Mask hoặc prefix (ví dụ 24 hoặc 255.255.255.0)"}]'::jsonb,
        '[{"scenario_vi": "Đặt IP 10.1.1.1/24 cho GE0/0/1", "cli_input": "[Huawei] interface GigabitEthernet0/0/1\n[Huawei-GigabitEthernet0/0/1] ip address 10.1.1.1 24\n[Huawei-GigabitEthernet0/0/1] quit", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 7.3 Huawei: route.static_add
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_huawei,
        (SELECT id FROM canonical_actions WHERE action_key = 'route.static_add'),
        'ip route-static <dst_ip> <prefix> <next_hop_ip>',
        'ip route-static <dst_ip> <prefix> <next_hop_ip> [preference <pref_value>]',
        '[Huawei]',
        'VRP v8',
        'Cấu hình Static Route trên Huawei VRP',
        'Thêm đường định tuyến tĩnh vào bảng định tuyến Huawei.',
        'Mặc định preference của static route trên Huawei là 60.',
        'display ip routing-table',
        'undo ip route-static <dst_ip> <prefix> <next_hop_ip>',
        false, false,
        ARRAY['huawei', 'vrp', 'ip route-static', 'static route'],
        '[{"name": "dst_ip", "type": "ipv4", "required": true, "default": "0.0.0.0", "description_vi": "Mạng đích"}, {"name": "prefix", "type": "integer", "required": true, "default": "0", "description_vi": "Prefix"}, {"name": "next_hop_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Next hop IP"}]'::jsonb,
        '[{"scenario_vi": "Đặt Default route qua 192.168.1.254", "cli_input": "[Huawei] ip route-static 0.0.0.0 0 192.168.1.254", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 7.4 Huawei: system.config_save
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_huawei,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        'save',
        'save [safely]',
        '<Huawei>',
        'VRP v8',
        'Lưu cấu hình hệ thống Huawei VRP',
        'Lưu cấu hình đang chạy vào file flash vrpcfg.zip.',
        'Phải thực hiện ở user view (<Huawei>), nếu đang ở system-view gõ return hoặc quit.',
        'display saved-configuration',
        null,
        false, false,
        ARRAY['huawei', 'vrp', 'save', 'luu cau hinh'],
        '[]'::jsonb,
        '[{"scenario_vi": "Lưu cấu hình", "cli_input": "<Huawei> save\nAre you sure to continue? (y/n)[n]: y", "cli_output": "Save the file successfully.", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- -------------------------------------------------------------
    -- 8. EXPANDED SEED COMMANDS TO REACH 50+ COMMANDS
    -- -------------------------------------------------------------

    -- 8.1 Cisco: interface.shutdown
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'interface.shutdown'),
        'shutdown',
        'interface <interface_id>\n shutdown',
        'Switch(config-if)#',
        'IOS-XE',
        'Tắt cổng Interface (Cisco Shutdown)',
        'Tắt cổng mạng về trạng thái administratively down để bảo trì hoặc cô lập sự cố.',
        'Để bật lại cổng dùng lệnh no shutdown.',
        'show ip interface brief',
        'no shutdown',
        true, false,
        ARRAY['shutdown', 'interface', 'cisco', 'disable port'],
        '[{"name": "interface_id", "type": "string", "required": true, "default": null, "description_vi": "Tên cổng"}]'::jsonb,
        '[{"scenario_vi": "Tắt cổng Gi0/5", "cli_input": "Switch(config)# interface Gi0/5\nSwitch(config-if)# shutdown", "cli_output": "%LINK-5-CHANGED: Interface GigabitEthernet0/5, changed state to administratively down", "notes_vi": ""}]'::jsonb,
        '["Cẩn thận không shutdown cổng uplink đang quản trị từ xa."]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;

    -- 8.2 Cisco: switching.lacp_create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'switching.lacp_create'),
        'channel-group <group_number> mode active',
        'interface range <interface_range>\n channel-group <group_number> mode active',
        'Switch(config-if-range)#',
        'IOS-XE',
        'Cấu hình LACP EtherChannel (Cisco)',
        'Gộp nhiều cổng vật lý thành nhóm Port-Channel sử dụng giao thức LACP chuẩn mở (802.3ad).',
        'Mode active chủ động đàm phán LACP. Mode passive chỉ lắng nghe.',
        'show etherchannel summary',
        'no channel-group <group_number>',
        false, false,
        ARRAY['lacp', 'etherchannel', 'port-channel', 'cisco', 'switch', 'bonding'],
        '[{"name": "group_number", "type": "integer", "required": true, "default": "1", "description_vi": "Số hiệu Port-Channel ID (1-128)"}]'::jsonb,
        '[{"scenario_vi": "Gộp Gi0/1 và Gi0/2 thành Port-Channel 1", "cli_input": "Switch(config)# interface range Gi0/1 - 2\nSwitch(config-if-range)# channel-group 1 mode active", "cli_output": "Creating a port-channel interface Port-channel 1", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.3 Cisco: security.acl_create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'security.acl_create'),
        'ip access-list extended <acl_name>\n permit ip <src_ip> <src_wildcard> <dst_ip> <dst_wildcard>',
        'ip access-list extended <acl_name>\n permit tcp <src_ip> <src_wildcard> <dst_ip> <dst_wildcard> eq <port>\n deny ip any any',
        'Router(config-ext-nacl)#',
        'IOS-XE',
        'Tạo Extended Access Control List (Cisco ACL)',
        'Tạo danh sách lọc gói tin IP mở rộng theo Source IP, Destination IP, Protocol và Port.',
        'Cuối mọi ACL luôn có ngầm định deny ip any any.',
        'show ip access-lists <acl_name>',
        'no ip access-list extended <acl_name>',
        false, false,
        ARRAY['acl', 'access-list', 'cisco', 'security', 'firewall'],
        '[{"name": "acl_name", "type": "string", "required": true, "default": null, "description_vi": "Tên hoặc số hiệu ACL"}]'::jsonb,
        '[{"scenario_vi": "Cho phép mạng 192.168.1.0/24 truy cập HTTP/HTTPS máy chủ 10.0.0.10", "cli_input": "Router(config)# ip access-list extended ALLOW_WEB\nRouter(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.10 eq 80\nRouter(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.10 eq 443", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.4 Cisco: aaa.user_create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'aaa.user_create'),
        'username <username> privilege <priv_level> algorithm-type sha256 secret <password>',
        'username <username> privilege 15 algorithm-type scrypt secret <password>',
        'Router(config)#',
        'IOS-XE',
        'Tạo tài khoản quản trị cục bộ (Cisco)',
        'Tạo user quản trị với quyền hạn privilege 15 và mã hóa mật khẩu an toàn với SHA256/Scrypt.',
        'Privilege 15 là mức quyền cao nhất (toàn quyền Enable).',
        'show running-config | include username',
        'no username <username>',
        false, false,
        ARRAY['user', 'username', 'secret', 'cisco', 'privilege 15', 'aaa'],
        '[{"name": "username", "type": "string", "required": true, "default": null, "description_vi": "Tên đăng nhập"}, {"name": "priv_level", "type": "integer", "required": true, "default": "15", "description_vi": "Mức đặc quyền (1-15)"}, {"name": "password", "type": "string", "required": true, "default": null, "description_vi": "Mật khẩu"}]'::jsonb,
        '[{"scenario_vi": "Tạo user netadmin quyền 15", "cli_input": "Router(config)# username netadmin privilege 15 algorithm-type sha256 secret StrongP@ssw0rd123!", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.5 Cisco: monitoring.ping
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        (SELECT id FROM canonical_actions WHERE action_key = 'monitoring.ping'),
        'ping <target_ip>',
        'ping <target_ip> source <source_ip_or_interface> repeat <count>',
        'Router#',
        'IOS-XE',
        'Ping kiểm tra kết nối mạng (Cisco)',
        'Gửi gói tin ICMP Echo tới địa chỉ đích để kiểm tra độ trễ và mất gói.',
        'Dấu chấm (.) nghĩa là timeout, dấu chấm than (!) nghĩa là thành công.',
        null, null,
        false, false,
        ARRAY['ping', 'icmp', 'cisco', 'troubleshooting'],
        '[{"name": "target_ip", "type": "ipv4", "required": true, "default": null, "description_vi": "Địa chỉ IP đích"}]'::jsonb,
        '[{"scenario_vi": "Ping 8.8.8.8 với nguồn là Loopback0", "cli_input": "Router# ping 8.8.8.8 source Loopback0 repeat 5", "cli_output": "Sending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 12/15/19 ms", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.6 Fortinet: system.hostname_set
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_fortinet,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.hostname_set'),
        'config system global\n set hostname <hostname>\nend',
        'config system global\n set hostname <hostname>\nend',
        'FortiGate #',
        'FortiOS 7.x',
        'Đổi Hostname trên FortiGate',
        'Thay đổi tên nhận diện của thiết bị tường lửa FortiGate.',
        'Tên hostname không quá 35 ký tự và không chứa khoảng trắng.',
        'get system status',
        null,
        false, false,
        ARRAY['fortinet', 'fortigate', 'hostname', 'system'],
        '[{"name": "hostname", "type": "string", "required": true, "default": null, "description_vi": "Tên mới cho thiết bị"}]'::jsonb,
        '[{"scenario_vi": "Đổi tên thành FGT-HQ-Primary", "cli_input": "FortiGate # config system global\nFortiGate (global) # set hostname FGT-HQ-Primary\nFortiGate (global) # end", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 8.7 Juniper: switching.lacp_create
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_juniper,
        (SELECT id FROM canonical_actions WHERE action_key = 'switching.lacp_create'),
        'set interfaces <physical_interface> ether-options 802.3ad ae<bundle_id>',
        'set chassis aggregated-devices ethernet device-count <count>\nset interfaces <physical_interface> ether-options 802.3ad ae<bundle_id>\nset interfaces ae<bundle_id> aggregated-ether-options lacp active',
        'user@switch#',
        'Junos OS',
        'Cấu hình Aggregated Ethernet (LAG/LACP) trên Juniper',
        'Gộp các interface vật lý thành link logic Aggregated Ethernet (aeX) sử dụng giao thức LACP.',
        'Cần khai báo device-count trong chassis aggregated-devices trước.',
        'show interfaces ae<bundle_id> terse\nshow lacp interfaces',
        'delete interfaces <physical_interface> ether-options 802.3ad',
        false, true,
        ARRAY['juniper', 'junos', 'lag', 'lacp', 'aggregated ethernet', 'switch'],
        '[{"name": "physical_interface", "type": "string", "required": true, "default": "ge-0/0/0", "description_vi": "Cổng vật lý"}, {"name": "bundle_id", "type": "integer", "required": true, "default": "0", "description_vi": "Số hiệu ae (ví dụ ae0)"}]'::jsonb,
        '[{"scenario_vi": "Gán ge-0/0/0 và ge-0/0/1 vào ae0 LACP active", "cli_input": "user@switch# set interfaces ge-0/0/0 ether-options 802.3ad ae0\nuser@switch# set interfaces ge-0/0/1 ether-options 802.3ad ae0\nuser@switch# set interfaces ae0 aggregated-ether-options lacp active\nuser@switch# commit", "cli_output": "commit complete", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.8 Palo Alto: system.config_save
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_palo_alto,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        'commit',
        'commit description "<change_ticket>"',
        'admin@PA-FW#',
        'PAN-OS 11.x',
        'Commit cấu hình trên Palo Alto Networks Firewall',
        'Biên dịch và áp dụng cấu hình candidate sang running configuration trên hệ điều hành PAN-OS.',
        'Mọi thay đổi trên tường lửa Palo Alto bắt buộc phải commit mới có hiệu lực.',
        'show jobs all',
        null,
        false, false,
        ARRAY['commit', 'palo alto', 'pan-os', 'save config', 'firewall'],
        '[]'::jsonb,
        '[{"scenario_vi": "Commit cấu hình kèm ghi chú", "cli_input": "admin@PA-FW# commit description \"Add new web policy\"", "cli_output": "Commit job 42 queued\n.\nConfiguration committed successfully", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_firewall) ON CONFLICT DO NOTHING;

    -- 8.9 MikroTik: system.config_save / backup
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_mikrotik,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        '/system backup save name=<backup_name>',
        '/export file=<export_name>\n/system backup save name=<backup_name>',
        '[admin@MikroTik] >',
        'RouterOS v7',
        'Sao lưu cấu hình MikroTik (Backup / Export RSC)',
        'Tạo file backup nhị phân hoặc xuất file script lệnh .rsc để lưu trữ cấu hình RouterOS.',
        'Lệnh /export xuất text script có thể đọc và sửa được, còn /system backup là file nhị phân toàn bộ hệ thống.',
        '/file print',
        null,
        false, false,
        ARRAY['mikrotik', 'backup', 'export', 'routeros', 'save config'],
        '[{"name": "backup_name", "type": "string", "required": true, "default": "backup_config", "description_vi": "Tên file sao lưu"}]'::jsonb,
        '[{"scenario_vi": "Xuất cấu hình ra file backup_2026.rsc", "cli_input": "[admin@MikroTik] > /export file=backup_2026", "cli_output": "", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_router) ON CONFLICT DO NOTHING;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

    -- 8.10 Aruba: system.config_save
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor,
        title_vi, description_vi, notes_vi, verification_command, rollback_command,
        is_destructive, requires_commit, tags, parameters, examples, warnings
    ) VALUES (
        v_aruba,
        (SELECT id FROM canonical_actions WHERE action_key = 'system.config_save'),
        'write memory',
        'copy running-config startup-config',
        'switch#',
        'AOS-CX',
        'Lưu cấu hình trên Aruba AOS-CX',
        'Lưu running-config sang startup-config để duy trì sau khởi động lại.',
        'Phím tắt: wr mem',
        'show startup-config',
        null,
        false, false,
        ARRAY['aruba', 'aos-cx', 'write memory', 'save config', 'switch'],
        '[]'::jsonb,
        '[{"scenario_vi": "Lưu cấu hình", "cli_input": "switch# write memory", "cli_output": "Copying configuration: [OK]", "notes_vi": ""}]'::jsonb,
        '[]'::jsonb
    ) RETURNING id INTO cmd_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (cmd_id, dt_switch) ON CONFLICT DO NOTHING;

END $$;
