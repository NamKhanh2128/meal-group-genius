/**
 * src/services/mealplan.service.ts  (v2 – multi-recipe per meal)
 *
 * Storage keys:
 *   "meal_plans"         → MealPlan[]
 *   "meal_plan_recipes"  → MealPlanRecipe[]
 *
 * Migration: old "meals" key (MealPlanItem[]) is converted on first load.
 */
import { storage, delay, uid } from "@/utils/storage";
import { recipeService } from "@/services/recipe.service";
import { shoppingService } from "@/services/shopping.service";
import type { MealPlan, MealPlanRecipe, MealPlanWithRecipes, MissingIngredient } from "@/types/mealplan";
import type { FoodItem, Recipe } from "@/types";

const PLANS_KEY = "meal_plans";
const RECIPES_KEY = "meal_plan_recipes";
const LEGACY_KEY = "meals";

// ─── Migration ──────────────────────────────────────────────────────────────

/** Called once at app start; converts old MealPlanItem[] → new schema. */
export function migrateMealPlans() {
  if (typeof window === "undefined") return;
  const migrated = storage.get<boolean>("meal_plans_migrated", false);
  if (migrated) return;

  const legacy = storage.get<any[]>(LEGACY_KEY, []);
  if (legacy.length === 0) {
    storage.set("meal_plans_migrated", true);
    return;
  }

  const plans: MealPlan[] = [];
  const planRecipes: MealPlanRecipe[] = [];

  for (const old of legacy) {
    const plan: MealPlan = {
      id: old.id ?? uid(),
      familyId: old.familyId,
      date: old.date,
      slot: old.slot ?? old.meal_type ?? "Sáng",
    };
    plans.push(plan);
    if (old.recipeId) {
      planRecipes.push({ id: uid(), mealPlanId: plan.id, recipeId: old.recipeId });
    }
  }

  storage.set(PLANS_KEY, plans);
  storage.set(RECIPES_KEY, planRecipes);
  storage.set("meal_plans_migrated", true);
  // Keep legacy key intact so dashboard still works with old list() call
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPlans(): MealPlan[] {
  return storage.get<MealPlan[]>(PLANS_KEY, []);
}
function getPlanRecipes(): MealPlanRecipe[] {
  return storage.get<MealPlanRecipe[]>(RECIPES_KEY, []);
}

// ─── Service ────────────────────────────────────────────────────────────────

export const mealPlanService = {
  // ── Legacy-compatible list (used by Dashboard) ───────────────────────────
  async list(familyId: string) {
    await delay(100);
    return getPlans().filter((p) => p.familyId === familyId);
  },

  // ── Week range query ──────────────────────────────────────────────────────
  async getWeek(familyId: string, startDate: string, endDate: string): Promise<MealPlanWithRecipes[]> {
    await delay(150);
    const allPlans = getPlans().filter(
      (p) => p.familyId === familyId && p.date >= startDate && p.date <= endDate,
    );
    const allRecipes = await recipeService.list();
    const recipeMap = new Map<string, Recipe>(allRecipes.map((r) => [r.id, r]));
    const planRecipes = getPlanRecipes();

    return allPlans.map((plan) => {
      const rIds = planRecipes.filter((pr) => pr.mealPlanId === plan.id).map((pr) => pr.recipeId);
      const recipes = rIds.map((id) => recipeMap.get(id)).filter(Boolean) as Recipe[];
      return { ...plan, recipes };
    });
  },

  // ── Upsert a meal plan slot (returns plan) ─────────────────────────────
  async upsertPlan(familyId: string, date: string, slot: MealPlan["slot"]): Promise<MealPlan> {
    await delay(100);
    const all = getPlans();
    let plan = all.find((p) => p.familyId === familyId && p.date === date && p.slot === slot);
    if (!plan) {
      plan = { id: uid(), familyId, date, slot };
      all.push(plan);
      storage.set(PLANS_KEY, all);
    }
    return plan;
  },

  // ── Add recipe to a meal ──────────────────────────────────────────────────
  async addRecipeToMeal(familyId: string, date: string, slot: MealPlan["slot"], recipeId: string): Promise<void> {
    await delay(100);
    const plan = await this.upsertPlan(familyId, date, slot);
    const all = getPlanRecipes();
    const exists = all.find((pr) => pr.mealPlanId === plan.id && pr.recipeId === recipeId);
    if (!exists) {
      all.push({ id: uid(), mealPlanId: plan.id, recipeId });
      storage.set(RECIPES_KEY, all);
    }
  },

  // ── Remove recipe from a meal ─────────────────────────────────────────────
  async removeRecipeFromMeal(mealPlanId: string, recipeId: string): Promise<void> {
    await delay(100);
    const all = getPlanRecipes().filter(
      (pr) => !(pr.mealPlanId === mealPlanId && pr.recipeId === recipeId),
    );
    storage.set(RECIPES_KEY, all);
    // If no recipes remain, delete the plan itself
    const remaining = all.filter((pr) => pr.mealPlanId === mealPlanId);
    if (remaining.length === 0) {
      storage.set(PLANS_KEY, getPlans().filter((p) => p.id !== mealPlanId));
    }
  },

  // ── Delete whole meal plan ────────────────────────────────────────────────
  async deletePlan(mealPlanId: string): Promise<void> {
    await delay(100);
    storage.set(PLANS_KEY, getPlans().filter((p) => p.id !== mealPlanId));
    storage.set(RECIPES_KEY, getPlanRecipes().filter((pr) => pr.mealPlanId !== mealPlanId));
  },

  // ── Check missing ingredients for a day ──────────────────────────────────
  async checkMissingIngredients(
    familyId: string,
    plans: MealPlanWithRecipes[],
  ): Promise<MissingIngredient[]> {
    await delay(100);
    const fridge = storage.get<FoodItem[]>("fridge", []).filter((f) => f.familyId === familyId);

    // Aggregate needed ingredients across all plans
    const needed = new Map<string, { qty: number; unit: string }>();
    for (const plan of plans) {
      for (const recipe of plan.recipes) {
        for (const ing of recipe.ingredients) {
          const key = ing.name.toLowerCase();
          const prev = needed.get(key) ?? { qty: 0, unit: ing.unit };
          needed.set(key, { qty: prev.qty + ing.quantity, unit: ing.unit });
        }
      }
    }

    const missing: MissingIngredient[] = [];
    for (const [key, { qty, unit }] of needed.entries()) {
      const fridgeItem = fridge.find((f) => f.name.toLowerCase() === key);
      const have = fridgeItem?.quantity ?? 0;
      if (have < qty) {
        missing.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          neededQty: qty,
          unit,
          haveQty: have,
        });
      }
    }
    return missing;
  },

  // ── Create shopping list from missing items ───────────────────────────────
  async createShoppingListFromMissing(
    familyId: string,
    createdBy: string,
    missing: MissingIngredient[],
    title?: string,
  ): Promise<void> {
    await delay(150);
    const list = await shoppingService.create({
      familyId,
      title: title ?? `Bổ sung nguyên liệu ${new Date().toLocaleDateString("vi-VN")}`,
      type: "daily",
      items: [],
      createdBy,
    });
    for (const m of missing) {
      const deficit = m.neededQty - m.haveQty;
      await shoppingService.addItem(list.id, {
        name: m.name,
        quantity: Math.ceil(deficit),
        unit: m.unit as any,
        category: "Khác",
      });
    }
  },
};
