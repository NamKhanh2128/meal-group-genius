import { endpoints } from "@/shared/constants/endpoints";
import type { Family, FamilyActivity, User } from "@/types";
import { db, saveDb } from "@/shared/lib/mockDb";
import { uid } from "@/shared/utils/storage";

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
  async addMemberById(family_id: string, user_id: string) {
    const state = await db();
    const user = state.users.find((item) => item.user_id === user_id);
    if (!user) throw new Error("Không tìm thấy người dùng với ID này.");
    if (state.family_members.some((item) => item.family_id === family_id && item.user_id === user.user_id)) throw new Error("Thành viên đã có trong gia đình.");
    state.family_members.push({ id: uid("family-member"), family_id, user_id: user.user_id });
    saveDb(state);
    return { ...user, password: undefined };
  },
  async joinFamilyById(family_id: string, user_id: string) {
    const state = await db();
    const family = state.families.find((f) => f.family_id === family_id);
    if (!family) throw new Error("Không tìm thấy gia đình với ID này.");
    if (state.family_members.some((item) => item.family_id === family_id && item.user_id === user_id)) throw new Error("Bạn đã là thành viên của gia đình này.");
    state.family_members.push({ id: uid("family-member"), family_id, user_id });
    saveDb(state);
    return family;
  },
  async createFamily(family_name: string, user_id: string) {
    const state = await db();
    const family_id = uid("family");
    const family: Family = { family_id, family_name, created_by: user_id };
    state.families.push(family);
    state.family_members.push({ id: uid("family-member"), family_id, user_id });
    saveDb(state);
    return family;
  },
  async assignShoppingTask(family_id: string, shopping_list_id: string, user_id: string, actor_id: string) {
    const state = await db();
    const list = state.shopping_lists.find((item) => item.family_id === family_id && item.shopping_list_id === shopping_list_id);
    if (!list) throw new Error("Không tìm thấy danh sách mua sắm.");
    if (!state.family_members.some((member) => member.family_id === family_id && member.user_id === user_id)) throw new Error("Người dùng không thuộc gia đình.");
    list.assigned_user_id = user_id;
    state.family_activities.unshift({
      id: uid("act"),
      family_id,
      user_id: actor_id,
      action_type: "family",
      message: "phân công nhiệm vụ mua hàng",
      target: list.title,
      status: "assigned",
      created_at: new Date().toISOString(),
    });
    saveDb(state);
  },
  async respondShoppingTask(family_id: string, shopping_list_id: string, user_id: string, status: "accepted" | "rejected") {
    const state = await db();
    const list = state.shopping_lists.find((item) => item.family_id === family_id && item.shopping_list_id === shopping_list_id);
    if (!list) throw new Error("Không tìm thấy danh sách mua sắm.");
    state.family_activities.unshift({
      id: uid("act"),
      family_id,
      user_id,
      action_type: "family",
      message: status === "accepted" ? "nhận nhiệm vụ mua hàng" : "từ chối nhiệm vụ mua hàng",
      target: list.title,
      status,
      created_at: new Date().toISOString(),
    });
    saveDb(state);
  },

  async transferAdmin(family_id: string, fromUserId: string, toUserId: string) {
    const state = await db();
    const family = state.families.find((f) => f.family_id === family_id);
    if (!family) throw new Error("Không tìm thấy gia đình.");
    if (family.created_by !== fromUserId) throw new Error("Bạn không phải quản trị viên gia đình.");
    if (fromUserId === toUserId) throw new Error("Không thể chuyển quyền cho chính mình.");
    const isMember = state.family_members.some((m) => m.family_id === family_id && m.user_id === toUserId);
    if (!isMember) throw new Error("Người được chuyển quyền không thuộc gia đình.");
    family.created_by = toUserId;
    state.family_activities.unshift({
      id: uid("act"),
      family_id,
      user_id: fromUserId,
      action_type: "family",
      message: `chuyển quyền quản trị gia đình cho ${state.users.find((u) => u.user_id === toUserId)?.full_name ?? "thành viên"}`,
      target: family.family_name,
      status: "transferred",
      created_at: new Date().toISOString(),
    });
    saveDb(state);
    return family;
  },
};
