---
phase: 3-docs-floating-panels
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/CascadingNav.jsx
  - src/pages/Docs.jsx
autonomous: true
gap_closure: true
requirements: [DOCS-UI-01]
must_haves:
  truths:
    - "Người dùng có thể click chọn tài liệu trong CascadingNav để xem nội dung"
    - "Người dùng có thể mở context menu cho từng tài liệu (chuột phải / nút ba chấm)"
    - "Tài liệu đang chọn được highlight (active state) trong danh sách"
    - "Thanh tìm kiếm hoạt động và lọc tài liệu trực tiếp"
    - "Nút 'Tài liệu mới' gọi đúng hàm tạo ghi chú mới"
  artifacts:
    - path: "src/components/layout/CascadingNav.jsx"
      provides: "Component Panel hiển thị và tương tác với tài liệu"
    - path: "src/pages/Docs.jsx"
      provides: "Quản lý state và truyền props xử lý sự kiện"
  key_links:
    - from: "src/pages/Docs.jsx"
      to: "src/components/layout/CascadingNav.jsx"
      via: "truyền onDocClick, activeDocId, onContextMenu, searchQuery, setSearchQuery, onAddNote"
---

<objective>
Khắc phục các lỗ hổng logic (gaps) trong `CascadingNav.jsx` đã phát hiện ở Phase 3. Khôi phục lại toàn bộ khả năng tương tác với danh sách tài liệu (chọn, tìm kiếm, context menu, tạo mới) mà không làm hỏng giao diện Glassmorphism mới.

Purpose: Đảm bảo người dùng có thể thực sự thao tác với tài liệu thay vì chỉ xem danh sách tĩnh.
Output: `CascadingNav.jsx` được kết nối đầy đủ các sự kiện với `Docs.jsx`.
</objective>

<execution_context>
@C:/Users/O5A00001315/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/3-docs-floating-panels/3-VERIFICATION.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Cập nhật CascadingNav.jsx để nhận và xử lý props tương tác</name>
  <files>src/components/layout/CascadingNav.jsx</files>
  <action>
    - Cập nhật tham số nhận vào component để bao gồm: `searchQuery`, `setSearchQuery`, `activeDocId`, `onDocClick`, `onContextMenu`, `onAddNote`.
    - Thêm một thanh tìm kiếm (input) ngay dưới Header Desktop và Mobile:
      + Giá trị là `searchQuery`, sự kiện `onChange` gọi `setSearchQuery(e.target.value)`.
      + Giao diện input: nền kính (`bg-white/10` hoặc tương tự), border mờ, icon kính lúp.
    - Cập nhật thẻ bao bọc mỗi tài liệu (item):
      + Thêm sự kiện `onClick={() => onDocClick(item.id)}`.
      + Thêm sự kiện `onContextMenu={(e) => onContextMenu(e, item.id, 'doc')}`.
      + Cập nhật class CSS để highlight tài liệu đang chọn (nếu `item.id === activeDocId`, thêm màu nền `bg-atrium-primary/10` hoặc `ring-1 ring-primary/30`).
    - Cập nhật nút "Tài liệu mới":
      + Thêm `onClick={onAddNote}`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>CascadingNav.jsx sử dụng đầy đủ các props và giao diện hiển thị đúng trạng thái active, thanh tìm kiếm.</done>
</task>

<task type="auto">
  <name>Task 2: Cập nhật Docs.jsx để truyền hàm onAddNote</name>
  <files>src/pages/Docs.jsx</files>
  <action>
    - Tìm đoạn render `<CascadingNav>`.
    - Component này đã được truyền phần lớn các props (`searchQuery`, `setSearchQuery`, `activeDocId`, `onDocClick`, `onContextMenu`).
    - Bổ sung prop `onAddNote={() => setIsNoteModalOpen(true)}` để nút "Tài liệu mới" trong `CascadingNav` hoạt động đúng luồng tạo ghi chú hiện tại của trang.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Docs.jsx truyền đủ prop onAddNote xuống CascadingNav.</done>
</task>

</tasks>

<verification>
- Mở danh sách tài liệu, thấy thanh tìm kiếm và gõ thử.
- Click vào tài liệu, nội dung hiển thị bên Main Content và item có màu highlight.
- Chuột phải vào tài liệu trong danh sách, Context Menu hiện ra.
- Nhấn nút "Tài liệu mới" ở dưới cùng danh sách, Modal tạo note hiện ra.
</verification>

<success_criteria>
- Khắc phục hoàn toàn 5 missing logics được báo cáo trong VERIFICATION.md.
- Không làm vỡ layout Cascading Panels hiện có.
</success_criteria>