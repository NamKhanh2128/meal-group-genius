# CLAUDE.md — FRONTEND FLOW SPECIFICATION

## Hệ thống “Đi Chợ Tiện Lợi”

### Frontend UX/UI Flow Full Detail

Dựa trên:

* SRS hệ thống Đi Chợ Tiện Lợi 
* Activity Flow:

  * Quản lý tủ lạnh
  * Gợi ý món ăn
  * Lập kế hoạch bữa ăn
  * Quản lý danh sách mua sắm

---

# 1. TỔNG QUAN FRONTEND ARCHITECTURE

## 1.1 App Structure

```txt
App
├── Auth
│   ├── Login
│   ├── Register
│   └── Forgot Password
│
├── Main Layout
│   ├── Sidebar
│   ├── Topbar
│   ├── Notification Center
│   └── Main Content
│
├── Dashboard
│
├── Refrigerator Management
│
├── Meal Planning
│
├── Recipe Suggestion
│
├── Shopping List
│
├── Family Group
│
├── Notifications
│
├── Profile
│
└── Settings
```

---

# 2. GLOBAL UI/UX RULES

## 2.1 Loading Rules

Mọi API call phải có:

* Skeleton loading
* Loading spinner
* Disabled buttons
* Retry mechanism

Ví dụ:

```txt
Button "Lưu"
→ loading state
→ spinner
→ disabled
```

---

## 2.2 Toast Rules

### Success

```txt
"Thêm thực phẩm thành công"
"Kế hoạch bữa ăn đã lưu"
"Cập nhật tồn kho thành công"
```

### Error

```txt
"Không thể kết nối máy chủ"
"Dữ liệu không hợp lệ"
"Vui lòng nhập đầy đủ thông tin"
```

### Warning

```txt
"Nguyên liệu sắp hết hạn"
"Bạn chưa lưu thay đổi"
```

---

## 2.3 Confirm Dialog Rules

Các hành động nguy hiểm:

* Xóa
* Hủy
* Reset
* Ghi đè kế hoạch

PHẢI có modal xác nhận.

Ví dụ:

```txt
Bạn có chắc muốn xóa thực phẩm này?
[Hủy]
[Xóa]
```

---

# 3. AUTH FLOW

---

# 3.1 LOGIN PAGE

## Route

```txt
/auth/login
```

---

## Components

### Left Section

* Branding
* App illustration
* Intro text

### Right Section

Login form.

---

## Inputs

| Field    | Type     |
| -------- | -------- |
| Email    | text     |
| Password | password |

---

## Buttons

### Đăng nhập

Action:

```txt
POST /auth/login
```

---

### Quên mật khẩu

Navigate:

```txt
/auth/forgot-password
```

---

### Đăng ký

Navigate:

```txt
/auth/register
```

---

## Validation

### Email empty

```txt
"Vui lòng nhập email"
```

### Invalid email

```txt
"Email không hợp lệ"
```

### Password empty

```txt
"Vui lòng nhập mật khẩu"
```

---

## Error Popup

### Wrong credentials

Modal:

```txt
Email hoặc mật khẩu không đúng
```

---

### Account locked

```txt
Tài khoản đã bị khóa do đăng nhập sai nhiều lần
```

---

## Success Flow

```txt
Login success
→ Save JWT
→ Fetch profile
→ Redirect dashboard
```

---

# 3.2 REGISTER PAGE

## Inputs

| Field            | Validation      |
| ---------------- | --------------- |
| Full Name        | required        |
| Email            | valid email     |
| Password         | strong password |
| Confirm Password | match password  |
| Phone            | optional        |

---

## Password Rules UI

Live checklist:

```txt
✓ 8 ký tự
✓ Có chữ hoa
✓ Có số
✓ Có ký tự đặc biệt
```

---

## Register Success Popup

```txt
Đăng ký thành công
[Về đăng nhập]
```

---

# 4. MAIN APP LAYOUT

---

# 4.1 SIDEBAR

## Menu Items

```txt
Dashboard
Tủ lạnh
Kế hoạch bữa ăn
Gợi ý món ăn
Danh sách mua sắm
Nhóm gia đình
Thông báo
Cá nhân
Cài đặt
```

---

# 4.2 TOPBAR

## Components

### Search

Global quick search:

* thực phẩm
* công thức
* món ăn

---

### Notifications

Bell icon.

Dropdown:

* sắp hết hạn
* tới giờ nấu ăn
* được giao nhiệm vụ mua hàng

---

### Profile Menu

Options:

```txt
Thông tin cá nhân
Đổi mật khẩu
Đăng xuất
```

---

# 5. DASHBOARD FLOW

