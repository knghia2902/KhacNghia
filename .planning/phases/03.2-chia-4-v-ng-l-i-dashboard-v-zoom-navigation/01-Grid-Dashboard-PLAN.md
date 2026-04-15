---
phase: "03.2"
plan: "01"
title: "Grid Dashboard Layout + Scroll Zoom Navigation"
wave: 1
depends_on: []
files_modified:
  - src/pages/Home.jsx
  - src/isometric.css
autonomous: true
requirements: []
---

# Plan 01: Grid Dashboard Layout + Scroll Zoom Navigation

<objective>
Refactor Home.jsx từ dạng single isometric world (4 trụ hologram + walk-to-navigate) thành dạng 2×2 Grid Layout hiển thị 4 vùng (Docs, Tools, Gallery, Admin) trên cùng 1 màn hình, mỗi vùng là một cảnh isometric 3D themed riêng biệt. Tích hợp Scroll Wheel Zoom để chuyển đổi mượt giữa overview và chi tiết.
</objective>

## Tasks

### Task 1: Refactor Home.jsx — Grid Layout Container

<read_first>
- src/pages/Home.jsx (hiện tại: single isometric world với 4 cyber-pedestal)
- src/isometric.css (hiện tại: isometric-world, cyber-pedestal, iso-floor classes)
- .planning/phases/03.2-chia-4-v-ng-l-i-dashboard-v-zoom-navigation/03.2-CONTEXT.md
</read_first>

<action>
1. Thay thế nội dung `#isometric-view` div trong Home.jsx:
   - Xóa single `isometric-world` container chứa 4 cyber-pedestal
   - Tạo CSS Grid container `id="zone-grid"` với `grid-template-columns: repeat(2, 1fr)` và `grid-template-rows: repeat(2, 1fr)`, full height (`h-full`), gap `1rem`
   - Mỗi ô grid (zone-cell) là một div có:
     - `class="zone-cell"` với `overflow: hidden`, `position: relative`, `border-radius: 1.5rem`
     - Nền tối gradient (giống dark mode hiện tại)
     - Border subtle `border: 1px solid rgba(255,255,255,0.05)`
     - Hover effect: `scale(1.02)`, border sáng hơn, shadow glow
   - 4 ô theo thứ tự: Docs (trên-trái), Admin (trên-phải), Tools (dưới-trái), Gallery (dưới-phải)

2. Bên trong mỗi zone-cell, tạo một mini isometric scene:
   - Mỗi cell chứa `<div class="mini-iso-world">` với transform isometric thu nhỏ
   - **Docs zone**: Sử dụng `<model-viewer>` với model tủ sách (`/models/Meshy_AI_The_Lanterned_Archive_0414101610_texture.glb`) + label "DOCS" hologram
   - **Tools zone**: Placeholder — icon búa (material icon `construction`) + label "TOOLS" + pedestal-base glow effect màu emerald
   - **Gallery zone**: Placeholder — icon ảnh (material icon `imagesmode`) + label "GALLERY" + pedestal-base glow effect màu purple
   - **Admin zone**: Placeholder — icon settings (material icon `admin_panel_settings`) + label "ADMIN" + pedestal-base glow effect màu amber

3. Giữ nguyên HUD overlay (Digital Atrium badge, Welcome text, Clock) nhưng điều chỉnh z-index và positioning cho phù hợp Grid layout mới.

4. Xóa Chibi Agent walk-to-navigate logic (useState agentPos, isAgentRunning, activeNode, handleNodeClick, model-viewer agent). Logic này không cần thiết trong Grid view.
</action>

<acceptance_criteria>
- Home.jsx contains `id="zone-grid"` div with CSS Grid layout
- Home.jsx contains exactly 4 `.zone-cell` divs (docs, tools, gallery, admin)
- Docs zone-cell contains model-viewer with src="/models/Meshy_AI_The_Lanterned_Archive_0414101610_texture.glb"
- Tools zone-cell contains material icon `construction` and text "TOOLS"
- Gallery zone-cell contains material icon `imagesmode` and text "GALLERY"
- Admin zone-cell contains material icon `admin_panel_settings` and text "ADMIN"
- Home.jsx does NOT contain `agentPos` or `isAgentRunning` state variables
- Home.jsx does NOT contain `handleNodeClick` function
- `npm run build` exits with code 0
</acceptance_criteria>

### Task 2: Thêm CSS Grid và Zone Styling vào isometric.css

<read_first>
- src/isometric.css (current styles)
- src/pages/Home.jsx (sau khi Task 1 hoàn thành — xem class names cần style)
</read_first>

