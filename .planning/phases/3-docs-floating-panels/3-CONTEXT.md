# Phase 3: Docs Floating Panels (Cascading Layout)

## Design & Architecture Decisions

### 1. Panel Interaction & Collapse Behavior
- Chuyển đổi từ giao diện Split-pane thành mô hình **Cascading Panels (Miller Columns)**.
- Panel 1 (Primary) hiển thị danh sách thư mục. Khi người dùng click chọn thư mục, Panel 2 (Secondary) chứa danh sách tài liệu mới trượt/nổi ra ngang cạnh phải.
- **Collapse/Dismiss:** Click ra vùng trống bên ngoài hoặc bấm phím `Esc` sẽ tự động thu hồi (collapse) Panel 2 một cách mượt mà.
- **Empty States:** Nếu chọn một thư mục trống, Panel 2 vẫn trượt ra nhằm xác nhận tương tác, nhưng sẽ hiển thị trạng thái "Empty State" mang đậm tính chất visual (icon tủ tài liệu mờ nhạt + thông báo "Trống").

### 2. Document List Density (Secondary Panel)
- **Mặc định:** Hiển thị dưới dạng list dọc minimalist, mỗi dòng chỉ có Icon tài liệu + Tiêu đề giúp không gian thoáng đãng.
- **Hover State:** Khi di chuột (hover) vào list item, dòng đó sẽ hơi nổi lên tạo thành một thẻ kính (glass card effect) và làm nổi bật thêm các metadata phụ (ví dụ: ngày chỉnh sửa, thẻ tags) ở khu vực lề phải.

### 3. Mobile & Responsive Strategy
- **Slide Navigation:** Trên khung nhìn nhỏ (Mobile), thay vì chia đôi dọc hoặc bottom sheet, hệ thống sẽ dùng cơ chế trượt ngang nguyên màn hình.
- Panel 1 chiếm trọn bề ngang mặc định. Khi click Folder, Panel 2 sẽ đẩy (slide) từ phải qua lấp đầy màn hình.
- Phía trên cùng của Panel 2 trên Mobile phải có một nút bấm `← Trở lại (Back)` để quay về màn hình Folder.

## Code Context & Guidelines
- **File Focus:** `src/pages/Docs.jsx` và có thể tạo component mới riêng rẽ cho cấu trúc Nav nếu quá tải.
- **State variables:** Tái sử dụng logic của `activeFolderId`, `folders`, và `docs` hiện có để render data liên kết giữa panel 1 và 2.
- **Style/Animation:** Sử dụng các tiện ích của Tailwind phù hợp với "Atrium": `backdrop-blur-xl`, `bg-white/40`, shadow elevation. Dùng class `transition-transform duration-300 ease-out` để mượt mà hóa thao tác trượt pop-out.
