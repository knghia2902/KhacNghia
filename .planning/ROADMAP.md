# Roadmap

## Phase 1: Tối ưu hoá Data Fetching & Supabase
- Triển khai Lazy Loading và chọn lọc trường dữ liệu (không select all).
- Ngăn chặn các vòng lặp request hoặc N+1 Queries trong components.

## Phase 2: Refactor UI Components (Code-Splitting)
- Chia nhỏ `Docs.jsx` và các files lớn khác sử dụng `React.lazy()` và `Suspense`.
- Implement Skeleton Loaders để che giấu độ trễ mạng phía client.

## Phase 3: Profiling & Database Indexing

### Phase 03.5: Quản lý vùng tùy chỉnh và hình dạng (INSERTED)

**Goal:** Triển khai cơ chế tạo vùng động và tùy chọn hình dạng (Chữ nhật/Tròn) thông qua Admin Panel.
**Requirements**: Refactor `zonesTransform`, cập nhật AdminPanel UI, lưu trữ vào `world_config`.
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 03.5 to break down)

- Cấu hình PostgreSQL Indexes trên các bảng cấu trúc hệ thống nếu cần.
- Kiểm thử và đo lường sự cải thiện qua Vercel.

### Phase 03.4: Migrate Docs and Folders to Supabase and optimize 3D model loading (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 03.4 to break down)

### Phase 03.3: Trang Settings va Cai dat he thong (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 3
**Plans:** 1/3 plans executed

Plans:
- [ ] TBD (run /gsd-plan-phase 03.3 to break down)

### Phase 03.2: Chia 4 vùng lưới Dashboard và Zoom Navigation (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 03.2 to break down)

### Phase 03.1: Redesign Dashboard 3D (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 03.1 to break down)
