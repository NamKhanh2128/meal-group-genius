import type { FoodUnit } from "./food";

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: FoodUnit;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  videoUrl?: string;
  timeMinutes: number;
  calories: number;
  difficulty: "Dễ làm" | "Trung bình" | "Khó";
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface MealPlanItem {
  id: string;
  familyId: string;
  date: string;
  slot: "Sáng" | "Trưa" | "Tối";
  recipeId: string;
  recipeName: string;
  image?: string;
  status: "Kế hoạch" | "Đang nấu" | "Đã xong";
  servings: number;
  time?: string;
}