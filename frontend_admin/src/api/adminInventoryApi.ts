import type { FridgeItem } from "@/types";
import { db, saveDb } from "@/lib/mockDb";

export type FridgeItemWithDetails = FridgeItem & {
  family_name?: string;
  food_name?: string;
  unit?: string;
  icon?: string;
  category?: string;
};

export const adminInventoryApi = {
  async list(): Promise<FridgeItemWithDetails[]> {
    const state = await db();
    return state.fridge_items.map((item) => {
      const family = state.families.find((f) => f.family_id === item.family_id);
      const food = state.foods.find((f) => f.food_id === item.food_id);

      return {
        ...item,
        family_name: family?.family_name ?? "Gia đình ẩn danh",
        food_name: food?.food_name ?? "Thực phẩm ẩn danh",
        unit: food?.unit,
        icon: food?.icon,
        category: food?.category,
      };
    });
  },

  async update(
    fridge_item_id: string,
    payload: { quantity: number; expiry_date: string; location: FridgeItem["location"] }
  ): Promise<FridgeItem> {
    const state = await db();
    const index = state.fridge_items.findIndex((item) => item.fridge_item_id === fridge_item_id);
    if (index < 0) throw new Error("Không tìm thấy thực phẩm trong tủ lạnh.");

    state.fridge_items[index] = {
      ...state.fridge_items[index]!,
      ...payload,
    };
    saveDb(state);
    return state.fridge_items[index]!;
  },

  async delete(fridge_item_id: string): Promise<void> {
    const state = await db();
    state.fridge_items = state.fridge_items.filter((item) => item.fridge_item_id !== fridge_item_id);
    saveDb(state);
  },
};
