# Phase 1: Database Foundation & Auth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-18
**Phase:** 01-database-foundation-auth
**Areas discussed:** Seed Data, Command Categories, Data Structure, Migration Approach

---

## Seed Data

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ seed lookup data | 7 vendors + 4 device types + categories, lệnh thật nhập qua form/import ở Phase 3 | |
| Seed lookup + 5-10 lệnh mẫu mỗi hãng | Đủ để test search ở Phase 2, khoảng 50-70 lệnh tổng | ✓ |
| Seed lookup + full dataset lớn (100+ lệnh) | Tốn thời gian nhưng có data thật ngay | |

**User's choice:** Seed lookup + 5-10 lệnh mẫu mỗi hãng
**Notes:** Ưu tiên có đủ data để test search functionality ở Phase 2

## Command Categories

| Option | Description | Selected |
|--------|-------------|----------|
| Interface & Port | cấu hình port, speed, duplex, shutdown | ✓ |
| VLAN | tạo/xóa VLAN, trunk, access port | ✓ |
| Routing | static route, OSPF, BGP, RIP | ✓ |
| Switching | STP, EtherChannel, port-security | ✓ |
| Security & ACL | access-list, firewall rules, NAT | ✓ |
| System & Management | hostname, NTP, SNMP, logging, save config | ✓ |
| AAA & User Management | local user, RADIUS, TACACS+ | ✓ |
| Monitoring & Troubleshooting | show commands, ping, traceroute, debug | ✓ |

**User's choice:** Tất cả 8 categories
**Notes:** Bao phủ đầy đủ các lĩnh vực chức năng mạng

## Data Structure

| Option | Description | Selected |
|--------|-------------|----------|
| JSON columns trong bảng commands | Tham số, ví dụ, warnings lưu dạng JSONB. Linh hoạt, không cần nhiều bảng | ✓ |
| Tách bảng riêng | command_params, command_examples, command_warnings — chuẩn hóa hơn nhưng phức tạp JOIN | |

**User's choice:** JSON columns (JSONB)
**Notes:** Ưu tiên linh hoạt và đơn giản query

## Migration Approach

| Option | Description | Selected |
|--------|-------------|----------|
| File SQL migration trong repo | Version control, có thể replay, dễ review | ✓ |
| Chạy trực tiếp trên Supabase SQL Editor | Nhanh hơn nhưng không track được | |
| Supabase CLI migrations | Có tooling hỗ trợ nhưng cần setup thêm | |

**User's choice:** File SQL migration trong repo
**Notes:** Giữ trong version control để review và replay

## Agent's Discretion

- Search RPC function implementation details
- GIN index configuration
- RLS policy details
- JSONB validation constraints

## Deferred Ideas

None
