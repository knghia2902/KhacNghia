# Phase 5: Isometric 3D Agent Space

## Design & Architecture Decisions

### 1. Agent Character — Cartoon Chibi Style
- Nhân vật đại diện (Agent) theo phong cách **Cartoon Chibi**: đầu to, thân nhỏ, mắt tròn to, biểu cảm dễ thương.
- Tông màu chủ đạo đồng bộ palette Atrium: `#006a65` (primary) / `#4ecdc4` (accent).
- **Cần import model 3D** dạng `.glb`/`.gltf` (tạo bằng Blender hoặc source từ Sketchfab/Mixamo). Không xây từ primitive geometry.
- Tủ sách và đồ vật trong cảnh giữ phong cách bo tròn, dễ thương, đồng bộ trực quan với chibi agent.

### 2. 3D Technology — Three.js (WebGL) via @react-three/fiber
- Dùng **Three.js** với **@react-three/fiber** (React wrapper) để tích hợp mượt mà vào codebase React/Vite.
- Camera: `OrthographicCamera` cố định góc isometric.
- Agent model: Load bằng `useGLTF` (từ `@react-three/drei`).
- Tủ sách/môi trường: Có thể pha trộn primitive geometry (BoxGeometry bo góc) cho props đơn giản + model import cho items phức tạp.
- **Fallback Mobile yếu / No-WebGL:** Nếu WebGL không khả dụng, hiển thị ảnh tĩnh isometric illustration thay thế.

### 3. Animation Sequence — Nhanh & Skippable
- Chuỗi animation khi click tài liệu:
  | Bước | Thời gian | Mô tả |
  |------|-----------|-------|
  | Agent đi đến tủ | ~800ms | Lerp position mượt |
  | Mở tủ / lấy sách | ~500ms | Cánh tủ xoay, sách bay ra |
  | Editor nổi lên | ~400ms | Scale+Fade (đồng bộ Phase 4) |
  | **Tổng** | **~1.7s** | |
- **Interruptible:** Nếu click tài liệu khác giữa chừng → cancel tween hiện tại ngay lập tức, Agent teleport sang vị trí mới, bắt đầu sequence mới.
- **Idle state:** Khi vừa mở trang hoặc chưa chọn tài liệu, Agent đứng yên ở trung tâm cảnh với micro-animation lắc lư nhẹ (idle bob).

### 4. Layout Integration — 3D Background + Editor Floating Overlay
- Cảnh 3D chiếm **toàn bộ khu vực Main Content** (bên phải Cascading Panels), đóng vai trò background layer.
- Editor (Ghost Panel từ Phase 4) **nổi lên đè trên cảnh 3D** dưới dạng floating window (z-index cao hơn, backdrop shadow mềm phía sau).
- **Luồng UX Desktop:**
  1. Mở `/docs` → Thấy Panel Folder (trái) + Cảnh 3D Isometric (phải, chiếm trọn).
  2. Click Folder → Panel 2 (Doc List) trượt ra.
  3. Click Document → Agent animation chạy → Hoàn tất → Editor bay lên (floating) trên cảnh 3D.
  4. Đóng Editor → Editor mờ dần, quay lại cảnh 3D thuần tuý.
- **Mobile (<768px):** Cảnh 3D **ẩn hoàn toàn** (`hidden md:block`). Trên điện thoại chỉ giữ Cascading Panels + Editor full screen. 3D là tính năng Desktop-only.

## Code Context & Guidelines
- **Thư viện cần cài:** `three`, `@react-three/fiber`, `@react-three/drei`.
- **File mới cần tạo:** Component React riêng cho cảnh 3D (VD: `src/components/docs/IsometricScene.jsx`).
- **Asset 3D:** Cần đặt file model `.glb` vào thư mục `public/models/` để load bằng `useGLTF`.
- **Tích hợp vào Docs.jsx:** Thay thế (hoặc bọc) khu vực `<section>` Main Content bằng cảnh 3D canvas, với Editor floating overlay bên trên.
