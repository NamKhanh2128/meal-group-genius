import type { Family } from "@/types";
import { db, saveDb } from "@/lib/mockDb";

export type FamilyWithMembers = Family & {
  members: {
    id: string;
    user_id: string;
    full_name?: string;
    email?: string;
    role?: string;
  }[];
  creator_name?: string;
};

export const adminFamilyApi = {
  async list(): Promise<FamilyWithMembers[]> {
    const state = await db();
    return [...state.families].map((fam) => {
      const creator = state.users.find((u) => u.user_id === fam.created_by);
      const members = state.family_members
        .filter((fm) => fm.family_id === fam.family_id)
        .map((fm) => {
          const user = state.users.find((u) => u.user_id === fm.user_id);
          return {
            id: fm.id,
            user_id: fm.user_id,
            full_name: user?.full_name,
            email: user?.email,
            role: user?.role,
          };
        });

      return {
        ...fam,
        creator_name: creator?.full_name ?? "Ẩn danh",
        members,
      };
    });
  },

  async delete(family_id: string): Promise<void> {
    const state = await db();
    state.families = state.families.filter((f) => f.family_id !== family_id);
    state.family_members = state.family_members.filter((fm) => fm.family_id !== family_id);
    state.fridge_items = state.fridge_items.filter((item) => item.family_id !== family_id);
    state.shopping_lists = state.shopping_lists.filter((l) => l.family_id !== family_id);
    state.shopping_list_items = state.shopping_list_items.filter((item) => {
      const isListDeleted = !state.shopping_lists.some((l) => l.shopping_list_id === item.shopping_list_id);
      return !isListDeleted;
    });
    state.meal_plans = state.meal_plans.filter((mp) => mp.family_id !== family_id);
    state.family_activities = state.family_activities.filter((act) => act.family_id !== family_id);
    saveDb(state);
  },
};
