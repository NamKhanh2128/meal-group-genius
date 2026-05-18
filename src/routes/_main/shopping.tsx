import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { shoppingService } from "@/services/shopping.service";
import { fridgeService } from "@/services/fridge.service";
import type { ShoppingList, FoodCategory, FoodUnit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, PackageCheck, Plus, Trash2, FileText, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fmtDate } from "@/utils/dateHelpers";

export const Route = createFileRoute("/_main/shopping")({
  head: () => ({ meta: [{ title: "Mua sắm — NATEAT" }] }),
  component: ShoppingPage,
});

const CATS: FoodCategory[] = ["Rau củ", "Thịt cá", "Đồ khô", "Sữa & Trứng", "Gia vị", "Khác"];
const UNITS: FoodUnit[] = ["kg", "g", "lít", "ml", "quả", "củ", "miếng", "gói"];

function ShoppingPage() {
  const { group, pushFeed } = useGroup();
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [openNew, setOpenNew] = useState(false);

  const refresh = async () => { if (group) setLists(await shoppingService.list(group.id)); };
  useEffect(() => { refresh(); }, [group]);

  async function toggle(listId: string, itemId: string) {
    await shoppingService.toggleItem(listId, itemId);
    refresh();
  }

  async function pushToFridge(list: ShoppingList) {
    if (!group) return;
    const bought = list.items.filter((i) => i.bought);
    if (bought.length === 0) return toast.error("Chưa có mặt hàng nào được mua");
    await fridgeService.addFromShopping(group.id, bought.map((b) => ({ name: b.name, quantity: b.quantity, unit: b.unit, category: b.category })));
    await shoppingService.complete(list.id);
    await pushFeed("complete", `cập nhật ${bought.length} mục vào tủ lạnh từ "${list.title}"`);
    toast.success("Đã cập nhật tồn kho vào tủ lạnh");
    refresh();
  }

  async function removeList(id: string) {
    if (!confirm("Xác nhận xoá danh sách?")) return;
    await shoppingService.remove(id);
    refresh();
    toast.success("Đã xoá");
  }

  return (
    <div className="space-y-6">
      <PageHero title="Danh sách mua sắm 🛒" subtitle="Lên kế hoạch và chia sẻ với cả nhà">
        <div className="mt-4">
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-warning hover:bg-warning/90 text-warning-foreground"><Plus className="h-4 w-4 mr-1.5" />Tạo danh sách mới</Button>
            </DialogTrigger>
            <NewListDialog onCreate={async (data) => {
              if (!group || !user) return;
              await shoppingService.create({ familyId: group.id, createdBy: user.id, ...data });
              await pushFeed("shopping", `tạo danh sách "${data.title}"`);
              setOpenNew(false);
              refresh();
              toast.success("Đã tạo danh sách");
            }} />
          </Dialog>
        </div>
      </PageHero>

      {lists.length === 0 && (
        <div className="rounded-3xl bg-card p-10 text-center shadow-card text-muted-foreground">Chưa có danh sách nào.</div>
      )}

      {lists.map((list) => {
        const allBought = list.items.length > 0 && list.items.every((i) => i.bought);
        const done = list.items.filter((i) => i.bought).length;
        return (
          <div key={list.id} className="rounded-3xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{list.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${list.status === "DONE" ? "bg-success/15 text-success" : "bg-info/15 text-info"}`}>
                    {list.status === "DONE" ? "Hoàn tất" : "Đang mua"}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs bg-secondary text-muted-foreground">{list.type === "weekly" ? "Theo tuần" : "Theo ngày"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {done}/{list.items.length} đã mua {list.planDate && ` · Ngày: ${fmtDate(list.planDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AddItemDialog onAdd={async (it) => { await shoppingService.addItem(list.id, it); refresh(); toast.success("Đã thêm"); }} />
                {allBought && list.status !== "DONE" && (
                  <Button onClick={() => pushToFridge(list)} className="rounded-xl bg-success hover:bg-success/90 text-success-foreground">
                    <PackageCheck className="mr-1.5 h-4 w-4" /> Cập nhật vào tủ lạnh
                  </Button>
                )}
                {list.status !== "DONE" && done > 0 && !allBought && (
                  <Button onClick={() => pushToFridge(list)} variant="outline" className="rounded-xl">
                    <CheckCheck className="mr-1.5 h-4 w-4" /> Hoàn tất một phần
                  </Button>
                )}
                <button onClick={() => removeList(list.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {list.items.map((it) => (
                <li key={it.id} className="flex items-center gap-2">
                  <button onClick={() => toggle(list.id, it.id)} className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${it.bought ? "bg-secondary/60" : "bg-secondary/30 hover:bg-secondary"}`}>
                    {it.bought ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <span className={`flex-1 text-sm ${it.bought ? "line-through text-muted-foreground" : "font-medium"}`}>{it.name} ({it.quantity}{it.unit})</span>
                    <span className="text-xs text-muted-foreground">{it.category}</span>
                  </button>
                  <button onClick={async () => { await shoppingService.removeItem(list.id, it.id); refresh(); }} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
              {list.items.length === 0 && <li className="col-span-2 text-sm text-muted-foreground text-center py-6">Chưa có mặt hàng. Bấm "Thêm" để bắt đầu.</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function NewListDialog({ onCreate }: { onCreate: (d: { title: string; type: "daily" | "weekly"; planDate?: string }) => void }) {
  const [form, setForm] = useState({ title: "", type: "weekly" as "daily" | "weekly", planDate: new Date().toISOString().slice(0, 10) });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Tạo danh sách mua sắm</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.title.trim()) return toast.error("Nhập tiêu đề"); onCreate(form); }} className="space-y-3">
        <div><Label>Tiêu đề *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Chợ thứ 7" required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Kiểu</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="daily">Theo ngày</SelectItem><SelectItem value="weekly">Theo tuần</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Ngày dự kiến</Label><Input type="date" value={form.planDate} onChange={(e) => setForm({ ...form, planDate: e.target.value })} /></div>
        </div>
        <DialogFooter><Button type="submit" className="rounded-xl"><FileText className="h-4 w-4 mr-1.5" />Tạo</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

function AddItemDialog({ onAdd }: { onAdd: (it: { name: string; quantity: number; unit: FoodUnit; category: FoodCategory }) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: 1, unit: "kg" as FoodUnit, category: "Khác" as FoodCategory });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" className="rounded-xl"><Plus className="h-4 w-4 mr-1.5" />Thêm mặt hàng</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Thêm mặt hàng</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; onAdd(form); setOpen(false); setForm({ name: "", quantity: 1, unit: "kg", category: "Khác" }); }} className="space-y-3">
          <div><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Số lượng</Label><Input type="number" min={0} step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div><Label>Đơn vị</Label><Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as FoodUnit })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Danh mục</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as FoodCategory })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button type="submit" className="rounded-xl">Thêm</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
