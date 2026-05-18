import { storage, uid } from "@/utils/storage";
import type { User, FamilyGroup, FoodItem, ShoppingList, Recipe, MealPlanItem, FeedItem } from "@/types";
import phoImg from "@/assets/meal-pho.jpg";
import riceImg from "@/assets/meal-rice.jpg";
import soupImg from "@/assets/meal-soup.jpg";
import heroImg from "@/assets/hero-dish.jpg";

const today = () => new Date().toISOString();
const daysFromNow = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export function seedIfEmpty() {
  if (storage.get("seeded", false)) return;

  const familyId = "fam-1";
  const userId = "user-1";

  const users: User[] = [
    { id: userId, email: "user@nateat.vn", name: "Người dùng", role: "user", familyId, status: "active", createdAt: today() },
    { id: "user-2", email: "nam@nateat.vn", name: "Nam", role: "user", familyId, status: "active", createdAt: today() },
    { id: "user-3", email: "hung@nateat.vn", name: "Hùng", role: "user", familyId, status: "active", createdAt: today() },
    { id: "user-4", email: "thanh@nateat.vn", name: "Thành", role: "user", familyId, status: "active", createdAt: today() },
    { id: "admin-1", email: "admin@nateat.vn", name: "Quản trị viên", role: "admin", status: "active", createdAt: today() },
  ];

  const families: FamilyGroup[] = [{
    id: familyId,
    name: "Gia đình NATEAT",
    ownerId: userId,
    members: [
      { userId, name: "Người dùng", role: "owner", joinedAt: today() },
      { userId: "user-2", name: "Nam", role: "member", joinedAt: today() },
      { userId: "user-3", name: "Hùng", role: "member", joinedAt: today() },
      { userId: "user-4", name: "Thành", role: "member", joinedAt: today() },
    ],
    createdAt: today(),
  }];

  const fridge: FoodItem[] = [
    { id: uid(), familyId, name: "Thịt bò", quantity: 500, unit: "g", category: "Thịt cá", location: "Ngăn mát", expiryDate: daysFromNow(2), createdAt: today(), icon: "🥩" },
    { id: uid(), familyId, name: "Cà chua", quantity: 6, unit: "quả", category: "Rau củ", location: "Ngăn mát", expiryDate: daysFromNow(5), createdAt: today(), icon: "🍅" },
    { id: uid(), familyId, name: "Hành tây", quantity: 2, unit: "củ", category: "Rau củ", location: "Kệ thường", expiryDate: daysFromNow(10), createdAt: today(), icon: "🧅" },
    { id: uid(), familyId, name: "Tỏi", quantity: 1, unit: "gói", category: "Gia vị", location: "Kệ thường", expiryDate: daysFromNow(30), createdAt: today(), icon: "🧄" },
    { id: uid(), familyId, name: "Sữa tươi", quantity: 1, unit: "lít", category: "Sữa & Trứng", location: "Ngăn mát", expiryDate: daysFromNow(4), createdAt: today(), icon: "🥛" },
    { id: uid(), familyId, name: "Trứng gà", quantity: 10, unit: "quả", category: "Sữa & Trứng", location: "Ngăn mát", expiryDate: daysFromNow(14), createdAt: today(), icon: "🥚" },
    { id: uid(), familyId, name: "Cá lóc", quantity: 1, unit: "kg", category: "Thịt cá", location: "Ngăn đông", expiryDate: daysFromNow(20), createdAt: today(), icon: "🐟" },
    { id: uid(), familyId, name: "Phở khô", quantity: 1, unit: "gói", category: "Đồ khô", location: "Kệ thường", expiryDate: daysFromNow(60), createdAt: today(), icon: "🍜" },
    { id: uid(), familyId, name: "Nước mắm", quantity: 1, unit: "lít", category: "Gia vị", location: "Kệ thường", expiryDate: daysFromNow(180), createdAt: today(), icon: "🧂" },
    { id: uid(), familyId, name: "Đậu phụ", quantity: 4, unit: "miếng", category: "Đồ khô", location: "Ngăn mát", expiryDate: daysFromNow(3), createdAt: today(), icon: "🟨" },
    { id: uid(), familyId, name: "Rau muống", quantity: 1, unit: "gói", category: "Rau củ", location: "Ngăn mát", expiryDate: daysFromNow(2), createdAt: today(), icon: "🥬" },
    { id: uid(), familyId, name: "Gạo", quantity: 5, unit: "kg", category: "Đồ khô", location: "Kệ thường", expiryDate: daysFromNow(120), createdAt: today(), icon: "🌾" },
  ];

  const recipes: Recipe[] = [
    {
      id: "rec-1", name: "Cơm bò lúc lắc", image: heroImg, timeMinutes: 20, calories: 450, difficulty: "Dễ làm",
      description: "Bò xào lúc lắc kiểu Việt với cà chua, hành tây thơm lừng.",
      ingredients: [
        { name: "Thịt bò", quantity: 300, unit: "g" },
        { name: "Cà chua", quantity: 2, unit: "quả" },
        { name: "Hành tây", quantity: 1, unit: "củ" },
        { name: "Tỏi", quantity: 1, unit: "gói" },
        { name: "Ớt sừng", quantity: 1, unit: "quả" },
        { name: "Nước tương", quantity: 50, unit: "ml" },
      ],
      steps: ["Ướp bò với tỏi, tiêu, nước tương 10 phút.", "Phi tỏi thơm, xào bò lửa lớn.", "Cho cà chua, hành tây vào đảo nhanh.", "Nêm gia vị, dọn cùng cơm nóng."],
    },
    {
      id: "rec-2", name: "Phở bò tái", image: phoImg, timeMinutes: 40, calories: 520, difficulty: "Trung bình",
      description: "Phở bò truyền thống nước dùng trong, thịt bò tái mềm.",
      ingredients: [{ name: "Phở khô", quantity: 1, unit: "gói" }, { name: "Thịt bò", quantity: 200, unit: "g" }, { name: "Hành tây", quantity: 1, unit: "củ" }],
      steps: ["Nấu nước dùng.", "Trụng phở.", "Bày bò tái lên trên, chan nước."],
    },
    {
      id: "rec-3", name: "Canh chua cá lóc", image: soupImg, timeMinutes: 30, calories: 320, difficulty: "Dễ làm",
      description: "Canh chua miền Nam với cá lóc tươi.",
      ingredients: [{ name: "Cá lóc", quantity: 1, unit: "kg" }, { name: "Cà chua", quantity: 2, unit: "quả" }],
      steps: ["Sơ chế cá.", "Nấu canh chua.", "Nêm vừa ăn."],
    },
    {
      id: "rec-4", name: "Cơm rang dưa bò", image: riceImg, timeMinutes: 25, calories: 480, difficulty: "Dễ làm",
      description: "Cơm rang với dưa cải chua và thịt bò.",
      ingredients: [{ name: "Gạo", quantity: 200, unit: "g" }, { name: "Thịt bò", quantity: 150, unit: "g" }],
      steps: ["Rang cơm.", "Cho dưa và bò vào xào.", "Nêm vừa ăn."],
    },
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const meals: MealPlanItem[] = [
    { id: uid(), familyId, date: todayStr, slot: "Sáng", recipeId: "rec-2", recipeName: "Phở bò tái", image: phoImg, status: "Đã xong", servings: 4 },
    { id: uid(), familyId, date: todayStr, slot: "Trưa", recipeId: "rec-4", recipeName: "Cơm rang dưa bò", image: riceImg, status: "Đang nấu", servings: 4, time: "11:30" },
    { id: uid(), familyId, date: todayStr, slot: "Tối", recipeId: "rec-3", recipeName: "Canh chua cá lóc", image: soupImg, status: "Kế hoạch", servings: 4, time: "18:00" },
  ];

  const shopping: ShoppingList[] = [{
    id: "list-1", familyId, title: "Chợ cuối tuần", type: "weekly",
    planDate: todayStr, status: "DRAFT", completed: false, createdAt: today(), createdBy: userId,
    items: [
      { id: uid(), name: "Cà chua bi", quantity: 500, unit: "g", category: "Rau củ", bought: true },
      { id: uid(), name: "Hành tây", quantity: 2, unit: "củ", category: "Rau củ", bought: true },
      { id: uid(), name: "Cá lóc tươi", quantity: 1, unit: "kg", category: "Thịt cá", bought: false },
      { id: uid(), name: "Đậu phụ", quantity: 4, unit: "miếng", category: "Đồ khô", bought: false },
      { id: uid(), name: "Nước mắm Phú Quốc", quantity: 1, unit: "lít", category: "Gia vị", bought: false },
      { id: uid(), name: "Ớt sừng", quantity: 100, unit: "g", category: "Gia vị", bought: false },
      { id: uid(), name: "Nước tương", quantity: 1, unit: "lít", category: "Gia vị", bought: false },
      { id: uid(), name: "Rau thơm", quantity: 1, unit: "gói", category: "Rau củ", bought: false },
      { id: uid(), name: "Chanh", quantity: 5, unit: "quả", category: "Rau củ", bought: false },
    ],
  }];

  const feed: FeedItem[] = [
    { id: uid(), familyId, userId: "user-2", userName: "Nam", kind: "shopping", message: 'thêm "Cà chua, Thịt bò" vào danh sách mua sắm', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: uid(), familyId, userId: "user-3", userName: "Hùng", kind: "fridge", message: 'cập nhật tủ lạnh: "Sữa tươi hết hạn 10/05"', createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: uid(), familyId, userId: "user-4", userName: "Thành", kind: "meal", message: 'lên thực đơn "Bữa tối thứ 6"', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: uid(), familyId, userId: "user-3", userName: "Hùng", kind: "complete", message: "đánh dấu mua xong 3 mục trong danh sách", createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
  ];

  storage.set("users", users);
  storage.set("families", families);
  storage.set("fridge", fridge);
  storage.set("recipes", recipes);
  storage.set("meals", meals);
  storage.set("shopping", shopping);
  storage.set("feed", feed);
  storage.set("seeded", true);
}
