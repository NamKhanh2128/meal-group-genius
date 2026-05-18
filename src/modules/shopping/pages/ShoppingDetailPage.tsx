import { CheckCircle2, Circle, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useShoppingStore } from "@/app/store/shoppingStore";
import { BackButton } from "@/components/common/PageActions";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShoppingDetailPage() {
  const { id } = useParams();
  const family = useAuthStore((state) => state.family)!;
  const { lists, load, toggleItem, complete } = useShoppingStore();
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [completeOpen, setCompleteOpen] = useState(false);
  const list = lists.find((item) => item.shopping_list_id === id);
  useEffect(() => { void load(family.family_id); }, [family.family_id, load]);
  if (!list) return <ScreenHeader title="Đang tải danh sách" actions={<BackButton />} />;

  async function confirmItem() {
    if (!checkingId) return;
    await toggleItem(checkingId, family.family_id);
    toast.success(`Đã xác nhận số lượng mua: ${quantity}`);
    const latest = lists.find((item) => item.shopping_list_id === id);
    if (latest && latest.items.every((item) => item.bought_status || item.id === checkingId)) setCompleteOpen(true);
  }

  return (
    <>
      <ScreenHeader title={list.title} subtitle="Tick purchased → mini popup quantity bought → nếu tất cả checked thì hoàn tất mua sắm → cập nhật tủ lạnh." actions={<div className="flex gap-2"><BackButton /><Button onClick={() => setCompleteOpen(true)} className="bg-[#31c875]"><PackageCheck className="mr-2 h-4 w-4" />Hoàn tất</Button></div>} />
      <section className="rounded-[8px] bg-white p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-2">
          {list.items.map((item) => <button key={item.id} onClick={() => { setCheckingId(item.id); setQuantity(item.quantity); }} className={`flex items-center gap-3 rounded-[8px] border p-4 text-left ${item.bought_status ? "bg-[#f1f3f7] text-[#9188a1] line-through" : "bg-white"}`}>{item.bought_status ? <CheckCircle2 className="text-[#31c875]" /> : <Circle />}<span className="text-xl">{item.food.icon}</span><div><b>{item.food.food_name}</b><p className="text-xs">{item.quantity} {item.food.unit} · {item.food.category}</p></div></button>)}
        </div>
      </section>
      <AppModal open={Boolean(checkingId)} onOpenChange={(open) => !open && setCheckingId(null)} type="confirm" title="Số lượng đã mua" primaryLabel="Xác nhận" secondaryLabel="Hủy" onPrimary={confirmItem}>
        <Input type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      </AppModal>
      <AppModal open={completeOpen} onOpenChange={setCompleteOpen} type="warning" title="Hoàn tất mua sắm?" primaryLabel="Cập nhật vào tủ lạnh" secondaryLabel="Tiếp tục" onPrimary={async () => { await complete(list.shopping_list_id, family.family_id); toast.success("Đã cập nhật tồn kho trong tủ lạnh."); }}>
        Sau khi hoàn tất, hệ thống sẽ tạo fridge_items cho các mặt hàng đã mua.
      </AppModal>
    </>
  );
}
