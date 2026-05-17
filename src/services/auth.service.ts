import { storage, delay } from "@/utils/storage";
import type { User } from "@/types";
import { seedIfEmpty } from "./seed";

const KEY_CURRENT = "currentUser";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    // TODO: Replace with real API call (e.g., axios.post('/auth/login'))
    await delay(400);
    seedIfEmpty();
    if (!password) throw new Error("Mật khẩu không được trống");
    const users = storage.get<User[]>("users", []);
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("Email không tồn tại");
    if (user.status === "banned") throw new Error("Tài khoản đã bị khoá");
    storage.set(KEY_CURRENT, user);
    storage.set("token", "mock-jwt-" + user.id);
    return user;
  },
  async register(data: { email: string; password: string; name: string }): Promise<User> {
    // TODO: Replace with real API call
    await delay(400);
    seedIfEmpty();
    const users = storage.get<User[]>("users", []);
    if (users.some((u) => u.email === data.email)) throw new Error("Email đã tồn tại");
    const user: User = {
      id: "user-" + Math.random().toString(36).slice(2, 8),
      email: data.email,
      name: data.name,
      role: "user",
      familyId: "fam-1",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    storage.set("users", [...users, user]);
    storage.set(KEY_CURRENT, user);
    storage.set("token", "mock-jwt-" + user.id);
    return user;
  },
  async logout(): Promise<void> {
    // TODO: Replace with real API call
    await delay(100);
    storage.remove(KEY_CURRENT);
    storage.remove("token");
  },
  current(): User | null {
    return storage.get<User | null>(KEY_CURRENT, null);
  },
  async updateProfile(patch: Partial<User>): Promise<User> {
    // TODO: Replace with real API call
    await delay(300);
    const cur = this.current();
    if (!cur) throw new Error("Chưa đăng nhập");
    const updated = { ...cur, ...patch };
    storage.set(KEY_CURRENT, updated);
    const users = storage.get<User[]>("users", []);
    storage.set("users", users.map((u) => (u.id === cur.id ? updated : u)));
    return updated;
  },
  async changePassword(_old: string, _next: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(300);
    if (_next.length < 6) throw new Error("Mật khẩu mới tối thiểu 6 ký tự");
  },
};