import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { FamilyGroup, FeedItem } from "@/types";
import { groupService } from "@/services/group.service";
import { useAuth } from "./AuthContext";

interface GroupCtx {
  group: FamilyGroup | null;
  feed: FeedItem[];
  refresh: () => Promise<void>;
  pushFeed: (kind: FeedItem["kind"], message: string) => Promise<void>;
}

const Ctx = createContext<GroupCtx | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [group, setGroup] = useState<FamilyGroup | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const refresh = useCallback(async () => {
    const g = await groupService.current();
    setGroup(g);
    if (g) setFeed(await groupService.feed(g.id));
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const pushFeed: GroupCtx["pushFeed"] = async (kind, message) => {
    if (!group || !user) return;
    await groupService.pushFeed(group.id, user.id, user.name, kind, message);
    setFeed(await groupService.feed(group.id));
  };

  return <Ctx.Provider value={{ group, feed, refresh, pushFeed }}>{children}</Ctx.Provider>;
}

export function useGroup() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGroup must be inside GroupProvider");
  return c;
}