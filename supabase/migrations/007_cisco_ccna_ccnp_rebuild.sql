-- Migration file for 77 Cisco CCNA/CCNP Commands

DO $$
DECLARE
    v_cisco UUID;
    v_switch UUID;
    v_router UUID;
    cat_ip_services UUID;
    cat_qos UUID;
    cat_switching UUID;
    cat_routing UUID;
    cat_security UUID;
    cat_management UUID;
    c_id UUID;
    a_id UUID;
BEGIN
    -- 1. CLEANUP
    DELETE FROM command_device_types;
    DELETE FROM command_favorites;
    DELETE FROM commands;
    DELETE FROM canonical_actions;
    -- 2. FETCH VENDOR & DEVICE TYPES
    SELECT id INTO v_cisco FROM vendors WHERE slug = 'cisco';
    SELECT id INTO v_switch FROM device_types WHERE slug = 'switch';
    SELECT id INTO v_router FROM device_types WHERE slug = 'router';
    -- 3. INSERT NEW CATEGORIES (IP Services and QoS)
    INSERT INTO command_categories (name_vi, name_en, slug, description_vi) 
    VALUES ('IP Services (DHCP/NAT)', 'IP Services', 'ip-services', 'Các dịch vụ hạ tầng mạng cơ bản')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, description_vi = EXCLUDED.description_vi RETURNING id INTO cat_ip_services;

    INSERT INTO command_categories (name_vi, name_en, slug, description_vi) 
    VALUES ('Quality of Service', 'QoS', 'qos', 'Điều khiển chất lượng dịch vụ')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, description_vi = EXCLUDED.description_vi RETURNING id INTO cat_qos;
    -- FETCH EXISTING CATEGORIES
    SELECT id INTO cat_switching FROM command_categories WHERE slug = 'switching';
    SELECT id INTO cat_routing FROM command_categories WHERE slug = 'routing';
    SELECT id INTO cat_security FROM command_categories WHERE slug = 'security';
    SELECT id INTO cat_management FROM command_categories WHERE slug = 'management';
    -- For fallback
    IF cat_switching IS NULL THEN
        INSERT INTO command_categories (name_vi, name_en, slug) VALUES ('Switching', 'Switching', 'switching') RETURNING id INTO cat_switching;
    END IF;
    IF cat_routing IS NULL THEN
        INSERT INTO command_categories (name_vi, name_en, slug) VALUES ('Routing', 'Routing', 'routing') RETURNING id INTO cat_routing;
    END IF;
    IF cat_security IS NULL THEN
        INSERT INTO command_categories (name_vi, name_en, slug) VALUES ('Security', 'Security', 'security') RETURNING id INTO cat_security;
    END IF;
    IF cat_management IS NULL THEN
        INSERT INTO command_categories (name_vi, name_en, slug) VALUES ('Management', 'Management', 'management') RETURNING id INTO cat_management;
    END IF;
    -- 4. INSERT COMMANDS AND ACTIONS
    -- CMD 1: Tạo VLAN
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'vlan.create', 'Tạo VLAN', 'Create VLAN', 'Tạo và cấu hình VLAN mới')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'vlan <id>\nname <name>', E'enable\nconfigure terminal\nvlan 10\nname HR_VLAN\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'Tạo VLAN', 'Tạo VLAN mới và gán tên cho VLAN đó trên Switch Cisco.', 'VLAN 1 là VLAN mặc định, không thể xóa hoặc đổi tên. Số hiệu VLAN từ 2-1001 là normal range, 1006-4094 là extended range.', 'show vlan brief', 'no vlan <id>', TRUE, FALSE, TRUE, ARRAY['vlan', 'layer2', 'switching', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 2: Cấu hình cổng Access
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'interface.access', 'Cấu hình cổng Access', 'Configure Access Port', 'Chuyển cổng sang chế độ Access và gán VLAN')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'switchport mode access\nswitchport access vlan <id>', E'enable\nconfigure terminal\ninterface GigabitEthernet1/0/1\nswitchport mode access\nswitchport access vlan 10\nend\nwrite memory', 'Switch(config-if)#', 'IOS-XE', 'Cấu hình cổng Access', 'Cấu hình cổng giao tiếp thành chế độ access và gán vào một VLAN cụ thể.', 'Chế độ access chỉ cho phép thiết bị cuối kết nối và chỉ thuộc một VLAN duy nhất (trừ khi cấu hình Voice VLAN).', 'show interfaces <interface-id> switchport', 'default interface <interface-id>', FALSE, FALSE, TRUE, ARRAY['access', 'vlan', 'port', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 3: Cấu hình cổng Trunk
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'interface.trunk', 'Cấu hình cổng Trunk', 'Configure Trunk Port', 'Chuyển cổng sang chế độ Trunk')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'switchport mode trunk\nswitchport trunk allowed vlan <vlans>\nswitchport trunk native vlan <id>', E'enable\nconfigure terminal\ninterface GigabitEthernet1/0/24\nswitchport trunk encapsulation dot1q\nswitchport mode trunk\nswitchport trunk allowed vlan 10,20,30\nswitchport trunk native vlan 99\nend\nwrite memory', 'Switch(config-if)#', 'IOS-XE', 'Cấu hình cổng Trunk', 'Cấu hình cổng giao tiếp thành chế độ trunk để truyền tải nhiều VLAN, cấu hình danh sách VLAN được phép và Native VLAN.', 'Native VLAN phải giống nhau ở cả hai đầu liên kết trunk. Nên thay đổi Native VLAN mặc định (VLAN 1) để bảo mật.', 'show interfaces trunk', 'default interface <interface-id>', FALSE, FALSE, TRUE, ARRAY['trunk', 'dot1q', 'vlan', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 4: Xem VLAN brief
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'show.vlan_brief', 'Xem thông tin VLAN tóm tắt', 'Show VLAN Brief', 'Kiểm tra danh sách VLAN')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show vlan brief', 'show vlan brief', 'Switch#', 'IOS-XE', 'Xem VLAN brief', 'Hiển thị thông tin tóm tắt về tất cả các VLAN đang tồn tại và các cổng được gán.', 'Lệnh cơ bản nhất để kiểm tra cấu hình VLAN và gán cổng.', '', '', FALSE, FALSE, TRUE, ARRAY['show', 'vlan', 'troubleshoot', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 5: Xem trạng thái Trunk
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'show.interfaces_trunk', 'Xem trạng thái cổng Trunk', 'Show Trunk Interfaces', 'Kiểm tra các kết nối Trunk')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show interfaces trunk', 'show interfaces trunk', 'Switch#', 'IOS-XE', 'Xem trạng thái Trunk', 'Hiển thị thông tin về tất cả các cổng đang hoạt động ở chế độ trunk, bao gồm Native VLAN và danh sách allowed VLAN.', 'Dùng để khắc phục sự cố liên quan đến kết nối trunk giữa các switch.', '', '', FALSE, FALSE, TRUE, ARRAY['show', 'trunk', 'troubleshoot', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 6: EtherChannel LACP
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'etherchannel.lacp', 'Cấu hình LACP EtherChannel', 'Configure LACP EtherChannel', 'Gộp cổng vật lý bằng LACP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'channel-group <number> mode active', E'enable\nconfigure terminal\ninterface range GigabitEthernet1/0/1-2\nchannel-group 1 mode active\nend\nwrite memory', 'Switch(config-if-range)#', 'IOS-XE', 'EtherChannel LACP', 'Gộp nhiều cổng vật lý thành một kết nối logic (Port-channel) sử dụng giao thức LACP.', 'Mode active chủ động thương lượng LACP. Các cổng trong nhóm phải có cùng tốc độ, duplex và cấu hình VLAN.', 'show etherchannel summary', 'no channel-group <number>', FALSE, FALSE, TRUE, ARRAY['etherchannel', 'lacp', 'port-channel', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 7: Xem EtherChannel
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'show.etherchannel', 'Xem trạng thái EtherChannel', 'Show EtherChannel Summary', 'Kiểm tra cấu hình EtherChannel')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show etherchannel summary', 'show etherchannel summary', 'Switch#', 'IOS-XE', 'Xem EtherChannel', 'Hiển thị trạng thái tóm tắt của tất cả các nhóm EtherChannel trên switch.', 'Kiểm tra ký tự trạng thái (SU = L2 in use, RU = L3 in use, SD = L2 down).', '', '', FALSE, FALSE, TRUE, ARRAY['show', 'etherchannel', 'troubleshoot', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 8: STP Rapid-PVST+
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'stp.mode_rapid_pvst', 'Cấu hình Rapid-PVST+', 'Configure Rapid-PVST+', 'Chuyển sang chế độ Rapid-PVST+')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'spanning-tree mode rapid-pvst', E'enable\nconfigure terminal\nspanning-tree mode rapid-pvst\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'STP Rapid-PVST+', 'Chuyển đổi giao thức Spanning Tree sang chế độ Rapid PVST+ (Mặc định của thiết bị Cisco thường là PVST+).', 'Rapid PVST+ hội tụ nhanh hơn nhiều so với STP truyền thống (802.1D).', 'show spanning-tree summary', 'no spanning-tree mode rapid-pvst', FALSE, FALSE, TRUE, ARRAY['stp', 'rapid-pvst', 'spanning-tree', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 9: STP Root Bridge
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'stp.root_primary', 'Thiết lập Root Bridge', 'Set Root Bridge', 'Cấu hình switch làm Root Bridge cho VLAN')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'spanning-tree vlan <id> root primary', E'enable\nconfigure terminal\nspanning-tree vlan 10 root primary\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'STP Root Bridge', 'Cấu hình switch hiện tại trở thành Root Bridge ưu tiên cho một VLAN cụ thể.', 'Lệnh này thực chất tự động hạ Bridge Priority xuống mức thấp hơn so với các switch khác trong mạng.', 'show spanning-tree vlan <id>', 'no spanning-tree vlan <id> root primary', FALSE, FALSE, TRUE, ARRAY['stp', 'root', 'spanning-tree', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 10: STP PortFast
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'stp.portfast', 'Cấu hình PortFast', 'Configure PortFast', 'Bật PortFast trên cổng Access')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'spanning-tree portfast', E'enable\nconfigure terminal\ninterface GigabitEthernet1/0/1\nspanning-tree portfast\nend\nwrite memory', 'Switch(config-if)#', 'IOS-XE', 'STP PortFast', 'Cấu hình tính năng PortFast trên cổng access, giúp cổng bỏ qua các trạng thái listening/learning và chuyển ngay sang forwarding.', 'Chỉ dùng cho cổng nối với thiết bị cuối (PC, Server). Không dùng trên cổng kết nối với Switch khác để tránh loop.', 'show spanning-tree interface <interface-id> portfast', 'no spanning-tree portfast', FALSE, FALSE, TRUE, ARRAY['stp', 'portfast', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '["KHÔNG cấu hình PortFast trên cổng kết nối switch khác"]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 11: BPDU Guard
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'stp.bpduguard', 'Bật BPDU Guard', 'Enable BPDU Guard', 'Bật bảo vệ BPDU trên cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'spanning-tree bpduguard enable', E'enable\nconfigure terminal\ninterface GigabitEthernet1/0/1\nspanning-tree bpduguard enable\nend\nwrite memory', 'Switch(config-if)#', 'IOS-XE', 'BPDU Guard', 'Bật tính năng BPDU Guard trên cổng. Nếu cổng nhận được bản tin BPDU, nó sẽ tự động bị đưa vào trạng thái err-disable (tắt).', 'Thường được cấu hình kèm theo PortFast để bảo vệ mạng khỏi các switch lạ kết nối vào mạng access.', 'show spanning-tree interface <interface-id> detail', 'no spanning-tree bpduguard enable', FALSE, FALSE, TRUE, ARRAY['stp', 'bpduguard', 'security', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 12: Port Security
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'security.port_security', 'Cấu hình Port Security', 'Configure Port Security', 'Bảo mật cổng theo địa chỉ MAC')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'switchport port-security\nswitchport port-security maximum <max>\nswitchport port-security violation <action>\nswitchport port-security mac-address sticky', E'enable\nconfigure terminal\ninterface GigabitEthernet1/0/1\nswitchport mode access\nswitchport port-security\nswitchport port-security maximum 2\nswitchport port-security violation restrict\nswitchport port-security mac-address sticky\nend\nwrite memory', 'Switch(config-if)#', 'IOS-XE', 'Port Security', 'Bật tính năng bảo mật cổng, giới hạn số lượng địa chỉ MAC và hành động khi vi phạm (protect, restrict, shutdown).', 'Cổng phải ở chế độ access hoặc trunk tĩnh (không auto). ''sticky'' cho phép switch tự động học MAC address vào cấu hình đang chạy.', 'show port-security interface <interface-id>', 'no switchport port-security', FALSE, FALSE, TRUE, ARRAY['security', 'port-security', 'mac', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 13: DHCP Snooping
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'security.dhcp_snooping', 'Cấu hình DHCP Snooping', 'Configure DHCP Snooping', 'Bảo vệ chống Rogue DHCP Server')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'ip dhcp snooping\nip dhcp snooping vlan <id>\nip dhcp snooping trust', E'enable\nconfigure terminal\nip dhcp snooping\nip dhcp snooping vlan 10\ninterface GigabitEthernet1/0/24\nip dhcp snooping trust\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'DHCP Snooping', 'Bật tính năng chống giả mạo DHCP Server, cấu hình trust port (kết nối với DHCP server thật) và untrust port (kết nối với user).', 'Bảo vệ mạng khỏi các Rogue DHCP Server và là tiền đề cho Dynamic ARP Inspection.', 'show ip dhcp snooping', 'no ip dhcp snooping', FALSE, FALSE, TRUE, ARRAY['dhcp', 'snooping', 'security', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 14: DAI (Dynamic ARP Inspection)
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'security.dai', 'Cấu hình DAI', 'Configure DAI', 'Chống giả mạo ARP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'ip arp inspection vlan <id>\nip arp inspection trust', E'enable\nconfigure terminal\nip arp inspection vlan 10\ninterface GigabitEthernet1/0/24\nip arp inspection trust\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'DAI (Dynamic ARP Inspection)', 'Tính năng ngăn chặn tấn công ARP Spoofing/Poisoning dựa vào cơ sở dữ liệu của DHCP Snooping.', 'Các cổng nối với user mặc định là untrust. Cần trust port kết nối lên Router/Switch lớp trên.', 'show ip arp inspection vlan <id>', 'no ip arp inspection vlan <id>', FALSE, FALSE, TRUE, ARRAY['dai', 'arp', 'security', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 15: CDP
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'show.cdp_neighbors', 'Xem CDP Neighbors', 'Show CDP Neighbors', 'Hiển thị thiết bị láng giềng Cisco')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show cdp neighbors', 'show cdp neighbors', 'Switch#', 'IOS-XE', 'CDP', 'Hiển thị thông tin các thiết bị láng giềng trực tiếp kết nối sử dụng giao thức CDP (Cisco Discovery Protocol).', 'CDP là giao thức độc quyền của Cisco, bật mặc định trên các thiết bị Cisco.', '', '', FALSE, FALSE, TRUE, ARRAY['cdp', 'discovery', 'show', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 16: LLDP
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'discovery.lldp_run', 'Bật LLDP', 'Enable LLDP', 'Bật giao thức LLDP toàn cục')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'lldp run', E'enable\nconfigure terminal\nlldp run\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'LLDP', 'Bật giao thức Link Layer Discovery Protocol (LLDP) toàn cục trên thiết bị.', 'LLDP là giao thức chuẩn mở (IEEE 802.1AB), dùng để khám phá thiết bị của các hãng khác nhau.', 'show lldp neighbors', 'no lldp run', FALSE, FALSE, TRUE, ARRAY['lldp', 'discovery', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 17: IP Address
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'interface.ip_address', 'Đặt IP Interface', 'Set Interface IP', 'Cấu hình địa chỉ IP cho cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip address <ip> <mask', E'enable\nconfigure terminal\ninterface <interface-id>\nip address <ip> <mask>\nno shutdown\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'IP Address', 'Cấu hình địa chỉ IPv4 cho cổng giao tiếp và bật cổng (no shutdown).', 'Cổng trên Router mặc định ở trạng thái shutdown, cần phải bật lên sau khi đặt IP.', 'show ip interface brief', 'no ip address', FALSE, FALSE, TRUE, ARRAY['ip address', 'interface', 'ipv4', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 18: Static Route
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.static', 'Cấu hình Route Tĩnh', 'Configure Static Route', 'Định tuyến tĩnh tới mạng đích')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip route <network> <mask> <next-hop>', E'enable\nconfigure terminal\nip route <network> <mask> <next-hop>\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Static Route', 'Cấu hình đường dẫn tĩnh (Static Route) đến một mạng đích cụ thể.', 'Next-hop có thể là địa chỉ IP của router láng giềng hoặc interface đầu ra (như Serial0/0/0).', 'show ip route static', 'no ip route <network> <mask> <next-hop>', FALSE, FALSE, TRUE, ARRAY['static route', 'routing', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 19: Default Route
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.default', 'Cấu hình Default Route', 'Configure Default Route', 'Định tuyến mặc định')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip route 0.0.0.0 0.0.0.0 <next-hop>', E'enable\nconfigure terminal\nip route 0.0.0.0 0.0.0.0 <next-hop>\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Default Route', 'Cấu hình đường dẫn mặc định (Gateway of last resort) để đẩy tất cả traffic không có trong bảng định tuyến ra ngoài.', 'Thường hướng ra mạng Internet hoặc ISP.', 'show ip route', 'no ip route 0.0.0.0 0.0.0.0 <next-hop>', FALSE, FALSE, TRUE, ARRAY['default route', 'gateway of last resort', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 20: Floating Static Route
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.floating_static', 'Cấu hình Route Dự Phòng', 'Configure Floating Route', 'Định tuyến tĩnh dự phòng thay đổi AD')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip route <network> <mask> <next-hop> <AD>', E'enable\nconfigure terminal\nip route <network> <mask> <next-hop> 10\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Floating Static Route', 'Đường dẫn tĩnh dự phòng (Floating Static Route) bằng cách tăng giá trị Administrative Distance (AD) cao hơn đường chính.', 'Ví dụ: đường chính học qua OSPF (AD=110), ta cấu hình static route dự phòng với AD=120.', 'show ip route', 'no ip route <network> <mask> <next-hop> <AD>', FALSE, FALSE, TRUE, ARRAY['floating static route', 'backup route', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 21: OSPFv2 Single-Area
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.ospf_single', 'Cấu hình OSPF', 'Configure OSPF', 'Cấu hình định tuyến OSPF cơ bản')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'router ospf <process-id>\nrouter-id <ip>\nnetwork <network> <wildcard> area <area-id>', E'enable\nconfigure terminal\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.1.0 0.0.0.255 area 0\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'OSPFv2 Single-Area', 'Cấu hình định tuyến động OSPFv2, thiết lập Router-ID và quảng bá mạng vào vùng (area).', 'Wildcard mask là phần đảo ngược của subnet mask. Với single-area, thường dùng Area 0 (Backbone).', 'show ip ospf', 'no router ospf <process-id>', FALSE, FALSE, TRUE, ARRAY['ospf', 'routing protocol', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 22: OSPF Passive Interface
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'ospf.passive_interface', 'Cấu hình OSPF Passive', 'Configure OSPF Passive', 'Ngăn gửi bản tin OSPF qua cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'passive-interface <interface-id>', E'enable\nconfigure terminal\nrouter ospf 1\npassive-interface GigabitEthernet0/0\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'OSPF Passive Interface', 'Cấu hình một interface ở chế độ passive để ngăn không gửi bản tin OSPF Hello ra cổng đó nhưng mạng vẫn được quảng bá.', 'Dùng cho các cổng kết nối xuống mạng LAN của user để giảm tải traffic và tăng bảo mật.', 'show ip ospf interface', 'no passive-interface <interface-id>', FALSE, FALSE, TRUE, ARRAY['ospf', 'passive-interface', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 23: OSPF Default Route
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'ospf.default_route', 'Quảng bá OSPF Default', 'Originate OSPF Default', 'Phân phối default route vào OSPF')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'default-information originate', E'enable\nconfigure terminal\nrouter ospf 1\ndefault-information originate\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'OSPF Default Route', 'Bơm default route (đã được cấu hình trên router tĩnh) vào môi trường OSPF để các router khác tự động học được.', 'Cần phải có lệnh ip route 0.0.0.0 0.0.0.0 trước thì lệnh này mới có tác dụng (hoặc dùng thêm từ khóa always).', 'show ip route ospf', 'no default-information originate', FALSE, FALSE, TRUE, ARRAY['ospf', 'default route', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 24: OSPF Cost
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'ospf.cost', 'Thay đổi Metric OSPF', 'Change OSPF Cost', 'Sửa đổi chi phí metric cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip ospf cost <value>', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nip ospf cost 10\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'OSPF Cost', 'Thay đổi thủ công chi phí (metric) OSPF trên một giao diện để điều chỉnh thuật toán chọn đường đi tốt nhất.', 'OSPF Cost mặc định tính bằng (10^8 / băng thông bps).', 'show ip ospf interface brief', 'no ip ospf cost', FALSE, FALSE, TRUE, ARRAY['ospf', 'metric', 'cost', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 25: Inter-VLAN Router-on-a-Stick
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.roas', 'Cấu hình Router-on-a-Stick', 'Configure ROAS', 'Định tuyến Inter-VLAN bằng Router')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'encapsulation dot1Q <vlan-id>', E'enable\nconfigure terminal\ninterface <interface-id>.<sub-id>\nencapsulation dot1Q <vlan-id>\nip address <ip> <mask>\nend\nwrite memory', 'Router(config-subif)#', 'IOS-XE', 'Inter-VLAN Router-on-a-Stick', 'Cấu hình sub-interface trên Router và đóng gói chuẩn 802.1Q để hỗ trợ định tuyến giữa các VLAN.', 'Sub-interface ID thường đặt trùng với VLAN ID cho dễ quản lý.', 'show ip interface brief', 'no interface <interface-id>.<sub-id>', FALSE, FALSE, TRUE, ARRAY['inter-vlan', 'roas', 'dot1q', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 26: Inter-VLAN SVI
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'switching.svi', 'Cấu hình SVI', 'Configure SVI', 'Tạo interface định tuyến trên Switch')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'interface vlan <id>\nip routing', E'enable\nconfigure terminal\nip routing\ninterface vlan <id>\nip address <ip> <mask>\nno shutdown\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'Inter-VLAN SVI', 'Cấu hình interface ảo SVI (Switch Virtual Interface) trên Layer 3 Switch và bật tính năng định tuyến IP.', 'Switch L3 hiệu năng cao hơn Router khi định tuyến các mạng VLAN cục bộ.', 'show ip route', 'no interface vlan <id>', FALSE, FALSE, TRUE, ARRAY['svi', 'inter-vlan', 'layer 3 switch', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 27: HSRP
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.hsrp', 'Cấu hình HSRP', 'Configure HSRP', 'Dự phòng Default Gateway bằng HSRP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'standby <group> ip <virtual-ip>\nstandby <group> priority <priority>\nstandby <group> preempt', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nstandby 1 ip 192.168.1.254\nstandby 1 priority 110\nstandby 1 preempt\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'HSRP', 'Cấu hình giao thức HSRP cung cấp độ sẵn sàng cao bằng cách tạo ra Gateway ảo giữa nhiều Router.', 'Router có Priority cao hơn sẽ làm Active. Tính năng Preempt cho phép Router cấu hình cao hơn chiếm lại quyền Active khi khôi phục.', 'show standby brief', 'no standby <group> ip', FALSE, FALSE, TRUE, ARRAY['hsrp', 'fhrp', 'redundancy', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 28: Show IP Route
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'show.ip_route', 'Xem bảng định tuyến', 'Show IP Route', 'Hiển thị chi tiết bảng định tuyến')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show ip route', 'show ip route', 'Router#', 'IOS-XE', 'Show IP Route', 'Hiển thị bảng định tuyến IP chứa tất cả các đường đã học qua cấu hình tĩnh hoặc động.', 'Lệnh cơ bản quan trọng nhất để khắc phục sự cố kết nối.', '', '', FALSE, FALSE, TRUE, ARRAY['show command', 'routing table', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 29: Show OSPF Neighbors
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'show.ospf_neighbor', 'Xem OSPF Neighbors', 'Show OSPF Neighbors', 'Hiển thị thông tin láng giềng OSPF')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show ip ospf neighbor', 'show ip ospf neighbor', 'Router#', 'IOS-XE', 'Show OSPF Neighbors', 'Hiển thị thông tin và trạng thái kết nối láng giềng OSPF.', 'Trạng thái FULL chỉ ra láng giềng đã hình thành và trao đổi cơ sở dữ liệu định tuyến thành công.', '', '', FALSE, FALSE, TRUE, ARRAY['show command', 'ospf neighbor', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 30: DHCP Server
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'dhcp.pool', 'Cấu hình DHCP Server', 'Configure DHCP Server', 'Thiết lập Pool cấp phát IP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'ip dhcp pool <name>\nnetwork <network> <mask>\ndefault-router <gateway>\ndns-server <dns>', E'enable\nconfigure terminal\nip dhcp pool <name>\nnetwork <network> <mask>\ndefault-router <gateway>\ndns-server <dns>\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'DHCP Server', 'Tạo một pool DHCP cấp phát tự động IP, subnet mask, gateway và DNS server cho thiết bị đầu cuối.', 'Tính năng DHCP Server được tích hợp sẵn trên IOS Cisco.', 'show ip dhcp binding', 'no ip dhcp pool <name>', FALSE, FALSE, TRUE, ARRAY['dhcp', 'dhcp server', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 31: DHCP Excluded
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'dhcp.excluded', 'Loại trừ IP DHCP', 'Exclude DHCP IP', 'Cấm cấp phát dãy IP nhất định')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip dhcp excluded-address <start> <end>', E'enable\nconfigure terminal\nip dhcp excluded-address 192.168.1.1 192.168.1.10\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'DHCP Excluded', 'Loại trừ dải IP không cấp phát qua DHCP để tránh trùng lặp IP với các thiết bị đặt IP tĩnh.', 'Nên cấu hình loại trừ IP trước khi cấu hình DHCP pool.', 'show ip dhcp pool', 'no ip dhcp excluded-address <start> <end>', FALSE, FALSE, TRUE, ARRAY['dhcp', 'excluded-address', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 32: DHCP Relay
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'dhcp.relay', 'Cấu hình DHCP Relay', 'Configure DHCP Relay', 'Chuyển tiếp bản tin DHCP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip helper-address <server-ip>', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nip helper-address 10.1.1.10\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'DHCP Relay', 'Cấu hình chuyển tiếp bản tin DHCP broadcast đến DHCP server thật nằm ở subnet khác.', 'Thường dùng trong mô hình mạng lớn dùng DHCP Server tập trung.', 'show ip interface <interface-id>', 'no ip helper-address', FALSE, FALSE, TRUE, ARRAY['dhcp relay', 'ip helper-address', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 33: Static NAT
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'nat.static', 'Cấu hình Static NAT', 'Configure Static NAT', 'Ánh xạ 1-1 IP NAT tĩnh')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip nat inside source static <local> <global>', E'enable\nconfigure terminal\nip nat inside source static 192.168.1.10 203.0.113.5\ninterface GigabitEthernet0/0\nip nat inside\ninterface GigabitEthernet0/1\nip nat outside\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Static NAT', 'Chuyển đổi tĩnh ánh xạ 1-1 giữa một IP Private ra một IP Public cụ thể.', 'Dùng để public một Web/Mail Server nội bộ ra ngoài Internet.', 'show ip nat translations', 'no ip nat inside source static <local> <global>', FALSE, FALSE, TRUE, ARRAY['nat', 'static nat', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 34: PAT/NAT Overload
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'nat.pat', 'Cấu hình PAT', 'Configure PAT', 'NAT Overload nhiều IP ra một IP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip nat inside source list <acl> interface <out-if> overload', E'enable\nconfigure terminal\naccess-list 1 permit 192.168.1.0 0.0.0.255\nip nat inside source list 1 interface GigabitEthernet0/1 overload\ninterface GigabitEthernet0/0\nip nat inside\ninterface GigabitEthernet0/1\nip nat outside\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'PAT/NAT Overload', 'Chuyển đổi nhiều IP Private ra một IP Public (hoặc 1 pool nhỏ) sử dụng các port khác nhau.', 'Phổ biến nhất, giúp toàn bộ mạng LAN dùng chung 1 IP public để ra Internet.', 'show ip nat translations', 'no ip nat inside source list <acl> interface <out-if> overload', FALSE, FALSE, TRUE, ARRAY['nat', 'pat', 'overload', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 35: NTP Client
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.ntp', 'Cấu hình NTP', 'Configure NTP', 'Đồng bộ thời gian qua mạng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ntp server <ip>', E'enable\nconfigure terminal\nntp server 8.8.8.8\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'NTP Client', 'Cấu hình thiết bị đồng bộ thời gian từ một máy chủ NTP (Network Time Protocol) chỉ định.', 'Rất quan trọng cho việc phân tích logs mạng sau này do mốc thời gian chuẩn xác.', 'show ntp associations', 'no ntp server <ip>', FALSE, FALSE, TRUE, ARRAY['ntp', 'time', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 36: Show NAT Translations
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_ip_services, 'show.nat', 'Xem bảng NAT', 'Show NAT Translations', 'Hiển thị các phiên NAT đang hoạt động')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show ip nat translations', 'show ip nat translations', 'Router#', 'IOS-XE', 'Show NAT Translations', 'Hiển thị bảng chuyển đổi địa chỉ đang diễn ra, ánh xạ giữa Inside Local và Inside Global.', 'Hữu ích để xem có thiết bị LAN nào đã được NAT thành công ra ngoài Internet không.', '', '', FALSE, FALSE, TRUE, ARRAY['show command', 'nat', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 37: Standard ACL
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.acl_standard', 'Tạo Standard ACL', 'Create Standard ACL', 'Lọc mạng qua IP nguồn')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'access-list <number> permit|deny <source> <wildcard>', E'enable\nconfigure terminal\naccess-list 10 deny 192.168.1.50 0.0.0.0\naccess-list 10 permit any\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Standard ACL', 'Tạo Access Control List cơ bản, chỉ kiểm tra địa chỉ IP nguồn để cho phép hoặc từ chối traffic.', 'Standard ACL mang số từ 1-99 hoặc 1300-1999. Luôn có quy tắc ngầm ''deny all'' ở cuối danh sách.', 'show access-lists', 'no access-list <number>', FALSE, FALSE, TRUE, ARRAY['security', 'acl', 'standard', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 38: Extended ACL
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.acl_extended', 'Tạo Extended ACL', 'Create Extended ACL', 'Lọc mạng kết hợp Port/IP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'access-list <number> permit|deny <protocol> <src> <dst> eq <port>', E'enable\nconfigure terminal\naccess-list 101 deny tcp 192.168.1.0 0.0.0.255 host 10.1.1.1 eq 80\naccess-list 101 permit ip any any\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Extended ACL', 'Tạo Access Control List nâng cao, có thể kiểm tra cả IP nguồn/đích, giao thức TCP/UDP và số Port.', 'Extended ACL mang số từ 100-199 hoặc 2000-2699.', 'show access-lists', 'no access-list <number>', FALSE, FALSE, TRUE, ARRAY['security', 'acl', 'extended', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 39: Named ACL
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.acl_named', 'Tạo Named ACL', 'Create Named ACL', 'Lọc mạng ACL theo tên')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip access-list extended <name>', E'enable\nconfigure terminal\nip access-list extended BLOCK_WEB\ndeny tcp any host 10.1.1.1 eq 80\npermit ip any any\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Named ACL', 'Tạo Access Control List sử dụng Tên thay vì Số, dễ nhớ và quản lý hơn.', 'Named ACL hỗ trợ thêm, xóa các dòng cụ thể dễ dàng bằng số thứ tự (sequence numbers).', 'show access-lists', 'no ip access-list extended <name>', FALSE, FALSE, TRUE, ARRAY['security', 'acl', 'named', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 40: Apply ACL to Interface
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.acl_apply', 'Gán ACL vào cổng', 'Apply ACL to Interface', 'Thực thi kiểm soát ACL')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip access-group <acl> in|out', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nip access-group BLOCK_WEB in\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'Apply ACL to Interface', 'Áp dụng Access Control List đã tạo vào một chiều (inbound hoặc outbound) của interface.', 'Đây là bước thiết yếu, ACL tạo ra sẽ vô dụng nếu không được apply.', 'show ip interface <interface>', 'no ip access-group <acl> in|out', TRUE, FALSE, TRUE, ARRAY['security', 'acl', 'interface', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 41: Local User + Secret
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.local_user', 'Tạo User cục bộ', 'Create Local User', 'Thiết lập tài khoản quản trị')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'username <name> privilege <level> secret <password>', E'enable\nconfigure terminal\nusername admin privilege 15 secret Cisc0123!\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Local User + Secret', 'Tạo tài khoản cục bộ trên thiết bị với mức đặc quyền và mật khẩu băm bảo mật (secret).', 'Quyền 15 là mức quản trị cao nhất, mức 1 là User EXEC mode mặc định.', 'show running-config | include username', 'no username <name>', FALSE, FALSE, TRUE, ARRAY['security', 'user', 'secret', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 42: Enable Secret
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.enable_secret', 'Cấu hình Enable Secret', 'Configure Enable Secret', 'Bảo vệ truy cập leo thang đặc quyền')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'enable secret <password>', E'enable\nconfigure terminal\nenable secret Cisc0123!\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Enable Secret', 'Thiết lập mật khẩu bảo vệ khi chuyển từ User EXEC mode sang Privileged EXEC mode (enable).', 'Nên dùng ''secret'' vì nó dùng hàm băm mạnh thay vì ''password'' bị lưu dạng plain text.', 'show running-config | include enable', 'no enable secret', FALSE, FALSE, TRUE, ARRAY['security', 'enable', 'secret', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 43: SSH Configuration
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.ssh', 'Cấu hình SSH', 'Configure SSH', 'Thiết lập quản lý từ xa an toàn')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'crypto key generate rsa\nip ssh version 2\ntransport input ssh', E'enable\nconfigure terminal\nhostname R1\nip domain-name cisco.com\ncrypto key generate rsa modulus 2048\nip ssh version 2\nline vty 0 15\nlogin local\ntransport input ssh\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'SSH Configuration', 'Cấu hình bảo mật từ xa bằng SSH, tắt Telnet để tránh lộ mật khẩu dạng rõ trên mạng.', 'Yêu cầu phải cấu hình hostname và domain-name trước khi tạo key RSA.', 'show ip ssh', 'crypto key zeroize rsa', TRUE, FALSE, TRUE, ARRAY['security', 'ssh', 'vty', 'management', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 44: Console & VTY Line
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.lines', 'Cấu hình Console/VTY', 'Configure Lines', 'Thiết lập cổng quản trị')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'line console 0\nline vty 0 15\nlogin local\nexec-timeout <min> <sec>', E'enable\nconfigure terminal\nline console 0\nlogin local\nexec-timeout 5 0\nline vty 0 15\nlogin local\nexec-timeout 10 0\nend\nwrite memory', 'Router(config-line)#', 'IOS-XE', 'Console & VTY Line', 'Cấu hình bảo mật cho cổng Console vật lý và đường VTY mạng từ xa, kết hợp timeout tự động.', 'Login local bắt buộc thiết bị dùng database tài khoản cục bộ (tạo bằng lệnh username).', 'show line', 'default line console 0', FALSE, FALSE, TRUE, ARRAY['security', 'console', 'vty', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 45: Banner MOTD
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.banner', 'Cấu hình Banner', 'Configure Banner', 'Hiển thị thông báo lúc Login')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'banner motd #<message>#', E'enable\nconfigure terminal\nbanner motd #\nUNAUTHORIZED ACCESS IS PROHIBITED\n#\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Banner MOTD', 'Tạo thông điệp hiển thị lúc đăng nhập (Message of The Day) cảnh báo người dùng trái phép.', 'Dấu # là ký tự phân cách (delimiter), có thể thay đổi tùy thích (ví dụ dùng &).', 'show running-config | include banner', 'no banner motd', FALSE, FALSE, TRUE, ARRAY['management', 'banner', 'motd', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 46: Service Password Encryption
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.password_encrypt', 'Mã hóa mật khẩu config', 'Encrypt Passwords', 'Mã hóa mật khẩu yếu trong cấu hình')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'service password-encryption', E'enable\nconfigure terminal\nservice password-encryption\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Service Password Encryption', 'Mã hóa toàn bộ mật khẩu dạng bản rõ (Type 0) đang tồn tại trong file cấu hình bằng thuật toán Type 7.', 'Thuật toán Type 7 yếu và dễ dịch ngược, tuy nhiên vẫn tốt hơn lưu mật khẩu rõ.', 'show running-config', 'no service password-encryption', FALSE, FALSE, TRUE, ARRAY['security', 'encryption', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 47: Hostname
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.hostname', 'Đặt tên Hostname', 'Set Hostname', 'Đặt tên định danh thiết bị')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'hostname <name>', E'enable\nconfigure terminal\nhostname R1_CORE\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Hostname', 'Đặt tên định danh cho thiết bị hiển thị ở dấu nhắc lệnh.', 'Dễ phân biệt khi quản trị mạng lớn.', 'show running-config | include hostname', 'no hostname', FALSE, FALSE, TRUE, ARRAY['management', 'hostname', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 48: Save Config
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.save_config', 'Lưu cấu hình', 'Save Configuration', 'Ghi cấu hình từ RAM sang NVRAM')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'copy running-config startup-config', E'copy running-config startup-config\n# Hoặc dùng: write memory', 'Router#', 'IOS-XE', 'Save Config', 'Lưu cấu hình đang hoạt động (trên RAM) vào NVRAM để không bị mất khi khởi động lại thiết bị.', 'Lệnh write memory cũng tương đương và ngắn gọn hơn (thường viết tắt là ''wr'').', 'show startup-config', '', FALSE, FALSE, TRUE, ARRAY['management', 'save', 'config', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 49: Show Running Config
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'show.running_config', 'Xem cấu hình đang chạy', 'Show Running Config', 'Kiểm tra chi tiết toàn bộ cấu hình')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show running-config', 'show running-config', 'Router#', 'IOS-XE', 'Show Running Config', 'Xem toàn bộ cấu hình hiện tại đang áp dụng và chạy trên RAM của thiết bị.', 'Lệnh phổ biến nhất. Có thể thêm | include / section / begin để lọc dữ liệu dài.', '', '', FALSE, FALSE, TRUE, ARRAY['management', 'show', 'running-config', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 50: Show Version
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'show.version', 'Xem Version iOS', 'Show Version', 'Kiểm tra phiên bản phần mềm')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show version', 'show version', 'Router#', 'IOS-XE', 'Show Version', 'Hiển thị thông tin tổng quan: phiên bản iOS, thời gian hoạt động (uptime), thông tin bộ nhớ, thanh ghi cấu hình (config register).', 'Sử dụng nhiều khi muốn kiểm tra uptime thiết bị để xác minh bị sập nguồn/khởi động lại.', '', '', FALSE, FALSE, TRUE, ARRAY['management', 'show', 'version', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 51: Show IP Interface Brief
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'show.ip_interface_brief', 'Xem nhanh Interface IP', 'Show IP Interface Brief', 'Kiểm tra nhanh danh sách và trạng thái cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'show ip interface brief', 'show ip interface brief', 'Router#', 'IOS-XE', 'Show IP Interface Brief', 'Liệt kê bảng tóm tắt về tất cả các giao diện IP, tình trạng vật lý (Status) và trạng thái giao thức (Protocol).', 'Trạng thái Up/Up là hoạt động bình thường, Admin Down là do cổng chưa được no shutdown.', '', '', FALSE, FALSE, TRUE, ARRAY['management', 'show', 'interface', 'ip', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 52: Syslog
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.syslog', 'Cấu hình Syslog', 'Configure Syslog', 'Chuyển logs hệ thống về máy chủ')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'logging host <ip>\nlogging trap <level>', E'enable\nconfigure terminal\nlogging host 10.1.1.50\nlogging trap warnings\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Syslog', 'Cấu hình gửi thông báo nhật ký hệ thống (Syslog) đến một máy chủ Syslog Server từ xa theo mức độ cảnh báo quy định.', 'Syslog có các cấp từ 0 (Emergencies) đến 7 (Debugging).', 'show logging', 'no logging host <ip>', FALSE, FALSE, TRUE, ARRAY['management', 'syslog', 'logging', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 53: SNMP v2c
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.snmp', 'Cấu hình SNMP', 'Configure SNMP', 'Bật giám sát bằng giao thức SNMP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'snmp-server community <string> RO|RW', E'enable\nconfigure terminal\nsnmp-server community PUBLIC_READ RO\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'SNMP v2c', 'Cấu hình giao thức SNMP v2c cho phép các công cụ giám sát mạng (NMS) truy xuất số liệu từ thiết bị qua Community string.', 'Nên dùng RO (Read-Only) cho an toàn. Với mạng lớn, khuyến cáo chuyển lên dùng SNMPv3 có mã hóa.', 'show snmp', 'no snmp-server community <string>', FALSE, FALSE, TRUE, ARRAY['management', 'snmp', 'monitoring', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 54: Ping
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'troubleshoot.ping', 'Ping IP', 'Ping', 'Kiểm tra kết nối mạng qua ICMP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ping <ip>', 'ping 8.8.8.8', 'Router#', 'IOS-XE', 'Ping', 'Sử dụng bản tin ICMP Echo Request/Reply kiểm tra khả năng kết nối mạng đầu cuối.', 'Cisco hiển thị dấu ! cho thành công, dấu . nếu timeout, dấu U nếu không có đường đi.', '', '', FALSE, FALSE, TRUE, ARRAY['management', 'troubleshooting', 'ping', 'icmp', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 55: Traceroute
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'troubleshoot.traceroute', 'Traceroute IP', 'Traceroute', 'Truy vết đường đi các node mạng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'traceroute <ip>', 'traceroute 8.8.8.8', 'Router#', 'IOS-XE', 'Traceroute', 'Truy vết đường đi của các gói tin từ nguồn tới đích bằng cách giảm dần giá trị TTL.', 'Khác với Windows dùng tracert (dùng ICMP), thiết bị Cisco dùng UDP traceroute.', '', '', FALSE, FALSE, TRUE, ARRAY['management', 'troubleshooting', 'traceroute', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 56: Shutdown/No Shutdown
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'interface.shutdown', 'Bật/Tắt cổng', 'Shutdown Interface', 'Kích hoạt hoặc ngắt cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'shutdown / no shutdown', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nshutdown\nno shutdown\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'Shutdown/No Shutdown', 'Tắt mềm hoặc bật lên một giao diện vật lý hay ảo.', 'Làm mới lại trạng thái cổng.', 'show ip interface brief', 'shutdown', TRUE, FALSE, TRUE, ARRAY['management', 'interface', 'shutdown', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 57: Description
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'interface.description', 'Mô tả cổng', 'Set Interface Description', 'Thêm mô tả cho cổng giao tiếp')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'description <text>', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\ndescription LINK_TO_ISP_VNPT\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'Description', 'Thêm dòng mô tả cho một interface, hỗ trợ quản trị viên nhận diện kết nối dễ hơn.', 'Rất quan trọng cho tài liệu mạng thực tế.', 'show interfaces description', 'no description', FALSE, FALSE, TRUE, ARRAY['management', 'interface', 'description', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 58: DNS Lookup
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.dns_lookup', 'Cấu hình phân giải DNS', 'Configure DNS Lookup', 'Gán máy chủ DNS và tính năng tra cứu')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'ip name-server <ip>\nip domain-lookup', E'enable\nconfigure terminal\nip name-server 8.8.8.8\nip domain-lookup\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'DNS Lookup', 'Cấu hình thiết bị dùng máy chủ DNS để phân giải tên miền thay vì chỉ dùng IP.', 'Nếu không cần thiết, đôi khi quản trị viên dùng lệnh ''no ip domain-lookup'' để tắt việc treo thiết bị khi gõ sai lệnh thành tên miền.', 'show hosts', 'no ip name-server <ip>', FALSE, FALSE, TRUE, ARRAY['management', 'dns', 'domain', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 59: Clock/Timezone
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.clock_timezone', 'Cấu hình Timezone', 'Configure Timezone', 'Thiết lập múi giờ cho hệ thống')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'clock timezone <zone> <offset>', E'enable\nconfigure terminal\nclock timezone ICT 7\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'Clock/Timezone', 'Cấu hình múi giờ hệ thống của thiết bị.', 'Cần cấu hình đúng múi giờ để log hệ thống (syslog/NTP) không bị sai lệch.', 'show clock', 'no clock timezone', FALSE, FALSE, TRUE, ARRAY['management', 'clock', 'timezone', 'ccna']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 60: OSPF Route Summarization
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'ospf.summarization', 'Thu gọn tuyến OSPF', 'OSPF Route Summarization', 'Summary định tuyến OSPF qua ABR')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'area <area-id> range <ip> <mask>', E'enable\nconfigure terminal\nrouter ospf 1\narea 1 range 10.1.0.0 255.255.252.0\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'OSPF Route Summarization', 'Cấu hình thu gọn tuyến OSPF tại ABR (Area Border Router) để tối ưu bảng định tuyến và tài nguyên router.', 'Giúp hạn chế số lượng bản tin LSA cần quảng bá khi mạng có biến động trong area con.', 'show ip route ospf', 'no area <area-id> range', FALSE, FALSE, TRUE, ARRAY['ospf', 'routing', 'summarization', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 61: OSPF MD5 Auth
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'ospf.md5_auth', 'Xác thực OSPF MD5', 'OSPF MD5 Auth', 'Bật xác thực bảo mật OSPF bằng MD5')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip ospf message-digest-key <key-id> md5 <key>', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nip ospf message-digest-key 1 md5 my_secret_key\nip ospf authentication message-digest\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'OSPF MD5 Auth', 'Thiết lập mật khẩu xác thực MD5 cho giao thức OSPF giúp ngăn kẻ tấn công giả mạo làm router OSPF láng giềng.', 'Key ID và Password phải giống hệt nhau ở hai đầu kết nối của link.', 'show ip ospf interface', 'no ip ospf message-digest-key', FALSE, FALSE, TRUE, ARRAY['ospf', 'security', 'authentication', 'md5', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 62: BGP eBGP Peering
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'bgp.ebgp_peering', 'Cấu hình eBGP Peering', 'Configure eBGP Peering', 'Thiết lập kết nối láng giềng eBGP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'neighbor <ip> remote-as <as>', E'enable\nconfigure terminal\nrouter bgp 65001\nneighbor 203.0.113.1 remote-as 65002\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'BGP eBGP Peering', 'Cấu hình thiết lập láng giềng BGP bên ngoài (eBGP) với một thiết bị thuộc Autonomous System (AS) khác.', 'BGP yêu cầu cấu hình neighbor một cách tĩnh. eBGP có giá trị AD là 20 mặc định.', 'show ip bgp summary', 'no neighbor <ip> remote-as <as>', FALSE, FALSE, TRUE, ARRAY['bgp', 'ebgp', 'peering', 'routing', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 63: BGP Route Filtering
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'bgp.route_filtering', 'Lọc tuyến BGP', 'BGP Route Filtering', 'Lọc tuyến đường qua prefix-list')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'neighbor <ip> prefix-list <name> in|out', E'enable\nconfigure terminal\nrouter bgp 65001\nneighbor 203.0.113.1 prefix-list FILTER_IN in\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'BGP Route Filtering', 'Sử dụng prefix-list để lọc các tuyến mạng BGP nhận vào hoặc gửi đi cho một neighbor cụ thể.', 'Mạnh mẽ và linh hoạt hơn dùng ACL khi cần lọc chính xác mask của prefix.', 'show ip bgp neighbors <ip> routes', 'no neighbor <ip> prefix-list <name> in|out', FALSE, FALSE, TRUE, ARRAY['bgp', 'filtering', 'prefix-list', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 64: Route Redistribution
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.redistribute', 'Cấu hình Route Redistribution', 'Configure Route Redistribution', 'Phân phối tuyến đường giữa các giao thức')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'redistribute <protocol> subnets', E'enable\nconfigure terminal\nrouter ospf 1\nredistribute connected subnets\nend\nwrite memory', 'Router(config-router)#', 'IOS-XE', 'Route Redistribution', 'Phân phối các tuyến đường từ giao thức khác (hoặc tuyến connected/static) vào trong bảng định tuyến hiện tại.', 'Từ khóa ''subnets'' cực kỳ quan trọng trong OSPF, nếu không nó chỉ phân phối classful network.', 'show ip route', 'no redistribute <protocol>', FALSE, FALSE, TRUE, ARRAY['redistribution', 'ospf', 'routing', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 65: GRE Tunnel
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'vpn.gre', 'Cấu hình GRE Tunnel', 'Configure GRE Tunnel', 'Tạo đường hầm ảo không mã hóa')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'interface tunnel <number>\ntunnel source <src>\ntunnel destination <dst>', E'enable\nconfigure terminal\ninterface tunnel 0\nip address 192.168.100.1 255.255.255.0\ntunnel source GigabitEthernet0/0\ntunnel destination 203.0.113.2\ntunnel mode gre ip\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'GRE Tunnel', 'Tạo đường hầm GRE đóng gói và truyền tải bất kỳ giao thức mạng L3 nào qua IP WAN (Internet).', 'GRE không có mã hóa, nếu cần bảo mật thì phải chạy đè thêm IPSec (như GRE over IPSec).', 'show interfaces tunnel <number>', 'no interface tunnel <number>', FALSE, FALSE, TRUE, ARRAY['vpn', 'gre', 'tunneling', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 66: VRF-Lite
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.vrf_lite', 'Cấu hình VRF-Lite', 'Configure VRF-Lite', 'Tạo bảng định tuyến ảo riêng biệt')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'vrf definition <name>\nrd <rd>\naddress-family ipv4', E'enable\nconfigure terminal\nvrf definition CUSTOMER_A\nrd 100:1\naddress-family ipv4\nexit-address-family\ninterface GigabitEthernet0/1\nvrf forwarding CUSTOMER_A\nip address 10.1.1.1 255.255.255.0\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'VRF-Lite', 'Tạo bản sao ảo của bảng định tuyến (VRF) cô lập các lớp mạng khác nhau trên cùng một router vật lý.', 'Ứng dụng nhiều khi gộp mạng chồng chéo IP hay ảo hóa phân chia phòng ban cấp độ mạng.', 'show vrf', 'no vrf definition <name>', TRUE, FALSE, TRUE, ARRAY['vrf', 'vrf-lite', 'routing', 'virtualization', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 67: PBR (Policy-Based Routing)
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.pbr', 'Cấu hình Định tuyến PBR', 'Configure PBR', 'Định tuyến dựa theo chính sách route-map')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'ip policy route-map <map-tag>', E'enable\nconfigure terminal\nroute-map PBR_MAP permit 10\nmatch ip address 1\nset ip next-hop 203.0.113.1\ninterface GigabitEthernet0/0\nip policy route-map PBR_MAP\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'PBR (Policy-Based Routing)', 'Định tuyến dựa trên chính sách thay vì chỉ dựa vào IP đích (như bảng định tuyến thông thường).', 'Có thể ép luồng traffic đi ra đường mạng khác dựa vào IP nguồn, giao thức, v.v...', 'show route-map', 'no ip policy route-map <map-tag>', FALSE, FALSE, TRUE, ARRAY['pbr', 'route-map', 'policy-based-routing', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 68: Private VLAN
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_switching, 'switching.private_vlan', 'Cấu hình Private VLAN', 'Configure Private VLAN', 'Phân chia VLAN bảo mật lớp 2')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'private-vlan primary|isolated|community', E'enable\nconfigure terminal\nvlan 100\nprivate-vlan primary\nvlan 101\nprivate-vlan isolated\nvlan 100\nprivate-vlan association 101\nend\nwrite memory', 'Switch(config-vlan)#', 'IOS-XE', 'Private VLAN', 'Tính năng Layer 2 giúp phân lập kết nối giữa các host thuộc cùng một Subnet IP để tăng cường bảo mật.', 'Isolated cấm giao tiếp lẫn nhau; Community cho phép giao tiếp nội bộ; Primary là VLAN cha nói chuyện với promiscuous port.', 'show vlan private-vlan', 'no vlan <vlan-id>', TRUE, FALSE, TRUE, ARRAY['vlan', 'private-vlan', 'security', 'switching', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 69: VRRP
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_routing, 'routing.vrrp', 'Cấu hình VRRP', 'Configure VRRP', 'Dự phòng Gateway dùng giao thức chuẩn VRRP')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'vrrp <group> ip <virtual-ip>', E'enable\nconfigure terminal\ninterface GigabitEthernet0/0\nvrrp 1 ip 192.168.1.254\nvrrp 1 priority 110\nend\nwrite memory', 'Router(config-if)#', 'IOS-XE', 'VRRP', 'Giao thức Gateway dự phòng chuẩn hóa quốc tế (IEEE) hoạt động tương tự HSRP của Cisco.', 'Cho phép sử dụng IP vật lý của Master Router làm IP ảo (Virtual IP) của Group luôn.', 'show vrrp', 'no vrrp <group> ip', FALSE, FALSE, TRUE, ARRAY['vrrp', 'fhrp', 'redundancy', 'gateway', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 70: IP SLA
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.ip_sla', 'Cấu hình IP SLA', 'Configure IP SLA', 'Giám sát mạng qua IP SLA')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'ip sla <number>\nicmp-echo <ip>', E'enable\nconfigure terminal\nip sla 1\nicmp-echo 8.8.8.8 source-interface GigabitEthernet0/0\nfrequency 10\nip sla schedule 1 life forever start-time now\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'IP SLA', 'Giám sát chủ động trạng thái liên kết bằng cách gửi định kỳ các bản tin ICMP. Thường kết hợp với Track và Static Route để chuyển đổi kết nối tự động.', 'Tuyệt vời để phát hiện đường truyền ISP bị rớt ngầm.', 'show ip sla statistics', 'no ip sla <number>', FALSE, FALSE, TRUE, ARRAY['sla', 'tracking', 'monitoring', 'failover', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 71: SPAN (Port Mirroring)
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_management, 'management.span', 'Cấu hình Mirroring SPAN', 'Configure SPAN Mirroring', 'Bắt và sao chép gói tin qua cổng Mirror')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'monitor session <id> source <if>\nmonitor session <id> destination <if>', E'enable\nconfigure terminal\nmonitor session 1 source interface GigabitEthernet1/0/1 both\nmonitor session 1 destination interface GigabitEthernet1/0/24\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', 'SPAN (Port Mirroring)', 'Sao chép toàn bộ lưu lượng gửi/nhận (Rx/Tx) của một hoặc nhiều cổng sang một cổng khác kết nối thiết bị bắt gói tin (như Wireshark, IDS).', 'SPAN nội bộ hoạt động trên cùng một switch. Có cả tính năng RSPAN để mirror qua mạng.', 'show monitor session <number>', 'no monitor session <id>', FALSE, FALSE, TRUE, ARRAY['span', 'mirroring', 'monitoring', 'troubleshooting', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 72: 802.1X
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.8021x', 'Cấu hình xác thực 802.1X', 'Configure 802.1X', 'Kiểm soát truy cập mạng lớp 2 qua cổng')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'dot1x system-auth-control\nauthentication port-control auto', E'enable\nconfigure terminal\ndot1x system-auth-control\ninterface GigabitEthernet1/0/1\nauthentication port-control auto\ndot1x pae authenticator\nend\nwrite memory', 'Switch(config)#', 'IOS-XE', '802.1X', 'Cấu hình tính năng xác thực truy cập mạng tại cổng vật lý (NAC), chặn thiết bị nếu xác thực thông qua máy chủ RADIUS không thành công.', 'Cần cấu hình kết nối tới server AAA (RADIUS) trước.', 'show dot1x all', 'no dot1x system-auth-control', FALSE, FALSE, TRUE, ARRAY['802.1x', 'security', 'nac', 'authentication', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 73: CoPP (Control Plane Policing)
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.copp', 'Cấu hình bảo vệ CPU CoPP', 'Configure CoPP', 'Giới hạn traffic nhắm tới CPU thiết bị')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'control-plane\nservice-policy input <policy>', E'enable\nconfigure terminal\ncontrol-plane\nservice-policy input COPP_POLICY\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'CoPP (Control Plane Policing)', 'Áp dụng chính sách QoS trên Control Plane để giới hạn các gói tin nhắm trực tiếp vào CPU router, bảo vệ hệ thống khỏi bị quá tải (DoS).', 'Bắt buộc có kiến thức MQC QoS (Class-map, Policy-map).', 'show policy-map control-plane', 'no service-policy input', FALSE, FALSE, TRUE, ARRAY['copp', 'security', 'control-plane', 'qos', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);

    -- CMD 74: RADIUS Server
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.radius', 'Khai báo RADIUS Server', 'Define RADIUS Server', 'Cấu hình xác thực qua máy chủ RADIUS')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'radius server <name>\naddress ipv4 <ip> auth-port <p1> acct-port <p2>', E'enable\nconfigure terminal\nradius server RADIUS_ISE\naddress ipv4 10.1.1.200 auth-port 1812 acct-port 1813\nkey my_radius_key\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'RADIUS Server', 'Khai báo máy chủ xác thực RADIUS phục vụ cho 802.1x, VPN hoặc quản trị thiết bị.', 'Giao thức chuẩn mở UDP (Port 1812/1813). Chỉ mã hóa mật khẩu, không mã hóa toàn bộ gói tin.', 'show aaa servers', 'no radius server <name>', FALSE, FALSE, TRUE, ARRAY['aaa', 'radius', 'security', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 75: TACACS+ Server
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_security, 'security.tacacs', 'Khai báo TACACS+ Server', 'Define TACACS+ Server', 'Cấu hình xác thực quản trị qua TACACS+')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'tacacs server <name>\naddress ipv4 <ip>', E'enable\nconfigure terminal\ntacacs server TACACS_ACS\naddress ipv4 10.1.1.201\nkey my_tacacs_key\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'TACACS+ Server', 'Khai báo máy chủ xác thực TACACS+ chuyên dùng cho cấu hình AAA quản trị lệnh chi tiết.', 'Giao thức của Cisco, dùng TCP Port 49, mã hóa toàn bộ payload bản tin AAA.', 'show aaa servers', 'no tacacs server <name>', FALSE, FALSE, TRUE, ARRAY['aaa', 'tacacs', 'security', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 76: QoS Class-map
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_qos, 'qos.class_map', 'Tạo Class-map QoS', 'Create QoS Class-map', 'Phân loại lưu lượng bằng Class-map')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, E'class-map match-any <name>\nmatch dscp <value>', E'enable\nconfigure terminal\nclass-map match-any VOICE_CLASS\nmatch dscp ef\nend\nwrite memory', 'Router(config)#', 'IOS-XE', 'QoS Class-map', 'Nhận diện và phân loại (Classification) các gói tin vào thành từng lớp chuyên dụng (Voice, Video, Data).', 'Là thành phần thiết yếu đầu tiên của cấu trúc MQC (Modular QoS CLI) trên thiết bị Cisco.', 'show class-map', 'no class-map <name>', FALSE, FALSE, TRUE, ARRAY['qos', 'mqc', 'class-map', 'classification', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

    -- CMD 77: QoS Policing
    INSERT INTO canonical_actions (category_id, action_key, name_vi, name_en, description_vi)
    VALUES (cat_qos, 'qos.policing', 'Giới hạn băng thông QoS', 'QoS Policing', 'Áp đặt chính sách Policing')
    ON CONFLICT (action_key) DO UPDATE SET name_vi = EXCLUDED.name_vi RETURNING id INTO a_id;
    INSERT INTO commands (vendor_id, canonical_action_id, command_syntax, full_syntax, prompt_mode, os_flavor, title_vi, description_vi, notes_vi, verification_command, rollback_command, is_destructive, requires_commit, is_verified, tags, parameters, examples, warnings)
    VALUES (v_cisco, a_id, 'police <bps>', E'enable\nconfigure terminal\npolicy-map LIMIT_BW\nclass class-default\npolice 10000000 conform-action transmit exceed-action drop\nend\nwrite memory', 'Router(config-pmap-c)#', 'IOS-XE', 'QoS Policing', 'Thực hiện giới hạn băng thông (Rate limit) một chiều cứng, vứt bỏ các gói tin vượt quá mức quy định.', 'Thường ứng dụng trên chiều inbound interface kết nối từ user để tránh lạm dụng băng thông tải về.', 'show policy-map interface <interface>', 'no policy-map <name>', FALSE, FALSE, TRUE, ARRAY['qos', 'policing', 'rate-limit', 'ccnp']::TEXT[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) RETURNING id INTO c_id;
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_router);
    INSERT INTO command_device_types (command_id, device_type_id) VALUES (c_id, v_switch);

END $$;