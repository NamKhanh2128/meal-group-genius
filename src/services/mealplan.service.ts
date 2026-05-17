import { storage, delay, uid } from "@/utils/storage";
import type { MealPlanItem } from "@/types";

export const mealPlanService = {
  async list(familyId: string): Promise<MealPlanItem[]> {
    // TODO: Replace with real API call
    await delay(150);
    return storage.get<MealPlanItem[]>("meals", []).filter((m) => m.familyId === familyId);
  },
  async add(item: Omit<MealPlanItem, "id">): Promise<MealPlanItem> {
    // TODO: Replace with real API call
    await delay(200);
    const all = storage.get<MealPlanItem[]>("meals", []);
    const created = { ...item, id: uid() };
    storage.set("meals", [created, ...all]);
    return created;
  },
  async setStatus(id: string, status: MealPlanItem["status"]): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const all = storage.get<MealPlanItem[]>("meals", []);
    const m = all.find((x) => x.id === id);
    if (m) m.status = status;
    storage.set("meals", all);
  },
  async remove(id: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const all = storage.get<MealPlanItem[]>("meals", []);
    storage.set("meals", all.filter((m) => m.id !== id));
  },
};