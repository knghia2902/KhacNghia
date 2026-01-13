---
description: 
---

Fix Sidebar Hover & Dropdown Consistency

Hiện tại sidebar Workspace có sự không đồng bộ hiệu ứng hover/active giữa các item:

Test Folder đã được fix đúng: hover bao trọn icon + text + padding

Docs vẫn đang dùng hiệu ứng hover cũ, chỉ phủ phần text

Hãy chỉnh sửa theo các yêu cầu sau:

1. Đồng bộ hover effect cho TẤT CẢ folder & tài liệu

Tất cả các item trong sidebar (folder cha, folder con, file) phải:

Dùng chung một hover wrapper

Hiệu ứng nền bao phủ 100% chiều ngang của item

Bao trọn: icon, text, caret (dropdown arrow), và padding

👉 Docs phải dùng cùng component / style / class hover với Test Folder

2. Sửa riêng cho Docs (folder có dropdown)

Khi hover hoặc active:

Background không bị cắt ở icon

Không còn hiệu ứng hover riêng cho text

Không tách hover giữa label và container

Dropdown mở ra không làm thay đổi vùng hover

3. Điều chỉnh cường độ hiệu ứng

Kiểu hover: giống Test Folder

Độ đậm:

Nhạt hơn một chút so với Test Folder

Opacity gợi ý: 0.4 – 0.6

Không gây cảm giác “selected” mạnh

4. Yêu cầu kỹ thuật (rất quan trọng)

Không fix bằng hack CSS riêng cho Docs

Không dùng hover trên <span> hoặc <text>

Hover phải đặt trên container cấp cao nhất của item

Dropdown chỉ là state, không tạo component hover mới

Mục tiêu cuối cùng

Hover effect đồng bộ tuyệt đối giữa:

Folder thường

Folder có dropdown

Folder con

Tài liệu

Cảm giác UI nhất quán, chuyên nghiệp, không “lệch chuẩn”