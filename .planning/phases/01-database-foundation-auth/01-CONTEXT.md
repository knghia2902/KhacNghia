# Phase 1: Database Foundation & Auth - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Tạo toàn bộ PostgreSQL schema trên Supabase cho Network Command Lookup Tool — 6 tables (vendors, device_types, command_categories, canonical_actions, commands, command_device_types), hybrid search RPC function, GIN indexes, Row Level Security, và seed data. Không bao gồm UI frontend (Phase 2) hay import/form (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Seed Data
- **D-01:** Seed lookup data (7 vendors + 4 device types) VÀ 5-10 lệnh mẫu mỗi hãng (~50-70 lệnh tổng). Đủ để test search ở Phase 2.
- **D-02:** Lệnh seed bao gồm các lệnh phổ biến nhất của mỗi hãng, trải đều qua nhiều categories và device types.

### Command Categories (8 nhóm)
- **D-03:** Tạo sẵn 8 command categories:
  1. Interface & Port — cấu hình port, speed, duplex, shutdown
  2. VLAN — tạo/xóa VLAN, trunk, access port
  3. Routing — static route, OSPF, BGP, RIP
  4. Switching — STP, EtherChannel, port-security
  5. Security & ACL — access-list, firewall rules, NAT
  6. System & Management — hostname, NTP, SNMP, logging, save config
  7. AAA & User Management — local user, RADIUS, TACACS+
  8. Monitoring & Troubleshooting — show commands, ping, traceroute, debug

### Data Structure
- **D-04:** Lưu tham số (parameters), ví dụ (examples), cảnh báo (warnings) dạng JSONB columns trong bảng `commands`. Không tạo bảng riêng. Cấu trúc JSONB linh hoạt, query dễ dàng với Supabase, không cần nhiều JOIN.
- **D-05:** Bảng `commands` có các JSONB columns: `parameters` (array of {name, description, required, default}), `examples` (array of {description, code, output}), `warnings` (array of strings).

### Migration Approach
- **D-06:** Tạo file SQL migration trong repo (ví dụ: `supabase/migrations/001_create_schema.sql`). Version control, có thể replay, dễ review. Không dùng Supabase CLI migrations, chạy SQL trực tiếp trên Supabase SQL Editor từ file migration.

### Agent's Discretion
- Search RPC function implementation details (pg_trgm weights, ranking formula)
- Exact GIN index configuration
- RLS policy details (authenticated-only read access)
- JSONB validation constraints

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research
- `.planning/research/ARCHITECTURE.md` — Database schema design, table relationships, search RPC
- `.planning/research/STACK.md` — PostgreSQL search implementation (pg_trgm, unaccent, tsvector)
- `.planning/research/PITFALLS.md` — Vietnamese text search challenges, CLI hierarchy, destructive commands

### Project
- `.planning/PROJECT.md` — Core value, constraints, active requirements
- `.planning/REQUIREMENTS.md` — DB-01 through DB-09 requirement details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabaseClient.js`: Supabase client đã cấu hình, dùng `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- `src/context/AuthContext.jsx`: Auth context sử dụng `supabase.auth` — RLS sẽ tự động hoạt động với session token

### Established Patterns
- Supabase queries dùng trực tiếp `supabase.from('table').select()` — không wrapper layer
- Auth state qua Context API (`useAuth()`)
- Không dùng TypeScript — tất cả JavaScript ES Modules

### Integration Points
- RLS policies cần hoạt động với existing auth flow (supabase.auth session)
- Schema mới hoàn toàn độc lập — không conflict với tables hiện có
- `src/pages/Tools.jsx` (411 dòng) đã tồn tại — Phase 2 sẽ tích hợp UI vào đây

</code_context>

<specifics>
## Specific Ideas

- 7 vendors: Cisco (IOS/IOS-XE/NX-OS), Fortinet (FortiOS), Juniper (Junos), Palo Alto (PAN-OS), MikroTik (RouterOS), Aruba/HPE, Huawei
- 4 device types: Switch, Router, Firewall, AP/WLC
- Mô tả lệnh hoàn toàn bằng tiếng Việt, command syntax bằng tiếng Anh
- Mỗi lệnh cần có: execution_context (ví dụ: "Global Config", "Interface Config", "Edit Mode")
- `canonical_actions` table dùng dot notation slugs: `vlan.create`, `route.static_add`, `interface.shutdown`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-database-foundation-auth*
*Context gathered: 2026-08-18*
