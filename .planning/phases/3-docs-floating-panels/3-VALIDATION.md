# Tiêu chí Xác thực (Validation) - Phase 3: Docs Floating Panels

## 1. Tiêu chí Chấp nhận (Acceptance Criteria)
Dựa trên các mục tiêu "must_haves" của dự án:
- [ ] **Giao diện không viền (No-line rule):** Người dùng có thể thấy danh sách thư mục (Primary Panel) mà không có bất kỳ viền phân cách cứng nào (không dùng border 1px chia cột).
- [ ] **Hiệu ứng trượt mượt mà:** Khi người dùng click vào một thư mục, danh sách tài liệu (Secondary Panel - CascadingNav) sẽ trượt ra mượt mà từ bên phải.
- [ ] **Trải nghiệm Mobile:** Trên màn hình di động (< 768px), panel trượt ra sẽ che khuất toàn bộ màn hình và có nút "← Trở lại" để đóng.
- [ ] **Đóng Panel tự động:** Nhấn phím `Esc` trên bàn phím hoặc click ra ngoài khu vực panel sẽ tự động đóng panel tài liệu.
- [ ] **Trạng thái trống (Empty State):** Các thư mục không có tài liệu sẽ hiển thị icon trạng thái trống lớn và mờ nhạt kèm dòng chữ "Thư mục trống" thay vì một màn hình trắng tinh.
- [ ] **Thiết kế Glassmorphism:** Giao diện của Secondary Panel áp dụng hiệu ứng kính mờ (backdrop-blur, nền trong suốt) và đổ bóng nổi (ambient shadow) theo đúng Design System "The Digital Atrium".

## 2. Các bước Kiểm thử Thủ công (Manual Testing Steps)
Để xác minh các chức năng UI/UX không thể kiểm tra tự động:
1. **Kiểm tra UI Mặc định:** 
   - Truy cập vào route `/docs`.
   - Quan sát panel thư mục bên trái (Primary Panel). Xác nhận không có viền đen/xám cứng phân cách giữa các khu vực.
2. **Kiểm tra Secondary Panel & Glassmorphism:**
   - Click vào một thư mục bất kỳ.
   - Xác nhận `CascadingNav` trượt từ phải sang một cách mượt mà.
   - Xác nhận nền của panel có hiệu ứng kính mờ (Glassmorphism).
3. **Kiểm tra Responsive (Mobile):**
   - Thu nhỏ trình duyệt xuống dưới 768px (hoặc dùng DevTools chuyển sang chế độ Mobile).
   - Click mở một thư mục. 
   - Xác nhận Secondary Panel hiển thị full màn hình, che lấp Primary Panel.
   - Click nút "← Trở lại" và xác nhận panel đóng lại, quay về Primary Panel.
4. **Kiểm tra Tương tác Đóng (Close Interactions):**
   - Mở Secondary Panel. Nhấn phím `Esc`. Xác nhận panel đóng lại.
   - Mở lại Secondary Panel. Click chuột vào vùng trống bên ngoài panel. Xác nhận panel đóng lại.
5. **Kiểm tra Empty State:**
   - Tạo hoặc click vào một thư mục không có tài liệu.
   - Xác nhận xuất hiện giao diện Empty State (icon thư mục lớn, mờ và text "Thư mục trống").

## 3. Tuân thủ Quy tắc Nyquist (Nyquist Compliance Checks)
Kiểm tra tính tự động hóa của các bước xác thực trong kế hoạch:
- [x] **Task 1 (Cấu hình Tailwind & Hooks):** Lệnh `<automated>` sử dụng `npx tailwindcss -i ./src/index.css -o ./src/output.css --dry-run` để đảm bảo config Tailwind biên dịch thành công mà không lỗi.
- [x] **Task 2 (CascadingNav Component):** Lệnh `<automated>` sử dụng `npm run build` để đảm bảo component mới (Secondary Panel) không gây lỗi build React/Vite.
- [x] **Task 3 (Tích hợp Docs.jsx):** Lệnh `<automated>` sử dụng `npm run build` để xác nhận toàn bộ luồng tích hợp UI component không vi phạm cú pháp hoặc gây lỗi ứng dụng.
- [x] Đảm bảo tất cả các thẻ `<verify>` trong file `3-PLAN.md` đều có chứa phần tử `<automated>` với một lệnh kiểm tra có thể thực thi nhanh chóng dưới 60 giây.
