import type { Food } from "@/types";
import { db, saveDb, uid } from "@/lib/mockDb";

export const adminFoodApi = {
  async list(): Promise<Food[]> {
    const state = await db();
    return [...state.foods].sort((a, b) => a.food_name.localeCompare(b.food_name, "vi"));
  },

  async getById(food_id: string): Promise<Food> {
    const state = await db();
    const food = state.foods.find((f) => f.food_id === food_id);
    if (!food) throw new Error("Không tìm thấy thực phẩm.");
    return food;
  },

  async create(payload: Omit<Food, "food_id">): Promise<Food> {
    const state = await db();
    const foodNameLower = payload.food_name.trim().toLowerCase();

    if (state.foods.some((f) => f.food_name.toLowerCase() === foodNameLower)) {
      throw new Error("Tên thực phẩm này đã tồn tại trong hệ thống.");
    }

    const food: Food = {
      ...payload,
      food_id: uid("food"),
      food_name: payload.food_name.trim(),
    };

    state.foods.push(food);
    saveDb(state);
    return food;
  },

  async update(food_id: string, payload: Partial<Food>): Promise<Food> {
    const state = await db();
    const index = state.foods.findIndex((f) => f.food_id === food_id);
    if (index < 0) throw new Error("Không tìm thấy thực phẩm.");

    if (payload.food_name) {
      const foodNameLower = payload.food_name.trim().toLowerCase();
      if (
        state.foods.some(
          (f) => f.food_id !== food_id && f.food_name.toLowerCase() === foodNameLower
        )
      ) {
        throw new Error("Tên thực phẩm này đã tồn tại trong hệ thống.");
      }
    }

    state.foods[index] = {
      ...state.foods[index]!,
      ...payload,
      food_name: payload.food_name ? payload.food_name.trim() : state.foods[index]!.food_name,
    };

    saveDb(state);
    return state.foods[index]!;
  },

  async delete(food_id: string): Promise<void> {
    const state = await db();
    const index = state.foods.findIndex((f) => f.food_id === food_id);
    if (index < 0) throw new Error("Không tìm thấy thực phẩm.");

    // Check if food is used in any recipes
    const boundRecipes = state.recipes.filter((r) =>
      state.recipe_ingredients.some((ri) => ri.recipe_id === r.recipe_id && ri.food_id === food_id)
    );

    if (boundRecipes.length > 0) {
      const recipeNames = boundRecipes.map((r) => `"${r.recipe_name}"`).join(", ");
      throw new Error(`Không thể xóa thực phẩm này vì đang cấu thành công thức: ${recipeNames}. Vui lòng chỉnh sửa các công thức này trước.`);
    }

    // Remove food
    state.foods.splice(index, 1);

    // Clean up related fridge items and shopping items
    state.fridge_items = state.fridge_items.filter((fi) => fi.food_id !== food_id);
    state.shopping_list_items = state.shopping_list_items.filter((sli) => sli.food_id !== food_id);

    saveDb(state);
  },

  async bulkDelete(food_ids: string[]): Promise<void> {
    const state = await db();

    // Check if any of these foods are used in recipes
    const boundRecipes = state.recipes.filter((r) =>
      state.recipe_ingredients.some((ri) => ri.recipe_id === r.recipe_id && food_ids.includes(ri.food_id))
    );

    if (boundRecipes.length > 0) {
      const recipeNames = boundRecipes.map((r) => `"${r.recipe_name}"`).join(", ");
      throw new Error(`Không thể xóa các thực phẩm đã chọn vì đang cấu thành công thức: ${recipeNames}. Vui lòng chỉnh sửa các công thức này trước.`);
    }

    state.foods = state.foods.filter((f) => !food_ids.includes(f.food_id));
    state.fridge_items = state.fridge_items.filter((fi) => !food_ids.includes(fi.food_id));
    state.shopping_list_items = state.shopping_list_items.filter((sli) => !food_ids.includes(sli.food_id));

    saveDb(state);
  },
};
