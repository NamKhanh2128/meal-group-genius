import { storage, delay, uid } from "@/utils/storage";
import type { ShoppingList, ShoppingItem } from "@/types";

const KEY = "shopping";

function loadAll() { return storage.get<ShoppingList[]>(KEY, []); }
function saveAll(list: ShoppingList[]) { storage.set(KEY, list); }

export const shoppingService = {
  async list(familyId: string): Promise<ShoppingList[]> {
    await delay(150);
    return loadAll().filter((l) => l.familyId === familyId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
  async get(id: string): Promise<ShoppingList | null> {
    await delay(80);
    return loadAll().find((l) => l.id === id) ?? null;
  },
  async create(data: { familyId: string; title: string; type: "daily" | "weekly"; planDate?: string; createdBy: string; items?: Omit<ShoppingItem, "id" | "bought">[] }): Promise<ShoppingList> {
    await delay(220);
    const created: ShoppingList = {
      id: "list-" + uid(),
      familyId: data.familyId,
      title: data.title,
      type: data.type,
      planDate: data.planDate,
      status: "DRAFT",
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      items: (data.items ?? []).map((it) => ({ ...it, id: uid(), bought: false })),
    };
    saveAll([created, ...loadAll()]);
    return created;
  },
  async remove(id: string): Promise<void> {
    await delay(120);
    saveAll(loadAll().filter((l) => l.id !== id));
  },
  async addItem(listId: string, item: Omit<ShoppingItem, "id" | "bought">): Promise<void> {
    await delay(150);
    const all = loadAll();
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    list.items.push({ ...item, id: uid(), bought: false });
    saveAll(all);
  },
  async toggleItem(listId: string, itemId: string): Promise<void> {
    await delay(80);
    const all = loadAll();
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    const it = list.items.find((i) => i.id === itemId);
    if (it) it.bought = !it.bought;
    saveAll(all);
  },
  async removeItem(listId: string, itemId: string): Promise<void> {
    await delay(100);
    const all = loadAll();
    const list = all.find((l) => l.id === listId);
    if (!list) return;
    list.items = list.items.filter((i) => i.id !== itemId);
    saveAll(all);
  },
  async complete(listId: string): Promise<void> {
    await delay(120);
    const all = loadAll();
    const list = all.find((l) => l.id === listId);
    if (list) { list.completed = true; list.status = "DONE"; }
    saveAll(all);
  },
};
