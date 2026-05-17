import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { shoppingService } from "@/services/shopping.service";
import { fridgeService } from "@/services/fridge.service";
import type { ShoppingList } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/shopping")({
  head: () => ({ meta: [{ title: "Mua sắm — NATEAT" }] }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const { group, pushFeed } = useGroup();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const refresh = async () => { if (group) setLists(await shoppingService.list(group.id)); };
  useEffect(() => { refresh(); }, [group]);

  async function toggle(listId: string, itemId: string) {
    await shoppingService.toggleItem(listId, itemId);
    refresh();
  }

  async function pushToFridge(list: ShoppingList) {
    if (!group) return;
    const bought = list.items.filter((i) => i.bought);
    await fridgeService.addFromShopping(group.id, bought.map((b) => ({ name: b.name, quantity: b.quantity, unit: b.unit, category: b.category })));
    await shoppingService.complete(list.id);
    await pushFeed("complete", `cập nhật ${bought.length} mục vào tủ lạnh`);
    toast.success("Đã cập nhật tồn kho vào tủ lạnh");
    refresh();
  }

  return (
    <div className="space-y-6">
      <PageHero title="Danh sách mua sắm 🛒" subtitle="Lên kế hoạch và chia sẻ với cả nhà" />
      {lists.map((list) => {
        const allBought = list.items.length > 0 && list.items.every((i) => i.bought);
        return (
          <div key={list.id} className="rounded-3xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{list.title}</h3>
                <p className="text-xs text-muted-foreground">{list.items.length} mục · {list.completed ? "Đã hoàn tất" : "Đang mua"}</p>
              </div>
              {allBought && !list.completed && (
                <Button onClick={() => pushToFridge(list)} className="rounded-xl bg-success hover:bg-success/90 text-success-foreground">
                  <PackageCheck className="mr-1.5 h-4 w-4" /> Cập nhật tồn kho vào tủ lạnh
                </Button>
              )}
            </div>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {list.items.map((it) => (
                <li key={it.id}>
                  <button onClick={() => toggle(list.id, it.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${it.bought ? "bg-secondary/60" : "bg-secondary/30 hover:bg-secondary"}`}>
                    {it.bought ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <span className={`flex-1 text-sm ${it.bought ? "line-through text-muted-foreground" : "font-medium"}`}>{it.name} ({it.quantity}{it.unit})</span>
                    <span className="text-xs text-muted-foreground">{it.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}