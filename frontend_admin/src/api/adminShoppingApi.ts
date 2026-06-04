import type { ShoppingList, ShoppingListItem } from "@/types";
import { db, saveDb } from "@/lib/mockDb";

export type ShoppingListWithDetails = ShoppingList & {
  family_name?: string;
  creator_name?: string;
  items: (ShoppingListItem & {
    food_name?: string;
    unit?: string;
    icon?: string;
  })[];
};

export const adminShoppingApi = {
  async list(): Promise<ShoppingListWithDetails[]> {
    const state = await db();
    return [...state.shopping_lists]
      .sort((a, b) => b.plan_date.localeCompare(a.plan_date))
      .map((sl) => {
        const family = state.families.find((f) => f.family_id === sl.family_id);
        const creator = state.users.find((u) => u.user_id === sl.created_by);
        const items = state.shopping_list_items
          .filter((sli) => sli.shopping_list_id === sl.shopping_list_id)
          .map((sli) => {
            const food = state.foods.find((f) => f.food_id === sli.food_id);
            return {
              ...sli,
              food_name: food?.food_name,
              unit: food?.unit,
              icon: food?.icon,
            };
          });

        return {
          ...sl,
          family_name: family?.family_name ?? "Gia đình ẩn danh",
          creator_name: creator?.full_name ?? "Ẩn danh",
          items,
        };
      });
  },

  async getById(shopping_list_id: string): Promise<ShoppingListWithDetails> {
    const state = await db();
    const sl = state.shopping_lists.find((l) => l.shopping_list_id === shopping_list_id);
    if (!sl) throw new Error("Không tìm thấy danh sách mua sắm.");

    const family = state.families.find((f) => f.family_id === sl.family_id);
    const creator = state.users.find((u) => u.user_id === sl.created_by);
    const items = state.shopping_list_items
      .filter((sli) => sli.shopping_list_id === sl.shopping_list_id)
      .map((sli) => {
        const food = state.foods.find((f) => f.food_id === sli.food_id);
        return {
          ...sli,
          food_name: food?.food_name,
          unit: food?.unit,
          icon: food?.icon,
        };
      });

    return {
      ...sl,
      family_name: family?.family_name ?? "Gia đình ẩn danh",
      creator_name: creator?.full_name ?? "Ẩn danh",
      items,
    };
  },

  async delete(shopping_list_id: string): Promise<void> {
    const state = await db();
    state.shopping_lists = state.shopping_lists.filter((l) => l.shopping_list_id !== shopping_list_id);
    state.shopping_list_items = state.shopping_list_items.filter((item) => item.shopping_list_id !== shopping_list_id);
    saveDb(state);
  },
};
