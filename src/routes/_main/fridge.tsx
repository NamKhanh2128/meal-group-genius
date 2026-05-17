import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { fridgeService } from "@/services/fridge.service";
import { fmtDate, daysUntil } from "@/utils/dateHelpers";
import type { FoodItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/fridge")({
  head: () => ({ meta: [{ title: "Tủ lạnh — NATEAT" }] }),
  component: FridgePage,
});

function FridgePage() {
  const { group, pushFeed } = useGroup();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { if (group) fridgeService.list(group.id).then(setItems); }, [group]);

  const filtered = items.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));

  async function remove(id: string) {
    await fridgeService.remove(id);
    setItems(items.filter((i) => i.id !== id));
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
          <Button className="rounded-xl">+ Thêm thực phẩm</Button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr><th className="p-3">Thực phẩm</th><th className="p-3">Số lượng</th><th className="p-3">Vị trí</th><th className="p-3">Hết hạn</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const d = daysUntil(f.expiryDate);
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="p-3 font-medium">{f.icon} {f.name}</td>
                    <td className="p-3">{f.quantity} {f.unit}</td>
                    <td className="p-3 text-muted-foreground">{f.location}</td>
                    <td className="p-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${d <= 2 ? "bg-destructive/15 text-destructive" : d <= 3 ? "bg-warning/15 text-warning" : "bg-secondary text-muted-foreground"}`}>{fmtDate(f.expiryDate)} · {d}d</span></td>
                    <td className="p-3 text-right"><button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}