import type { MealType } from "./database";

export type { MealType };

export type MealSlot = "Sáng" | "Trưa" | "Tối";

export interface MealPlanV2 {
  id: string;
  familyId: string;
  date: string;
  slot: MealSlot;
}

export interface MealPlanRecipe {
  id: string;
  mealPlanId: string;
  recipeId: string;
}

export interface MissingIngredient {
  name: string;
  neededQty: number;
  unit: string;
  haveQty: number;
}
