-- ==============================================================================
-- Migration: 004_dhcp_snooping_seed.sql
-- Description: Seed End-to-End DHCP Snooping commands across multiple vendors
--              (Cisco, Huawei, Aruba, Juniper) with full config scripts.
-- ==============================================================================

-- Ensure Canonical Action exists for DHCP Snooping
INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
VALUES (
    (SELECT id FROM command_categories WHERE slug = 'security-acl'),
    'security.dhcp_snooping',
    'Cấu hình DHCP Snooping toàn diện',
    'Configure Full DHCP Snooping',
    'Bật DHCP Snooping chống Rogue DHCP Server, cấu hình Trust Port cho máy chủ DHCP và Rate Limit cho Client Port'
)
ON CONFLICT (action_key) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    description_vi = EXCLUDED.description_vi;

DO $$
DECLARE
    v_cisco UUID;
    v_huawei UUID;
    v_aruba UUID;
    v_juniper UUID;
    v_switch UUID;
    v_action_dhcp UUID;
    v_cmd_id UUID;
BEGIN
    SELECT id INTO v_cisco FROM vendors WHERE slug = 'cisco';
    SELECT id INTO v_huawei FROM vendors WHERE slug = 'huawei';
    SELECT id INTO v_aruba FROM vendors WHERE slug = 'aruba_hpe';
    SELECT id INTO v_juniper FROM vendors WHERE slug = 'juniper';
    SELECT id INTO v_switch FROM device_types WHERE slug = 'switch';
    SELECT id INTO v_action_dhcp FROM canonical_actions WHERE action_key = 'security.dhcp_snooping';

    -- 1. CISCO IOS-XE / CATALYST: Full DHCP Snooping Script
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode,
        title_vi, description_vi, os_flavor, verification_command, rollback_command,
        is_destructive, requires_commit, notes_vi, tags, parameters, examples, warnings
    ) VALUES (
        v_cisco,
        v_action_dhcp,
        'ip dhcp snooping',
        E'configure terminal\nip dhcp snooping\nip dhcp snooping vlan 10,20,30\nno ip dhcp snooping information option\n!\ninterface GigabitEthernet0/1\n description Uplink-to-DHCP-Server\n ip dhcp snooping trust\n exit\n!\ninterface range GigabitEthernet0/2 - 24\n description Client-Access-Ports\n ip dhcp snooping limit rate 15\n exit\n!\nend\nwrite memory',
        'Switch(config)#',
        'Cấu hình DHCP Snooping toàn diện trên Cisco Switch (IOS-XE)',
        'Kịch bản kích hoạt DHCP Snooping từ đầu đến cuối: Bật tính năng trên toàn switch, kích hoạt trên các VLAN cần bảo vệ, đặt cổng nối Server/Router làm cổng TRUST, giới hạn tốc độ cấp phát (Rate Limit) trên các cổng Access và lưu cấu hình.',
        'IOS-XE',
        'show ip dhcp snooping binding',
        'configure terminal\nno ip dhcp snooping\nend\nwrite memory',
        false,
        false,
        'Mặc định tất cả cổng trên Switch sau khi bật DHCP Snooping sẽ ở trạng thái UNTRUST. Nếu không set cổng nối DHCP Server thành TRUST, toàn bộ Client sẽ không xin được IP.',
        ARRAY['dhcp', 'snooping', 'dhcp-snooping', 'dhcp snooping', 'rogue dhcp', 'bao mat', 'cisco', 'switch'],
        '[
            {"name": "vlan_id", "type": "range / list", "description_vi": "Danh sách VLAN muốn bảo vệ bằng DHCP Snooping (ví dụ: 10,20 hoặc 10-50)", "default_value": "all"},
            {"name": "trust_interface", "type": "interface", "description_vi": "Cổng kết nối trực tiếp hoặc uplink về phía DHCP Server hợp lệ", "default_value": "Gi0/1"},
            {"name": "rate_limit", "type": "integer (pps)", "description_vi": "Số lượng gói tin DHCP tối đa cho phép mỗi giây trên cổng Access (chống DoS DHCP Starvation)", "default_value": "15"}
        ]'::jsonb,
        '[
            {
                "scenario_vi": "Cấu hình chuẩn cho Switch 24 cổng: Gi0/1 nối Router/DHCP Server, Gi0/2 - 24 nối User VLAN 10",
                "command": "configure terminal\nip dhcp snooping\nip dhcp snooping vlan 10\nno ip dhcp snooping information option\ninterface GigabitEthernet0/1\n ip dhcp snooping trust\ninterface range GigabitEthernet0/2 - 24\n ip dhcp snooping limit rate 15\nend\nwrite memory",
                "output_sample": "Switch# show ip dhcp snooping\nSwitch DHCP snooping is enabled\nDHCP snooping is configured on following VLANs:\n10\nInsertion of option 82 is disabled\nInterface                  Trusted    Rate limit (pps)\n-----------------------    -------    ----------------\nGigabitEthernet0/1         yes        unlimited\nGigabitEthernet0/2         no         15\n..."
            }
        ]'::jsonb,
        '[
            "Bắt buộc cấu hình lệnh ''ip dhcp snooping trust'' trên cổng nối DHCP Server trước khi bật tính năng trên VLAN.",
            "Nếu Switch không đóng vai trò DHCP Relay với Option 82, cần thêm lệnh ''no ip dhcp snooping information option'' để tránh Cisco Switch drop gói DHCP do Option 82 không khớp."
        ]'::jsonb
    ) RETURNING id INTO v_cmd_id;

    IF v_cmd_id IS NOT NULL THEN
        INSERT INTO command_device_types (command_id, device_type_id)
        VALUES (v_cmd_id, v_switch)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. HUAWEI VRP: Full DHCP Snooping Script
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode,
        title_vi, description_vi, os_flavor, verification_command, rollback_command,
        is_destructive, requires_commit, notes_vi, tags, parameters, examples, warnings
    ) VALUES (
        v_huawei,
        v_action_dhcp,
        'dhcp enable\ndhcp snooping enable',
        E'system-view\ndhcp enable\ndhcp snooping enable\n!\nvlan 10\n dhcp snooping enable\n quit\n!\ninterface GigabitEthernet 0/0/1\n description Uplink-DHCP-Server\n dhcp snooping trusted\n quit\n!\ninterface GigabitEthernet 0/0/2\n description Client-Port\n dhcp snooping check dhcp-rate enable\n dhcp snooping check dhcp-rate 15\n quit\n!\nsave',
        '<Huawei>',
        'Cấu hình DHCP Snooping toàn diện trên Huawei Switch (VRP)',
        'Kịch bản kích hoạt DHCP Snooping từ đầu đến cuối trên Huawei VRP: Bật dịch vụ DHCP toàn cục, kích hoạt DHCP Snooping trên VLAN 10, cấu hình cổng Uplink GE0/0/1 làm Trusted Port và đặt Rate Limit trên cổng Client GE0/0/2.',
        'VRP v8',
        'display dhcp snooping user-bind all',
        'system-view\nundo dhcp snooping enable\nundo dhcp enable\nreturn\nsave',
        false,
        false,
        'Trên Huawei VRP, trước khi bật DHCP Snooping phải thực thi lệnh "dhcp enable" toàn cục.',
        ARRAY['dhcp', 'snooping', 'dhcp-snooping', 'dhcp snooping', 'huawei', 'vrp', 'switch'],
        '[
            {"name": "vlan_id", "type": "integer", "description_vi": "VLAN cần kích hoạt DHCP Snooping", "default_value": "10"},
            {"name": "trusted_port", "type": "interface", "description_vi": "Cổng kết nối tới DHCP Server hợp lệ", "default_value": "GigabitEthernet0/0/1"},
            {"name": "rate_limit", "type": "integer", "description_vi": "Tốc độ gói tin DHCP cho phép mỗi giây", "default_value": "15"}
        ]'::jsonb,
        '[
            {
                "scenario_vi": "Kích hoạt bảo vệ VLAN 10 và xem bảng binding người dùng nhận IP",
                "command": "system-view\ndhcp enable\ndhcp snooping enable\nvlan 10\n dhcp snooping enable\ninterface GigabitEthernet 0/0/1\n dhcp snooping trusted\nreturn\nsave",
                "output_sample": "<Huawei> display dhcp snooping user-bind all\nDHCP Dynamic Bind-table:\nIP Address       MAC Address     VLAN/CEVLAN  Interface              Lease\n--------------------------------------------------------------------------------\n192.168.10.100   5489-98cf-1234  10/--        GigabitEthernet0/0/2   2026/08/19 12:00"
            }
        ]'::jsonb,
        '[
            "Đảm bảo đã lưu cấu hình (save) sau khi hoàn tất thiết lập.",
            "Tất cả các cổng chưa set trusted sẽ tự động drop gói DHCP OFFER / ACK từ phía client."
        ]'::jsonb
    ) RETURNING id INTO v_cmd_id;

    IF v_cmd_id IS NOT NULL THEN
        INSERT INTO command_device_types (command_id, device_type_id)
        VALUES (v_cmd_id, v_switch)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. ARUBA / HPE AOS-CX: Full DHCP Snooping Script
    INSERT INTO commands (
        vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode,
        title_vi, description_vi, os_flavor, verification_command, rollback_command,
        is_destructive, requires_commit, notes_vi, tags, parameters, examples, warnings
    ) VALUES (
        v_aruba,
        v_action_dhcp,
        'dhcp-snooping',
        E'configure terminal\ndhcp-snooping\ndhcp-snooping vlan 10,20\n!\ninterface 1/1/1\n description Uplink-DHCP-Server\n dhcp-snooping trust\n exit\n!\nend\nwrite memory',
        'switch(config)#',
        'Cấu hình DHCP Snooping trên Aruba / HPE AOS-CX Switch',
        'Kịch bản cấu hình DHCP Snooping trên nền tảng Aruba AOS-CX: Bật dịch vụ dhcp-snooping toàn cục, chỉ định VLAN áp dụng, đặt cổng Uplink 1/1/1 làm trusted interface và lưu cấu hình.',
        'AOS-CX',
        'show dhcp-snooping',
        'configure terminal\nno dhcp-snooping\nend\nwrite memory',
        false,
        false,
        'AOS-CX hỗ trợ tính năng DHCP Snooping đi kèm Dynamic ARP Protection (DAI) để bảo vệ toàn diện Layer 2.',
        ARRAY['dhcp', 'snooping', 'dhcp-snooping', 'dhcp snooping', 'aruba', 'hpe', 'aos-cx'],
        '[
            {"name": "vlan_id", "type": "range / list", "description_vi": "Danh sách VLAN được bảo vệ", "default_value": "10,20"},
            {"name": "trust_port", "type": "interface", "description_vi": "Cổng kết nối phía máy chủ DHCP", "default_value": "1/1/1"}
        ]'::jsonb,
        '[
            {
                "scenario_vi": "Bảo vệ VLAN 10 và 20 với Uplink port 1/1/1 trên Aruba AOS-CX",
                "command": "configure terminal\ndhcp-snooping\ndhcp-snooping vlan 10,20\ninterface 1/1/1\n dhcp-snooping trust\nend\nwrite memory",
                "output_sample": "switch# show dhcp-snooping\nDHCP Snooping Information\n  DHCP Snooping                 : Enabled\n  DHCP Snooping authorized VLANs: 10, 20\n  Port       Trust\n  -------    -------\n  1/1/1      Trusted"
            }
        ]'::jsonb,
        '[
            "Luôn kiểm tra trạng thái port trusted trước khi đưa vào môi trường vận hành thực tế."
        ]'::jsonb
    ) RETURNING id INTO v_cmd_id;

    IF v_cmd_id IS NOT NULL THEN
        INSERT INTO command_device_types (command_id, device_type_id)
        VALUES (v_cmd_id, v_switch)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
