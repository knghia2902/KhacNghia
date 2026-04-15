---
phase: 3-docs-floating-panels
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - tailwind.config.js
  - src/hooks/useOnClickOutside.js
  - src/components/layout/CascadingNav.jsx
  - src/pages/Docs.jsx
autonomous: true
requirements: [DOCS-UI-01]
must_haves:
  truths:
    - "Người dùng có thể thấy danh sách thư mục (Primary Panel) không có viền phân cách"
    - "Người dùng click vào thư mục, danh sách tài liệu (Secondary Panel) sẽ trượt ra mượt mà từ bên phải"
    - "Trên mobile, panel trượt ra che khuất màn hình và có nút Trở lại"
    - "Nhấn Esc hoặc click ra ngoài sẽ tự động đóng panel tài liệu"
    - "Thư mục trống hiển thị icon trạng thái trống (Empty State) lớn thay vì màn hình trắng"
    - "Giao diện áp dụng hiệu ứng kính (Glassmorphism) và tuân thủ quy tắc No-line"
  artifacts:
    - path: "tailwind.config.js"
      provides: "Màu sắc, font chữ và shadow theo Design System The Digital Atrium"
    - path: "src/hooks/useOnClickOutside.js"
      provides: "Hook xử lý sự kiện click ra ngoài để đóng panel"
    - path: "src/components/layout/CascadingNav.jsx"
      provides: "Component Panel trượt phụ (Secondary Panel) chứa danh sách tài liệu"
    - path: "src/pages/Docs.jsx"
      provides: "Trang tài liệu chính, quản lý state và hiển thị Primary Panel"
  key_links:
    - from: "src/pages/Docs.jsx"
      to: "src/components/layout/CascadingNav.jsx"
      via: "import và truyền props (isOpen, onClose, items)"
---

<objective>
Chuyển đổi giao diện Sidebar trang Docs từ Split-pane sang mô hình Cascading Panels (Miller Columns), tuân thủ nghiêm ngặt Design System "The Digital Atrium" với hiệu ứng Glassmorphism và quy tắc No-line.

Purpose: Mở rộng không gian hiển thị, tạo cảm giác không gian 3D trong UI, nâng cấp trải nghiệm người dùng với các hiệu ứng nổi và typography chuyên nghiệp.
Output: Hệ thống điều hướng trượt mượt mà trên cả Desktop và Mobile, cấu hình Tailwind được cập nhật.
</objective>

