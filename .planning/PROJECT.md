# Network Command Lookup Tool

## What This Is

Một trang mới trong ứng dụng web hiện tại (React/Vite, route `/tools`), cho phép tra cứu nhanh các lệnh cấu hình thiết bị mạng (Switch, Router, Firewall, Access Point) của nhiều hãng khác nhau. Hỗ trợ tìm kiếm theo tên lệnh, chức năng, hãng, và so sánh lệnh tương đương giữa các hãng.

## Core Value

Tra cứu lệnh nhanh chóng và chính xác — kỹ sư mạng chỉ cần gõ chức năng cần làm, tool trả về đúng lệnh cần dùng cho đúng thiết bị đang thao tác.

## Requirements

### Validated

- ✓ Ứng dụng React/Vite đã hoạt động với Supabase backend — existing
- ✓ Hệ thống đăng nhập / xác thực đã có — existing
- ✓ Deploy trên Vercel đã thiết lập — existing
- ✓ Database schema, GIN indexes, search RPC & RLS trên Supabase PostgreSQL (Phase 1: Database Foundation & Auth)
- ✓ Seed data 7 vendors & 4 device types & 8 categories & 38+ CLI commands (Phase 1: Database Foundation & Auth)

### Active

- [ ] Trang tra cứu lệnh tại `/tools` với UI tìm kiếm, filter theo hãng và loại thiết bị
- [ ] Hỗ trợ các hãng: Cisco (IOS/IOS-XE/NX-OS), Fortinet (FortiOS), Juniper (Junos), Palo Alto (PAN-OS), MikroTik (RouterOS), Aruba/HPE, Huawei
- [ ] Hỗ trợ các loại thiết bị: Switch, Router, Firewall, Access Point / Wireless Controller
- [ ] Mỗi lệnh hiển thị: tên lệnh, mô tả, ví dụ, cú pháp đầy đủ, lưu ý/cảnh báo, tham số/options
- [ ] Tìm kiếm theo tên lệnh (full-text search)
- [ ] Tìm kiếm theo chức năng (ví dụ: "cấu hình VLAN" → hiện lệnh tương ứng)
- [ ] Filter theo hãng + loại thiết bị
- [ ] So sánh lệnh giữa các hãng (cùng chức năng, khác vendor)
- [ ] Form thêm lệnh mới (thêm lẻ qua UI)
- [ ] Import lệnh hàng loạt từ file CSV/JSON
- [ ] Lưu dữ liệu lệnh trên Supabase (PostgreSQL) để search mạnh
- [ ] Yêu cầu đăng nhập mới truy cập được
- [ ] Mô tả lệnh bằng tiếng Việt

### Out of Scope

- Chạy lệnh trực tiếp trên thiết bị (chỉ tra cứu, không SSH/API vào thiết bị)
- Tự động crawl lệnh từ tài liệu hãng (nhập thủ công hoặc import)
- Hỗ trợ đa ngôn ngữ (chỉ tiếng Việt)

## Context

- App hiện tại: React + Vite, TailwindCSS, Supabase backend, deploy Vercel
- Tool tra cứu lệnh sẽ là trang mới trong app, route `/tools`
- Database: Supabase PostgreSQL — dùng full-text search, filter, indexing cho performance
- Các hãng thiết bị: Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei
- Loại thiết bị: Switch, Router, Firewall, AP/WLC
- Cần auth: chỉ user đã đăng nhập mới truy cập được

## Constraints

- **Tech Stack**: Giữ nguyên React, Vite, TailwindCSS, Supabase
- **Routing**: Tích hợp vào app hiện tại (không phải app riêng)
- **Auth**: Dùng hệ thống auth hiện có
- **Language**: Mô tả lệnh bằng tiếng Việt

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lưu lệnh trên Supabase PostgreSQL | Full-text search mạnh, filter linh hoạt, đã có sẵn | ✓ Validated (Phase 1) |
| Tích hợp vào app hiện tại (/tools) | Không tạo app mới, dùng lại auth + infra | — Pending (Phase 2) |
| Hỗ trợ tất cả hãng ngay từ v1 | User cần tra cứu đa hãng ngay | ✓ Validated (Phase 1) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: August 2026 after initialization*
