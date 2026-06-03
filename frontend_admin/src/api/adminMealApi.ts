import type { MealPlan } from "@/types";
import { db } from "@/lib/mockDb";

export type MealPlanWithDetails = MealPlan & {
  family_name?: string;
  recipe_name?: string;
  creator_name?: string;
};

export const adminMealApi = {
  async list(): Promise<MealPlanWithDetails[]> {
    const state = await db();
    return [...state.meal_plans]
      .sort((a, b) => b.meal_date.localeCompare(a.meal_date))
      .map((mp) => {
        const family = state.families.find((f) => f.family_id === mp.family_id);
        const recipe = state.recipes.find((r) => r.recipe_id === mp.recipe_id);
        
        // Find family creator or default user
        let creatorName = "Người dùng";
        if (family?.created_by) {
          const user = state.users.find((u) => u.user_id === family.created_by);
          if (user) {
            creatorName = user.full_name;
          }
        }

        return {
          ...mp,
          family_name: family?.family_name ?? "Gia đình ẩn danh",
          recipe_name: recipe?.recipe_name ?? "Món ăn ẩn danh",
          creator_name: creatorName,
        };
      });
  },
};
