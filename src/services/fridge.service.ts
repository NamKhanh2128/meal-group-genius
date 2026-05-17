import { storage, delay, uid } from "@/utils/storage";
import type { FoodItem } from "@/types";

const KEY = "fridge";

export const fridgeService = {
  async list(familyId: string): Promise<FoodItem[]> {
    // TODO: Replace with real API call (axios.get('/fridge'))
    await delay(200);
    return storage.get<FoodItem[]>(KEY, []).filter((f) => f.familyId === familyId);
  },
  async add(item: Omit<FoodItem, "id" | "createdAt">): Promise<FoodItem> {
    // TODO: Replace with real API call
    await delay(250);
    const all = storage.get<FoodItem[]>(KEY, []);
    const created: FoodItem = { ...item, id: uid(), createdAt: new Date().toISOString() };
    storage.set(KEY, [created, ...all]);
    return created;
  },
  async update(id: string, patch: Partial<FoodItem>): Promise<FoodItem> {
    // TODO: Replace with real API call
    await delay(200);
    const all = storage.get<FoodItem[]>(KEY, []);
    const next = all.map((f) => (f.id === id ? { ...f, ...patch } : f));
    storage.set(KEY, next);
    return next.find((f) => f.id === id)!;
  },
  async remove(id: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(200);
    const all = storage.get<FoodItem[]>(KEY, []);
    storage.set(KEY, all.filter((f) => f.id !== id));
  },
  async use(id: string, amount: number): Promise<FoodItem | null> {
    // TODO: Replace with real API call
    await delay(200);
    const all = storage.get<FoodItem[]>(KEY, []);
    const item = all.find((f) => f.id === id);
    if (!item) return null;
    item.quantity = Math.max(0, item.quantity - amount);
    storage.set(KEY, all);
    return item;
  },
  async deductIngredients(familyId: string, ingredients: { name: string; quantity: number }[]): Promise<void> {
    // TODO: Replace with real API call
    await delay(250);
    const all = storage.get<FoodItem[]>(KEY, []);
    for (const ing of ingredients) {
      const item = all.find((f) => f.familyId === familyId && f.name.toLowerCase() === ing.name.toLowerCase());
      if (item) item.quantity = Math.max(0, item.quantity - ing.quantity);
    }
    storage.set(KEY, all);
  },
  async addFromShopping(familyId: string, items: { name: string; quantity: number; unit: string; category: string }[]): Promise<void> {
    // TODO: Replace with real API call
    await delay(250);
    const all = storage.get<FoodItem[]>(KEY, []);
    for (const it of items) {
      const existing = all.find((f) => f.familyId === familyId && f.name.toLowerCase() === it.name.toLowerCase());
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        all.unshift({
          id: uid(),
          familyId,
          name: it.name,
          quantity: it.quantity,
          unit: it.unit as FoodItem["unit"],
          category: it.category as FoodItem["category"],
          location: "Ngăn mát",
          expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
    }
    storage.set(KEY, all);
  },
};