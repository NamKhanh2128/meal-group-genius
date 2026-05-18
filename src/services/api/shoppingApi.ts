import { endpoints } from "@/services/endpoints";
import type { Food, ShoppingList, ShoppingListItem, ShoppingType } from "@/types";
import { addDaysIso } from "@/utils/date";
import { uid } from "@/utils/storage";
import { addActivity, db, getSession, saveDb } from "./mockDb";

export type ShoppingListDetail = ShoppingList & { items: Array<ShoppingListItem & { food: Food }> };

export const shoppingApi = {
  endpoint: endpoints.shopping,
  async list(family_id: string): Promise<ShoppingListDetail[]> {
    const state = await db();
    return state.shopping_lists
      .filter((list) => list.family_id === family_id)
      .map((list) => ({
        ...list,
        items: state.shopping_list_items
          .filter((item) => item.shopping_list_id === list.shopping_list_id)
          .map((item) => ({ ...item, food: state.foods.find((food) => food.food_id === item.food_id)! })),
      }));
  },
  async detail(shopping_list_id: string): Promise<ShoppingListDetail> {
    const state = await db();
    const list = state.shopping_lists.find((item) => item.shopping_list_id === shopping_list_id);
    if (!list) throw new Error("Không tìm thấy danh sách mua sắm.");
    return {
      ...list,
      items: state.shopping_list_items.filter((item) => item.shopping_list_id === shopping_list_id).map((item) => ({ ...item, food: state.foods.find((food) => food.food_id === item.food_id)! })),
    };
  },
  async create(payload: { family_id: string; title: string; plan_date: string; list_type: ShoppingType; created_by: string; items: Array<{ food_id: string; quantity: number }> }) {
    if (!payload.title || !payload.list_type) throw new Error("Vui lòng nhập tiêu đề và kiểu danh sách.");
    const state = await db();
    if (!state.families.some((family) => family.family_id === payload.family_id)) throw new Error("Người dùng chưa có nhóm gia đình.");
    const list: ShoppingList = { shopping_list_id: uid("shopping"), family_id: payload.family_id, title: payload.title, plan_date: payload.plan_date, list_type: payload.list_type, status: "DRAFT", created_by: payload.created_by };
    state.shopping_lists.unshift(list);
    state.shopping_list_items.push(...payload.items.map((item) => ({ id: uid("shopping-item"), shopping_list_id: list.shopping_list_id, food_id: item.food_id, quantity: item.quantity, bought_status: false })));
    addActivity(state, payload.family_id, payload.created_by, "shopping", `tạo danh sách "${payload.title}" và chia sẻ cho gia đình`);
    saveDb(state);
    return list;
  },
  async upsertItem(shopping_list_id: string, payload: { food_id: string; quantity: number }) {
    const state = await db();
    state.shopping_list_items.push({ id: uid("shopping-item"), shopping_list_id, food_id: payload.food_id, quantity: payload.quantity, bought_status: false });
    saveDb(state);
  },
  async toggleItem(id: string) {
    const state = await db();
    const item = state.shopping_list_items.find((row) => row.id === id);
    if (!item) throw new Error("Không tìm thấy mặt hàng.");
    item.bought_status = !item.bought_status;
    saveDb(state);
  },
  async complete(shopping_list_id: string) {
    const state = await db();
    const list = state.shopping_lists.find((item) => item.shopping_list_id === shopping_list_id);
    if (!list) throw new Error("Không tìm thấy danh sách.");
    const bought = state.shopping_list_items.filter((item) => item.shopping_list_id === shopping_list_id && item.bought_status);
    bought.forEach((item) => {
      state.fridge_items.push({ fridge_item_id: uid("fridge"), family_id: list.family_id, food_id: item.food_id, quantity: item.quantity, expiry_date: addDaysIso(7), location: "Ngăn mát" });
    });
    if (state.shopping_list_items.filter((item) => item.shopping_list_id === shopping_list_id).every((item) => item.bought_status)) list.status = "DONE";
    const session = getSession();
    if (session) addActivity(state, list.family_id, session.user_id, "shopping", "mua hàng và cập nhật tồn kho trong tủ lạnh");
    saveDb(state);
  },
};