<action>
1. Thêm CSS cho Grid Dashboard:
```css
/* Grid Dashboard Layout */
#zone-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 1rem;
    height: 100%;
    padding: 1rem;
}

.zone-cell {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    background: rgba(16, 22, 20, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.zone-cell:hover {
    transform: scale(1.02);
    border-color: rgba(6, 182, 212, 0.3);
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.15), inset 0 0 30px rgba(6, 182, 212, 0.05);
}
```

2. Thêm CSS cho mini isometric scene bên trong mỗi zone:
```css
.mini-iso-world {
    transform: rotateX(55deg) rotateZ(-45deg) scale(0.6);
    transform-style: preserve-3d;
    width: 300px;
    height: 300px;
    position: relative;
}

.mini-iso-floor {
    width: 100%;
    height: 100%;
    background: rgba(13, 148, 136, 0.05);
    border: 1px dashed rgba(13, 148, 136, 0.2);
    border-radius: 12px;
    box-shadow: inset 0 0 30px rgba(13, 148, 136, 0.1);
}
```

3. Thêm zone label styling (chữ tên zone ở góc dưới cell):
```css
.zone-label {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 10;
    font-size: 1.5rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 4px;
    pointer-events: none;
}
```
</action>

<acceptance_criteria>
- isometric.css contains `#zone-grid` selector with `display: grid` and `grid-template-columns: repeat(2, 1fr)`
- isometric.css contains `.zone-cell` selector with `border-radius: 1.5rem` and hover transform
- isometric.css contains `.mini-iso-world` selector with isometric transform
- isometric.css contains `.zone-label` selector
- No CSS syntax errors (unclosed blocks)
</acceptance_criteria>

### Task 3: Implement Scroll Wheel Zoom Navigation

<read_first>
- src/pages/Home.jsx (sau khi Task 1 hoàn thành)
- .planning/phases/03.2-chia-4-v-ng-l-i-dashboard-v-zoom-navigation/03.2-CONTEXT.md (zoom decisions)
</read_first>

<action>
1. Thêm state quản lý zoom:
```jsx
const [zoomTarget, setZoomTarget] = useState(null); // null = overview, 'docs'|'tools'|'gallery'|'admin' = zoomed
const [hoveredZone, setHoveredZone] = useState(null);
```

2. Thêm `useEffect` lắng nghe wheel event trên `#zone-grid`:
```jsx
useEffect(() => {
    const grid = document.getElementById('zone-grid');
    if (!grid) return;
    
    const handleWheel = (e) => {
        e.preventDefault();
        
        if (e.deltaY > 0 && hoveredZone && !zoomTarget) {
            // Scroll down = zoom in vào zone đang hover
            setZoomTarget(hoveredZone);
            // Sau animation (600ms), navigate tới route
            setTimeout(() => {
                const routes = { docs: '/docs', tools: '/tools', gallery: '/gallery', admin: '/admin' };
                navigate(routes[hoveredZone]);
            }, 600);
        }
    };
    
    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
}, [hoveredZone, zoomTarget, navigate]);
```

3. Trên mỗi zone-cell, thêm:
   - `onMouseEnter={() => setHoveredZone('docs')}` (tương ứng mỗi zone)
   - `onMouseLeave={() => setHoveredZone(null)}`
   - `onClick={() => navigate('/docs')}` (fallback click navigation)

4. Khi `zoomTarget` khác null, áp CSS class `zone-zooming` lên cell đó:
   - Cell đang zoom: `transform: scale(4); opacity: 0; z-index: 50` (zoom to full screen rồi fade)
   - Các cell khác: `transform: scale(0.8); opacity: 0` (thu nhỏ rồi biến mất)
   - Transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`
</action>

<acceptance_criteria>
- Home.jsx contains `zoomTarget` and `hoveredZone` state variables
- Home.jsx contains `addEventListener('wheel', handleWheel` for scroll zoom
- Home.jsx contains `e.preventDefault()` inside wheel handler
- Each zone-cell has `onMouseEnter` and `onMouseLeave` handlers
- Each zone-cell has `onClick` handler that calls `navigate()`
- isometric.css contains `.zone-zooming` class with `transform: scale(4)` or similar zoom animation
- Scrolling down on a zone triggers navigation to correct route (/docs, /tools, /gallery, /admin)
- `npm run build` exits with code 0
</acceptance_criteria>

## Verification

<must_haves>
- [ ] Dashboard hiển thị 4 vùng dạng lưới 2×2 trên cùng 1 màn hình
- [ ] Mỗi vùng có cảnh isometric riêng (Docs có model tủ sách, còn lại placeholder)
- [ ] Scroll chuột xuống trên zone nào → zoom in + navigate tới trang đó
- [ ] Click vào zone cũng navigate được (fallback)
- [ ] Dark mode đồng bộ (background tối, borders subtle, text sáng)
- [ ] Build thành công không lỗi
</must_haves>
