import { create } from "zustand";
import { shoppingApi, type ShoppingListDetail } from "@/services/api/shoppingApi";
import type { ShoppingType } from "@/types";
import { getErrorMessage } from "@/utils/errors";

type ShoppingState = {
  lists: ShoppingListDetail[];
  loading: boolean;
  error: string | null;
  load: (family_id: string) => Promise<void>;
  create: (payload: { family_id: string; title: string; plan_date: string; list_type: ShoppingType; created_by: string; items: Array<{ food_id: string; quantity: number }> }) => Promise<void>;
  toggleItem: (id: string, family_id: string) => Promise<void>;
  addItem: (shopping_list_id: string, payload: { food_id: string; quantity: number }, family_id: string) => Promise<void>;
  complete: (shopping_list_id: string, family_id: string) => Promise<void>;
};

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  lists: [],
  loading: false,
  error: null,
  load: async (family_id) => {
    set({ loading: true, error: null });
    try {
      set({ lists: await shoppingApi.list(family_id), loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
  create: async (payload) => {
    await shoppingApi.create(payload);
    await get().load(payload.family_id);
  },
  toggleItem: async (id, family_id) => {
    await shoppingApi.toggleItem(id);
    await get().load(family_id);
  },
  addItem: async (shopping_list_id, payload, family_id) => {
    await shoppingApi.upsertItem(shopping_list_id, payload);
    await get().load(family_id);
  },
  complete: async (shopping_list_id, family_id) => {
    await shoppingApi.complete(shopping_list_id);
    await get().load(family_id);
  },
}));
