# Phase 5: Isometric 3D Agent Space

## Objective
Xây dựng không gian 3D Isometric tương tác ngay bên phải hệ thống Cascading Panels trên trang Docs. Nhân vật Chibi Agent sẽ thực hiện chuỗi animation khi người dùng chọn tài liệu, sau đó Editor nổi lên dạng floating overlay trên cảnh 3D.

## Context
Tham khảo file định hướng: `.planning/phases/5-isometric-3d-agent/5-CONTEXT.md`

## Execution Steps

### 1. Cài đặt Dependencies
- **Cwd:** Root project
- Chạy lệnh:
  ```bash
  npm install three @react-three/fiber @react-three/drei
  ```
- Xác nhận không có conflict trong `package.json`.

### 2. Chuẩn bị Asset 3D
- Tạo thư mục `public/models/`.
- **Agent Chibi:** Cần 1 file model `.glb` cho nhân vật chibi. Có 2 cách:
  - (A) Tìm model miễn phí trên Sketchfab (license CC0/CC-BY) rồi optimize bằng `gltf-transform` hoặc gltfjsx.
  - (B) Tạo placeholder đơn giản bằng Three.js primitives (SphereGeometry cho đầu, CylinderGeometry cho thân, tông `#006a65`) — dùng tạm cho development, thay model thật sau.
- **Bookshelf:** Có thể xây từ primitives (BoxGeometry) trực tiếp trong code.
- Đặt file model vào `public/models/chibi-agent.glb` (hoặc dùng placeholder).

### 3. Tạo Component IsometricScene
- **File mới:** `src/components/docs/IsometricScene.jsx`
- **Nội dung:**
  ```jsx
  // Cấu trúc chính
  import { Canvas } from '@react-three/fiber'
  import { OrthographicCamera, useGLTF } from '@react-three/drei'
  
  export default function IsometricScene({ activeFolderId, activeDocId, onAnimationComplete }) {
    return (
      <Canvas>
        <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <Floor />
        <Bookshelf />
        <ChibiAgent targetDocId={activeDocId} onReach={onAnimationComplete} />
      </Canvas>
    )
  }
  ```
- **Sub-components bên trong file:**
  - `Floor` — Plane geometry nền sàn, material mờ nhạt matching dot-grid tone.
  - `Bookshelf` — Nhóm BoxGeometry bo nhẹ tạo hình tủ sách isometric, vị trí cố định.
  - `ChibiAgent` — Component load model `.glb` bằng `useGLTF`, quản lý vị trí + animation.

### 4. Xây dựng Agent Animation Logic
- **Trong `ChibiAgent` component:**
  - Dùng `useFrame` (từ @react-three/fiber) để update vị trí mỗi frame.
  - State machine đơn giản: `idle` → `walking` → `interacting` → `done`.
  - **Idle:** Agent lắc lư nhẹ (sin wave trên Y position, amplitude ~0.05, period ~2s).
  - **Walking (~800ms):** Lerp position từ vị trí hiện tại đến trước tủ sách. Dùng `THREE.Vector3.lerp()` với tốc độ cố định.
  - **Interacting (~500ms):** Cánh tủ xoay (rotate Y 90deg), một "sách" (BoxGeometry nhỏ) bay ra từ tủ. Agent đưa tay (nếu model có bone) hoặc đơn giản là sách nổi lên cạnh Agent.
  - **Done:** Gọi callback `onAnimationComplete()` để Docs.jsx biết hiển thị Editor.
- **Interruptible:** Nếu `activeDocId` thay đổi giữa chừng → reset state machine về `walking` với target mới, cancel tween cũ ngay lập tức.

### 5. Tích hợp vào Docs.jsx — Layout Refactor
- **Target File:** `src/pages/Docs.jsx`
- **Import:** Thêm `import IsometricScene from '../components/docs/IsometricScene'` (lazy import khuyến khích: `React.lazy`).
- **Thêm state:** `const [showEditorOverlay, setShowEditorOverlay] = useState(false);`
- **Cấu trúc lại khu vực Main Content (`<section>`):**
  ```jsx
  {/* Container chính bên phải panels */}
  <div className="flex-1 relative h-full hidden md:block">
    {/* Layer 1: 3D Scene (background, luôn render) */}
    <div className="absolute inset-0 z-0">
      <IsometricScene
        activeFolderId={activeFolderId}
        activeDocId={activeDocId}
        onAnimationComplete={() => setShowEditorOverlay(true)}
      />
    </div>
    
    {/* Layer 2: Editor Overlay (nổi lên khi có doc) */}
    {showEditorOverlay && activeDoc && (
      <section className="absolute inset-4 z-10 bg-white/30 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_60px_-15px_rgba(0,0,0,0.08)] border border-white/20 flex flex-col overflow-hidden animate-[scaleIn_0.4s_ease-out]">
        {/* Ghost Panel Editor - code từ Phase 4 */}
      </section>
    )}
  </div>
  
  {/* Mobile: Editor trực tiếp, không 3D */}
  <section className="flex-1 flex flex-col h-full md:hidden ...">
    {/* Editor code cho mobile */}
  </section>
  ```
- **Dismiss Editor:** Thêm nút "X" hoặc click vào backdrop → `setShowEditorOverlay(false)` để quay lại view 3D thuần tuý.

### 6. WebGL Fallback
- **File:** `src/components/docs/IsometricScene.jsx`
- Wrap `<Canvas>` trong try-catch hoặc dùng `<Canvas fallback={...}>`:
  ```jsx
  <Canvas fallback={<IsometricFallbackImage />}>
  ```
- `IsometricFallbackImage` là ảnh tĩnh illustration isometric (có thể generate bằng AI hoặc dùng placeholder SVG).

## Verification Criteria
1. Mở `/docs` trên Desktop — Thấy cảnh 3D isometric với sàn, tủ sách, và nhân vật Chibi Agent đứng yên lắc lư.
2. Click Folder → Panel Doc List trượt ra (Phase 3). Click một tài liệu → Agent bắt đầu đi đến tủ (~800ms), tương tác mở tủ (~500ms), rồi Editor nổi lên đè trên cảnh 3D (~400ms).
3. Trong lúc Agent đang đi mà click tài liệu khác → Animation bị cancel, Agent nhảy sang target mới ngay.
4. Đóng Editor overlay → Quay lại cảnh 3D. Agent đang idle.
5. Mở trang trên mobile (<768px) → Không thấy cảnh 3D, chỉ có Cascading Panels + Editor.
6. Trên browser không hỗ trợ WebGL → Hiển thị fallback image thay vì crash.
