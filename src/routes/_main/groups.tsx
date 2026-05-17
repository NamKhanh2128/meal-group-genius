import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";

export const Route = createFileRoute("/_main/groups")({
  head: () => ({ meta: [{ title: "Gia đình — NATEAT" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { group } = useGroup();
  return (
    <div className="space-y-6">
      <PageHero title={group?.name ?? "Gia đình"} subtitle={`${group?.members.length ?? 0} thành viên`} />
      <div className="rounded-3xl bg-card p-6 shadow-card">
        <h3 className="font-bold mb-4">Thành viên</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {group?.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-warning to-warning/60 text-white font-bold">{m.name[0]}</div>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role === "owner" ? "Chủ nhóm" : "Thành viên"}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}