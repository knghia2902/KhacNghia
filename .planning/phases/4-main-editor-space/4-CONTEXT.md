# Phase 4: Main Editor Space

## Design & Architecture Decisions

### 1. Container Styling — "Ghost Panel"
- Chuyển Editor container từ `bg-white/70` sang **gần trong suốt**: `bg-white/30 backdrop-blur-xl`.
- Loại bỏ border cứng (`border-white/60`) → thay bằng `border border-white/20` hoặc bỏ hẳn border.
- Giữ lại **ambient shadow mềm** duy nhất: `shadow-[0_8px_60px_-15px_rgba(0,0,0,0.08)]`.
- Bo góc giữ `rounded-[1.5rem]` để đồng bộ với Panel 1 và Panel 2 từ Phase 3.
- Mục tiêu: Nội dung editor "nổi" trên canvas dot-grid, không bị nhốt trong hộp cứng.

### 2. Toolbar Behavior — Fixed Top Bar "Atrium hóa"
- Giữ nguyên thanh top bar cố định nhưng **làm mờ Atrium style**: `bg-white/10 backdrop-blur-md border-b border-white/10`.
- Các nút (Save, Cancel, Export, Focus Mode) giữ dạng icon pill nhỏ gọn, glassmorphism consistent.
- **View mode (không edit):** Thanh bar tự thu gọn (giảm chiều cao xuống `h-10` hoặc giảm opacity), trả không gian cho nội dung.
- **Edit mode:** Bar hiện rõ đầy đủ với Save/Cancel, chiều cao chuẩn `h-16`.

### 3. Document Open Transition — Subtle Scale + Fade
- Khi chuyển tài liệu: Nội dung editor thực hiện animation **fadeIn + scale(0.98 → 1.0)** trong ~300ms.
- Title (`h1`) có animation staggered: hiện trước nội dung ~100ms, tạo cảm giác phân tầng Premium.
- Giữ hiệu ứng skeleton loading (animate-pulse) đã có khi content chưa tải xong từ Supabase.
- Không dùng hiệu ứng bay-vào phức tạp để giữ hiệu năng trên mobile.

## Code Context & Guidelines
- **File Focus:** `src/pages/Docs.jsx` — Khu vực `<section>` (Main Content Area) từ dòng ~2056 trở đi.
- **Phụ thuộc Phase 3:** Editor nằm bên phải hệ thống Cascading Panels. Khi Panel 2 mở/đóng, Editor tự co giãn (flex-1). Styling của Phase 4 phải tương thích với cơ chế push-content từ Phase 3.
- **Tailwind classes chuẩn Atrium:** `backdrop-blur-xl`, `bg-white/30`, `rounded-[1.5rem]`, `shadow-[0_8px_60px_-15px_rgba(0,0,0,0.08)]`, `transition-all duration-300 ease-out`.
