# Phase 2: Search UI & Command Display - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Xây dựng toàn bộ giao diện tra cứu lệnh mạng (Network Command Lookup UI) — tích hợp vào hệ thống hiện tại tại route `/tools/network-commands` (và card launcher trên `/tools`), thanh tìm kiếm thông minh Omnisearch (`Ctrl+K`), bộ lọc đa chiều (Vendor, Device Type, Category, Favorites), danh sách Command Card grid, và Right Sliding Drawer hiển thị chi tiết câu lệnh.

</domain>

<decisions>
## Implementation Decisions

### Navigation & Tool Integration
- **D-01:** Tạo card mặc định "Network Command Lookup" (Tra cứu lệnh mạng) trên trang `/tools`. Khi bấm "Launch" sẽ điều hướng tới trang con `/tools/network-commands`.
- **D-02:** Trang `/tools/network-commands` có nút quay lại (Back to Tools) và breadcrumbs điều hướng rõ ràng.

### Search & Filtering Experience
- **D-03:** Thanh tìm kiếm Omnisearch ở đầu trang hỗ trợ phím tắt `Ctrl+K` hoặc `/` để focus nhanh, có nút xóa nhanh (Clear).
- **D-04:** Gọi RPC `search_network_commands` với debounce ~200ms để tìm kiếm tức thì theo tiếng Việt có dấu/không dấu, cú pháp lệnh hoặc từ khóa.
- **D-05:** Bộ lọc đa chiều gồm:
  - Vendor chips (Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei) hiển thị kèm badge_color của từng hãng.
  - Device Type chips (Switch, Router, Firewall, AP/WLC).
  - Category selector/chips (8 danh mục chuẩn hóa).
  - Toggle "Yêu thích" (Favorites Only).

### Command Card Grid
- **D-06:** Hiển thị danh sách lệnh dạng Card Grid responsive (1 cột trên mobile, 2-3 cột trên desktop), hỗ trợ dark/light mode theo theme chung của ứng dụng.
- **D-07:** Mỗi thẻ lệnh hiển thị: Vendor badge, Device types, Title tiếng Việt, Syntax code block, mô tả ngắn, nút Quick Copy và nút Favorite Star.

### Command Detail View (Right Sheet / Drawer)
- **D-08:** Khi click vào card, mở Right Sliding Drawer (Sheet trượt từ bên phải) giúp giữ nguyên ngữ cảnh danh sách lệnh để dễ đối chiếu.
- **D-09:** Drawer hiển thị chi tiết:
  - Cú pháp đầy đủ (`full_syntax`) và chế độ dòng lệnh (`prompt_mode`).
  - Bảng tham số (`parameters` JSONB).
  - Các kịch bản & ví dụ thực tế (`examples` JSONB).
  - Cảnh báo an toàn (`warnings` JSONB & `is_destructive` badge đỏ).
  - Lệnh kiểm tra (`verification_command`) và lệnh hoàn tác (`rollback_command`).

### Utilities & User Actions
- **D-10:** Nút 1-Click Copy thông minh: Tự động loại bỏ các tiền tố prompt như `Switch(config)#`, `Router#`, `[Huawei]` để người dùng chỉ copy câu lệnh thực thi sạch. Kèm Toast feedback thông báo đã copy.
- **D-11:** Đánh dấu yêu thích (Favorites): Kết nối với bảng `command_favorites` trên Supabase cho người dùng đã đăng nhập.

### Agent's Discretion
- Chi tiết animation trượt của Drawer (Framer Motion hoặc CSS transition mượt mà).
- Thiết kế Loading Skeleton và Empty State khi không tìm thấy kết quả tìm kiếm.
- Chi tiết debounce hook (`useDebounce`) và state management của bộ lọc.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database & Backend
- `supabase/migrations/001_create_schema.sql` — Schema định nghĩa 7 bảng và quan hệ
- `supabase/migrations/002_search_rpc.sql` — Định nghĩa hàm `search_network_commands` và tham số đầu vào/đầu ra
- `supabase/migrations/003_seed_data.sql` — Dữ liệu mẫu Vendors, Device Types, Categories, Commands

### Frontend & Architecture
- `.planning/REQUIREMENTS.md` — Yêu cầu SRCH-01 đến SRCH-07 và UI-01 đến UI-06
- `src/lib/supabaseClient.js` — Supabase client instance
- `src/context/AuthContext.jsx` — Quản lý authentication session cho Favorites và RLS
- `src/pages/Tools.jsx` — Trang chủ `/tools` cần gắn card điều hướng
- `src/App.jsx` — Cấu hình routing ứng dụng

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabaseClient.js`: Client kết nối Supabase, gọi `supabase.rpc('search_network_commands', { ... })`
- `src/context/AuthContext.jsx`: Hook `useAuth()` lấy `user`, `isAuthenticated`
- `src/context/ThemeContext.jsx`: Hook `useTheme()` hỗ trợ dark/light mode
- Tailwind CSS v4 cấu hình sẵn các utility colors (`mint-soft`, `peach-soft`, dark classes)
- Google Material Symbols (`material-symbols-outlined`) sử dụng xuyên suốt app cho các icons

### Integration Points
- Thêm Route `/tools/network-commands` trong `src/App.jsx`.
- Cập nhật `src/pages/Tools.jsx` để thêm card mặc định cho Network Command Lookup Tool.
- Tạo component module mới tại `src/components/network-commands/` (SearchHeader, FilterBar, CommandCard, CommandDrawer, CommandDetail, etc.).

</code_context>

<specifics>
## Specific Ideas

- Giao diện tra cứu phong cách hiện đại, tối ưu cho kỹ sư mạng thao tác nhanh bằng bàn phím.
- Màu sắc badge vendor: Cisco (#005073), Fortinet (#EE3124), Juniper (#84BD00), Palo Alto (#FA582D), MikroTik (#222222), Aruba (#FF8300), Huawei (#CF0A2C).
- Cảnh báo lệnh hủy diệt (`is_destructive`): Badge màu đỏ cảnh báo đậm để kỹ sư không chạy nhầm trên thiết bị production.

</specifics>

<deferred>
## Deferred Ideas

- Form thêm lệnh mới qua UI và Import file CSV/JSON (Chuyển sang Phase 3: Data Import & Cross-Vendor Comparison).
- Ma trận so sánh lệnh chéo hãng theo Canonical Action (Chuyển sang Phase 3: Data Import & Cross-Vendor Comparison).

</deferred>

---

*Phase: 02-search-ui-command-display*
*Context gathered: 2026-08-18*
