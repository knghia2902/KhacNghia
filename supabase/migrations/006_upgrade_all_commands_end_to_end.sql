-- ==============================================================================
-- Migration: 006_upgrade_all_commands_end_to_end.sql
-- Description: Upgrade ALL commands in the database to provide complete,
--              professional, end-to-end configuration scripts (từ đầu đến cuối).
-- ==============================================================================

DO $$
BEGIN

    -- 1. CISCO: Gán IP cho Interface
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n description <description>\n ip address <ip_address> <subnet_mask>\n no shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show ip interface <interface_name>',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no ip address\n shutdown\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Đặt địa chỉ IP cho Interface (Cisco Router/L3 Switch)%';

    -- 2. CISCO: Tắt cổng Interface (Shutdown)
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if)#',
        verification_command = 'show ip interface brief',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no shutdown\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Tắt cổng Interface (Cisco Shutdown)%';

    -- 3. CISCO: Đặt mô tả cho Interface
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n description <description_text>\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if)#',
        verification_command = 'show interfaces <interface_name> description',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no description\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Đặt mô tả cho Interface (Cisco Description)%';

    -- 4. CISCO: Xem trạng thái Interface
    UPDATE commands SET
        full_syntax = 'show ip interface brief',
        prompt_mode = 'Switch#'
    WHERE title_vi ILIKE '%Xem tóm tắt trạng thái Interface (Cisco Show IP Int Brief)%';

    -- 5. CISCO: Tạo VLAN
    UPDATE commands SET
        full_syntax = E'configure terminal\nvlan <vlan_id>\n name <vlan_name>\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show vlan brief',
        rollback_command = E'configure terminal\nno vlan <vlan_id>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Tạo VLAN trên Cisco Switch%';

    -- 6. CISCO: Gán cổng Access vào VLAN
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n description Access-to-Client\n switchport mode access\n switchport access vlan <vlan_id>\n no shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if)#',
        verification_command = 'show interfaces <interface_name> switchport',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no switchport access vlan\n no switchport mode\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Gán cổng Switch vào VLAN Access (Cisco)%';

    -- 7. CISCO: Cấu hình Trunk Port
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n description Trunk-Uplink\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan <vlan_list>\n no shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if)#',
        verification_command = 'show interfaces trunk',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no switchport mode\n no switchport trunk allowed vlan\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình cổng Trunk 802.1Q (Cisco)%';

    -- 8. CISCO: Xem danh sách VLAN
    UPDATE commands SET
        full_syntax = 'show vlan brief',
        prompt_mode = 'Switch#'
    WHERE title_vi ILIKE '%Xem danh sách VLAN (Cisco Show VLAN Brief)%';

    -- 9. CISCO: Thêm Static Route
    UPDATE commands SET
        full_syntax = E'configure terminal\nip route <dst_network> <subnet_mask> <next_hop_ip>\nend\nwrite memory',
        prompt_mode = 'Router(config)#',
        verification_command = 'show ip route static',
        rollback_command = E'configure terminal\nno ip route <dst_network> <subnet_mask> <next_hop_ip>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Thêm Static Route trên Cisco Router/L3 Switch%';

    -- 10. CISCO: Default Route
    UPDATE commands SET
        full_syntax = E'configure terminal\nip route 0.0.0.0 0.0.0.0 <gateway_ip>\nend\nwrite memory',
        prompt_mode = 'Router(config)#',
        verification_command = 'show ip route 0.0.0.0',
        rollback_command = E'configure terminal\nno ip route 0.0.0.0 0.0.0.0 <gateway_ip>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình Default Route trên Cisco Router%';

    -- 11. CISCO: OSPF
    UPDATE commands SET
        full_syntax = E'configure terminal\nrouter ospf <process_id>\n router-id <router_id_ip>\n network <network_ip> <wildcard_mask> area <area_id>\n exit\nend\nwrite memory',
        prompt_mode = 'Router(config)#',
        verification_command = E'show ip ospf neighbor\nshow ip route ospf',
        rollback_command = E'configure terminal\nno router ospf <process_id>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Bật định tuyến OSPF (Cisco Router)%';

    -- 12. CISCO: BGP Neighbor
    UPDATE commands SET
        full_syntax = E'configure terminal\nrouter bgp <local_as>\n bgp router-id <router_id_ip>\n neighbor <neighbor_ip> remote-as <remote_as>\n neighbor <neighbor_ip> description <description>\n exit\nend\nwrite memory',
        prompt_mode = 'Router(config-router)#',
        verification_command = 'show ip bgp summary',
        rollback_command = E'configure terminal\nrouter bgp <local_as>\n no neighbor <neighbor_ip>\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình BGP Neighbor (Cisco BGP)%';

    -- 13. CISCO: Show IP Route
    UPDATE commands SET
        full_syntax = 'show ip route',
        prompt_mode = 'Router#'
    WHERE title_vi ILIKE '%Xem bảng định tuyến IP (Cisco Show IP Route)%';

    -- 14. CISCO: LACP EtherChannel
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface range <interface_range>\n channel-group <channel_id> mode active\n exit\ninterface port-channel <channel_id>\n switchport mode trunk\n switchport trunk allowed vlan all\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if-range)#',
        verification_command = 'show etherchannel summary',
        rollback_command = E'configure terminal\nno interface port-channel <channel_id>\ninterface range <interface_range>\n no channel-group <channel_id>\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình LACP EtherChannel (Cisco)%';

    -- 15. CISCO: STP Mode
    UPDATE commands SET
        full_syntax = E'configure terminal\nspanning-tree mode rapid-pvst\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show spanning-tree summary',
        rollback_command = E'configure terminal\nspanning-tree mode pvst\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình chế độ Spanning Tree Rapid-PVST (Cisco)%';

    -- 16. CISCO: Port Security
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n switchport mode access\n switchport port-security\n switchport port-security maximum <max_mac>\n switchport port-security violation restrict\n switchport port-security mac-address sticky\n exit\nend\nwrite memory',
        prompt_mode = 'Switch(config-if)#',
        verification_command = 'show port-security interface <interface_name>',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no switchport port-security\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình Port Security bảo vệ cổng (Cisco)%';

    -- 17. CISCO: Extended ACL
    UPDATE commands SET
        full_syntax = E'configure terminal\nip access-list extended <acl_name>\n permit tcp <src_ip> <src_wildcard> <dst_ip> <dst_wildcard> eq <port>\n deny ip any any\n exit\ninterface <interface_name>\n ip access-group <acl_name> in\n exit\nend\nwrite memory',
        prompt_mode = 'Router(config-ext-nacl)#',
        verification_command = 'show access-lists <acl_name>',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no ip access-group <acl_name> in\n exit\nno ip access-list extended <acl_name>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Tạo Extended Access Control List (Cisco ACL)%';

    -- 18. CISCO: Hostname
    UPDATE commands SET
        full_syntax = E'configure terminal\nhostname <hostname>\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show running-config | include hostname'
    WHERE title_vi ILIKE '%Đổi tên thiết bị (Cisco Hostname)%';

    -- 19. CISCO: Save Config
    UPDATE commands SET
        full_syntax = 'write memory',
        prompt_mode = 'Switch#',
        verification_command = 'show startup-config'
    WHERE title_vi ILIKE '%Lưu cấu hình thiết bị Cisco (Write Memory / Copy Run Start)%';

    -- 20. CISCO: NTP Server
    UPDATE commands SET
        full_syntax = E'configure terminal\nntp server <ntp_server_ip>\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show ntp associations',
        rollback_command = E'configure terminal\nno ntp server <ntp_server_ip>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Cấu hình NTP Server đồng bộ thời gian (Cisco)%';

    -- 21. CISCO: Local Admin User
    UPDATE commands SET
        full_syntax = E'configure terminal\nusername <username> privilege <priv_level> algorithm-type sha256 secret <password>\nend\nwrite memory',
        prompt_mode = 'Switch(config)#',
        verification_command = 'show running-config | include username',
        rollback_command = E'configure terminal\nno username <username>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Tạo tài khoản quản trị cục bộ (Cisco)%';

    -- 22. CISCO: Ping & Traceroute & Show Version
    UPDATE commands SET
        full_syntax = 'ping <target_ip> repeat <count>',
        prompt_mode = 'Switch#'
    WHERE title_vi ILIKE '%Ping kiểm tra kết nối mạng (Cisco)%';

    UPDATE commands SET
        full_syntax = 'traceroute <target_ip>',
        prompt_mode = 'Switch#'
    WHERE title_vi ILIKE '%Dò đường đi gói tin (Cisco Traceroute)%';

    UPDATE commands SET
        full_syntax = 'show version',
        prompt_mode = 'Switch#'
    WHERE title_vi ILIKE '%Xem thông tin phiên bản phần mềm Cisco (Show Version)%';


    -- 23. FORTINET: Đặt IP Interface
    UPDATE commands SET
        full_syntax = E'config system interface\n edit <port_name>\n  set mode static\n  set ip <ip_address> <subnet_mask>\n  set allowaccess ping https ssh\n  set status up\n next\nend',
        prompt_mode = 'FortiGate #',
        verification_command = 'get system interface physical <port_name>',
        rollback_command = E'config system interface\n edit <port_name>\n  unset ip\n  unset allowaccess\n next\nend'
    WHERE title_vi ILIKE '%Đặt IP và quyền truy cập cho Interface FortiGate%';

    -- 24. FORTINET: Static Route
    UPDATE commands SET
        full_syntax = E'config router static\n edit 0\n  set dst <dst_subnet> <subnet_mask>\n  set gateway <gateway_ip>\n  set device <interface_name>\n next\nend',
        prompt_mode = 'FortiGate #',
        verification_command = 'get router info routing-table static',
        rollback_command = E'config router static\n delete <entry_id>\nend'
    WHERE title_vi ILIKE '%Thêm Static Route trên FortiGate%';

    -- 25. FORTINET: Firewall Policy
    UPDATE commands SET
        full_syntax = E'config firewall policy\n edit 0\n  set name <policy_name>\n  set srcintf <src_interface>\n  set dstintf <dst_interface>\n  set action accept\n  set srcaddr <src_address>\n  set dstaddr <dst_address>\n  set schedule always\n  set service <service_name>\n  set nat enable\n next\nend',
        prompt_mode = 'FortiGate #',
        verification_command = 'show firewall policy',
        rollback_command = E'config firewall policy\n delete <policy_id>\nend'
    WHERE title_vi ILIKE '%Tạo Firewall Policy / Rule trên FortiGate%';

    -- 26. FORTINET: Hostname & Ping
    UPDATE commands SET
        full_syntax = E'config system global\n set hostname <hostname>\nend',
        prompt_mode = 'FortiGate #',
        verification_command = 'get system status'
    WHERE title_vi ILIKE '%Đổi Hostname trên FortiGate%';

    UPDATE commands SET
        full_syntax = 'execute ping <target_ip>',
        prompt_mode = 'FortiGate #'
    WHERE title_vi ILIKE '%Ping kiểm tra kết nối trên FortiGate%';


    -- 27. HUAWEI: Đặt IP Interface
    UPDATE commands SET
        full_syntax = E'system-view\ninterface <interface_name>\n description <description_text>\n ip address <ip_address> <subnet_mask_or_prefix>\n undo shutdown\n quit\nreturn\nsave',
        prompt_mode = '<Huawei>',
        verification_command = 'display ip interface brief <interface_name>',
        rollback_command = E'system-view\ninterface <interface_name>\n undo ip address\n shutdown\n quit\nreturn\nsave'
    WHERE title_vi ILIKE '%Đặt IP cho Interface trên Huawei Router/Switch%';

    -- 28. HUAWEI: Tạo VLAN
    UPDATE commands SET
        full_syntax = E'system-view\nvlan <vlan_id>\n description <vlan_name>\n quit\nreturn\nsave',
        prompt_mode = '<Huawei>',
        verification_command = 'display vlan <vlan_id>',
        rollback_command = E'system-view\nundo vlan <vlan_id>\nreturn\nsave'
    WHERE title_vi ILIKE '%Tạo VLAN trên Huawei Switch (VRP)%';

    -- 29. HUAWEI: Static Route
    UPDATE commands SET
        full_syntax = E'system-view\nip route-static <dst_ip> <prefix> <next_hop_ip>\nreturn\nsave',
        prompt_mode = '<Huawei>',
        verification_command = 'display ip routing-table protocol static',
        rollback_command = E'system-view\nundo ip route-static <dst_ip> <prefix> <next_hop_ip>\nreturn\nsave'
    WHERE title_vi ILIKE '%Cấu hình Static Route trên Huawei VRP%';

    -- 30. HUAWEI: Save
    UPDATE commands SET
        full_syntax = 'save',
        prompt_mode = '<Huawei>',
        verification_command = 'display saved-configuration'
    WHERE title_vi ILIKE '%Lưu cấu hình hệ thống Huawei VRP%';


    -- 31. JUNIPER: Đặt IP Interface
    UPDATE commands SET
        full_syntax = E'configure\nset interfaces <interface_name> unit 0 family inet address <ip_address>/<prefix>\nset interfaces <interface_name> description "<description>"\ncommit and-quit',
        prompt_mode = 'user@router#',
        verification_command = 'show interfaces terse <interface_name>',
        rollback_command = E'configure\ndelete interfaces <interface_name> unit 0 family inet address <ip_address>/<prefix>\ncommit and-quit'
    WHERE title_vi ILIKE '%Đặt địa chỉ IP cho Interface (Juniper)%';

    -- 32. JUNIPER: Tạo VLAN
    UPDATE commands SET
        full_syntax = E'configure\nset vlans <vlan_name> vlan-id <vlan_id>\ncommit and-quit',
        prompt_mode = 'user@switch#',
        verification_command = 'show vlans',
        rollback_command = E'configure\ndelete vlans <vlan_name>\ncommit and-quit'
    WHERE title_vi ILIKE '%Tạo VLAN trên Juniper Junos Switch%';

    -- 33. JUNIPER: Static Route
    UPDATE commands SET
        full_syntax = E'configure\nset routing-options static route <dst_network>/<prefix> next-hop <next_hop_ip>\ncommit and-quit',
        prompt_mode = 'user@router#',
        verification_command = 'show route protocol static',
        rollback_command = E'configure\ndelete routing-options static route <dst_network>/<prefix>\ncommit and-quit'
    WHERE title_vi ILIKE '%Thêm Static Route (Juniper Junos)%';

    -- 34. JUNIPER: LAG / LACP
    UPDATE commands SET
        full_syntax = E'configure\nset chassis aggregated-devices ethernet device-count <device_count>\nset interfaces <physical_interface> ether-options 802.3ad ae<bundle_id>\nset interfaces ae<bundle_id> aggregated-ether-options lacp active\ncommit and-quit',
        prompt_mode = 'user@switch#',
        verification_command = 'show interfaces ae<bundle_id> brief',
        rollback_command = E'configure\ndelete interfaces <physical_interface> ether-options 802.3ad\ndelete interfaces ae<bundle_id>\ncommit and-quit'
    WHERE title_vi ILIKE '%Cấu hình Aggregated Ethernet (LAG/LACP) trên Juniper%';

    -- 35. JUNIPER: Commit
    UPDATE commands SET
        full_syntax = E'configure\ncommit confirmed 5\ncommit and-quit',
        prompt_mode = 'user@device#',
        verification_command = 'show system commit'
    WHERE title_vi ILIKE '%Áp dụng và lưu cấu hình Junos (Commit / Commit Confirmed)%';


    -- 36. MIKROTIK: Đặt IP Interface
    UPDATE commands SET
        full_syntax = '/ip address add address=<ip_address>/<prefix> interface=<interface_name> comment="<description>"',
        prompt_mode = '[admin@MikroTik] >',
        verification_command = '/ip address print',
        rollback_command = '/ip address remove [find address="<ip_address>/<prefix>"]'
    WHERE title_vi ILIKE '%Đặt địa chỉ IP trên MikroTik (RouterOS)%';

    -- 37. MIKROTIK: Static Route
    UPDATE commands SET
        full_syntax = '/ip route add dst-address=<dst_network>/<prefix> gateway=<gateway_ip> comment="<description>"',
        prompt_mode = '[admin@MikroTik] >',
        verification_command = '/ip route print where static=yes',
        rollback_command = '/ip route remove [find dst-address="<dst_network>/<prefix>"]'
    WHERE title_vi ILIKE '%Thêm Route trên MikroTik RouterOS%';

    -- 38. MIKROTIK: Source NAT Masquerade
    UPDATE commands SET
        full_syntax = '/ip firewall nat add chain=srcnat out-interface=<out_interface> action=masquerade comment="Internet Masquerade NAT"',
        prompt_mode = '[admin@MikroTik] >',
        verification_command = '/ip firewall nat print',
        rollback_command = '/ip firewall nat remove [find comment="Internet Masquerade NAT"]'
    WHERE title_vi ILIKE '%Cấu hình Source NAT Masquerade trên MikroTik%';

    -- 39. MIKROTIK: Backup / Export
    UPDATE commands SET
        full_syntax = E'/system backup save name=<backup_name>\n/export file=<export_filename>',
        prompt_mode = '[admin@MikroTik] >',
        verification_command = '/file print'
    WHERE title_vi ILIKE '%Sao lưu cấu hình MikroTik (Backup / Export RSC)%';


    -- 40. PALO ALTO: Layer 3 Interface
    UPDATE commands SET
        full_syntax = E'configure\nset network interface ethernet <interface_name> layer3 ip <ip_address>/<prefix>\nset network interface ethernet <interface_name> comment "<description>"\ncommit',
        prompt_mode = 'admin@PA-FW#',
        verification_command = 'show interface <interface_name>',
        rollback_command = E'configure\ndelete network interface ethernet <interface_name> layer3 ip <ip_address>/<prefix>\ncommit'
    WHERE title_vi ILIKE '%Đặt IP cho Interface Layer 3 trên Palo Alto%';

    -- 41. PALO ALTO: Static Route
    UPDATE commands SET
        full_syntax = E'configure\nset network virtual-router <vr_name> routing-table ip static-route <route_name> destination <dst_cidr> nexthop ip-address <gateway_ip>\ncommit',
        prompt_mode = 'admin@PA-FW#',
        verification_command = 'show routing route virtual-router <vr_name>',
        rollback_command = E'configure\ndelete network virtual-router <vr_name> routing-table ip static-route <route_name>\ncommit'
    WHERE title_vi ILIKE '%Thêm Static Route trong Virtual Router (Palo Alto)%';

    -- 42. PALO ALTO: Security Rule
    UPDATE commands SET
        full_syntax = E'configure\nset rulebase security rules <rule_name> from <from_zone> to <to_zone> source <src_addr> destination <dst_addr> application <app_name> service <service_name> action allow\ncommit',
        prompt_mode = 'admin@PA-FW#',
        verification_command = 'show rulebase security rules <rule_name>',
        rollback_command = E'configure\ndelete rulebase security rules <rule_name>\ncommit'
    WHERE title_vi ILIKE '%Tạo Security Policy Rule trên Palo Alto%';

    -- 43. PALO ALTO: Commit
    UPDATE commands SET
        full_syntax = E'configure\ncommit',
        prompt_mode = 'admin@PA-FW#',
        verification_command = 'show jobs all'
    WHERE title_vi ILIKE '%Commit cấu hình trên Palo Alto Networks Firewall%';


    -- 44. ARUBA AOS-CX: Interface IP
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_name>\n description <description>\n ip address <ip_address>/<prefix>\n no shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'switch(config)#',
        verification_command = 'show interface <interface_name>',
        rollback_command = E'configure terminal\ninterface <interface_name>\n no ip address\n shutdown\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Đặt IP cho Interface (Aruba AOS-CX)%';

    -- 45. ARUBA AOS-CX: Tạo VLAN
    UPDATE commands SET
        full_syntax = E'configure terminal\nvlan <vlan_id>\n name <vlan_name>\n exit\nend\nwrite memory',
        prompt_mode = 'switch(config)#',
        verification_command = 'show vlan summary',
        rollback_command = E'configure terminal\nno vlan <vlan_id>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Tạo VLAN trên Aruba AOS-CX Switch%';

    -- 46. ARUBA AOS-CX: Access Port
    UPDATE commands SET
        full_syntax = E'configure terminal\ninterface <interface_id>\n description Access-to-Client\n vlan access <vlan_id>\n no shutdown\n exit\nend\nwrite memory',
        prompt_mode = 'switch(config-if)#',
        verification_command = 'show interface <interface_id> brief',
        rollback_command = E'configure terminal\ninterface <interface_id>\n no vlan access\n exit\nend\nwrite memory'
    WHERE title_vi ILIKE '%Gán Access Port vào VLAN (Aruba AOS-CX)%';

    -- 47. ARUBA AOS-CX: Static Route
    UPDATE commands SET
        full_syntax = E'configure terminal\nip route <dst_network>/<prefix> <next_hop_ip>\nend\nwrite memory',
        prompt_mode = 'switch(config)#',
        verification_command = 'show ip route static',
        rollback_command = E'configure terminal\nno ip route <dst_network>/<prefix> <next_hop_ip>\nend\nwrite memory'
    WHERE title_vi ILIKE '%Thêm Static Route trên Aruba AOS-CX%';

END $$;
