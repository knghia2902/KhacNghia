# Roadmap

## Phase 1: Tối ưu hoá Data Fetching & Supabase
- Triển khai Lazy Loading và chọn lọc trường dữ liệu (không select all).
- Ngăn chặn các vòng lặp request hoặc N+1 Queries trong components.

## Phase 2: Refactor UI Components (Code-Splitting)
- Chia nhỏ `Docs.jsx` và các files lớn khác sử dụng `React.lazy()` và `Suspense`.
- Implement Skeleton Loaders để che giấu độ trễ mạng phía client.

## Phase 3: Profiling & Database Indexing
- Cấu hình PostgreSQL Indexes trên các bảng cấu trúc hệ thống nếu cần.
- Kiểm thử và đo lường sự cải thiện qua Vercel.