---

# 5.1 DASHBOARD OVERVIEW

## Widgets

### Tồn kho tủ lạnh

* Tổng số thực phẩm
* Sắp hết hạn
* Hết hạn

---

### Kế hoạch hôm nay

* Breakfast
* Lunch
* Dinner

---

### Danh sách mua sắm gần nhất

---

### Gợi ý món ăn nhanh

Card carousel.

---

### Thống kê

* Thực phẩm dùng nhiều
* Lãng phí
* Món ăn phổ biến

---

# 6. REFRIGERATOR MANAGEMENT FLOW

(SRS UC003 + activity flow)

---

# 6.1 REFRIGERATOR PAGE

## Route

```txt
/refrigerator
```

---

# 6.2 PAGE LAYOUT

## Header

### Search Bar

Placeholder:

```txt
Tìm thực phẩm...
```

---

### Filter Button

Opens filter drawer.

---

### Add Food Button

```txt
+ Thêm thực phẩm
```

---

# 6.3 FILTER DRAWER

## Filters

| Filter         | Type   |
| -------------- | ------ |
| Danh mục       | select |
| Sắp hết hạn    | toggle |
| Hết hạn        | toggle |
| Vị trí lưu trữ | select |

---

## Buttons

### Reset Filter

### Apply Filter

---

# 6.4 FOOD LIST UI

Card/Table switchable.

---

## Food Card

Displays:

* Tên
* Số lượng
* Đơn vị
* HSD
* Danh mục
* Vị trí

---

## Card Actions

### Edit

### Delete

### Use Ingredient

---

# 6.5 ADD FOOD MODAL

## Open Trigger

```txt
+ Thêm thực phẩm
```

---

## Fields

| Field    | Required |
| -------- | -------- |
| Tên      | yes      |
| Số lượng | yes      |
| Đơn vị   | yes      |
| HSD      | yes      |
| Danh mục | yes      |
| Vị trí   | no       |

---

## Buttons

### Save

### Cancel

---

## Validation Errors

### Invalid expiry date

```txt
Ngày hết hạn không hợp lệ
```

### Quantity <= 0

```txt
Số lượng phải lớn hơn 0
```

---

## Success Flow

```txt
Save
→ optimistic update
→ refresh inventory
→ toast success
```

---

# 6.6 EDIT FOOD FLOW

## Open

Click pencil icon.

---

## Modal

Pre-filled form.

---

## Buttons

### Save Changes

### Cancel

---

## Unsaved Changes Popup

```txt
Bạn có muốn bỏ thay đổi?
```

---

# 6.7 DELETE FOOD FLOW

## Click Trash Icon

Opens confirm modal.

---

## Modal

```txt
Bạn có chắc muốn xóa thực phẩm này?
```

Buttons:

```txt
[Hủy]
[Xóa]
```

---

# 6.8 EXPIRY WARNING FLOW

## Auto Highlight

### < 3 days

Yellow border.

### expired

Red border.

---

## Notification

```txt
"Sữa tươi sẽ hết hạn sau 2 ngày"
```

---

# 7. SHOPPING LIST FLOW

(Activity flow + UC004)

---

# 7.1 SHOPPING LIST PAGE

## Route

```txt
/shopping-list
```

---

# 7.2 LIST OVERVIEW

Tabs:

```txt
Đang mua
Hoàn thành
Được giao
```

---

## Create List Button

```txt
+ Tạo danh sách
```

---

# 7.3 CREATE SHOPPING LIST MODAL

## Step 1

Choose type:

```txt
Theo ngày
Theo tuần
```

Buttons:

```txt
Tiếp tục
Hủy
```

---

## Step 2

Add items.

---

## Item Row

Fields:

| Field         | Type         |
| ------------- | ------------ |
| Tên thực phẩm | autocomplete |
| Quantity      | number       |
| Unit          | select       |
| Category      | select       |

---

## Row Actions

### Add Row

### Delete Row

---

## Validation

If empty:

```txt
Danh sách phải có ít nhất 1 mặt hàng
```

---

# 7.4 SAVE SHOPPING LIST FLOW

```txt
Save
→ check family group
→ if group exists
→ open assignment modal
```

---

# 7.5 ASSIGNMENT MODAL

## Displays

Family members.

---

## Actions

### Assign buyer

### Skip

---

## Buttons

```txt
Chia sẻ
Bỏ qua
```

---

# 7.6 SHOPPING LIST DETAIL PAGE

## Features

### Mark Purchased

Checkbox.

---

### Edit Quantity

Inline edit.

---

### Delete Item

Trash icon.

---

### Add Missing Ingredients From Meal Plan

