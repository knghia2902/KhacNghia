# KhacNghia - Hướng dẫn Setup

Ứng dụng quản lý ghi chú với Rich Text Editor, Image Gallery, và Tools.

---

## 🚀 Deploy lên Vercel từ GitHub

### Bước 1: Import Project

1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập bằng GitHub
2. Click **Add New** → **Project**
3. Tìm và chọn repository `KhacNghia`
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Bước 2: Thêm Environment Variables

Trong phần **Environment Variables**, thêm 2 biến:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://[project-id].supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key từ Supabase) |

> ⚠️ Lấy 2 giá trị này từ Supabase Dashboard → Settings → API

### Bước 3: Deploy

Click **Deploy** và đợi 1-2 phút.

> 💡 Sau này mỗi khi push code lên GitHub, Vercel sẽ tự động deploy!

---

## ⚙️ Cấu hình Supabase

### Bước 1: Tạo Project

1. Truy cập [supabase.com](https://supabase.com) → **New Project**
2. Chọn:
   - **Name**: `khacnghia`
   - **Region**: `Southeast Asia (Singapore)`
3. Đợi 2-3 phút để khởi tạo

### Bước 2: Lấy API Keys

1. Vào **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGci...`

### Bước 3: Tạo User Admin

1. Vào **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Điền:
   - **Email**: `admin@example.com`
   - **Password**: Tạo password mạnh
   - **Auto Confirm User**: ✅ BẬT
4. Click **Create user**

> 💡 User này sẽ dùng để đăng nhập vào trang `/login` để có quyền chỉnh sửa nội dung.

---

## 🗄️ Tạo Database Tables

Vào **SQL Editor** → **New Query** → Copy và chạy:

```sql
-- =============================================
-- 1. FOLDERS (Thư mục)
-- =============================================
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    "iconColor" TEXT DEFAULT 'text-gray-400',
    color TEXT,
    "parentId" TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. DOCS (Tài liệu)
-- =============================================
CREATE TABLE docs (
    id TEXT PRIMARY KEY,
    "parentId" TEXT,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    tags TEXT[],
    bg TEXT,
    attachments JSONB DEFAULT '[]',
    "isLocked" BOOLEAN DEFAULT false,
    "isHidden" BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. GALLERY_IMAGES (Ảnh)
-- =============================================
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT,
    url TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TOOLS (Công cụ)
-- =============================================
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'extension',
    icon_bg TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Click **Run** để tạo tables.

---

## 📦 Tạo Storage Bucket

1. Vào **Storage** → **New bucket**
2. Điền:
   - **Name**: `docs-media`
   - **Public bucket**: ✅ BẬT
3. Click **Create bucket**

### Thêm Policies (cho phép upload/download):

Vào bucket → **Policies** → **New Policy** → **For full customization**

**Policy 1 - Upload:**
```
Name: Allow uploads
Operation: INSERT
Expression: true
```

**Policy 2 - Download:**
```
Name: Allow downloads
Operation: SELECT
Expression: true
```

---

## ✅ Kiểm tra

| Item | Cách kiểm tra |
|------|---------------|
| **Vercel** | Truy cập URL được cung cấp sau deploy |
| **Supabase** | Vào Table Editor, kiểm tra 4 tables đã tạo |
| **Storage** | Kiểm tra bucket `docs-media` |

---

## � Chạy Local (Development)

```bash
# Clone
git clone https://github.com/knghia2902/KhacNghia.git
cd KhacNghia

# Install
npm install

# Tạo file .env
echo "VITE_SUPABASE_URL=https://xxx.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJabc..." >> .env

# Chạy
npm run dev
```

Mở `http://localhost:5173`

---

## � Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4
- **Editor**: TipTap 3
- **Backend**: Supabase (PostgreSQL + Storage)
- **Deploy**: Vercel

---

## 📁 Cấu trúc Project

```
src/
├── pages/                    # Các trang chính
│   ├── Admin.jsx             # Quản trị hệ thống
│   ├── Docs.jsx              # Quản lý tài liệu (trang chính)
│   ├── Home.jsx              # Trang chủ
│   ├── Images.jsx            # Gallery ảnh
│   ├── Landing.jsx           # Landing page
│   ├── Login.jsx             # Đăng nhập
│   ├── Overview.jsx          # Tổng quan
│   └── Tools.jsx             # Công cụ
│
├── components/
│   ├── docs/
│   │   └── MarkdownRenderer.jsx
│   ├── editor/
│   │   ├── MarkdownEditor.jsx
│   │   ├── RichTextEditor.jsx
│   │   └── extensions/
│   │       ├── ResizableImage.js
│   │       └── ResizableImageComponent.jsx
│   └── layout/
│       ├── Dock.jsx
│       ├── Header.jsx
│       └── Layout.jsx
│
├── context/
│   ├── AuthContext.jsx       # Xác thực Supabase
│   └── ThemeContext.jsx      # Dark/Light mode
│
├── lib/
│   └── supabaseClient.js     # Supabase client
│
└── main.jsx                  # Entry point
```
