# Khắc phục kết nối DB & Tối ưu hóa Web

## What This Is

Dự án này tập trung vào việc khắc phục sự cố kết nối cơ sở dữ liệu Supabase bị chậm (đặc biệt trên trang Docs khi triển khai trên Vercel), đồng thời thực hiện các công việc cấu trúc lại, tối ưu hóa và nâng cấp tổng thể hiệu năng cho ứng dụng.

## Core Value

Đảm bảo ứng dụng hoạt động mượt mà, phản hồi nhanh chóng và mang lại trải nghiệm người dùng tối ưu nhất trên môi trường production. Ưu tiên hàng đầu là tốc độ tải và độ ổn định của dữ liệu.

## Requirements

### Validated

- ✓ Ứng dụng React/Vite đã hoàn thiện với Supabase backend
- ✓ Chức năng quản lý Docs và thư mục cơ bản đã hoạt động
- ✓ Hệ thống deploy qua Vercel đã được thiết lập

### Active

- [ ] Phân tích và khắc phục gốc rễ tình trạng gọi DB chậm khi xem Docs trên Vercel
- [ ] Tối ưu hóa các truy vấn Supabase (cân nhắc lazy loading, indexing, caching)
- [ ] Tối ưu hóa hiệu năng frontend của trang web (cải thiện kích thước file `Docs.jsx` bị quá tải, áp dụng code-splitting)
- [ ] Nâng cấp các chức năng của ứng dụng theo hướng thân thiện và mượt mà hơn

### Out of Scope

- Bỏ qua việc đập đi xây lại bằng framework/ngôn ngữ mới (tiếp tục bám sát React/Vite/JavaScript gốc).
- Bỏ qua việc thay đổi các dịch vụ database cốt lõi (vẫn dùng Supabase).

## Context

- Ứng dụng sử dụng React + Vite, giao diện dựa trên TailwindCSS. Không sử dụng TypeScript hay backend riêng.
- Vấn đề nghẽn cổ chai: Thời gian phản hồi DB qua Supabase client trên trang `Docs` hiện rất chậm ở môi trường Vercel. 
- Technical debt: Một số trang như `Docs.jsx` (hơn 100KB) hoặc `Images.jsx` chiếm dung lượng quá khổ và gom quá nhiều logic, có thể làm UI block/loading chậm.
- Không có test framework hiện hành. 

## Constraints

- **Tech Stack**: Bắt buộc giữ nguyên React, Supabase, Tailwind.
- **Production**: Mọi giải pháp tối ưu phải tương thích tốt với môi trường Vercel và Supabase cloud.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Ưu tiên hiệu năng trước tính năng mới | Vấn đề kết nối đang phá vỡ UX | — Pending |

---
*Last updated: April 2026 after initialization*