Smart CTA.

---

# 7.7 COMPLETE FLOW

## When all checked

Popup:

```txt
Đã mua hết?
```

Buttons:

```txt
[Chưa]
[Hoàn tất]
```

---

## Success

```txt
Update refrigerator inventory
→ move to completed tab
```

---

# 8. RECIPE SUGGESTION FLOW

(Activity Flow UC006)

---

# 8.1 RECIPE SUGGESTION PAGE

## Route

```txt
/recipe-suggestion
```

---

# 8.2 INITIAL STATE

CTA Button:

```txt
Gợi ý món ăn từ tủ lạnh
```

---

# 8.3 SYSTEM FLOW

```txt
Check ingredients
→ find recipes
→ rank by match score
```

---

# 8.4 RECIPE RESULT UI

## Recipe Card

Displays:

* image
* name
* cooking time
* missing ingredients count
* nutrition
* match percentage

---

## Actions

### Xem công thức

### Thêm vào kế hoạch bữa ăn

### Lưu yêu thích

---

# 8.5 EMPTY RESULT FLOW

Illustration + message:

```txt
Không tìm thấy món ăn phù hợp
```

Buttons:

```txt
Xem gợi ý mua thêm
Thử lại
```

---

# 8.6 RECIPE DETAIL MODAL

Sections:

```txt
Thông tin món
Nguyên liệu
Hướng dẫn
Dinh dưỡng
```

---

## Ingredient Status

### Available

Green check.

### Missing

Red indicator.

---

## Buttons

### Nấu món này

### Thêm vào meal plan

### Thêm nguyên liệu thiếu vào shopping list

---

# 8.7 COOKING CONFIRM FLOW

After cooking:

Popup:

```txt
Bạn đã nấu món này?
```

---

## Ingredient Consumption Editor

Adjust used quantity.

---

## Buttons

```txt
Xác nhận sử dụng
Hủy
```

---

## Success

```txt
Update refrigerator inventory
```

---

# 9. MEAL PLANNING FLOW

(Activity Flow UC005)

---

# 9.1 MEAL PLANNER PAGE

## Route

```txt
/meal-planner
```

---

# 9.2 MAIN LAYOUT

## Top Toolbar

### Previous Week

### Next Week

### Today

### View Mode

```txt
Theo ngày
Theo tuần
```

---

### Generate AI Plan

Primary CTA.

---

# 9.3 WEEK CALENDAR VIEW

## Grid

| Day | Breakfast | Lunch | Dinner | Snack |

---

## Meal Slot

Displays:

* meal count
* calories
* recipe preview

---

## Meal Slot Actions

### Add meal

### Replace meal

### Delete meal

### Move drag/drop

### View detail

---

# 9.4 GENERATE PLAN FLOW

## Modal

Choose:

* calories goal
* dietary preference
* disliked ingredients
* budget level

---

## Generate Button

```txt
Tạo kế hoạch
```

---

## AI Loading Screen

Animated states:

```txt
Đang kiểm tra nguyên liệu...
Đang xây dựng thực đơn...
Đang tối ưu dinh dưỡng...
```

---

# 9.5 GENERATED PLAN UI

## Each Meal Cell

Displays:

* thumbnail
* recipe name
* prep time
* ingredients status

---

## Top Summary

### Total calories

### Missing ingredients

### Estimated budget

---

# 9.6 CUSTOMIZE PLAN FLOW

## Actions

### Replace Dish

Open recipe picker.

---

### Add Meal

Popup meal selector.

---

### Delete Meal

Confirm modal.

---

### Favorite Recipes

Side drawer.

---

# 9.7 REPLACE DISH MODAL

## Features

* Search recipes
* Filter cuisine
* Filter time
* Filter calories

---

## Recipe Actions

### Select

### Preview

---

# 9.8 INGREDIENT CHECK FLOW

After confirm plan:

```txt
Check refrigerator inventory
→ compare ingredients
```

---

## If Missing Ingredients

Open popup:

```txt
Có 8 nguyên liệu còn thiếu
```

Buttons:

```txt
Xem danh sách
Tạo shopping list
Bỏ qua
```

---

# 9.9 SHOPPING LIST AUTO GENERATION

## Modal

Grouped by category:

* Rau củ
* Thịt cá
* Gia vị

---

## Buttons

### Confirm Add

### Edit List

### Cancel

---

# 9.10 SAVE MEAL PLAN FLOW

## Buttons

### Save Plan

### Save Draft

### Discard

---

## Success Flow

```txt
Save calendar
→ create notifications
→ sync dashboard
```

---

# 10. FAMILY GROUP FLOW

---

