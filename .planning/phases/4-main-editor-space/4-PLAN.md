# Phase 4: Main Editor Space — Atrium Refactor

## Objective
Refactor khu vực soạn thảo chính (Main Editor) sang phong cách "Digital Atrium": container gần trong suốt (Ghost Panel), toolbar mờ kính tự co giãn theo mode, và hiệu ứng chuyển tài liệu Premium (Scale + Fade).

## Context
Tham khảo file định hướng: `.planning/phases/4-CONTEXT.md`

## Execution Steps

### 1. Ghost Panel — Refactor Editor Container
- **Target File:** `src/pages/Docs.jsx`
- **Vị trí:** Tìm thẻ `<section>` (~dòng 2056) có class:
  ```
  bg-white/70 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_12px_40px_-5px_rgba(0,0,0,0.08)] border border-white/60
  ```
- **Thay đổi class thành:**
  ```
  bg-white/30 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_60px_-15px_rgba(0,0,0,0.08)] border border-white/20
  ```
- Giữ nguyên `flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-500`.
- Giữ nguyên logic `isFocusMode` (max-w-4xl mx-auto shadow-2xl khi focus).

### 2. Atrium Toolbar — View Mode vs Edit Mode
- **Vị trí:** Tìm thẻ `<div>` header bar (~dòng 2065) có class:
  ```
  h-16 px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md z-10
  ```
- **View Mode (không edit):** Thay styling thành:
  ```
  h-10 px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/10 backdrop-blur-md z-10 transition-all duration-300
  ```
  Thu gọn chiều cao xuống `h-10`, padding nhỏ hơn `px-6`, nền hơi đậm hơn chút `bg-white/10`.
- **Edit Mode (đang edit):** Giữ styling đầy đủ:
  ```
  h-16 px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/15 backdrop-blur-lg z-10 transition-all duration-300
  ```
  Chiều cao đầy đủ `h-16`, backdrop mạnh hơn `backdrop-blur-lg`.
- **Implementation:** Dùng conditional class dựa trên biến `isEditing`:
  ```jsx
  className={`... ${isEditing ? 'h-16 px-8 bg-white/15 backdrop-blur-lg' : 'h-10 px-6 bg-white/10 backdrop-blur-md'} transition-all duration-300`}
  ```

### 3. Document Open Transition — Scale + Fade
- **Vị trí:** Tìm các `div` chứa content, cụ thể:
  - View mode content wrapper (~dòng 2162): có class `animate-[fadeIn_0.3s_ease-out]`
  - Edit mode content wrapper (~dòng 2142): có class `animate-[fadeIn_0.2s_ease-out]`
- **Thêm keyframe mới vào `<style>` block** (hoặc file CSS toàn cục `index.css`):
  ```css
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes titleSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```
- **Thay thế animation class:**
  - Content wrapper: `animate-[fadeIn_0.3s_ease-out]` → `animate-[scaleIn_0.3s_ease-out]`
  - Edit wrapper: `animate-[fadeIn_0.2s_ease-out]` → `animate-[scaleIn_0.25s_ease-out]`
- **Title stagger:** Tìm thẻ `<h1>` hiển thị `activeDoc.title` (~dòng 2163) và thêm class:
  ```
  animate-[titleSlideIn_0.25s_ease-out]
  ```
  Điều này khiến title xuất hiện trước body content khoảng ~50ms, tạo cảm giác phân tầng.

### 4. Đồng bộ Empty State với Atrium Style
- **Vị trí:** Tìm đoạn JSX "Select a note to view..." (~dòng 2222-2225).
- **Refactor Empty State:** Thay thế text mặc định bằng giao diện Atrium:
  ```jsx
  <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/30">
    <span className="material-symbols-outlined text-7xl mb-4 opacity-20">edit_note</span>
    <p className="text-sm font-medium">Chọn tài liệu để bắt đầu</p>
    <p className="text-xs mt-1 opacity-50">hoặc tạo trang mới từ panel bên trái</p>
  </div>
  ```

## Verification Criteria
1. Mở trang `/docs` — Editor container giờ phải gần trong suốt, nhìn thấy dot-grid xuyên qua nền nhẹ.
2. Ở View mode — Thanh toolbar mỏng (`h-10`), nhẹ nhàng. Chuyển sang Edit mode — Toolbar tự giãn lên (`h-16`) mượt mà với transition.
3. Click chuyển giữa các tài liệu — Nội dung có hiệu ứng "lớn dần" (scale 0.98→1.0) thay vì chỉ fade đơn thuần. Title hiện trước body.
4. Khi không có tài liệu nào được chọn — Empty state hiển thị icon + text Atrium.
5. Focus Mode vẫn hoạt động bình thường (max-w-4xl + shadow lớn hơn).