<execution_context>
@C:/Users/O5A00001315/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/3-docs-floating-panels/3-CONTEXT.md
@.planning/phases/3-docs-floating-panels/3-RESEARCH.md
@stitch/cyan_logic/DESIGN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Cấu hình Design System & Tiện ích (Tailwind & Hooks)</name>
  <files>tailwind.config.js, src/hooks/useOnClickOutside.js</files>
  <action>
    - Mở `tailwind.config.js`, thêm các màu mới vào `theme.extend.colors`: `atrium-primary` (#006a65), `atrium-primary-container` (#4ecdc4), `atrium-surface` (#f2fcf8), `atrium-surface-low` (#ecf6f2), `atrium-surface-lowest` (#ffffff), `atrium-on-surface` (#141d1b), `atrium-on-variant` (#3d4948).
    - Thêm font `Plus Jakarta Sans` (cho display/headline) và `Inter` (cho body/label) vào `theme.extend.fontFamily`.
    - Thêm `ambient` shadow (`0 12px 60px rgba(20, 29, 27, 0.06)`) vào `boxShadow`.
    - Tạo file `src/hooks/useOnClickOutside.js`, viết custom hook nhận vào `ref` và `handler` để xử lý sự kiện `mousedown` (click ra ngoài vùng ref) và `touchstart`.
  </action>
  <verify>
    <automated>npx tailwindcss -i ./src/index.css -o ./src/output.css --dry-run</automated>
  </verify>
  <done>Tailwind chứa đủ màu/font mới, Hook useOnClickOutside được tạo thành công và sẵn sàng sử dụng.</done>
</task>

<task type="auto">
  <name>Task 2: Xây dựng CascadingNav Component (Secondary Panel)</name>
  <files>src/components/layout/CascadingNav.jsx</files>
  <action>
    - Tạo component `CascadingNav` nhận props: `isOpen`, `onClose`, `items`, `folderName`.
    - Sử dụng `useOnClickOutside` và bắt sự kiện phím `Escape` để gọi `onClose`.
    - Giao diện container: Dùng `fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-out`. Áp dụng Glassmorphism: `bg-atrium-primary-container/15 backdrop-blur-[20px] shadow-ambient`. Nếu `isOpen` thì `translate-x-0`, ngược lại `translate-x-full`.
    - Mobile Strategy: Đặt độ rộng `w-full md:w-[400px]`. Phía trên cùng thêm header chỉ hiện ở mobile (`md:hidden`) với nút "← Trở lại" gọi `onClose`.
    - Empty State: Nếu `items.length === 0`, render icon thư mục khổng lồ mờ nhạt (opacity 30-40%) và text "Thư mục trống" (sử dụng font Inter `body-md`).
    - Document List: List dọc không có viền (tuân thủ No-line rule). Khi hover: thẻ kính nổi lên (`hover:bg-atrium-surface-lowest hover:shadow-ambient transition-all`), hiển thị metadata ngày chỉnh sửa ở góc phải. Tiêu đề tài liệu dùng Inter `body-md`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Component trượt CascadingNav hoàn thiện với hiệu ứng kính, danh sách hover và trạng thái trống (Empty State).</done>
</task>

<task type="auto">
  <name>Task 3: Refactor Docs.jsx và Tích hợp Cascading Layout</name>
  <files>src/pages/Docs.jsx</files>
  <action>
    - Thêm state `isSecondaryPanelOpen` (boolean).
    - Khi `handleFolderClick` được gọi, set `isSecondaryPanelOpen(true)`.
    - Layout chính: Xóa bỏ các `border` 1px chia cột cũ (quy tắc No-line). Thay vào đó, dùng nền `bg-atrium-surface` cho phần tử cha, và `bg-atrium-surface-low` cho Primary Panel (Sidebar chứa thư mục).
    - Typography Scale: Cập nhật tiêu đề thư mục (nếu có) thành `font-display` (Plus Jakarta Sans). Các mục danh sách dùng `font-body` (Inter). Thẻ active dùng pill dọc `bg-atrium-primary` (4x24px) thay vì đổi màu nền cục bộ cứng nhắc.
    - Mobile Logic: Trên mobile (`< 768px`), nếu `isSecondaryPanelOpen` là true, thêm class `hidden md:flex` cho Primary Panel để nhường toàn bộ màn hình cho Secondary Panel.
    - Render `&lt;CascadingNav isOpen={isSecondaryPanelOpen} onClose={() =&gt; setIsSecondaryPanelOpen(false)} items={filteredDocs} /&gt;` ngay dưới thẻ `&lt;aside&gt;` hoặc container phù hợp.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Trang Docs không còn border chia cột, click thư mục mở panel trượt với hiệu ứng Glassmorphism. Mobile hoạt động đẩy ngang toàn màn hình.</done>
</task>

</tasks>

<verification>
- Truy cập /docs, kiểm tra panel thư mục bên trái (Primary Panel) không có viền đen/xám cứng.
- Click thư mục, CascadingNav trượt từ phải sang (Secondary Panel), có nền kính mờ (Glassmorphism).
- Giao diện Responsive trên Mobile hiển thị Secondary Panel full màn hình và có nút Back.
- Ấn Esc hoặc click vùng trống ngoài Secondary Panel sẽ đóng panel.
</verification>

<success_criteria>
- Luồng Cascading Panels hoạt động trơn tru không lỗi.
- Design System mới (Tonal layering, Glassmorphism, No-line rule, Typography Scale) được áp dụng hoàn toàn cho Navigation.
- Mobile Layout sử dụng Slide trượt ngang với trải nghiệm người dùng tự nhiên.
</success_criteria>

<output>
Sau khi hoàn thành, tạo `.planning/phases/3-docs-floating-panels/3-01-SUMMARY.md`
</output>