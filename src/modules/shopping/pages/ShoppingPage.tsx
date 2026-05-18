import { CheckCircle2, ClipboardCheck, Plus, ShoppingCart, UserCheck, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useShoppingStore } from "@/app/store/shoppingStore";
import { BackButton } from "@/components/common/PageActions";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { formatDate, todayIso } from "@/utils/date";

type Tab = "today" | "week" | "done";

export function ShoppingPage() {
  const family = useAuthStore((state) => state.family)!;
  const { lists, load, complete } = useShoppingStore();
  const [tab, setTab] = useState<Tab>("today");
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [inventoryId, setInventoryId] = useState<string | null>(null);
  useEffect(() => { void load(family.family_id); }, [family.family_id, load]);

  const filtered = useMemo(() => lists.filter((list) => {
    if (tab === "done") return list.status === "DONE";
    if (tab === "today") return list.plan_date === todayIso() && list.status !== "DONE";
    return list.list_type === "weekly" && list.status !== "DONE";
  }), [lists, tab]);

  async function updateInventory(id: string) {
    await complete(id, family.family_id);
    toast.success("Cập nhật vào tủ lạnh thành công.");
  }

  return (
    <>
      <ScreenHeader title="Quản lý danh sách mua sắm" subtitle="Tabs hôm nay/tuần này/đã hoàn thành, nhận nhiệm vụ, tick purchased và cập nhật tồn kho." actions={<div className="flex gap-2"><BackButton /><Button asChild className="rounded-[8px] bg-[#ffb11f]"><Link to="/shopping/create"><Plus className="mr-2 h-4 w-4" />Tạo danh sách</Link></Button></div>} />
      <div className="mb-5 flex flex-wrap gap-2">
        {(["today", "week", "done"] as Tab[]).map((item) => <Button key={item} variant={tab === item ? "default" : "outline"} className={tab === item ? "bg-[#7655aa]" : ""} onClick={() => setTab(item)}>{item === "today" ? "Hôm nay" : item === "week" ? "Tuần này" : "Đã hoàn thành"}</Button>)}
      </div>
      <div className="grid gap-4">
        {filtered.map((list) => {
          const bought = list.items.filter((item) => item.bought_status).length;
          const allBought = list.items.length > 0 && bought === list.items.length;
          return (
            <section key={list.shopping_list_id} className="rounded-[8px] bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-xl font-extrabold">{list.title}</h3><p className="text-sm text-[#746d82]">{list.list_type === "weekly" ? "Theo tuần" : "Theo ngày"} · {formatDate(list.plan_date)} · {bought}/{list.items.length} đã mua</p></div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => toast.success("Đã nhận nhiệm vụ mua hàng.")}><UserCheck className="mr-2 h-4 w-4" />Nhận nhiệm vụ</Button>
                  <Button variant="outline" onClick={() => toast.warning("Đã từ chối nhiệm vụ mua hàng.")}><UserX className="mr-2 h-4 w-4" />Từ chối</Button>
                  <Button asChild variant="outline" className="rounded-[8px]"><Link to={`/shopping/${list.shopping_list_id}`}><ShoppingCart className="mr-2 h-4 w-4" />Xem</Link></Button>
                  <Button onClick={() => allBought ? setCompleteId(list.shopping_list_id) : setInventoryId(list.shopping_list_id)} className="rounded-[8px] bg-[#31c875]" disabled={list.status === "DONE"}><CheckCircle2 className="mr-2 h-4 w-4" />Cập nhật tủ lạnh</Button>
                </div>
              </div>
            </section>
          );
        })}
        {filtered.length === 0 && <div className="rounded-[8px] bg-white p-10 text-center shadow-card"><ClipboardCheck className="mx-auto h-10 w-10 text-[#7655aa]" /><b className="mt-3 block">Không có danh sách trong tab này</b><Button asChild className="mt-4 bg-[#ffb11f]"><Link to="/shopping/create">Tạo danh sách</Link></Button></div>}
      </div>
      <AppModal open={Boolean(completeId)} onOpenChange={(open) => !open && setCompleteId(null)} type="confirm" title="Hoàn tất mua sắm?" primaryLabel="Hoàn tất" secondaryLabel="Tiếp tục" onPrimary={() => completeId && setInventoryId(completeId)}>
        Tất cả mặt hàng đã được đánh dấu đã mua. Bạn có muốn hoàn tất danh sách?
      </AppModal>
      <AppModal open={Boolean(inventoryId)} onOpenChange={(open) => !open && setInventoryId(null)} type="warning" title="Cập nhật vào tủ lạnh?" primaryLabel="Cập nhật" secondaryLabel="Để sau" onPrimary={() => inventoryId && updateInventory(inventoryId)}>
        Các mặt hàng đã mua sẽ được thêm vào fridge_items.
      </AppModal>
    </>
  );
}
