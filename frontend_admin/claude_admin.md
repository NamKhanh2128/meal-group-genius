# CLAUDE_ADMIN.md — Admin Frontend Build Prompt
> **Dành cho:** Claude Code hoặc bất kỳ AI coding agent nào  
> **Mức độ ràng buộc:** STRICT — Không được tự ý sáng tạo lệch hệ thống  
> **Ưu tiên tuyệt đối:** Đọc & phân tích toàn bộ user frontend TRƯỚC KHI viết bất kỳ dòng code nào

---

## 🎯 MISSION

Build một **Admin Frontend** hoàn chỉnh cho hệ thống **NATEAT** — ứng dụng quản lý thực phẩm và kế hoạch bữa ăn cho gia đình.

Admin frontend phải:
- **Đồng bộ 100%** với user frontend về design system, component patterns, data schema, API layer
- **Không được** tự ý thay đổi màu sắc, typography, data types, naming conventions
- **Không được** đoán API — phải đọc từ `src/shared/lib/mockDb.ts` và các API files hiện có
- **Phải** hoạt động song song với user frontend, chia sẻ cùng localStorage DB key `nateat.db.v2`

---

## 📁 PROJECT CONTEXT

### Cấu trúc dự án hiện tại
```
c:\Users\KHANH\Documents\GitHub\meal-group-genius\
├── src/                          ← User frontend (ĐỌC KỸ TOÀN BỘ)
│   ├── app/
│   │   ├── providers/
│   │   └── router/AppRouter.tsx  ← Routing config (react-router-dom v6)
│   ├── components/
│   │   └── ui/                   ← 46 shadcn/ui components (TailwindCSS v4)
│   ├── layouts/
│   │   └── MainLayout.tsx        ← Layout với header + bottom nav
│   ├── modules/
│   │   ├── auth/                 ← authApi.ts, authStore.ts (Zustand)
│   │   ├── family/
│   │   ├── fridge/
│   │   ├── meal-plan/
│   │   ├── recipe/
│   │   ├── shopping/
│   │   └── statistics/
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   └── SplashPage.tsx
│   ├── shared/
│   │   ├── api/foodApi.ts
│   │   ├── components/           ← AppModal, BottomNav, NotificationDropdown, ScreenHeader
│   │   ├── constants/
│   │   │   ├── endpoints.ts      ← API endpoints map
│   │   │   └── options.ts        ← foodCategories, foodUnits, foodLocations, mealTypes
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── mockDb.ts         ← ⚠️ SOURCE OF TRUTH cho toàn bộ data
│   │   │   └── i18n.ts           ← Bilingual vi/en translations
│   │   ├── store/
│   │   │   └── languageStore.ts  ← Zustand language store + useT() hook
│   │   └── utils/
│   ├── types/
│   │   ├── database.ts           ← ⚠️ CANONICAL TYPE DEFINITIONS — không được thay đổi
│   │   └── index.ts
│   ├── styles.css                ← ⚠️ Design system CSS (TailwindCSS v4 + oklch colors)
│   └── main.tsx
├── frontend_admin/               ← ✅ OUTPUT TARGET (hiện đang rỗng)
├── package.json                  ← Dependencies (React 19, Vite 7, TailwindCSS v4, Zustand 5, RHF 7)
├── vite.config.ts
└── tsconfig.json
```

### Output path (TUYỆT ĐỐI không được thay đổi)
```
C:\Users\KHANH\Documents\GitHub\meal-group-genius\frontend_admin\
```

Admin là một **Vite + React + TypeScript** app độc lập trong thư mục `frontend_admin/`, nhưng **chia sẻ localStorage** với user frontend.

---

## 🔍 BƯỚC 1 — BẮT BUỘC: ĐỌC & PHÂN TÍCH USER FRONTEND

**KHÔNG ĐƯỢC BỎ QUA BƯỚC NÀY.** Trước khi viết bất kỳ dòng code nào, bạn phải đọc đầy đủ các file sau:

### 1.1 Design System (BẮT BUỘC ĐỌC)
```
src/styles.css
```
Ghi nhớ chính xác:
- Tất cả CSS custom properties (`--primary`, `--background`, `--sidebar`, v.v.)
- Toàn bộ oklch color values cho cả `:root` và `.dark`
- `--radius` base = `1rem`
- Sidebar colors: `--sidebar: oklch(0.42 0.20 290)` (purple)
- Primary brand: `--primary: oklch(0.52 0.22 290)` (purple)
- Warning accent: `#ffb11f` (yellow/orange)

### 1.2 Type Definitions (BẮT BUỘC ĐỌC)
```
src/types/database.ts
```
Đây là **nguồn duy nhất** cho tất cả types. Copy nguyên xi, không được extend hoặc thay đổi.

### 1.3 Mock Database Layer (BẮT BUỘC ĐỌC)
```
src/shared/lib/mockDb.ts
```
Admin phải dùng **cùng DB_KEY** `"nateat.db.v2"` và **cùng SESSION_KEY** `"nateat.session"`. Admin sẽ đọc/ghi vào cùng localStorage, tức là data đồng bộ real-time với user frontend.

### 1.4 Auth System (BẮT BUỘC ĐỌC)
```
src/modules/auth/api/authApi.ts
src/modules/auth/store/authStore.ts
src/modules/auth/schemas.ts
```

### 1.5 Layout & Navigation (BẮT BUỘC ĐỌC)
```
src/layouts/MainLayout.tsx
src/shared/components/AppModal.tsx
src/shared/components/BottomNav.tsx
src/shared/components/NotificationDropdown.tsx
```

### 1.6 API Layer Patterns (BẮT BUỘC ĐỌC)
```
src/shared/api/foodApi.ts
src/shared/constants/endpoints.ts
src/shared/constants/options.ts
```
Mọi API function trong admin **phải theo cùng pattern**: async function → call `db()` → xử lý data → `saveDb()` nếu có mutation.

