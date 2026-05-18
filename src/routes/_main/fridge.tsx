import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { fridgeService } from "@/services/fridge.service";
import { fmtDate, daysUntil } from "@/utils/dateHelpers";
import type { FoodItem, FoodCategory, FoodLocation, FoodUnit } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_main/fridge")({
  head: () => ({ meta: [{ title: "Tủ lạnh — NATEAT" }] }),
  component: FridgePage,
});

const CATS: FoodCategory[] = ["Rau củ", "Thịt cá", "Đồ khô", "Sữa & Trứng", "Gia vị", "Khác"];
const LOCS: FoodLocation[] = ["Ngăn mát", "Ngăn đông", "Kệ thường"];
const UNITS: FoodUnit[] = ["kg", "g", "lít", "ml", "quả", "củ", "miếng", "gói"];

function FridgePage() {
  const { group, pushFeed } = useGroup();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => { if (group) setItems(await fridgeService.list(group.id)); };
  useEffect(() => { refresh(); }, [group]);

  const filtered = items.filter((f) =>
    f.name.toLowerCase().includes(q.toLowerCase()) &&
    (catFilter === "all" || f.category === catFilter)
  );

  async function remove(id: string) {
    if (!confirm("Xác nhận xoá thực phẩm này?")) return;
    await fridgeService.remove(id);
    await refresh();
    await pushFeed("fridge", "xoá 1 mục khỏi tủ lạnh");
    toast.success("Đã xoá");
  }

  return (
    <div className="space-y-6">
      <PageHero title="Quản lý tủ lạnh ❄️" subtitle={`${items.length} mục · ${items.filter((i) => daysUntil(i.expiryDate) <= 3).length} sắp hết hạn`} />
      <div className="rounded-3xl bg-card p-6 shadow-card">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm thực phẩm…" className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={() => { setEditing(null); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Thêm thực phẩm
              </Button>
            </DialogTrigger>
            <FoodDialog
              editing={editing}
              onSubmit={async (data) => {
                if (!group) return;
                if (editing) {
                  await fridgeService.update(editing.id, data);
                  await pushFeed("fridge", `cập nhật "${data.name}" trong tủ lạnh`);
                  toast.success("Đã cập nhật");
                } else {
                  await fridgeService.add({ ...data, familyId: group.id });
                  await pushFeed("fridge", `thêm "${data.name}" vào tủ lạnh`);
                  toast.success("Đã thêm");
                }
                setOpen(false);
                refresh();
              }}
            />
          </Dialog>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr><th className="p-3">Thực phẩm</th><th className="p-3">Số lượng</th><th className="p-3">Danh mục</th><th className="p-3">Vị trí</th><th className="p-3">Hết hạn</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const d = daysUntil(f.expiryDate);
                return (
                  <tr key={f.id} className="border-t border-border hover:bg-secondary/30 transition">
                    <td className="p-3 font-medium">{f.icon} {f.name}</td>
                    <td className="p-3">{f.quantity} {f.unit}</td>
                    <td className="p-3 text-muted-foreground">{f.category}</td>
                    <td className="p-3 text-muted-foreground">{f.location}</td>
                    <td className="p-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${d <= 2 ? "bg-destructive/15 text-destructive" : d <= 3 ? "bg-warning/15 text-warning" : "bg-secondary text-muted-foreground"}`}>{fmtDate(f.expiryDate)} · {d}d</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => { setEditing(f); setOpen(true); }} className="text-muted-foreground hover:text-primary mr-3"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Không có thực phẩm nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FoodDialog({ editing, onSubmit }: { editing: FoodItem | null; onSubmit: (d: Omit<FoodItem, "id" | "createdAt" | "familyId">) => void | Promise<void> }) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    quantity: editing?.quantity ?? 1,
    unit: (editing?.unit ?? "kg") as FoodUnit,
    category: (editing?.category ?? "Khác") as FoodCategory,
    location: (editing?.location ?? "Ngăn mát") as FoodLocation,
    expiryDate: editing?.expiryDate?.slice(0, 10) ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    icon: editing?.icon ?? "🍱",
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? "Cập nhật" : "Thêm"} thực phẩm</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return toast.error("Nhập tên thực phẩm"); onSubmit({ ...form, expiryDate: new Date(form.expiryDate).toISOString() }); }} className="space-y-3">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <div><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} /></div>
          <div><Label>Tên *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Số lượng</Label><Input type="number" min={0} step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
          <div><Label>Đơn vị</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as FoodUnit })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Danh mục</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as FoodCategory })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label>Vị trí</Label>
            <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v as FoodLocation })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOCS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div><Label>Hạn sử dụng</Label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
        <DialogFooter><Button type="submit" className="rounded-xl">{editing ? "Cập nhật" : "Thêm vào tủ lạnh"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
