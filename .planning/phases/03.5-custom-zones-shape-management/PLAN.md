# Plan: Phase 03.5 - Custom Zones & Shape Management

## Goal
Triển khai khả năng tạo các vùng không gian linh hoạt với các hình dạng khác nhau (Chữ nhật/Tròn) và quản lý chúng thông qua giao diện Admin.

## Proposed Changes

### 1. Refactor `zonesTransform` State
- Mở rộng cấu trúc của `zonesTransform` để lưu thêm `label`, `shape` (rect/circle) và `color`.
- Đảm bảo tính tương thích ngược với dữ liệu cũ từ Supabase.

### 2. Render Vùng động trong `Docs.jsx`
- Thay thế các khối JSX cứng (`REGION 1-4`) bằng vòng lặp `.map()`.
- Cập nhật logic `iso-floor` để xử lý thuộc tính `shape` (sử dụng `border-radius: 50%` cho hình tròn).

### 3. Cập nhật AdminPanel
- Thêm section "Quản lý vùng".
- Form thêm vùng mới với các trường: Tên vùng, Hình dạng.
- Danh sách các vùng hiện có với nút Xóa.

### 4. Đồng bộ hóa Supabase
- Tự động lưu `zonesTransform` vào bảng `world_config` mỗi khi có thay đổi (debounced hoặc manual save).

## Verification Plan

### Manual Verification
1.  Truy cập Admin zone, mở Settings.
2.  Nhấn "Thêm vùng mới", chọn hình tròn.
3.  Kiểm tra vùng mới xuất hiện trên bản đồ.
4.  Thử kéo/thả và thay đổi kích thước vùng mới.
5.  F5 trang để đảm bảo vùng mới vẫn tồn tại.
