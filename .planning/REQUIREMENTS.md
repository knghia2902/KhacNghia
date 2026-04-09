# Requirements

## Epic: Tối ưu hoá Component và Data Fetching
- [REQ-1] Chuyển đổi lệnh get dữ liệu Supabase trên `Docs.jsx` thành fetch chọn lọc (chỉ kéo `id, title, parentId`, không kéo trường nội dung quá lớn).
- [REQ-2] Bổ sung cơ chế Lazy Loading cho dữ liệu chi tiết: chỉ gọi nội dung `content` khi người dùng click vào document cụ thể.
- [REQ-3] Cải thiện Component `Docs.jsx`, thực hiện code-splitting (React.lazy) để giảm kích thước bundle load ban đầu.
- [REQ-4] Tích hợp Loading Skeletons/Indicators ở giao diện để che khuất độ trễ dữ liệu khi host trên Vercel.
- [REQ-5] Tối ưu hóa Database: Tạo Index trên PostgreSQL của Supabase (nếu cần) cho các node truy vấn chính (như `parentId`).
