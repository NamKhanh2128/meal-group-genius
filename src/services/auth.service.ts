import { storage, delay, uid } from "@/utils/storage";
import type { User, FamilyGroup } from "@/types";
import { seedIfEmpty } from "./seed";

const KEY_CURRENT = "currentUser";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(350);
    seedIfEmpty();
    if (!password) throw new Error("Mật khẩu không được trống");
    const users = storage.get<User[]>("users", []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("Email không tồn tại");
    if (user.status === "banned") throw new Error("Tài khoản đã bị khoá");
    storage.set(KEY_CURRENT, user);
    storage.set("token", "mock-jwt-" + user.id);
    return user;
  },
  async register(data: { email: string; password: string; name: string }): Promise<User> {
    await delay(400);
    seedIfEmpty();
    const users = storage.get<User[]>("users", []);
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("Email đã tồn tại");
    }
    const userId = "user-" + uid();
    const familyId = "fam-" + uid();

    // Tạo gia đình mặc định 1 thành viên là user
    const fam: FamilyGroup = {
      id: familyId,
      name: `Gia đình của ${data.name}`,
      ownerId: userId,
      members: [{ userId, name: data.name, role: "owner", joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    const families = storage.get<FamilyGroup[]>("families", []);
    storage.set("families", [fam, ...families]);

    const user: User = {
      id: userId,
      email: data.email,
      name: data.name,
      role: "user",
      familyId,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    storage.set("users", [...users, user]);
    storage.set(KEY_CURRENT, user);
    storage.set("token", "mock-jwt-" + user.id);
    return user;
  },
  async logout(): Promise<void> {
    await delay(120);
    storage.remove(KEY_CURRENT);
    storage.remove("token");
  },
  current(): User | null {
    return storage.get<User | null>(KEY_CURRENT, null);
  },
  async updateProfile(patch: Partial<User>): Promise<User> {
    await delay(250);
    const cur = this.current();
    if (!cur) throw new Error("Chưa đăng nhập");
    const updated = { ...cur, ...patch };
    storage.set(KEY_CURRENT, updated);
    const users = storage.get<User[]>("users", []);
    storage.set("users", users.map((u) => (u.id === cur.id ? updated : u)));
    return updated;
  },
  async changePassword(_old: string, next: string): Promise<void> {
    await delay(300);
    if (next.length < 6) throw new Error("Mật khẩu mới tối thiểu 6 ký tự");
  },
};