### 1.7 i18n System (BẮT BUỘC ĐỌC)
```
src/shared/lib/i18n.ts
src/shared/store/languageStore.ts
```

### 1.8 Một module hoàn chỉnh (ĐỌC ĐỂ HIỂU PATTERN)
Đọc toàn bộ `src/modules/auth/` và `src/modules/fridge/` để hiểu structure pattern:
```
module/
├── api/[moduleName]Api.ts
├── pages/
│   ├── [Module]Page.tsx
│   └── [Module]FormPage.tsx
├── components/
└── store/[module]Store.ts   (chỉ khi cần complex state)
```

---

## 🏗️ BƯỚC 2 — THIẾT KẾ ADMIN FRONTEND

### 2.1 Tech Stack (GIỐNG HỆT user frontend, không thay đổi)

```json
{
  "framework": "Vite + React 19 + TypeScript",
  "styling": "TailwindCSS v4 (dùng @import 'tailwindcss', không phải v3)",
  "ui_components": "shadcn/ui (Radix UI primitives)",
  "routing": "react-router-dom v6",
  "state": "Zustand v5",
  "forms": "react-hook-form v7 + zod v3",
  "data_fetching": "useState + useEffect (không dùng TanStack Query trong admin)",
  "notifications": "sonner",
  "icons": "lucide-react",
  "charts": "recharts"
}
```

### 2.2 Khởi tạo dự án

```bash
cd C:\Users\KHANH\Documents\GitHub\meal-group-genius\frontend_admin
# Khởi tạo Vite project
npx -y create-vite@latest . --template react-ts
# Install dependencies
npm install react-router-dom zustand react-hook-form @hookform/resolvers zod sonner lucide-react recharts tailwindcss @tailwindcss/vite @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-alert-dialog class-variance-authority clsx tailwind-merge date-fns tw-animate-css
```

### 2.3 Cấu trúc thư mục Admin (PHẢI tuân thủ)

```
frontend_admin/
├── index.html
├── package.json
├── vite.config.ts                 ← Giống user vite.config.ts, alias @ → ./src
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── styles.css                 ← COPY NGUYÊN XI từ src/styles.css của user
│   ├── types/
│   │   └── database.ts            ← COPY NGUYÊN XI từ src/types/database.ts
│   ├── lib/
│   │   ├── mockDb.ts              ← COPY NGUYÊN XI từ src/shared/lib/mockDb.ts
│   │   │                            ⚠️ PHẢI dùng cùng DB_KEY = "nateat.db.v2"
│   │   ├── i18n.ts                ← COPY + EXTEND với admin-specific keys
│   │   └── utils.ts               ← cn() helper (clsx + tailwind-merge)
│   ├── constants/
│   │   ├── endpoints.ts           ← COPY từ src/shared/constants/endpoints.ts
│   │   └── options.ts             ← COPY từ src/shared/constants/options.ts
│   ├── store/
│   │   ├── authStore.ts           ← Admin auth store (chỉ cho role ADMIN)
│   │   └── languageStore.ts       ← COPY từ src/shared/store/languageStore.ts
│   ├── api/
│   │   ├── adminUserApi.ts        ← CRUD users
│   │   ├── adminFoodApi.ts        ← CRUD foods
│   │   ├── adminRecipeApi.ts      ← CRUD recipes
│   │   ├── adminMealApi.ts        ← CRUD meal plans
│   │   ├── adminFamilyApi.ts      ← Read families + members
│   │   ├── adminShoppingApi.ts    ← Read shopping lists
│   │   └── adminStatsApi.ts       ← Aggregate statistics
│   ├── components/
│   │   ├── ui/                    ← shadcn/ui components (copy từ src/components/ui/)
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx    ← Sidebar + Header layout
│   │   │   ├── AdminSidebar.tsx   ← Collapsible sidebar (xem section 7)
│   │   │   └── AdminHeader.tsx    ← Top bar
│   │   └── shared/
│   │       ├── AppModal.tsx       ← COPY từ src/shared/components/AppModal.tsx
│   │       ├── DataTable.tsx      ← Generic table với sort/filter/pagination
│   │       ├── SearchInput.tsx    ← Debounced search input
│   │       ├── FilterBar.tsx      ← Filter dropdowns
│   │       ├── BulkActionBar.tsx  ← Bulk action toolbar
│   │       ├── ConfirmDialog.tsx  ← Reusable confirm dialog
│   │       ├── StatCard.tsx       ← KPI card component
│   │       └── PageHeader.tsx     ← Page title + breadcrumb + actions
│   ├── pages/
│   │   ├── LoginPage.tsx          ← Admin login (kiểm tra role === "ADMIN")
│   │   ├── DashboardPage.tsx      ← Admin dashboard
│   │   ├── users/
│   │   │   ├── UserListPage.tsx
│   │   │   └── UserFormPage.tsx
│   │   ├── foods/
│   │   │   ├── FoodListPage.tsx
│   │   │   └── FoodFormPage.tsx
│   │   ├── recipes/
│   │   │   ├── RecipeListPage.tsx
│   │   │   └── RecipeFormPage.tsx
│   │   ├── meals/
│   │   │   └── MealListPage.tsx
│   │   ├── statistics/
│   │   │   └── StatisticsPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   └── router/
│       └── AdminRouter.tsx
```

---

## 🎨 BƯỚC 3 — UI/UX CONSISTENCY RULES (KHÔNG ĐƯỢC VI PHẠM)

### 3.1 Color Palette (COPY NGUYÊN XI từ src/styles.css)

```css
/* styles.css của admin PHẢI bắt đầu bằng: */
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* Toàn bộ @theme inline, :root, .dark — COPY NGUYÊN XI */
```

