import type { User } from "@/types";
import { db, saveDb, uid, getSession } from "@/lib/mockDb";

export const adminUserApi = {
  async list(): Promise<User[]> {
    const state = await db();
    return [...state.users].sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"));
  },

  async getById(user_id: string): Promise<User> {
    const state = await db();
    const user = state.users.find((u) => u.user_id === user_id);
    if (!user) throw new Error("Không tìm thấy người dùng.");
    return user;
  },

  async create(payload: Omit<User, "user_id">): Promise<User> {
    const state = await db();
    const emailLower = payload.email.toLowerCase();
    
    if (state.users.some((u) => u.email.toLowerCase() === emailLower)) {
      throw new Error("Email đã tồn tại trong hệ thống.");
    }
    
    const user: User = { 
      ...payload, 
      user_id: uid("user"),
      locked: payload.locked ?? false 
    };
    state.users.push(user);
    saveDb(state);
    return user;
  },

  async update(user_id: string, payload: Partial<User>): Promise<User> {
    const state = await db();
    const index = state.users.findIndex((u) => u.user_id === user_id);
    if (index < 0) throw new Error("Không tìm thấy người dùng.");

    if (payload.email) {
      const emailLower = payload.email.toLowerCase();
      if (
        state.users.some(
          (u) => u.user_id !== user_id && u.email.toLowerCase() === emailLower
        )
      ) {
        throw new Error("Email đã tồn tại trong hệ thống.");
      }
    }

    state.users[index] = { 
      ...state.users[index]!, 
      ...payload 
    };
    saveDb(state);
    return state.users[index]!;
  },

  async toggleLock(user_id: string): Promise<User> {
    const session = getSession();
    if (session?.user_id === user_id) {
      throw new Error("Không thể tự khóa tài khoản quản trị đang đăng nhập.");
    }

    const state = await db();
    const index = state.users.findIndex((u) => u.user_id === user_id);
    if (index < 0) throw new Error("Không tìm thấy người dùng.");

    const user = state.users[index]!;
    user.locked = !user.locked;
    saveDb(state);
    return user;
  },

  async delete(user_id: string): Promise<void> {
    const session = getSession();
    if (session?.user_id === user_id) {
      throw new Error("Không thể tự xóa tài khoản quản trị đang đăng nhập.");
    }

    const state = await db();
    const index = state.users.findIndex((u) => u.user_id === user_id);
    if (index < 0) throw new Error("Không tìm thấy người dùng.");

    const creatorFamilies = state.families.filter((f) => f.created_by === user_id);

    // Remove user
    state.users.splice(index, 1);

    // Clean up related family members
    state.family_members = state.family_members.filter((fm) => fm.user_id !== user_id);

    // Cascade delete families
    creatorFamilies.forEach((fam) => {
      const family_id = fam.family_id;
      state.families = state.families.filter((f) => f.family_id !== family_id);
      state.family_members = state.family_members.filter((fm) => fm.family_id !== family_id);
      state.fridge_items = state.fridge_items.filter((item) => item.family_id !== family_id);
      state.shopping_lists = state.shopping_lists.filter((l) => l.family_id !== family_id);
      state.meal_plans = state.meal_plans.filter((mp) => mp.family_id !== family_id);
      state.family_activities = state.family_activities.filter((act) => act.family_id !== family_id);
    });

    state.shopping_list_items = state.shopping_list_items.filter((item) => {
      return state.shopping_lists.some((l) => l.shopping_list_id === item.shopping_list_id);
    });

    saveDb(state);
  },

  async bulkDelete(user_ids: string[]): Promise<void> {
    const session = getSession();
    const currentAdminId = session?.user_id;
    
    if (currentAdminId && user_ids.includes(currentAdminId)) {
      throw new Error("Danh sách xóa chứa tài khoản quản trị đang đăng nhập. Vui lòng bỏ chọn tài khoản này.");
    }

    const state = await db();
    const creatorFamilies = state.families.filter((f) => user_ids.includes(f.created_by));

    // Filter out users
    state.users = state.users.filter((u) => !user_ids.includes(u.user_id));
    // Clean up family members
    state.family_members = state.family_members.filter((fm) => !user_ids.includes(fm.user_id));

    // Cascade delete families
    creatorFamilies.forEach((fam) => {
      const family_id = fam.family_id;
      state.families = state.families.filter((f) => f.family_id !== family_id);
      state.family_members = state.family_members.filter((fm) => fm.family_id !== family_id);
      state.fridge_items = state.fridge_items.filter((item) => item.family_id !== family_id);
      state.shopping_lists = state.shopping_lists.filter((l) => l.family_id !== family_id);
      state.meal_plans = state.meal_plans.filter((mp) => mp.family_id !== family_id);
      state.family_activities = state.family_activities.filter((act) => act.family_id !== family_id);
    });

    state.shopping_list_items = state.shopping_list_items.filter((item) => {
      return state.shopping_lists.some((l) => l.shopping_list_id === item.shopping_list_id);
    });

    saveDb(state);
  },

  async resetPassword(user_id: string, new_password: string): Promise<void> {
    const state = await db();
    const user = state.users.find((u) => u.user_id === user_id);
    if (!user) throw new Error("Không tìm thấy người dùng.");
    
    user.password = new_password;
    saveDb(state);
  },
};
