import { storage, delay, uid } from "@/utils/storage";
import type { ShoppingList, ShoppingItem } from "@/types";

const KEY = "shopping";

export const shoppingService = {
  async list(familyId: string): Promise<ShoppingList[]> {
    // TODO: Replace with real API call
    await delay(200);
    return storage.get<ShoppingList[]>(KEY, []).filter((l) => l.familyId === familyId);
  },
  async create(data: Omit<ShoppingList, "id" | "createdAt" | "completed">): Promise<ShoppingList> {
    // TODO: Replace with real API call
    await delay(250);
    const all = storage.get<ShoppingList[]>(KEY, []);
    const created: ShoppingList = { ...data, id: uid(), completed: false, createdAt: new Date().toISOString() };
    storage.set(KEY, [created, ...all]);
    return created;
  },
  async addItem(listId: string, item: Omit<ShoppingItem, "id" | "bought">): Promise<void> {
    // TODO: Replace with real API call
    await delay(200);
    const all = storage.get<ShoppingList[]>(KEY, []);
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    list.items.push({ ...item, id: uid(), bought: false });
    storage.set(KEY, all);
  },
  async toggleItem(listId: string, itemId: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const all = storage.get<ShoppingList[]>(KEY, []);
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    const it = list.items.find((i) => i.id === itemId);
    if (it) it.bought = !it.bought;
    storage.set(KEY, all);
  },
  async removeItem(listId: string, itemId: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const all = storage.get<ShoppingList[]>(KEY, []);
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    list.items = list.items.filter((i) => i.id !== itemId);
    storage.set(KEY, all);
  },
  async complete(listId: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const all = storage.get<ShoppingList[]>(KEY, []);
    const list = all.find((l) => l.id === listId);
    if (list) list.completed = true;
    storage.set(KEY, all);
  },
};