<user_constraints>
## User Constraints (từ 3-CONTEXT.md)

### Locked Decisions
- **Panel Interaction & Collapse Behavior:** Chuyển đổi từ giao diện Split-pane thành mô hình Cascading Panels (Miller Columns). Panel 1 (Primary) hiển thị danh sách thư mục. Khi người dùng click chọn thư mục, Panel 2 (Secondary) chứa danh sách tài liệu mới trượt/nổi ra ngang cạnh phải. Click ra vùng trống hoặc `Esc` sẽ tự động thu hồi.
- **Empty States:** Hiển thị trạng thái "Empty State" mang đậm tính chất visual (icon tủ tài liệu mờ nhạt + thông báo "Trống").
- **Document List Density:** Dạng list dọc minimalist (Icon + Tiêu đề). Khi hover: thẻ kính (glass card effect) và nổi bật metadata (ngày chỉnh sửa, thẻ tags).
- **Mobile & Responsive Strategy:** Dùng cơ chế trượt ngang nguyên màn hình. Phía trên Panel 2 trên Mobile phải có nút `← Trở lại (Back)`.
- **Code Context:** Tập trung vào `src/pages/Docs.jsx`. Có thể tạo component mới riêng rẽ cho cấu trúc Nav. Tái sử dụng logic của `activeFolderId`, `folders`, `docs`.