**Màu sắc cốt lõi** (không được dùng màu khác):
| Token | Light Value | Dùng cho |
|---|---|---|
| `--primary` | `oklch(0.52 0.22 290)` | CTA buttons, active states |
| `--sidebar` | `oklch(0.42 0.20 290)` | Sidebar background |
| `#ffb11f` | amber | Brand accent, quick-add button |
| `#7655aa` | purple | Primary button bg, links |
| `--destructive` | `oklch(0.62 0.22 25)` | Delete, error states |
| `--success` | `oklch(0.64 0.17 145)` | Success badges |
| `--warning` | `oklch(0.72 0.18 50)` | Warning badges |

### 3.2 Typography

```css
/* User FE dùng: */
font-family: Arial, "Times New Roman", sans-serif;

/* Admin FE PHẢI dùng giống hệt (không thay đổi). */
/* Nếu muốn dùng Google Font, chỉ được thêm Inter làm ưu tiên đầu: */
font-family: "Inter", Arial, "Times New Roman", sans-serif;
```

**Font weight conventions** (theo user FE):
- `font-extrabold` (800) → Page titles, hero text
- `font-bold` (700) → Section headers, button labels
- `font-semibold` (600) → Nav items, table headers
- `font-medium` (500) → Body text
- Default → Muted text, labels

### 3.3 Border Radius

```
--radius: 1rem (base)
Rounded variants: sm=12px, md=14px, lg=16px, xl=20px, 2xl=24px
Buttons: rounded-[8px] (theo pattern trong AppModal.tsx)
Cards: rounded-[20px] hoặc rounded-[28px]
Avatars/Icons: rounded-full hoặc rounded-xl
```

### 3.4 Shadows

```css
shadow-card: 0 4px 24px -8px oklch(0.52 0.22 290 / 0.15)
shadow-elevated: 0 10px 40px -12px oklch(0.52 0.22 290 / 0.25)
```

### 3.5 Component Patterns

**Button variants** (theo shadcn Button component):
```tsx
// Primary action
<Button className="bg-[#7655aa] hover:bg-[#67489a]">...</Button>

// Destructive
<Button variant="destructive">...</Button>

// Outline secondary
<Button variant="outline" className="rounded-[8px]">...</Button>

// Ghost
<Button variant="ghost">...</Button>
```

**NavLink active state** (theo MainLayout.tsx pattern):
```tsx
className={({ isActive }) =>
  `... ${isActive ? "bg-[#eee9f7] text-[#65439a]" : "text-[#9790a6] hover:bg-[#f1edf7]"}`
}
```

**Modal pattern** (theo AppModal.tsx):
```tsx
<AppModal
  open={open}
  onOpenChange={setOpen}
  type="confirm"  // "confirm" | "success" | "error" | "warning" | "info"
  title="..."
  primaryLabel="Xác nhận"
  secondaryLabel="Hủy"
  onPrimary={handleAction}
>
  Nội dung confirm dialog
</AppModal>
```

---

## 🔐 BƯỚC 4 — AUTHENTICATION

### 4.1 Admin Login Flow

Admin login **khác hoàn toàn** với user login ở chỗ:
1. Sau khi login thành công, **phải kiểm tra** `user.role === "ADMIN"`
2. Nếu không phải ADMIN → reject với message: `"Tài khoản không có quyền quản trị."`
3. Admin token format: `mock-token-admin-1` (giống user token format)

**Admin account mặc định** (từ mockDb.ts):
```
email: admin@nateat.vn
password: Admin@123
role: ADMIN
```

### 4.2 Admin Auth Store

```typescript
// src/store/authStore.ts
import { create } from "zustand";
import type { User } from "@/types";

// ⚠️ Phải dùng cùng SESSION_KEY với user frontend
const SESSION_KEY = "nateat.session";
const DB_KEY = "nateat.db.v2";

type AdminAuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  bootstrap: async () => {
    // Đọc session từ localStorage (cùng key với user FE)
    // Validate user.role === "ADMIN"
    // Nếu không phải ADMIN → set user: null
  },
  login: async (email, password) => {
    // 1. Call db() để lấy data
    // 2. Tìm user theo email
    // 3. Kiểm tra password
    // 4. Kiểm tra role === "ADMIN" — nếu không: throw Error
    // 5. Kiểm tra user.locked
    // 6. setSession() với cùng format như user FE
  },
  logout: async () => {
    // Xóa session (cùng key với user FE)
    set({ user: null });
  },
}));
```

### 4.3 Protected Route Admin

```typescript
// router/AdminRouter.tsx
function AdminProtectedRoute() {
  const user = useAdminAuthStore((state) => state.user);
  const loading = useAdminAuthStore((state) => state.loading);
  
  if (loading) return <LoadingScreen />;
  if (!user || user.role !== "ADMIN") return <Navigate to="/admin/login" replace />;
  return <AdminLayout />;
}
```

### 4.4 Routing

