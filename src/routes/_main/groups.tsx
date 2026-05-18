import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { groupService } from "@/services/group.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_main/groups")({
  head: () => ({ meta: [{ title: "Gia đình — NATEAT" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { group, refresh, pushFeed } = useGroup();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [famName, setFamName] = useState("");

  useEffect(() => { if (group) setFamName(group.name); }, [group]);

  if (!group) return <div className="rounded-3xl bg-card p-10 text-center shadow-card">Đang tải gia đình…</div>;
  const isOwner = user?.id === group.ownerId;

  async function addMember() {
    if (!name.trim()) return;
    await groupService.addMember(group!.id, name.trim());
    await pushFeed("meal", `mời "${name}" vào gia đình`);
    setName(""); setOpen(false); refresh();
    toast.success("Đã thêm thành viên");
  }

  async function removeMember(userId: string, mName: string) {
    if (!confirm(`Xoá ${mName} khỏi gia đình?`)) return;
    await groupService.removeMember(group!.id, userId);
    refresh();
    toast.success("Đã xoá");
  }

  async function saveName() {
    await groupService.rename(group!.id, famName);
    setEditing(false); refresh();
    toast.success("Đã đổi tên gia đình");
  }

  return (
    <div className="space-y-6">
      <PageHero title={group.name} subtitle={`${group.members.length} thành viên · Chủ nhóm: ${group.members.find((m) => m.role === "owner")?.name ?? "—"}`} />
      <div className="rounded-3xl bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Input value={famName} onChange={(e) => setFamName(e.target.value)} className="w-72" />
                <Button size="icon" onClick={saveName}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => { setFamName(group.name); setEditing(false); }}><X className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg">{group.name}</h3>
                {isOwner && <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>}
              </>
            )}
          </div>
          {isOwner && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-1.5" />Mời thành viên</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Thêm thành viên</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Tên thành viên</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Mai" /></div>
                </div>
                <DialogFooter><Button onClick={addMember} className="rounded-xl">Thêm</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {group.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-warning to-warning/60 text-white font-bold">{m.name[0]?.toUpperCase()}</div>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role === "owner" ? "Chủ nhóm" : "Thành viên"}</div>
              </div>
              {isOwner && m.role !== "owner" && (
                <button onClick={() => removeMember(m.userId, m.name)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
