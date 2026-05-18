import { endpoints } from "@/services/endpoints";
import type { Family, FamilyActivity, User } from "@/types";
import { db, saveDb } from "./mockDb";
import { uid } from "@/utils/storage";

export const familyApi = {
  endpoint: endpoints.families,
  async detail(family_id: string): Promise<{ family: Family; members: User[]; activities: FamilyActivity[] }> {
    const state = await db();
    const family = state.families.find((item) => item.family_id === family_id);
    if (!family) throw new Error("Không tìm thấy gia đình.");
    const memberIds = state.family_members.filter((item) => item.family_id === family_id).map((item) => item.user_id);
    return {
      family,
      members: state.users.filter((item) => memberIds.includes(item.user_id)).map((item) => ({ ...item, password: undefined })),
      activities: state.family_activities.filter((item) => item.family_id === family_id),
    };
  },
  async rename(family_id: string, family_name: string) {
    const state = await db();
    const family = state.families.find((item) => item.family_id === family_id);
    if (!family) throw new Error("Không tìm thấy gia đình.");
    family.family_name = family_name;
    saveDb(state);
    return family;
  },
  async addMember(family_id: string, email: string) {
    const state = await db();
    const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("Email chưa đăng ký tài khoản.");
    if (state.family_members.some((item) => item.family_id === family_id && item.user_id === user.user_id)) throw new Error("Thành viên đã có trong gia đình.");
    state.family_members.push({ id: uid("family-member"), family_id, user_id: user.user_id });
    saveDb(state);
    return { ...user, password: undefined };
  },
};
