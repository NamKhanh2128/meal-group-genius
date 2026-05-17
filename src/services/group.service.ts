import { storage, delay, uid } from "@/utils/storage";
import type { FamilyGroup, FeedItem, FeedKind } from "@/types";

export const groupService = {
  async current(): Promise<FamilyGroup | null> {
    // TODO: Replace with real API call
    await delay(150);
    return storage.get<FamilyGroup | null>("family", null);
  },
  async addMember(name: string, _email: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(250);
    const fam = storage.get<FamilyGroup | null>("family", null);
    if (!fam) return;
    fam.members.push({ userId: "user-" + uid(), name, role: "member", joinedAt: new Date().toISOString() });
    storage.set("family", fam);
  },
  async removeMember(userId: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(150);
    const fam = storage.get<FamilyGroup | null>("family", null);
    if (!fam) return;
    fam.members = fam.members.filter((m) => m.userId !== userId);
    storage.set("family", fam);
  },
  async feed(familyId: string): Promise<FeedItem[]> {
    // TODO: Replace with real API call
    await delay(150);
    return storage.get<FeedItem[]>("feed", []).filter((f) => f.familyId === familyId);
  },
  async pushFeed(familyId: string, userId: string, userName: string, kind: FeedKind, message: string): Promise<void> {
    // TODO: Replace with real API call
    await delay(50);
    const all = storage.get<FeedItem[]>("feed", []);
    all.unshift({ id: uid(), familyId, userId, userName, kind, message, createdAt: new Date().toISOString() });
    storage.set("feed", all.slice(0, 50));
  },
};