```typescript
// Tất cả admin routes có prefix /admin/
export function AdminRouter() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/new" element={<UserFormPage mode="create" />} />
          <Route path="/users/:id" element={<UserFormPage mode="edit" />} />
          <Route path="/foods" element={<FoodListPage />} />
          <Route path="/foods/new" element={<FoodFormPage mode="create" />} />
          <Route path="/foods/:id" element={<FoodFormPage mode="edit" />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage mode="create" />} />
          <Route path="/recipes/:id" element={<RecipeFormPage mode="edit" />} />
          <Route path="/meals" element={<MealListPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🗂️ BƯỚC 5 — SIDEBAR LAYOUT (KÈM FIX LỖI COLLAPSE)

### 5.1 AdminSidebar Component

Sidebar admin là **desktop-only sidebar** (không có bottom nav). Phải có chức năng collapse/expand.

**⚠️ BUG THỰC TẾ CẦN TRÁNH: Sidebar collapse không click được**

Nguyên nhân phổ biến:
1. `pointer-events: none` bị leak khi sidebar collapsed
2. Overlay/backdrop che phần nội dung khi collapsed
3. `transition` không hoàn chỉnh khiến element vẫn chiếm space
4. `z-index` conflict giữa sidebar và content

**Fix chuẩn:**

```tsx
// AdminSidebar.tsx
export function AdminSidebar({ collapsed, onToggle }: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`
        relative flex h-full flex-col bg-sidebar text-sidebar-foreground
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
      // ⚠️ KHÔNG dùng overflow-hidden trên container ngoài — sẽ clip tooltip
    >
      {/* Logo */}
      <div className="flex h-[68px] shrink-0 items-center px-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffb11f] text-white">
          <span className="text-lg font-extrabold">N</span>
        </div>
        {/* ⚠️ Dùng opacity thay vì display:none để tránh layout shift */}
        <span className={`
          ml-3 text-xl font-extrabold text-white
          transition-[opacity,width] duration-200
          ${collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"}
        `}>
          NATEAT Admin
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Toggle button */}
      {/* ⚠️ Toggle button PHẢI ở ngoài sidebar body để không bị clip */}
      <button
        onClick={onToggle}
        className="
          absolute -right-3 top-[84px] z-50
          grid h-6 w-6 place-items-center rounded-full
          border border-sidebar-border bg-sidebar text-sidebar-foreground
          shadow-md transition hover:scale-110
        "
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}

// SidebarNavItem — PHẢI handle cả collapsed và expanded state
function SidebarNavItem({ item, collapsed }: {
  item: { to: string; label: string; icon: React.ElementType };
  collapsed: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={item.to}
          className={({ isActive }) => `
            flex items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-semibold transition-colors
            ${isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {/* ⚠️ Icon LUÔN hiển thị, shrink-0 để không bị squash */}
          <item.icon className="h-5 w-5 shrink-0" />
          
          {/* ⚠️ Label dùng opacity + width transition, không phải display toggle */}
          <span className={`
            overflow-hidden whitespace-nowrap
            transition-[opacity,max-width] duration-200
            ${collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}
          `}>
            {item.label}
          </span>
        </NavLink>
      </TooltipTrigger>
      
      {/* Chỉ show tooltip khi collapsed */}
      {collapsed && (
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
```

### 5.2 AdminLayout Component

```tsx
// components/layout/AdminLayout.tsx
export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    // ⚠️ TooltipProvider PHẢI wrap toàn bộ layout
    <TooltipProvider delayDuration={100}>
      <div className="flex h-screen overflow-hidden bg-background">
        
        {/* Sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          
          {/* ⚠️ overflow-auto trên main, không phải trên wrapper */}
          <main className="flex-1 overflow-auto bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
```

### 5.3 Sidebar Nav Items

```typescript
const navItems = [
  { to: "/dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { to: "/users",      label: "Quản lý người dùng",  icon: Users },
  { to: "/foods",      label: "Quản lý thực phẩm",   icon: UtensilsCrossed },
  { to: "/recipes",    label: "Quản lý công thức",   icon: BookOpen },
  { to: "/meals",      label: "Quản lý bữa ăn",      icon: CalendarDays },
  { to: "/statistics", label: "Thống kê",             icon: BarChart3 },
  { to: "/settings",   label: "Cài đặt",              icon: Settings },
];
```

### 5.4 AdminHeader Component

```tsx
// components/layout/AdminHeader.tsx
export function AdminHeader() {
  const user = useAdminAuthStore((state) => state.user);
  const logout = useAdminAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      {/* Breadcrumb */}
      <AdminBreadcrumb />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="hidden text-right leading-tight lg:block">
          <div className="text-sm font-bold">{user?.full_name}</div>
          <div className="text-xs text-muted-foreground">Quản trị viên</div>
        </div>
        
        <Avatar className="h-9 w-9 bg-[#ffbd2c] text-[#4b3178]">
          <AvatarFallback className="text-xs font-bold">
            {user?.full_name?.charAt(0) ?? "A"}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLogoutOpen(true)}
          title="Đăng xuất"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <AppModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        type="confirm"
        title="Đăng xuất?"
        primaryLabel="Đăng xuất"
        secondaryLabel="Hủy"
        onPrimary={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
      >
        Phiên làm việc admin sẽ kết thúc.
      </AppModal>
    </header>
  );
}
```

---

## 📊 BƯỚC 6 — CÁC MODULE ADMIN

### 6.1 Dashboard

**KPIs hiển thị** (aggregate từ `db()`):
- Tổng người dùng (users.length)
- Tổng thực phẩm (foods.length)
- Tổng công thức (recipes.length)
- Tổng gia đình (families.length)
- Tổng bữa ăn được lên kế hoạch (meal_plans.length)
- Danh sách mua sắm đang mở (shopping_lists.filter(DRAFT).length)

**Charts** (dùng recharts, cùng `chart-N` color tokens từ styles.css):
- Bar chart: Số bữa ăn theo ngày (7 ngày gần nhất)
- Pie chart: Phân bố thực phẩm theo category
- Line chart: Hoạt động gia đình (activities) theo ngày

**Recent Activity Table**:
- Lấy `family_activities` sort by `created_at` DESC, lấy 10 records gần nhất
- Hiển thị: user, action_type, message, created_at

```typescript
// api/adminStatsApi.ts
export const adminStatsApi = {
  async summary() {
    const state = await db();
    return {
      totalUsers: state.users.filter(u => u.role === "USER").length,
      totalAdmins: state.users.filter(u => u.role === "ADMIN").length,
      totalFoods: state.foods.length,
      totalRecipes: state.recipes.length,
      totalFamilies: state.families.length,
      totalMealPlans: state.meal_plans.length,
      activeShopping: state.shopping_lists.filter(s => s.status === "DRAFT").length,
      recentActivities: [...state.family_activities]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 10),
    };
  },
  async mealsByDay() {
    const state = await db();
    // Group meal_plans by meal_date, count per day (last 7 days)
  },
  async foodsByCategory() {
    const state = await db();
    // Group foods by category, count per category
  },
};
```

### 6.2 User Management

**API** (`api/adminUserApi.ts`):
```typescript
export const adminUserApi = {
  async list(): Promise<User[]> {
    const state = await db();
    return [...state.users].sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"));
  },
  async getById(user_id: string): Promise<User> {
    const state = await db();
    const user = state.users.find(u => u.user_id === user_id);
    if (!user) throw new Error("Không tìm thấy người dùng.");
    return user;
  },
  async create(payload: Omit<User, "user_id">): Promise<User> {
    const state = await db();
    // validate email uniqueness
    const user: User = { ...payload, user_id: uid("user") };
    state.users.push(user);
    saveDb(state);
    return user;
  },
  async update(user_id: string, payload: Partial<User>): Promise<User> {
    const state = await db();
    // find, validate, patch, saveDb
  },
  async toggleLock(user_id: string): Promise<User> {
    // Toggle user.locked boolean
  },
  async delete(user_id: string): Promise<void> {
    // Không cho xóa chính mình (admin đang login)
    // Xóa user + family_members liên quan
  },
  async bulkDelete(user_ids: string[]): Promise<void> {
    // Batch delete, cùng validation như delete đơn
  },
  async resetPassword(user_id: string, new_password: string): Promise<void> {
    // Admin reset password cho user
  },
};
```

**UserListPage** phải có:
- [ ] Table với columns: Avatar, Tên, Email, SĐT, Role badge, Trạng thái (Locked/Active), Ngày tạo, Actions
- [ ] Search theo tên/email (debounce 300ms)
- [ ] Filter theo role (All/USER/ADMIN) và trạng thái (All/Active/Locked)
- [ ] Pagination (10 per page)
- [ ] Bulk select + bulk delete
- [ ] Actions per row: Edit, Toggle Lock, Reset Password, Delete
- [ ] Confirm dialog trước mọi destructive action

**UserFormPage** phải có:
- [ ] Form fields: full_name, email, phone, password (chỉ khi create), role
- [ ] Validation với Zod (tái sử dụng `passwordRule` từ `src/modules/auth/schemas.ts`)
- [ ] Submit → call api → toast.success → navigate back

### 6.3 Food Management

**Data types** (từ `src/types/database.ts`, KHÔNG THAY ĐỔI):
```typescript
type FoodCategory = "Rau củ" | "Thịt cá" | "Đồ khô" | "Sữa & Trứng" | "Gia vị" | "Khác";
type FoodUnit = "kg" | "g" | "lít" | "ml" | "quả" | "củ" | "miếng" | "gói";
interface Food {
  food_id: string;
  food_name: string;
  category: FoodCategory;
  unit: FoodUnit;
  icon?: string;  // emoji
}
```

**FoodListPage** phải có:
- [ ] Table: Icon, Tên, Danh mục, Đơn vị, Actions
- [ ] Search theo tên
- [ ] Filter theo category (dùng `foodCategories` từ options.ts)
- [ ] Bulk delete
- [ ] Add/Edit/Delete per row

**FoodFormPage** phải có:
- [ ] Input: food_name, category (Select), unit (Select), icon (emoji picker hoặc text input)
- [ ] Category options: dùng `foodCategories` từ `constants/options.ts`
- [ ] Unit options: dùng `foodUnits` từ `constants/options.ts`
- [ ] Validate: food_name required, category required, unit required

### 6.4 Recipe Management

**Data types** (từ `src/types/database.ts`):
```typescript
interface Recipe {
  recipe_id: string;
  recipe_name: string;
  description: string;
  instructions: string[];  // mảng các bước
  image_url?: string;
  time_minutes: number;
  calories: number;
  difficulty: string;
  is_favorite?: boolean;
}

interface RecipeIngredient {
  id: string;
  recipe_id: string;
  food_id: string;
  quantity: number;
}
```

**RecipeListPage** phải có:
- [ ] Grid view (card) hoặc table view (toggle)
- [ ] Search theo tên
- [ ] Hiển thị: ảnh, tên, thời gian, calories, độ khó, số nguyên liệu
- [ ] Actions: Edit, Delete

**RecipeFormPage** phải có:
- [ ] Fields: recipe_name, description, image_url, time_minutes, calories, difficulty
- [ ] `instructions`: dynamic list (add/remove steps)
- [ ] Ingredients section: add/remove `RecipeIngredient` rows, mỗi row có food_id (Select từ foods list) và quantity

### 6.5 Meal Management

**Chỉ đọc** (không CRUD — meal plans được tạo bởi users):
- [ ] Table: Family, Ngày, Bữa (Sáng/Trưa/Tối/Bữa phụ), Công thức, User tạo
- [ ] Filter theo ngày (date range picker)
- [ ] Filter theo meal_type
- [ ] Export basic summary

### 6.6 Statistics

Hiển thị các biểu đồ aggregate từ toàn bộ dữ liệu:

```typescript
// Recharts dùng màu từ CSS vars:
// chart-1 = oklch(0.646 0.222 41.116) — orange
// chart-2 = oklch(0.6 0.118 184.704)  — teal
// chart-3 = oklch(0.398 0.07 227.392)  — blue
// chart-4 = oklch(0.828 0.189 84.429)  — yellow
// chart-5 = oklch(0.769 0.188 70.08)  — amber
```

Charts cần build:
1. **Phân bố thực phẩm theo category** — PieChart
2. **Bữa ăn theo ngày** (7 ngày gần nhất) — BarChart
3. **Hoạt động hệ thống theo ngày** — LineChart
4. **Top recipes** (được lên kế hoạch nhiều nhất) — HorizontalBarChart
5. **Users theo role** — PieChart

### 6.7 Settings

- [ ] **Ngôn ngữ**: Toggle vi/en (dùng languageStore)
- [ ] **Thông tin Admin**: Xem/sửa profile của admin đang login
- [ ] **Đổi mật khẩu**: Form với validation
- [ ] **Seed data reset**: Button để reset `nateat.db.v2` về initial state (có confirm dialog)
- [ ] **Export data**: Download toàn bộ DB dưới dạng JSON (cho dev/debug)

---

## 🧩 BƯỚC 7 — COMPONENT ARCHITECTURE

### 7.1 DataTable Component (Generic)

```tsx
// components/shared/DataTable.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
}

// Features phải implement:
// 1. Column sorting (click header)
// 2. Row selection (checkbox column)
// 3. Skeleton loading state
// 4. Empty state với icon + message
// 5. Striped rows (bg-muted trên odd rows)
// 6. Hover highlight
// 7. Responsive: horizontal scroll trên mobile
```

### 7.2 Pagination Component

```tsx
// components/shared/Pagination.tsx
// Dùng shadcn/ui Pagination components
// Props: total, page, pageSize, onPageChange, onPageSizeChange
// PageSize options: [10, 20, 50]
// Hiển thị: "Hiển thị X-Y trong Z kết quả"
```

### 7.3 SearchInput Component

```tsx
// components/shared/SearchInput.tsx
// - Debounce 300ms bằng useEffect + setTimeout
// - Clear button khi có text
// - Icon search ở bên trái
// - Placeholder text configurable
```

### 7.4 BulkActionBar Component

```tsx
// components/shared/BulkActionBar.tsx
// Hiển thị khi selectedCount > 0
// Animate in từ bottom (slide-up) khi appear
// Nội dung: "Đã chọn X mục" + actions (Delete, v.v.)
// ⚠️ Luôn có confirm dialog trước bulk delete
```

### 7.5 StatCard Component

```tsx
// components/shared/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: { value: number; label: string; positive?: boolean };
  color?: "primary" | "success" | "warning" | "destructive";
  to?: string;  // Clickable card → navigate
}
// Style: rounded-[20px], shadow-card, icon với colored background
// Trend: up/down arrow với green/red color
```

---

## 📋 BƯỚC 8 — DATA CONSISTENCY RULES

### 8.1 DB Key Sharing

```typescript
// ⚠️ TUYỆT ĐỐI dùng cùng key này
const DB_KEY = "nateat.db.v2";
const SESSION_KEY = "nateat.session";
```

Lý do: Admin và user FE chạy cùng một browser, chia sẻ localStorage. Thay đổi của admin **phải thấy ngay** ở user FE khi user refresh.

### 8.2 Type Safety

```typescript
// Luôn import types từ @/types (không redefine)
import type { User, Food, Recipe, Family, MealPlan } from "@/types";

// Enum values PHẢI dùng string literals CHÍNH XÁC:
user.role === "ADMIN"    // ✅ Đúng
user.role === "admin"    // ❌ Sai — type là "ADMIN" | "USER"

shopping.status === "DRAFT"  // ✅
shopping.status === "draft"  // ❌

location === "Ngăn mát"  // ✅ (tiếng Việt, có dấu)
location === "Ngan mat"  // ❌
```

### 8.3 ID Format

```typescript
// Dùng uid() function từ mockDb
// Format: "{prefix}-{timestamp}{random}"
// Ví dụ: uid("user") → "user-abc123"
// Luôn import từ shared lib, không tự implement
```

### 8.4 Date Format

```typescript
// Dates dưới dạng ISO string "YYYY-MM-DD"
// Luôn dùng todayIso(), addDaysIso() từ utils/date
// Không dùng new Date().toLocaleDateString()
```

### 8.5 Mutations phải gọi saveDb()

```typescript
// Pattern BẮT BUỘC cho mọi mutation:
async update(id: string, payload: Partial<Entity>) {
  const state = await db();                    // 1. Đọc current state
  const index = state.entities.findIndex(...); // 2. Tìm item
  if (index < 0) throw new Error("...");       // 3. Guard
  state.entities[index] = { ...state.entities[index], ...payload }; // 4. Mutate
  saveDb(state);                               // 5. ⚠️ LUÔN PHẢI gọi saveDb()
  return state.entities[index];               // 6. Return updated item
}
```

---

## ⚡ BƯỚC 9 — UX NÂNG CAO

### 9.1 Search & Filter Pattern

```typescript
// Pattern chuẩn cho mọi list page:
const [searchQuery, setSearchQuery] = useState("");
const [filterRole, setFilterRole] = useState<UserRole | "ALL">("ALL");
const [currentPage, setCurrentPage] = useState(1);
const PAGE_SIZE = 10;

// ⚠️ Reset về page 1 khi search/filter thay đổi
useEffect(() => setCurrentPage(1), [searchQuery, filterRole]);

const filtered = useMemo(() => {
  let result = rawData;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(item => 
      item.full_name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
    );
  }
  if (filterRole !== "ALL") {
    result = result.filter(item => item.role === filterRole);
  }
  return result;
}, [rawData, searchQuery, filterRole]);

const paginated = useMemo(() => {
  const start = (currentPage - 1) * PAGE_SIZE;
  return filtered.slice(start, start + PAGE_SIZE);
}, [filtered, currentPage]);
```

### 9.2 Optimistic Updates

Không cần optimistic updates vì app dùng localStorage (sync, không async). Chỉ cần:
1. Call API function
2. Reload data list
3. Show toast

### 9.3 Error Handling Pattern

```typescript
// Pattern chuẩn cho mọi async action:
const [loading, setLoading] = useState(false);

async function handleAction() {
  setLoading(true);
  try {
    await api.doSomething();
    toast.success("Thành công!");
    await loadData(); // refresh list
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi.";
    toast.error(message);
  } finally {
    setLoading(false);
  }
}
```

### 9.4 Confirm Dialog Pattern

```typescript
// Luôn dùng AppModal cho destructive actions
const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

// In JSX:
<button onClick={() => setDeleteTarget(user)}>Xóa</button>

<AppModal
  open={Boolean(deleteTarget)}
  onOpenChange={(open) => !open && setDeleteTarget(null)}
  type="confirm"
  title={`Xóa ${deleteTarget?.full_name}?`}
  primaryLabel="Xóa"
  secondaryLabel="Hủy"
  onPrimary={async () => {
    await adminUserApi.delete(deleteTarget!.user_id);
    toast.success("Đã xóa.");
    setDeleteTarget(null);
    await loadData();
  }}
>
  Hành động này không thể hoàn tác.
</AppModal>
```

### 9.5 Bulk Action Pattern

```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

// Bulk action bar (animate khi selectedIds.length > 0):
{selectedIds.length > 0 && (
  <BulkActionBar
    count={selectedIds.length}
    onDelete={() => setBulkDeleteOpen(true)}
    onClear={() => setSelectedIds([])}
  />
)}

<AppModal
  open={bulkDeleteOpen}
  onOpenChange={setBulkDeleteOpen}
  type="confirm"
  title={`Xóa ${selectedIds.length} mục?`}
  primaryLabel="Xóa tất cả"
  secondaryLabel="Hủy"
  onPrimary={async () => {
    await adminUserApi.bulkDelete(selectedIds);
    setSelectedIds([]);
    await loadData();
  }}
>
  Hành động này không thể hoàn tác.
</AppModal>
```

---

## 🚀 BƯỚC 10 — PERFORMANCE

### 10.1 Code Splitting

```typescript
// Dùng React.lazy cho từng page
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const UserListPage = lazy(() => import("@/pages/users/UserListPage"));
// ...

// Wrap Routes với Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

### 10.2 Memoization

```typescript
// Mọi filtered/computed list PHẢI dùng useMemo
const filtered = useMemo(() => { ... }, [rawData, searchQuery, filter]);

// Mọi handler trong vòng lặp PHẢI dùng useCallback
const handleDelete = useCallback((id: string) => { ... }, [loadData]);
```

### 10.3 Loading States

```typescript
// Skeleton loading cho tables:
{loading ? (
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      ...
    </TableRow>
  ))
) : (
  data.map(row => <TableRow key={row.id}>...</TableRow>)
)}
```

---

## 📝 BƯỚC 11 — CODE QUALITY

### 11.1 TypeScript Strict Rules

```json
// tsconfig.json phải có:
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 11.2 Naming Conventions (theo user FE)

```typescript
// Components: PascalCase
export function UserListPage() {}

// Hooks: camelCase, prefix "use"
export function useAdminAuthStore() {}

// API modules: camelCase, suffix "Api"
export const adminUserApi = {};

// Store: camelCase, suffix "Store"
export const useAdminAuthStore = create<...>(...)

// Types/Interfaces: PascalCase
interface DataTableProps<T> {}

// Constants: camelCase (theo user FE pattern)
const navItems = [...];
const PAGE_SIZE = 10;
```

### 11.3 Import Order

```typescript
// 1. React
import { useState, useEffect, useMemo } from "react";

// 2. Third-party
import { create } from "zustand";
import { useNavigate } from "react-router-dom";

// 3. Internal - types
import type { User, Food } from "@/types";

// 4. Internal - lib/utils
import { db, saveDb } from "@/lib/mockDb";

// 5. Internal - components
import { DataTable } from "@/components/shared/DataTable";
```

### 11.4 Error Boundaries

```tsx
// Wrap mỗi page section trong ErrorBoundary
class AdminErrorBoundary extends Component<...> {
  // Hiển thị friendly error UI khi có uncaught error
  render() {
    if (this.state.hasError) {
      return (
        <div className="grid place-items-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold">Đã xảy ra lỗi</h2>
          <Button onClick={() => this.setState({ hasError: false })}>Thử lại</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 💡 BƯỚC 12 — EXTRA FEATURES (AI TỰ ĐỀ XUẤT VÀ IMPLEMENT)

AI phải tự đề xuất và implement ÍT NHẤT 5 trong số các tính năng sau (hoặc tương đương về giá trị):

1. **Activity Log Timeline** — Hiển thị toàn bộ `family_activities` dưới dạng timeline với filter theo action_type, user, date range

2. **Quick Stats Widget** — Floating widget ở góc phải bottom khi scroll, show 3-4 KPI numbers

3. **Dark Mode Toggle** — Sử dụng `.dark` class từ styles.css (đã có dark mode tokens), persist preference vào localStorage

4. **Keyboard Shortcuts** — Ctrl+K để mở global search, Esc để đóng modal, Delete để xóa selected items

5. **Data Health Check** — Dashboard widget cảnh báo data inconsistencies: orphan records, users không có family, foods không có food_name, v.v.

6. **Print-friendly View** — `@media print` CSS cho table views, ẩn sidebar/header khi in

7. **CSV Export** — Export filtered table data ra CSV (dùng vanilla JS, không thêm library mới)

8. **Inline Edit** — Click vào cell trong table để edit trực tiếp (không cần mở form page) cho các field đơn giản như food_name, user role

9. **Notification Bell** — Admin notifications cho các events quan trọng: user mới đăng ký, food sắp hết hạn (aggregate cross-family), v.v.

10. **Activity Heatmap** — Calendar heatmap (tự implement bằng CSS grid, không dùng library) hiển thị ngày nào có nhiều activity nhất

---

## ⚠️ BƯỚC 13 — COMMON BUGS & PITFALLS

### ❌ BUG 1: Sidebar toggle không hoạt động sau collapse
**Nguyên nhân:** `overflow-hidden` trên container gây ra `pointer-events` bị block
**Fix:** Chỉ dùng `overflow-hidden` trên inner elements, không trên container chính

### ❌ BUG 2: Data không đồng bộ giữa admin và user
**Nguyên nhân:** Dùng khác DB_KEY hoặc không gọi `saveDb()` sau mutation
**Fix:** Luôn verify `DB_KEY = "nateat.db.v2"` và mọi write function đều kết thúc bằng `saveDb(state)`

### ❌ BUG 3: TypeScript error khi dùng `.find()` result
**Nguyên nhân:** `noUncheckedIndexedAccess` + `.find()` trả về `T | undefined`
**Fix:** Luôn check null: `const item = arr.find(...); if (!item) throw new Error(...);`

### ❌ BUG 4: Form reset không hoạt động khi navigate từ create sang edit
**Nguyên nhân:** React Hook Form không reset khi defaultValues thay đổi
**Fix:** Dùng `useEffect(() => { form.reset(data); }, [data]);` hoặc thêm `key={id}` vào form component

### ❌ BUG 5: Bulk selection bị xóa khi data reload
**Nguyên nhân:** `setData()` trigger re-render, selectedIds không reset
**Fix:** Filter selectedIds sau khi reload: `setSelectedIds(prev => prev.filter(id => newData.some(item => getRowId(item) === id)))`

### ❌ BUG 6: Pagination không reset khi filter thay đổi
**Nguyên nhân:** currentPage không về 1 khi searchQuery thay đổi
**Fix:** Bắt buộc `useEffect(() => setCurrentPage(1), [searchQuery, filter])` như mô tả ở mục 9.1

### ❌ BUG 7: Toast spam khi click nhanh
**Nguyên nhân:** Không disable button khi loading
**Fix:** Luôn `disabled={loading}` trên submit/action buttons

### ❌ BUG 8: Admin có thể xóa chính mình
**Nguyên nhân:** API không validate
**Fix:** Trong `adminUserApi.delete()`: `if (user_id === currentAdminId) throw new Error("Không thể tự xóa tài khoản đang sử dụng.")`

---

## ✅ CHECKLIST TRƯỚC KHI SUBMIT

Trước khi nói "done", AI phải tự verify từng mục:

### Setup
- [ ] `frontend_admin/` được khởi tạo đúng với Vite + React + TS
- [ ] `styles.css` copy nguyên xi từ `src/styles.css` (verify oklch values)
- [ ] `types/database.ts` copy nguyên xi từ `src/types/database.ts`
- [ ] `lib/mockDb.ts` dùng cùng `DB_KEY = "nateat.db.v2"`
- [ ] Path alias `@` trỏ đúng vào `./src`

### Auth
- [ ] Login chỉ cho role === "ADMIN"
- [ ] Bootstrap check session từ localStorage khi app load
- [ ] Protected routes redirect về /login nếu chưa auth
- [ ] Logout xóa session và redirect về /login

### Sidebar
- [ ] Sidebar collapse/expand hoạt động với animation smooth
- [ ] Tooltip hiển thị khi collapsed, ẩn khi expanded
- [ ] Toggle button không bị overlap bởi sidebar
- [ ] Nav items click được ở cả 2 states (collapsed + expanded)
- [ ] Active state highlight đúng theo route hiện tại

### Modules
- [ ] Dashboard: 6 KPI cards + ít nhất 2 charts
- [ ] User list: search, filter, pagination, bulk delete, toggle lock
- [ ] User form: create + edit với validation
- [ ] Food list: search, filter by category, bulk delete
- [ ] Food form: create + edit với category/unit dropdowns
- [ ] Recipe list: search, card/table view
- [ ] Recipe form: instructions list + ingredients list
- [ ] Meal list: read-only table với date filter
- [ ] Statistics: ít nhất 4 charts
- [ ] Settings: language toggle + profile edit + password change

### Data
- [ ] Mọi create/update/delete đều gọi `saveDb()`
- [ ] Types không bị thay đổi so với `src/types/database.ts`
- [ ] Không có hardcoded strings thay vì type literals

### UX
- [ ] Mọi destructive action có confirm dialog
- [ ] Toast success/error sau mỗi action
- [ ] Loading state khi fetching
- [ ] Empty state khi không có data
- [ ] Responsive: sidebar ẩn trên mobile (breakpoint md)

### Code Quality
- [ ] Không có `any` type (trừ khi không tránh được, phải comment lý do)
- [ ] Không có unused imports
- [ ] Mọi async function trong event handler đều có try/catch
- [ ] Mọi `.find()` result được guard null check

---

## 🔧 VERIFICATION COMMANDS

Sau khi build xong, chạy để verify:

```bash
cd C:\Users\KHANH\Documents\GitHub\meal-group-genius\frontend_admin

# TypeScript check (0 errors)
npx tsc --noEmit

# Dev server phải start thành công
npm run dev
```

Test flow thủ công:
1. Mở `http://localhost:5173/admin` (hoặc port dev server chỉ định)
2. Login với `admin@nateat.vn` / `Admin@123` → redirect về dashboard
3. Thử login với `user@nateat.vn` / `User@123` → phải bị từ chối
4. Mở `http://localhost:5174` (user FE) cạnh admin → thêm user mới ở admin → refresh user FE → phải thấy data mới

---

*End of claude_admin.md — Prompt version 1.0*  
*Generated from analysis of: meal-group-genius user frontend (src/)*
