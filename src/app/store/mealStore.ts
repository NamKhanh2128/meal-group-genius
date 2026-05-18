import { create } from "zustand";
import type { MealPlanGroup, RecipeSuggestion } from "@/types";
import { mealApi } from "@/services/api/mealApi";
import { getErrorMessage } from "@/utils/errors";

type MealState = {
  groups: MealPlanGroup[];
  generated: MealPlanGroup[];
  suggestions: RecipeSuggestion[];
  loading: boolean;
  error: string | null;
  load: (family_id: string) => Promise<void>;
  generate: (family_id: string, mode: "day" | "week") => Promise<void>;
  setGenerated: (groups: MealPlanGroup[]) => void;
  saveGenerated: () => Promise<void>;
};

export const useMealStore = create<MealState>((set, get) => ({
  groups: [],
  generated: [],
  suggestions: [],
  loading: false,
  error: null,
  load: async (family_id) => {
    set({ loading: true, error: null });
    try {
      set({ groups: await mealApi.grouped(family_id), loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
  generate: async (family_id, mode) => {
    set({ loading: true, error: null });
    try {
      const result = await mealApi.generate(family_id, mode);
      set({ generated: result.plan, suggestions: result.suggestions, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
  setGenerated: (groups) => set({ generated: groups }),
  saveGenerated: async () => {
    await mealApi.save(get().generated);
    const familyId = get().generated[0]?.family_id;
    if (familyId) await get().load(familyId);
  },
}));
