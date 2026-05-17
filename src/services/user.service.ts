import { storage, delay } from "@/utils/storage";
import type { User } from "@/types";

export const userService = {
  async list(): Promise<User[]> {
    // TODO: Replace with real API call
    await delay(200);
    return storage.get<User[]>("users", []);
  },
  async toggleBan(id: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const users = storage.get<User[]>("users", []);
    const u = users.find((x) => x.id === id);
    if (u) u.status = u.status === "banned" ? "active" : "banned";
    storage.set("users", users);
  },
  async resetPassword(_id: string): Promise<string> {
    // TODO: Replace with real API call
    await delay(200);
    return "Nateat@2026";
  },
};