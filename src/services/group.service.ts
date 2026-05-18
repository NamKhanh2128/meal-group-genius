import { storage, delay, uid } from "@/utils/storage";
import { authService } from "./auth.service";
import type { FamilyGroup, FeedItem, FeedKind } from "@/types";

const KEY = "families";

function loadAll(): FamilyGroup[] {
  return storage.get<FamilyGroup[]>(KEY, []);
}
function saveAll(list: FamilyGroup[]) {
  storage.set(KEY, list);
}

export const groupService = {
  async current(): Promise<FamilyGroup | null> {
    await delay(80);
    const user = authService.current();
    if (!user?.familyId) return null;
    return loadAll().find((f) => f.id === user.familyId) ?? null;
  },
  async get(id: string): Promise<FamilyGroup | null> {
    await delay(60);
    return loadAll().find((f) => f.id === id) ?? null;
  },
  async create(name: string, owner: { id: string; name: string }): Promise<FamilyGroup> {
    await delay(150);
    const fam: FamilyGroup = {
      id: "fam-" + uid(),
      name,
      ownerId: owner.id,
      members: [{ userId: owner.id, name: owner.name, role: "owner", joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    saveAll([fam, ...loadAll()]);
    return fam;
  },
  async rename(id: string, name: string): Promise<void> {
    await delay(120);
    const all = loadAll();
    const f = all.find((x) => x.id === id);
    if (f) f.name = name;
    saveAll(all);
  },
  async addMember(familyId: string, name: string): Promise<void> {
    await delay(200);
    const all = loadAll();
    const f = all.find((x) => x.id === familyId);
    if (!f) return;
    f.members.push({ userId: "user-" + uid(), name, role: "member", joinedAt: new Date().toISOString() });
    saveAll(all);
  },
  async removeMember(familyId: string, userId: string): Promise<void> {
    await delay(150);
    const all = loadAll();
    const f = all.find((x) => x.id === familyId);
    if (!f) return;
    f.members = f.members.filter((m) => m.userId !== userId);
    saveAll(all);
  },
  async feed(familyId: string): Promise<FeedItem[]> {
    await delay(120);
    return storage.get<FeedItem[]>("feed", []).filter((f) => f.familyId === familyId);
  },
  async pushFeed(familyId: string, userId: string, userName: string, kind: FeedKind, message: string): Promise<void> {
    await delay(50);
    const all = storage.get<FeedItem[]>("feed", []);
    all.unshift({ id: uid(), familyId, userId, userName, kind, message, createdAt: new Date().toISOString() });
    storage.set("feed", all.slice(0, 80));
  },
};