# 10.1 FAMILY PAGE

## Features

* Create group
* Invite member
* Remove member
* Leave group

---

# 10.2 INVITE FLOW

## Modal

Input:

```txt
Email thành viên
```

---

## Buttons

### Send Invite

### Cancel

---

# 10.3 MEMBER CARD

Displays:

* avatar
* role
* assigned tasks

---

# 11. NOTIFICATION FLOW

---

# 11.1 Notification Types

## Expiry Warning

```txt
"Trứng sắp hết hạn"
```

---

## Meal Reminder

```txt
"Đã đến giờ nấu bữa tối"
```

---

## Shopping Assignment

```txt
"Bạn được giao mua Rau cải"
```

---

# 11.2 Notification Center

Actions:

### Mark read

### Delete

### Open related item

---

# 12. PROFILE FLOW

---

# 12.1 PROFILE PAGE

Sections:

```txt
Thông tin cá nhân
Bảo mật
Cài đặt thông báo
```

---

## Change Password Flow

Fields:

* current password
* new password
* confirm password

---

## Validation

```txt
Mật khẩu mới không đủ mạnh
```

---

# 13. GLOBAL POPUPS

---

# 13.1 NETWORK ERROR

```txt
Không thể kết nối máy chủ
[Vui lòng thử lại]
```

---

# 13.2 SESSION EXPIRED

```txt
Phiên đăng nhập đã hết hạn
[Đăng nhập lại]
```

---

# 13.3 UNSAVED CHANGES

```txt
Bạn có muốn lưu thay đổi trước khi thoát?
[Lưu]
[Bỏ qua]
[Hủy]
```

---

# 14. MOBILE RESPONSIVE RULES

---

# 14.1 Mobile Navigation

Bottom navigation:

```txt
Trang chủ
Tủ lạnh
Meal Plan
Shopping
Profile
```

---

# 14.2 Mobile Meal Planner

Calendar becomes:

```txt
Accordion day cards
```

---

# 14.3 Floating Action Button

FAB:

```txt
+ quick add
```

Actions:

* add food
* add shopping item
* add meal

---

# 15. FRONTEND STATE MANAGEMENT

---

# 15.1 Global Stores

```txt
authStore
userStore
refrigeratorStore
mealPlanStore
recipeStore
shoppingStore
notificationStore
familyStore
```

---

# 15.2 Cache Strategy

Use:

```txt
React Query / TanStack Query
```

Rules:

* stale time
* optimistic update
* background refetch

---

# 16. API LOADING/ERROR STANDARD

---

# 16.1 Query States

Every page must support:

```txt
loading
empty
error
success
refetching
```

---

# 16.2 Empty States

Example:

```txt
Tủ lạnh của bạn đang trống
[+ Thêm thực phẩm]
```

---

# 17. UI DESIGN SYSTEM

---

# 17.1 Colors

```txt
Primary: Green
Warning: Orange
Danger: Red
Success: Emerald
Background: Neutral light
```

---

# 17.2 Components

Must standardize:

* Modal
* Drawer
* Toast
* Input
* Button
* Table
* Card
* Calendar
* Multi-select
* Combobox

---

# 18. ADVANCED UX REQUIREMENTS

---

# 18.1 Smart Suggestions

System should suggest:

* món tận dụng đồ sắp hết hạn
* món theo thời tiết
* món theo lịch sử ăn

---

# 18.2 Drag & Drop

Meal planner supports:

```txt
drag meal between days
```

---

# 18.3 Inline Editing

Shopping list + refrigerator:

```txt
edit without modal
```

---

# 19. FRONTEND ROUTING MAP

```txt
/
├── /login
├── /register
├── /dashboard
├── /refrigerator
├── /shopping-list
├── /shopping-list/:id
├── /meal-planner
├── /recipe-suggestion
├── /family
├── /notifications
├── /profile
└── /settings
```

---

# 20. FINAL UX PRINCIPLES

Frontend MUST:

* tối thiểu click
* mobile-first
* thao tác nhanh
* optimistic update
* hạn chế popup dư thừa
* focus vào meal planning + refrigerator synergy
* shopping list auto-generated from meal plans
* AI suggestions integrated directly into planning flow
* mọi action đều realtime update UI

---

# 21. IMPORTANT IMPLEMENTATION NOTE

Meal Planning là trung tâm hệ thống.

Flow chuẩn:

```txt
Tủ lạnh
→ AI gợi ý món
→ Meal planning
→ Generate missing ingredients
→ Shopping list
→ Mua hàng
→ Update refrigerator
→ Continue cycle
```

Toàn bộ frontend phải xoay quanh vòng lặp UX này.
