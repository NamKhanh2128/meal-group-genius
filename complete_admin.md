# Hướng Dẫn Hoàn Thiện Phân Hệ Bảng Quản Trị (frontend_admin)

Tài liệu này đóng vai trò là bản đặc tả kỹ thuật và kế hoạch phát triển chi tiết nhằm giải quyết các lỗ hổng nghiệp vụ, lỗi dữ liệu mồ côi và tích hợp các tính năng còn thiếu trong hệ thống quản trị `frontend_admin` dựa trên kết quả phân tích đối sánh tại [compare.md](file://c:/Users/KHANH/Documents/GitHub/meal-group-genius/compare.md).

---

## 1. KHẮC PHỤC CÁC LỖI NGHIỆP VỤ (BUSINESS LOGIC BUGS)

### 1.1. Lỗi Xóa Tài Khoản Người Dùng Chủ Nhóm (Orphaned Family Creator)
* **Tệp cần sửa**: [adminUserApi.ts](file:///c:/Users/KHANH/Documents/GitHub/meal-group-genius/frontend_admin/src/api/adminUserApi.ts)
* **Yêu cầu**: Khi xóa một User là `created_by` của nhóm gia đình, chúng ta cần xóa cascade nhóm gia đình đó cùng toàn bộ các bảng liên đới khác để tránh dữ liệu mồ côi làm crash frontend của User khác.
* **Mã nguồn đề xuất**:
```typescript
// Sửa hàm delete và bulkDelete trong adminUserApi.ts để tích hợp cascade clean tương tự như adminFamilyApi.delete:
async delete(user_id: string): Promise<void> {
  const session = getSession();
  if (session?.user_id === user_id) {
    throw new Error("Không thể tự xóa tài khoản quản trị đang đăng nhập.");
  }

  const state = await db();
  const index = state.users.findIndex((u) => u.user_id === user_id);
  if (index < 0) throw new Error("Không tìm thấy người dùng.");

  // Tìm các gia đình do user này tạo ra
  const creatorFamilies = state.families.filter((f) => f.created_by === user_id);
  
  // Xóa user
  state.users.splice(index, 1);
  state.family_members = state.family_members.filter((fm) => fm.user_id !== user_id);

  // Thực hiện cascade delete cho mỗi gia đình bị ảnh hưởng
  creatorFamilies.forEach((fam) => {
    const family_id = fam.family_id;
    state.families = state.families.filter((f) => f.family_id !== family_id);
    state.family_members = state.family_members.filter((fm) => fm.family_id !== family_id);
    state.fridge_items = state.fridge_items.filter((item) => item.family_id !== family_id);
    state.shopping_lists = state.shopping_lists.filter((l) => l.family_id !== family_id);
    state.meal_plans = state.meal_plans.filter((mp) => mp.family_id !== family_id);
    state.family_activities = state.family_activities.filter((act) => act.family_id !== family_id);
  });
  
  // Dọn dẹp lại các mặt hàng đi chợ không thuộc danh sách nào
  state.shopping_list_items = state.shopping_list_items.filter((item) => {
    return state.shopping_lists.some((l) => l.shopping_list_id === item.shopping_list_id);
  });

  saveDb(state);
}
```

### 1.2. Ràng Buộc Khi Xóa Thực Phẩm Chuẩn (Orphaned Recipe Ingredients)
* **Tệp cần sửa**: [adminFoodApi.ts](file:///c:/Users/KHANH/Documents/GitHub/meal-group-genius/frontend_admin/src/api/adminFoodApi.ts)
* **Yêu cầu**: Không cho phép xóa thực phẩm chuẩn nếu nó đang là nguyên liệu của bất kỳ công thức nấu ăn nào.
* **Mã nguồn đề xuất**:
```typescript
async delete(food_id: string): Promise<void> {
  const state = await db();
  const index = state.foods.findIndex((f) => f.food_id === food_id);
  if (index < 0) throw new Error("Không tìm thấy thực phẩm.");

  // Kiểm tra xem thực phẩm có nằm trong công thức nào không
  const boundRecipes = state.recipes.filter((r) => 
    state.recipe_ingredients.some((ri) => ri.recipe_id === r.recipe_id && ri.food_id === food_id)
  );

  if (boundRecipes.length > 0) {
    const recipeNames = boundRecipes.map((r) => `"${r.recipe_name}"`).join(", ");
    throw new Error(`Không thể xóa thực phẩm này vì đang cấu thành công thức: ${recipeNames}. Vui lòng chỉnh sửa các công thức này trước.`);
  }

  state.foods.splice(index, 1);
  state.fridge_items = state.fridge_items.filter((fi) => fi.food_id !== food_id);
  state.shopping_list_items = state.shopping_list_items.filter((sli) => sli.food_id !== food_id);

  saveDb(state);
}
```

---

## 2. BỔ SUNG CÁC TRANG QUẢN TRỊ VÀ API MỚI

Để Admin kiểm soát 100% dữ liệu User tạo ra, chúng ta cần triển khai 3 trang quản lý mới:

### 2.1. Quản Lý Danh Sách Đi Chợ (`/shopping-lists`)
* **Tệp API bổ sung**: [adminShoppingApi.ts](file:///c:/Users/KHANH/Documents/GitHub/meal-group-genius/frontend_admin/src/api/adminShoppingApi.ts) (Thêm hàm `delete`)
```typescript
async delete(shopping_list_id: string): Promise<void> {
  const state = await db();
  state.shopping_lists = state.shopping_lists.filter((l) => l.shopping_list_id !== shopping_list_id);
  state.shopping_list_items = state.shopping_list_items.filter((item) => item.shopping_list_id !== shopping_list_id);
  saveDb(state);
}
```
* **Trang Giao diện mới**: `ShoppingListPage.tsx`
  - Hiển thị danh sách các đợt đi chợ chuẩn kèm tên gia đình, ngày đi và trạng thái.
  - Tích hợp một Dialog xem nhanh chi tiết các mặt hàng đi chợ (tên sản phẩm, số lượng yêu cầu, số lượng đã mua thực tế, trạng thái hoàn thành).
  - Tích hợp nút xóa danh sách đi chợ bị lỗi hoặc rác.

### 2.2. Quản Lý Tủ Lạnh Hộ Gia Đình (`/inventories`)
* **Tệp API mới**: `adminInventoryApi.ts`
  - Hàm `list()`: Đọc toàn bộ thực phẩm tủ lạnh từ `state.fridge_items`, ánh xạ thông tin thực phẩm từ `state.foods` và tên gia đình từ `state.families`.
  - Hàm `update(fridge_item_id, quantity, expiry_date, location)`: Sửa đổi trực tiếp dữ liệu tủ lạnh.
  - Hàm `delete(fridge_item_id)`: Hủy bỏ thực phẩm bị hỏng/lỗi khỏi tủ lạnh.
* **Trang Giao diện mới**: `InventoryListPage.tsx`
  - Cho phép Admin xem, sửa và xóa thực phẩm tồn kho của từng gia đình để hỗ trợ xử lý khiếu nại hoặc kiểm tra lỗi lãng phí thực tế.

### 2.3. Nhật Ký Hoạt Động Kiểm Toán Hệ Thống (`/activities`)
* **Tệp API mới**: `adminActivityApi.ts`
  - Hàm `list()`: Đọc toàn bộ `state.family_activities` và ánh xạ tên người dùng từ `state.users`.
* **Trang Giao diện mới**: `ActivityLogPage.tsx`
  - Hỗ trợ xem nhật ký đầy đủ (phân trang, lọc theo loại hành động: Tủ lạnh, Mua sắm, Nấu ăn, Gia đình).

---

## 3. TÍCH HỢP HỆ THỐNG ĐỊNH TUYẾN & MENU BẢN DỊCH

### 3.1. Đăng ký Định Tuyến trong `AdminRouter.tsx`
Khai báo 3 trang mới sử dụng `lazy` import và bọc trong Protected Route của Admin:
```typescript
const ShoppingListPage = lazy(() => import("@/pages/shopping/ShoppingListPage").then((m) => ({ default: m.ShoppingListPage })));
const InventoryListPage = lazy(() => import("@/pages/inventories/InventoryListPage").then((m) => ({ default: m.InventoryListPage })));
const ActivityLogPage = lazy(() => import("@/pages/activities/ActivityLogPage").then((m) => ({ default: m.ActivityLogPage })));

// Thêm các Route tương ứng trong <Route element={<AdminProtectedRoute />}>
<Route path="/shopping-lists" element={<AdminErrorBoundary><Suspense fallback={<PageLoader />}><ShoppingListPage /></Suspense></AdminErrorBoundary>} />
<Route path="/inventories" element={<AdminErrorBoundary><Suspense fallback={<PageLoader />}><InventoryListPage /></Suspense></AdminErrorBoundary>} />
<Route path="/activities" element={<AdminErrorBoundary><Suspense fallback={<PageLoader />}><ActivityLogPage /></Suspense></AdminErrorBoundary>} />
```

### 3.2. Cập Nhật Menu trong `AdminHeader.tsx`
Thêm các mục điều hướng vào mảng `navItems` để hiển thị icon tương ứng trên thanh bar trung tâm:
```typescript
import { ShoppingBag, Refrigerator, Activity } from "lucide-react";

const navItems = [
  // ... các mục cũ
  { to: "/shopping-lists", labelKey: "adminShoppingLists", icon: ShoppingBag },
  { to: "/inventories", labelKey: "adminInventories", icon: Refrigerator },
  { to: "/activities", labelKey: "adminActivities", icon: Activity },
];
```

### 3.3. Cấu Hình Bản Dịch trong `i18n.ts`
Thêm các key dịch thuật tương ứng cho tiếng Việt và tiếng Anh:
* **vi**:
  - `adminShoppingLists`: "Danh sách đi chợ"
  - `adminInventories`: "Tủ lạnh gia đình"
  - `adminActivities`: "Nhật ký kiểm toán"
* **en**:
  - `adminShoppingLists`: "Shopping Lists"
  - `adminInventories`: "Family Fridges"
  - `adminActivities`: "Audit Logs"