### Cập nhật Design System (từ DESIGN.md)
- **Màu sắc mới:** `primary` (#006a65), `primary-container` (#4ecdc4), `secondary` (#845415), `surface` (#f2fcf8), `surface-container-low` (#ecf6f2), `surface-container-lowest` (#ffffff).
- **Quy tắc No-Line:** Cấm sử dụng viền solid 1px để phân chia nội dung. Phân định ranh giới bằng thay đổi màu nền và chuyển đổi tông (Tonal Transitions).
- **Glassmorphism (Glass & Gradient):** Các UI nổi (như panel trượt) sử dụng hiệu ứng kính. Token: `primary-container` (#4ecdc4) với độ mờ 15% + blur 20px. Các CTA chính có gradient từ `primary` sang `primary-container` (góc 135 độ).
- **Typography:** Plus Jakarta Sans cho tiêu đề (Display, Headlines), Inter cho nội dung (Body, Labels).
- **Elevation:** Tonal Layering thay cho shadow thông thường. Bóng đổ mờ khi cần nổi (Blur: 40px-60px, Opacity: 6% của `#141d1b`, Y: 12px).
- **Documentation Sidebar:** Không có viền phải. Nền `surface-container-low`. Trạng thái active dùng thẻ pill đứng bằng `primary` (4x24px).
- **Lists & Cards:** Nghiêm cấm vạch ngăn cách (divider lines). Sử dụng khoảng trắng hoặc đổi màu nền.
</user_constraints>

# Phase 3: Docs Floating Panels (Cascading Layout) - Research

**Researched:** 2024
**Domain:** Giao diện điều hướng Cascading (Miller Columns), Glassmorphism UI, CSS Transitions/Animations.
**Confidence:** HIGH

## Summary
Giai đoạn này tập trung vào việc chuyển đổi cấu trúc giao diện của phần tài liệu từ Split-pane truyền thống sang mô hình Cascading Panels, tuân thủ nghiêm ngặt Design System "The Digital Atrium" mới. Điểm cốt lõi là việc loại bỏ hoàn toàn các viền (borders) 1px, thay vào đó sử dụng sự thay đổi màu nền (background shifts) và chuyển đổi tông (tonal transitions) để tạo chiều sâu. Các panel nổi sẽ ứng dụng hiệu ứng Glassmorphism tinh tế để tạo không gian mở, hiện đại mà không làm mất đi tính chuyên nghiệp.

**Primary recommendation:** Xây dựng hệ thống cấu trúc Tailwind CSS mở rộng trong `tailwind.config.js` để bao hàm các token màu mới, đồng thời tạo một component chuyên biệt (VD: `CascadingNav.jsx`) tách biệt khỏi `Docs.jsx` để dễ dàng quản lý logic trượt trên cả Desktop và Mobile.

## Standard Stack

### Core
| Library / Công nghệ | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| **React (Hooks)** | Kèm repo | Quản lý trạng thái hiển thị panel (mở/đóng), id thư mục đang chọn, và logic trượt trên mobile. | Khả năng quản lý state mạnh mẽ tích hợp sẵn trong ứng dụng. |
| **Tailwind CSS** | Kèm repo | Triển khai các quy tắc thiết kế mới (No-line rule, Glassmorphism, Elevation) mà không cần viết CSS thuần. | Cho phép tạo ra các class utility phức tạp dễ dàng như `backdrop-blur-[20px]`, `bg-white/40`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | CSS Transitions thuần qua Tailwind (`transition-transform`) | Framer Motion cho animation phức tạp hơn nhưng tăng bundle size. Tailwind đủ tốt và mượt cho các thao tác trượt pop-out đơn giản. |
| `react-use` cho click-outside | Tự viết Hook `useOnClickOutside` | Tự viết giúp giảm phụ thuộc, logic không quá phức tạp, tiết kiệm dung lượng. |

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── layout/
│   │   ├── CascadingNav.jsx      # Component mới quản lý luồng điều hướng 2 panel
│   │   ├── PrimaryPanel.jsx      # Danh sách thư mục (bên trái)
│   │   └── SecondaryPanel.jsx    # Panel trượt (bên phải) với hiệu ứng kính
├── pages/
│   └── Docs.jsx                  # Wrapper container, quản lý data (folders, docs)
```

### Pattern 1: Tonal Layering (Chuyển đổi tông màu)
**What:** Phân tách các khu vực giao diện bằng sự chênh lệch màu nền thay vì dùng viền mỏng.
**When to use:** Luôn sử dụng khi xếp chồng các thành phần như Card lên nền Sidebar, hoặc Sidebar lên nền chính.
**Example:**
```jsx
// Base layer: surface (#f2fcf8)
// Sidebar: surface-container-low (#ecf6f2)
// Card: surface-container-lowest (#ffffff)
<div className="bg-[#f2fcf8] min-h-screen p-8">
  <aside className="bg-[#ecf6f2] p-6 rounded-[1.5rem]">
    {/* Active item */}
    <div className="bg-[#ffffff] flex items-center p-3 relative rounded-xl">
      <div className="absolute left-0 w-1 h-6 bg-[#006a65] rounded-full" />
      <span className="ml-3 text-[#141d1b]">Active Folder</span>
    </div>
  </aside>
</div>
```

### Pattern 2: Floating Glass Panel (Glassmorphism)
**What:** Sử dụng độ mờ của nền kết hợp với backdrop-blur để tạo hiệu ứng nổi.
**When to use:** Cho Secondary Panel chứa danh sách tài liệu hoặc thẻ hover nổi lên.
**Example:**
```jsx
{/* Sử dụng primary-container (#4ecdc4) ở mức 15% opacity + backdrop-blur 20px */}
<div className="bg-[#4ecdc4]/15 backdrop-blur-[20px] shadow-[0_12px_60px_rgba(20,29,27,0.06)] transition-transform duration-300 ease-out translate-x-0">
  {/* Content */}
</div>
```

### Anti-Patterns to Avoid
- **Borders cho sectioning:** Tuyệt đối không dùng `border`, `border-gray-200`, hay các class tương tự để chia cột, chia dòng.
- **Cards-inside-cards:** Không lồng ghép nhiều thẻ có viền vào nhau, tạo sự nhiễu loạn thị giác. Dùng khoảng trắng (spacing) thay thế.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Click Outside Panel | Viết event listener thuần ở mọi component | Hook tự chế tái sử dụng `useOnClickOutside` | Tránh rò rỉ bộ nhớ (memory leaks) nếu quên dọn dẹp (cleanup) event listener. |
| Icons tủ tài liệu | Vẽ SVG thuần bằng tay | Thư viện icon (Lucide, Phosphor) kết hợp với màu sắc Design System | Đảm bảo tính nhất quán và dễ tùy chỉnh kích cỡ, độ mờ (opacity). |

**Key insight:** Logic điều khiển lớp kính mờ (glassmorphism) và đổ bóng phức tạp thường dễ sai lệch giữa các trình duyệt. Dùng các utility chuẩn của Tailwind (vd: `backdrop-blur-[20px]`, `shadow-[custom]`) đảm bảo sự đồng bộ.

## Common Pitfalls

### Pitfall 1: Bị giật lag khi trượt trên Mobile
**What goes wrong:** Animation trượt Panel 2 từ phải sang trái bị giật, rớt khung hình (drop frames).
**Why it happens:** Sử dụng `margin` hoặc `left`/`right` để tạo animation thay vì `transform`.
**How to avoid:** Luôn dùng `translate-x` kết hợp `transition-transform duration-300 ease-out` để nhờ GPU xử lý.

### Pitfall 2: Hiệu ứng blur không hoạt động trên nền trong suốt
**What goes wrong:** Panel có class `backdrop-blur` nhưng nhìn như trong suốt, không làm mờ background phía sau.
**Why it happens:** Không có màu nền định dạng bán trong suốt đi kèm.
**How to avoid:** Phải kết hợp giữa `backdrop-blur` và màu nền có opacity (ví dụ: `bg-[#4ecdc4]/15` hoặc `bg-white/40`).

### Pitfall 3: Lỗi z-index khiến các nội dung đè chéo
**What goes wrong:** Secondary Panel trượt ra nhưng lại nằm dưới các thành phần khác trên trang.
**Why it happens:** Thiếu kiểm soát các layer trong ngữ cảnh xếp chồng (stacking context).
**How to avoid:** Gán `z-50` cho các Floating Panels và đảm bảo container cha có `relative` hoặc `absolute` đúng cách.

## Code Examples

### CSS Cấu hình (cần bổ sung vào `tailwind.config.js`)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'atrium-primary': '#006a65',
        'atrium-primary-container': '#4ecdc4',
        'atrium-secondary': '#845415',
        'atrium-surface': '#f2fcf8',
        'atrium-surface-low': '#ecf6f2',
        'atrium-surface-lowest': '#ffffff',
        'atrium-on-surface': '#141d1b',
        'atrium-on-variant': '#3d4948',
        'atrium-outline-variant': '#bcc9c7',
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 12px 60px rgba(20, 29, 27, 0.06)',
      }
    }
  }
}
```

### Component Trượt Cascading cơ bản
```jsx
// SecondaryPanel.jsx
import React, { useRef, useEffect } from 'react';

