/**
 * src/stores/mealPlanStore.ts
 * Zustand store – manages weekly meal plan state.
 */
import { create } from "zustand";
import { mealPlanService } from "@/services/mealplan.service";
import type { MealPlan, MealPlanWithRecipes, MissingIngredient } from "@/types/mealplan";

function getWeekRange(anchor: Date): { start: string; end: string; days: string[] } {
  const d = new Date(anchor);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    days.push(x.toISOString().slice(0, 10));
  }
  return { start: days[0], end: days[6], days };
}

interface MealPlanStore {
  // State
  weekAnchor: Date;
  weekDays: string[];
  plansByDate: Record<string, MealPlanWithRecipes[]>; // date → plans
  loading: boolean;
  error: string | null;
  // Dialog state
  editingDate: string | null;
  editingSlot: MealPlan["slot"] | null;
  // Missing ingredients for currently edited day
  missingIngredients: MissingIngredient[];
  familyId: string | null;

  // Actions
  setFamilyId: (id: string) => void;
  loadWeek: (familyId: string, anchor?: Date) => Promise<void>;
  prevWeek: () => void;
  nextWeek: () => void;
  openEdit: (date: string, slot: MealPlan["slot"]) => void;
  closeEdit: () => void;
  addRecipe: (recipeId: string) => Promise<void>;
  removeRecipe: (mealPlanId: string, recipeId: string) => Promise<void>;
  checkMissing: () => Promise<void>;
  saveAndCreateShopping: (createdBy: string) => Promise<boolean>;
}

export const useMealPlanStore = create<MealPlanStore>((set, get) => ({
  weekAnchor: new Date(),
  weekDays: getWeekRange(new Date()).days,
  plansByDate: {},
  loading: false,
  error: null,
  editingDate: null,
  editingSlot: null,
  missingIngredients: [],
  familyId: null,

  setFamilyId: (id) => set({ familyId: id }),

  loadWeek: async (familyId, anchor) => {
    const base = anchor ?? get().weekAnchor;
    const { start, end, days } = getWeekRange(base);
    set({ loading: true, error: null, weekAnchor: base, weekDays: days, familyId });
    try {
      const plans = await mealPlanService.getWeek(familyId, start, end);
      const byDate: Record<string, MealPlanWithRecipes[]> = {};
      for (const d of days) byDate[d] = [];
      for (const p of plans) {
        byDate[p.date] = [...(byDate[p.date] ?? []), p];
      }
      set({ plansByDate: byDate, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  prevWeek: () => {
    const { weekAnchor, familyId } = get();
    const prev = new Date(weekAnchor);
    prev.setDate(prev.getDate() - 7);
    if (familyId) get().loadWeek(familyId, prev);
  },

  nextWeek: () => {
    const { weekAnchor, familyId } = get();
    const next = new Date(weekAnchor);
    next.setDate(next.getDate() + 7);
    if (familyId) get().loadWeek(familyId, next);
  },

  openEdit: (date, slot) => {
    set({ editingDate: date, editingSlot: slot, missingIngredients: [] });
  },

  closeEdit: () => set({ editingDate: null, editingSlot: null, missingIngredients: [] }),

  addRecipe: async (recipeId) => {
    const { familyId, editingDate, editingSlot } = get();
    if (!familyId || !editingDate || !editingSlot) return;
    await mealPlanService.addRecipeToMeal(familyId, editingDate, editingSlot, recipeId);
    await get().loadWeek(familyId);
    await get().checkMissing();
  },

  removeRecipe: async (mealPlanId, recipeId) => {
    const { familyId } = get();
    await mealPlanService.removeRecipeFromMeal(mealPlanId, recipeId);
    if (familyId) {
      await get().loadWeek(familyId);
      await get().checkMissing();
    }
  },

  checkMissing: async () => {
    const { familyId, editingDate, plansByDate } = get();
    if (!familyId || !editingDate) return;
    const dayPlans = plansByDate[editingDate] ?? [];
    const missing = await mealPlanService.checkMissingIngredients(familyId, dayPlans);
    set({ missingIngredients: missing });
  },

  saveAndCreateShopping: async (createdBy) => {
    const { familyId, plansByDate } = get();
    if (!familyId) return false;
    // Aggregate all plans for the week
    const allPlans = Object.values(plansByDate).flat();
    const missing = await mealPlanService.checkMissingIngredients(familyId, allPlans);
    if (missing.length > 0) {
      await mealPlanService.createShoppingListFromMissing(familyId, createdBy, missing);
      return true; // shopping list created
    }
    return false;
  },
}));
