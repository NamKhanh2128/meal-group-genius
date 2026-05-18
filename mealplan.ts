// ─── Meal Plan Types (v2 – multi-recipe per meal) ───────────────────────────

export type MealSlot = "Sáng" | "Trưa" | "Tối";

/** One meal slot for a specific date (no recipe_id here). */
export interface MealPlan {
  id: string;          // uid
  familyId: string;
  date: string;        // YYYY-MM-DD
  slot: MealSlot;
}

/** Junction: many recipes per meal plan. */
export interface MealPlanRecipe {
  id: string;          // uid
  mealPlanId: string;
  recipeId: string;
}

/** Enriched view used by UI (read-only, computed). */
export interface MealPlanWithRecipes extends MealPlan {
  recipes: import("./recipe").Recipe[];
}

/** Result of missing-ingredient check. */
export interface MissingIngredient {
  name: string;
  neededQty: number;
  unit: string;
  haveQty: number;
}