const SecondaryPanel = ({ isOpen, onClose, items }) => {
  const panelRef = useRef();

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Đóng panel bằng phím Esc
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      className={`fixed inset-y-0 right-0 w-full md:w-[400px] z-50 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-out bg-atrium-primary-container/15 backdrop-blur-[20px] shadow-ambient`}
    >
      {/* Nút Mobile Back */}
      <div className="md:hidden p-4">
        <button onClick={onClose} className="text-atrium-on-surface font-body font-medium">
          ← Trở lại
        </button>
      </div>

      <div className="p-6">
        {items.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-atrium-on-variant">
            <span className="text-4xl mb-4 opacity-50">📁</span>
            <p className="font-body text-sm">Thư mục trống</p>
          </div>
        ) : (
          // Document List
          <ul className="space-y-4">
            {items.map(doc => (
              <li key={doc.id} className="group relative p-3 rounded-xl hover:bg-atrium-surface-lowest hover:shadow-ambient transition-all cursor-pointer flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <span className="font-body text-sm text-atrium-on-surface">{doc.title}</span>
                 </div>
                 {/* Metadata nổi bật khi hover */}
                 <span className="opacity-0 group-hover:opacity-100 transition-opacity font-body text-xs text-atrium-on-variant">
                    {doc.date}
                 </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SecondaryPanel;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Split-pane với viền border | Cascading Panel / Miller Columns | Phase 3 | Mở rộng không gian hiển thị cho main canvas (3D editor), tạo cảm giác layer 3D trong không gian UI. |
| 50/50 Split cứng | Nổi (Floating) & Kính mờ (Glassmorphism) | Giai đoạn nâng cấp Design System | Phá vỡ cảm giác hộp (box), tăng tính hiện đại và editorial cho sản phẩm. |

**Deprecated/outdated:**
- Sử dụng border 1px để ngăn cách: Gây ra sự vụn vặt về thị giác. Thay thế hoàn toàn bằng khoảng cách trắng và Tonal Layering.

## Khuyến nghị Triển khai
1. **Cập nhật cấu hình:** Bổ sung ngay các biến màu vào `tailwind.config.js`. Tránh hardcode mã hex trong các file component.
2. **Typography Font:** Nhúng Google Fonts (Plus Jakarta Sans, Inter) trong `index.html` hoặc import vào css chính.
3. **Mô-đun hóa:** Di chuyển logic hiển thị list tài liệu từ `Docs.jsx` vào một component riêng biệt để Docs.jsx gọn gàng, chỉ làm nhiệm vụ Data Fetching và State Wrapper.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest / Jest (theo thư viện hiện hành của repo) |
| Config file | none — see Wave 0 |
| Quick run command | `npm run test` |
| Full suite command | `npm run test -- --watchAll=false` |

### Wave 0 Gaps
- [ ] Chưa có thiết lập testing framework rõ ràng trong mã nguồn.
- [ ] Cần tạo file unit test mẫu cho hook `useOnClickOutside`.

## Sources

### Primary (HIGH confidence)
- `stitch/cyan_logic/DESIGN.md` - Quy chuẩn màu sắc, hệ thống typography, No-Line rule, Glassmorphism token.
- `.planning/phases/3-docs-floating-panels/3-CONTEXT.md` - Yêu cầu logic tương tác, cấu trúc Miller columns, hành vi collapse (Esc/click outside).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TailwindCSS đủ linh hoạt đáp ứng mọi yêu cầu về glassmorphism và transition phức tạp theo thiết kế.
- Architecture: HIGH - Tách biệt container (Docs.jsx) và presentational panel (CascadingNav) là chuẩn mực React.
- Pitfalls: HIGH - Các vấn đề về z-index và performance trượt CSS đã quá phổ biến ở mô hình Miller Columns mobile.

**Research date:** 2024
**Valid until:** Không giới hạn trong phạm vi phase này.