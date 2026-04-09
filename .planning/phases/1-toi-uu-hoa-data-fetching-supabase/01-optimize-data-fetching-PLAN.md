---
wave: 1
depends_on: []
files_modified: ["src/pages/Docs.jsx"]
autonomous: false
---

# Plan 1: Tối ưu dữ liệu hiển thị Docs

<objective>
Tối ưu hóa query lấy dữ liệu tài liệu trên trang Docs. Bỏ việc tải toàn bộ nội dung tài liệu (`content`) để tiết kiệm băng thông và tăng tốc render tree list, thay bằng Lazy Loading khi click vào chi tiết. Chống slow connection trên Vercel.
</objective>

<requirements>
- [REQ-1] Chuyển đổi lệnh get dữ liệu Supabase trên `Docs.jsx` thành fetch chọn lọc (chỉ kéo `id, title, parentId`, không kéo trường nội dung quá lớn).
- [REQ-2] Bổ sung cơ chế Lazy Loading cho dữ liệu chi tiết: chỉ gọi nội dung `content` khi người dùng click vào document cụ thể.
- [REQ-4] Tích hợp Loading Skeletons/Indicators ở giao diện để che khuất độ trễ dữ liệu khi host trên Vercel.
</requirements>

<must_haves>
- Lần load đầu tiên của trang `Docs.jsx` chỉ lấy siêu dữ liệu (metadata: id, title, parentId, icon, tags, date) và KHÔNG lấy `content` hay `attachments`.
- Khi user bấm vào 1 document, hiển thị UI Skeleton loading mượt mà.
- Gửi query Supabase thứ hai để lấy chính xác `content` của doc ID đó khi được chọn.
</must_haves>

<tasks>

<task>
  <description>Refactor Docs.jsx Supabase Data Fetching</description>
  <read_first>
    - src/pages/Docs.jsx
  </read_first>
  <action>
    Tiến hành refactor logic lấy dữ liệu (hook useEffect hoặc function load data) trong `src/pages/Docs.jsx`:
    1. Trong hàm fetch list docs ban đầu, thiết lập query Supabase: `.select('id, created_at, title, parentid, parentId, icon, date, tags, bg, is_locked, is_hidden, color')`. Chắc chắn KHÔNG BẤM `content` và `attachments`.
    2. Bổ sung state `[isDocLoading, setIsDocLoading] = useState(false)` để hiển thị UI chờ.
    3. Cập nhật hàm xử lý click chọn Doc (thường là set `activeDocId`): Thêm logic gọi async Supabase để lấy nội dung (`.select('content, attachments').eq('id', docId).single()`).
    4. Thêm UI placeholder/skeleton khi `isDocLoading` đang `true` trong viewport hiển thị chi tiết (RichTextEditor).
  </action>
  <acceptance_criteria>
    - File `src/pages/Docs.jsx` có Supabase truy vấn không chứa `content` khi load list.
    - File `src/pages/Docs.jsx` có gọi query lấy `content` tách biệt.
    - Component có render Skeleton hoặc ký hiệu Load khi `isDocLoading` là true.
  </acceptance_criteria>
</task>

</tasks>

<verification>
Thực hiện chạy dev server `npm run dev` và dùng trình duyệt:
1. Vào `/docs`. Mở tab Network > Fetch/XHR.
2. Kiểm tra response của query `docs`, xác nhận dung lượng nhỏ và payload JSON trả về KHÔNG chứa string `content` khổng lồ.
3. Click vào một File ở sidebar.
4. Xem Network tab để chắc chắn có 1 query mới gọi lên Supabase lấy riêng nội dung của file đó.
5. Quan sát thấy màn hình hiển thị Skeleton Loader trước khi render nội dung hoàn chỉnh.
</verification>
