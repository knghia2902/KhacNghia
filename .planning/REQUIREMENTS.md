# Requirements: Network Command Lookup Tool

## v1 Requirements

### Database & Search (DB)

- [ ] **DB-01**: Tạo bảng `vendors` chứa 7 hãng (Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei) với logo, slug, mô tả
- [ ] **DB-02**: Tạo bảng `device_types` chứa 4 loại thiết bị (Switch, Router, Firewall, AP/WLC)
- [ ] **DB-03**: Tạo bảng `command_categories` phân cấp theo nhóm chức năng (VLAN, Routing, Security, Interface, System, Monitoring, AAA)
- [ ] **DB-04**: Tạo bảng `canonical_actions` ánh xạ chức năng tương đương giữa các hãng (ví dụ: `vlan.create`, `route.static_add`)
- [ ] **DB-05**: Tạo bảng `commands` chứa đầy đủ: tên lệnh, cú pháp, mô tả tiếng Việt, ví dụ, tham số, lưu ý/cảnh báo, execution context/mode
- [ ] **DB-06**: Tạo bảng junction `command_device_types` cho quan hệ M:N giữa commands và device_types
- [ ] **DB-07**: Tạo hybrid search RPC function kết hợp full-text search (tsvector), trigram similarity (pg_trgm), và unaccent cho tiếng Việt
- [ ] **DB-08**: Tạo GIN indexes trên search_vector, command_syntax, và unaccent(description) để đảm bảo query <50ms
- [ ] **DB-09**: Cấu hình Row Level Security (RLS) yêu cầu đăng nhập mới truy cập được

### Import & Data (IMP)

- [ ] **IMP-01**: User có thể thêm lệnh mới qua form UI với validation đầy đủ (tên, cú pháp, mô tả, ví dụ, tham số, vendor, device type, category)
- [ ] **IMP-02**: User có thể import lệnh hàng loạt từ file CSV với preview validation trước khi insert
- [ ] **IMP-03**: User có thể import lệnh hàng loạt từ file JSON với schema validation (Zod)
- [ ] **IMP-04**: Import hiển thị bảng preview: dòng hợp lệ (xanh) vs lỗi (đỏ), cho phép sửa trước khi submit

### Search & Filter (SRCH)

- [ ] **SRCH-01**: User có thể tìm kiếm lệnh theo tên/cú pháp (ví dụ: gõ "show ip route" → hiện kết quả)
- [ ] **SRCH-02**: User có thể tìm kiếm theo chức năng tiếng Việt (ví dụ: "cấu hình VLAN" → hiện lệnh tương ứng của các hãng)
- [ ] **SRCH-03**: Tìm kiếm hỗ trợ không dấu tiếng Việt (ví dụ: "cau hinh" tìm được "cấu hình")
- [ ] **SRCH-04**: User có thể filter theo hãng (multi-select chips)
- [ ] **SRCH-05**: User có thể filter theo loại thiết bị (Switch/Router/Firewall/AP)
- [ ] **SRCH-06**: User có thể filter theo nhóm chức năng (category)
- [ ] **SRCH-07**: Kết quả search hiện real-time (debounced) với ranking theo relevance

### UI & Display (UI)

- [ ] **UI-01**: Trang tra cứu lệnh tại route `/tools` trong app hiện tại
- [ ] **UI-02**: Mỗi lệnh hiển thị dạng Command Card: tên lệnh, vendor badge, device type, cú pháp highlight, mô tả ngắn
- [ ] **UI-03**: Click vào command card mở chi tiết: cú pháp đầy đủ, mô tả, ví dụ, bảng tham số, lưu ý/cảnh báo, execution context
- [ ] **UI-04**: Nút 1-click copy lệnh (tự động loại bỏ prompt characters như `Router#`, `[edit]`)
- [ ] **UI-05**: Hiển thị badge cảnh báo cho lệnh nguy hiểm (destructive commands)
- [ ] **UI-06**: Hiển thị execution context/mode rõ ràng (ví dụ: "Global Config", "Interface Config", "Edit Mode")

### Cross-Vendor Comparison (CMP)

- [ ] **CMP-01**: User có thể xem so sánh lệnh tương đương giữa các hãng cho cùng chức năng (Cross-Vendor Matrix)
- [ ] **CMP-02**: Ma trận so sánh hiển thị cú pháp của mỗi hãng side-by-side, dựa trên canonical_actions

## v2 Requirements (Deferred)

- [ ] Command Palette (`Ctrl+K`) để tìm kiếm nhanh từ bất kỳ trang nào
- [ ] Bookmark/Favorite commands cho mỗi user
- [ ] Export dữ liệu lệnh ra CSV/JSON
- [ ] Cheat Sheet view tổng hợp theo chủ đề
- [ ] Interactive Snippet Generator (điền tham số vào template lệnh)
- [ ] Dark mode cho trang tra cứu
- [ ] CLI abbreviation resolution (ví dụ: `sh ip int br` → `show ip interface brief`)

## Out of Scope

- Kết nối SSH/Telnet/API trực tiếp vào thiết bị — chỉ tra cứu, không thực thi
- Tự động crawl/scrape lệnh từ tài liệu hãng — nhập thủ công hoặc import
- CLI simulator/emulator (Packet Tracer/GNS3) — không phải mục tiêu
- Đa ngôn ngữ i18n — chỉ tiếng Việt + CLI syntax tiếng Anh
- AI tự sinh lệnh — nguy cơ lệnh sai gây sự cố production

## Traceability

| REQ-ID | Phase | Plan | Status |
|--------|-------|------|--------|
| DB-01 | 1 — Database Foundation & Auth | — | Not started |
| DB-02 | 1 — Database Foundation & Auth | — | Not started |
| DB-03 | 1 — Database Foundation & Auth | — | Not started |
| DB-04 | 1 — Database Foundation & Auth | — | Not started |
| DB-05 | 1 — Database Foundation & Auth | — | Not started |
| DB-06 | 1 — Database Foundation & Auth | — | Not started |
| DB-07 | 1 — Database Foundation & Auth | — | Not started |
| DB-08 | 1 — Database Foundation & Auth | — | Not started |
| DB-09 | 1 — Database Foundation & Auth | — | Not started |
| SRCH-01 | 2 — Search UI & Command Display | — | Not started |
| SRCH-02 | 2 — Search UI & Command Display | — | Not started |
| SRCH-03 | 2 — Search UI & Command Display | — | Not started |
| SRCH-04 | 2 — Search UI & Command Display | — | Not started |
| SRCH-05 | 2 — Search UI & Command Display | — | Not started |
| SRCH-06 | 2 — Search UI & Command Display | — | Not started |
| SRCH-07 | 2 — Search UI & Command Display | — | Not started |
| UI-01 | 2 — Search UI & Command Display | — | Not started |
| UI-02 | 2 — Search UI & Command Display | — | Not started |
| UI-03 | 2 — Search UI & Command Display | — | Not started |
| UI-04 | 2 — Search UI & Command Display | — | Not started |
| UI-05 | 2 — Search UI & Command Display | — | Not started |
| UI-06 | 2 — Search UI & Command Display | — | Not started |
| IMP-01 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
| IMP-02 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
| IMP-03 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
| IMP-04 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
| CMP-01 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
| CMP-02 | 3 — Data Import & Cross-Vendor Comparison | — | Not started |
