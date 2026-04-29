# Xiangqi Online (Chinese Chess) - Phase 1

Dự án game Cờ Tướng trực tuyến cao cấp, tối ưu SEO cho thị trường Việt Nam.

## 📋 Mục Lục

- [Tech Stack](#tech-stack)
- [Cài Đặt Dự Án](#cài-đặt-dự-án)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Tính Năng Hoàn Thành (Milestone 1)](#tính-năng-hoàn-thành-milestone-1)
- [Tài Liệu Bổ Sung](#tài-liệu-bổ-sung)

## 🛠 Tech Stack

- **Frontend Framework:** Next.js 14+ (App Router)
- **UI Framework:** CSS (Mobile-first, Responsive)
- **State Management:** Zustand
- **Database & Auth:** Supabase (PostgreSQL, Realtime, Auth)
- **Game Engine:**
  - **Logic:** Custom Xiangqi rules / Stockfish (WASM)
  - **Rendering:** Pixi.js (Canvas)
  - **Animations:** GSAP
  - **Audio:** Howler.js
- **Language:** TypeScript

## 🚀 Cài Đặt Dự Án

### Yêu Cầu Hệ Thống

- Node.js 18+
- npm hoặc yarn
- Tài khoản Supabase ([tạo tại đây](https://app.supabase.com))

### Bước 1: Clone và Cài Đặt Dependencies

```bash
# Clone repository
git clone <repository-url>
cd chinese-chess

# Cài đặt dependencies
npm install
```

### Bước 2: Cấu Hình Environment Variables

1. **Tạo file `.env.local`** từ template:

```bash
cp env.local.example .env.local
```

2. **Lấy thông tin từ Supabase Dashboard:**
   - Truy cập: https://app.supabase.com/project/_/settings/api
   - Copy các giá trị sau:

3. **Cập nhật `.env.local` với các biến bắt buộc:**

```env
# Supabase Configuration (Bắt buộc)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (Cần cho seed script và migrations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL (Cho migrations - tùy chọn)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Admin Panel (Tùy chọn)
ADMIN_ALLOWED_IPS=127.0.0.1,::1
ADMIN_EMAILS=admin@example.com

# SEO Configuration (Tùy chọn)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Lưu ý quan trọng:**

- `SUPABASE_SERVICE_ROLE_KEY`: Lấy từ Supabase Dashboard → Settings → API → `service_role` key
- **KHÔNG BAO GIỜ** commit file `.env.local` vào git
- Trong production, cấu hình các biến này trong hosting platform (Vercel, etc.)

### Bước 3: Chạy Database Migrations

Chạy migrations để tạo schema database:

```bash
# Option 1: Sử dụng pg library (Khuyến nghị)
npm run migrate

# Option 2: Sử dụng Supabase CLI
npm run migrate:supabase

# Option 3: Manual - Copy nội dung từ supabase/full_deployment.sql vào Supabase SQL Editor
```

Xem chi tiết tại [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### Bước 4: Seed Demo Data

Chạy script để tạo dữ liệu demo (Admin account + Bài viết mẫu):

```bash
npm run seed:demo
```

Script này sẽ:

- Tạo tài khoản Admin: `admin@cotuong.online` / `Admin@123456`
- Tạo 6-8 bài viết mẫu về Cờ Tướng (tiếng Việt)
- Link các bài viết với Admin account

### Bước 5: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

## 📁 Cấu Trúc Dự Án

```
chinese-chess/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # Public pages
│   │   ├── hoc-co-tuong/         # SEO Content Pages (SSR) - Blog system
│   │   │   ├── [slug]/           # Blog detail pages
│   │   │   └── page.tsx          # Blog list page
│   │   ├── choi-voi-may/         # Play with AI page
│   │   ├── choi-online/          # Online multiplayer (M2)
│   │   ├── dang-nhap/            # Login/Register page
│   │   └── ...
│   ├── admin/                    # Admin panel (Protected route)
│   │   ├── blog/                 # Blog CMS
│   │   ├── users/                # User management
│   │   └── transactions/         # Transaction logs
│   └── auth/                     # Auth callbacks
│
├── components/                   # React components
│   ├── game/                     # Game Logic & PixiJS rendering
│   │   ├── ChessBoard.tsx        # PixiJS canvas component
│   │   ├── GameBoard.tsx         # High-level game component
│   │   └── ...
│   ├── blog/                     # Blog components
│   │   ├── BlogCard.tsx          # Blog card component
│   │   └── ...
│   ├── auth/                     # Authentication components
│   ├── layout/                   # Layout components (Navbar, etc.)
│   └── ...
│
├── lib/                          # Utilities & services
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Client-side Supabase
│   │   ├── server.ts             # Server-side Supabase
│   │   └── middleware.ts         # Auth middleware
│   ├── blog/                     # Blog service
│   │   ├── blogService.ts        # Client-side blog API
│   │   └── blogService.server.ts # Server-side blog API
│   ├── game/                     # Game logic
│   │   ├── chessRules.ts         # Xiangqi rules
│   │   ├── gameState.ts          # Game state management
│   │   └── ...
│   └── ...
│
├── stores/                       # Zustand state stores
│   ├── authStore.ts              # Authentication store
│   ├── gameStore.ts              # Game state store
│   ├── shopStore.ts              # Shop store
│   └── ...
│
├── scripts/                      # Maintenance scripts
│   ├── seed-demo.ts              # Demo data seeding script
│   └── migrate-with-pg.js       # Migration runner
│
├── supabase/                     # Database migrations
│   ├── migrations/               # Migration files (chronological)
│   └── full_deployment.sql      # Full schema (manual deployment)
│
└── public/                       # Static assets
    ├── assets/                   # Game assets (themes, sounds)
    └── wasm/                     # WebAssembly files (Stockfish)
```

### Giải Thích Các Thư Mục Quan Trọng

- **`app/(pages)/cach-choi-co-tuong`**: Hệ thống blog/SEO content với SSR đầy đủ. Tất cả pages đều render trên server để tối ưu SEO.
- **`components/game`**: Logic game và rendering với PixiJS. Tách biệt giữa engine (logic) và UI (React components).
- **`lib/supabase`**: Clients Supabase được tách riêng cho client-side và server-side để đảm bảo security.
- **`scripts`**: Scripts tiện ích như seed demo data, migrations.
- **`stores`**: Zustand stores quản lý global state (auth, game, shop, UI).

## ✅ Tính Năng Hoàn Thành (Milestone 1)

### 1. Authentication System

- ✅ **Email/Password Authentication**: Đăng ký, đăng nhập, quên mật khẩu
- ✅ **Google OAuth**: Đăng nhập bằng Google (Priority)
- ✅ **Session Management**: Tự động quản lý session với Supabase
- ✅ **Protected Routes**: Middleware bảo vệ routes cần authentication
- ✅ **Password Recovery**: Flow đặt lại mật khẩu qua email
- ✅ **Registration Bug Fix**: Fixed email validation issues (trim, lowercase)

**Tài liệu:** [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### 2. SEO-Ready Blog System (`/cach-choi-co-tuong`)

- ✅ **Server-Side Rendering (SSR)**: Tất cả pages render trên server cho SEO
- ✅ **Dynamic Metadata**: `generateMetadata` cho mỗi route
- ✅ **Clean URLs**: Slug-based URLs (e.g., `/cach-choi-co-tuong/khai-cuoc-hay`)
- ✅ **Content Management**:
  - Blog list page với pagination
  - Blog detail pages với rich HTML content
  - Category filtering (Guide, Openings, Puzzles, Endgame)
- ✅ **Image Optimization**: Next.js Image component với fallback handling
- ✅ **Responsive Design**: Mobile-first, tối ưu cho mọi thiết bị
- ✅ **Theme Support**: Blog pages fully theme-aware (Light/Dark mode)

**Routes:**

- `/cach-choi-co-tuong` - Blog list page
- `/cach-choi-co-tuong/[slug]` - Blog detail page

### 3. Admin Panel Security

- ✅ **Hidden Route**: `/admin` route được ẩn khỏi public (404 cho non-admin)
- ✅ **Role-Based Access**: Chỉ users có `role: 'admin'` mới truy cập được
- ✅ **IP Whitelist**: Cấu hình IP whitelist (optional, cho non-admin users)
- ✅ **Features:**
  - User Management (View, Ban/Unban)
  - Blog CMS (Create, Edit, Delete articles)
  - Transaction Logs

**Tài liệu:** [ADMIN_SETUP.md](./ADMIN_SETUP.md)

### 4. Database Schema

- ✅ **Profiles Table**: User profiles với role, ELO rating, avatar
- ✅ **Blog Articles Table**: Full blog system với metadata, SEO fields
- ✅ **Migrations System**: Chronological migrations với rollback support
- ✅ **Auto Profile Creation**: Database trigger automatically creates profiles on signup

### 5. UI/UX Foundation

- ✅ **Light/Dark Theme System**: Complete theme switcher with CSS variables
  - Light Theme: Wood/parchment aesthetic (cream background, dark brown text)
  - Dark Theme: Deep blue/black gaming aesthetic
  - Theme persistence via localStorage
- ✅ **Responsive Layout**: Mobile-first, works on all screen sizes
  - Mobile sidebar with proper spacing and z-index
  - Responsive navbar (minimal on mobile)
- ✅ **Mantine UI Integration**: Consistent component library
- ✅ **Vietnamese Language**: Tất cả UI, errors, notifications đều bằng tiếng Việt
- ✅ **Theme-Aware Components**: All pages adapt to theme changes

## 📚 Tài Liệu Bổ Sung

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Hướng dẫn chạy database migrations
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Chi tiết setup Supabase
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Cấu hình Google OAuth
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Cấu hình Admin Panel
- **[FONTS_SETUP.md](./FONTS_SETUP.md)** - Cấu hình fonts (Be Vietnam Pro, Inter)
- **[stores/README.md](./stores/README.md)** - Zustand stores documentation

## 📊 Current Status

**Status**: Milestone 1 - Polish & Deployment

**Active Features**:

- ✅ Light/Dark Theme System (Complete)
- ✅ Registration Bug Fixes (Complete)
- ✅ Responsive Layout & Mobile Sidebar (Complete)
- ✅ Theme-Aware Blog & Shop Pages (Complete)
- 🔄 Performance Optimization (In Progress)

**Recent Updates**: See [CHANGELOG.md](./CHANGELOG.md) for detailed change history.

## 🎮 Các Milestone Tiếp Theo

### Milestone 2: Core Game & AI (Sắp tới)

- Pixi.js Board rendering
- Move validation & Turn logic
- AI Opponent (Stockfish integration) với 3-4 difficulty levels

### Milestone 3: Online Multiplayer

- Room System (Create/Join via ID/Link)
- Realtime Sync (Supabase Realtime)
- In-game Chat
- Co Up (Mystery Chess) Mode

### Milestone 4: Economy System

- Virtual Currency ("Lượng")
- Daily Rewards
- Cosmetic Shop
- Betting System

### Milestone 5: Admin & Final Polish

- Admin Panel enhancements
- Leaderboard
- Final SEO Audit

## 🛠 Scripts Có Sẵn

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

# Database
npm run migrate          # Run migrations (pg library)
npm run migrate:supabase # Run migrations (Supabase CLI)
npm run seed:demo       # Seed demo data (Admin + Blog articles)
```

## 🔒 Security Notes

- **Service Role Key**: Chỉ sử dụng trong server-side code, KHÔNG expose ra client
- **Admin Routes**: Được bảo vệ bởi middleware và role checks
- **Environment Variables**: Không commit `.env.local` vào git
- **RLS Policies**: Supabase Row Level Security được enable cho tất cả tables

## 📝 Development Notes

- **Language**: Tất cả user-facing strings (UI, errors, notifications) đều bằng **tiếng Việt**
- **Code/Comments**: Code và comments bằng **tiếng Anh**
- **SEO Priority**: Tất cả public pages (`/`, `/cach-choi-co-tuong/*`) đều SSR
- **Mobile-First**: Design ưu tiên mobile experience
- **Theme System**: Complete Light/Dark theme support with CSS variables (see [THEME_REFACTOR_SUMMARY.md](./THEME_REFACTOR_SUMMARY.md))

## 🚀 Deploy

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables trong Vercel Dashboard
4. Deploy tự động

Xem thêm: [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)

---

**Developed for Vietnamese Market** 🇻🇳 | **M1 (Phase 1) Complete** ✅
