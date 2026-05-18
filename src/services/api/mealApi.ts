import { endpoints } from "@/services/endpoints";
import type { MealPlan, MealPlanGroup, MealType, RecipeSuggestion } from "@/types";
import { uid } from "@/utils/storage";
import { addActivity, db, getSession, saveDb } from "./mockDb";
import { recipeApi } from "./recipeApi";

export const mealApi = {
  endpoint: endpoints.mealPlans,
  async list(family_id: string): Promise<MealPlan[]> {
    const state = await db();
    return state.meal_plans.filter((item) => item.family_id === family_id);
  },
  async grouped(family_id: string): Promise<MealPlanGroup[]> {
    const rows = await this.list(family_id);
    const map = new Map<string, MealPlanGroup>();
    rows.forEach((row) => {
      const key = `${row.meal_date}-${row.meal_type}`;
      if (!map.has(key)) map.set(key, { family_id, meal_date: row.meal_date, meal_type: row.meal_type, recipe_ids: [] });
      map.get(key)!.recipe_ids.push(row.recipe_id);
    });
    return [...map.values()];
  },
  async generate(family_id: string, mode: "day" | "week"): Promise<{ suggestions: RecipeSuggestion[]; plan: MealPlanGroup[] }> {
    const suggestions = await recipeApi.suggestions(family_id);
    if (suggestions.length === 0) return { suggestions: [], plan: [] };
    const days = mode === "week" ? 7 : 1;
    const dates = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
    const mealTypes: MealType[] = ["Sáng", "Trưa", "Tối", "Bữa phụ"];
    const plan = dates.flatMap((date, dateIndex) => mealTypes.map((mealType, typeIndex) => ({
      family_id,
      meal_date: date,
      meal_type: mealType,
      recipe_ids: [suggestions[(dateIndex + typeIndex) % suggestions.length].recipe.recipe_id],
    })));
    return { suggestions, plan };
  },
  async save(groups: MealPlanGroup[]) {
    if (groups.length === 0) throw new Error("Chưa có kế hoạch bữa ăn để lưu.");
    const state = await db();
    const family_id = groups[0].family_id;
    groups.forEach((group) => {
      state.meal_plans = state.meal_plans.filter((row) => !(row.family_id === group.family_id && row.meal_date === group.meal_date && row.meal_type === group.meal_type));
      group.recipe_ids.forEach((recipe_id) => state.meal_plans.push({ meal_plan_id: uid("meal"), family_id: group.family_id, meal_date: group.meal_date, meal_type: group.meal_type, recipe_id }));
    });
    const session = getSession();
    if (session) addActivity(state, family_id, session.user_id, "meal", "lưu kế hoạch bữa ăn vào lịch");
    saveDb(state);
  },
  async createShoppingListForMissing(family_id: string, user_id: string, title: string) {
    const suggestions = await recipeApi.suggestions(family_id);
    const missing = suggestions.flatMap((item) => item.missing);
    const unique = new Map(missing.map((row) => [row.food.food_id, row]));
    const state = await db();
    const list = { shopping_list_id: uid("shopping"), family_id, title, plan_date: new Date().toISOString().slice(0, 10), status: "DRAFT" as const, created_by: user_id, list_type: "daily" as const };
    state.shopping_lists.unshift(list);
    [...unique.values()].forEach((row) => state.shopping_list_items.push({ id: uid("shopping-item"), shopping_list_id: list.shopping_list_id, food_id: row.food.food_id, quantity: row.quantity, bought_status: false }));
    addActivity(state, family_id, user_id, "shopping", "tự động tạo danh sách bổ sung nguyên liệu thiếu");
    saveDb(state);
    return list;
  },
};
