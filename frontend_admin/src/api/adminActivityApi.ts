import type { FamilyActivity } from "@/types";
import { db } from "@/lib/mockDb";

export type FamilyActivityWithDetails = FamilyActivity & {
  user_name?: string;
  user_email?: string;
  user_role?: string;
  family_name?: string;
};

export const adminActivityApi = {
  async list(): Promise<FamilyActivityWithDetails[]> {
    const state = await db();
    return [...state.family_activities]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((act) => {
        const user = state.users.find((u) => u.user_id === act.user_id);
        const family = state.families.find((f) => f.family_id === act.family_id);

        return {
          ...act,
          user_name: user?.full_name ?? "Người dùng ẩn danh",
          user_email: user?.email ?? "—",
          user_role: user?.role ?? "USER",
          family_name: family?.family_name ?? "Gia đình ẩn danh",
        };
      });
  },
};
