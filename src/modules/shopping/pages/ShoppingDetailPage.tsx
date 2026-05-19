import { CheckCircle2, Circle, PackageCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useShoppingStore } from "@/app/store/shoppingStore";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function ShoppingDetailPage() {
  const { id } = useParams();
  const family = useAuthStore((state) => state.family)!;
  const { lists, load, recordPurchase, deleteItems, complete } = useShoppingStore();
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const list = lists.find((item) => item.shopping_list_id === id);
  const allCompleted = useMemo(() => Boolean(list?.items.length) && list!.items.every((item) => item.item_status === "COMPLETED"), [list]);

  useEffect(() => { void load(family.family_id); }, [family.family_id, load]);
  if (!list) return <ScreenHeader title="Đang tải danh sách" />;

  async function confirmItem() {
    if (!checkingId) return;
    setSubmitting(true);
    try {
      await recordPurchase(checkingId, quantity, family.family_id);
      const item = list.items.find((row) => row.id === checkingId);
      const status = quantity >= (item?.quantity ?? 0) ? "completed" : "partial";
      toast.success(`Đã cập nhật ${status}. Inventory +${quantity}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật mặt hàng.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!selectedIds.length) return;
    await deleteItems(list.shopping_list_id, selectedIds, family.family_id);
    setSelectedIds([]);
    toast.success("Đã xóa các mặt hàng đã chọn.");
  }

  async function confirmComplete() {
    try {
      await complete(list.shopping_list_id, family.family_id);
      toast.success("Danh sách đã hoàn tất.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Danh sách còn mặt hàng partial hoặc pending.");
    }
  }

  return (
    <>
      <ScreenHeader
        title={list.title}
        subtitle="Bought quantity quyết định PARTIAL/COMPLETED. Inventory chỉ cộng delta bought quantity đúng một lần."
        actions={<div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!selectedIds.length} onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Xóa hàng loạt</Button><Button disabled={!allCompleted || submitting} onClick={() => setCompleteOpen(true)} className="bg-[#31c875]"><PackageCheck className="mr-2 h-4 w-4" />Hoàn tất</Button></div>}
      />
      <section className="rounded-[8px] bg-white p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-2">
          {list.items.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 rounded-[8px] border p-4 transition ${item.item_status === "COMPLETED" ? "bg-[#f1f3f7]" : "bg-white hover:border-[#7655aa]"}`}>
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={(checked) => setSelectedIds((prev) => checked ? [...prev, item.id] : prev.filter((id) => id !== item.id))}
              />
              <button className="flex flex-1 items-center gap-3 text-left" onClick={() => { setCheckingId(item.id); setQuantity(item.bought_quantity ?? item.quantity); }}>
                {item.item_status === "COMPLETED" ? <CheckCircle2 className="text-[#31c875]" /> : <Circle className={item.item_status === "PARTIAL" ? "text-[#ffad1f]" : "text-[#9188a1]"} />}
                <span className="text-xl">{item.food.icon}</span>
                <div>
                  <b>{item.food.food_name}</b>
                  <p className="text-xs text-[#746d82]">
                    Need {item.quantity} {item.food.unit} · Bought {item.bought_quantity ?? 0} · Remaining {item.remaining_quantity ?? item.quantity} · {item.item_status ?? "PENDING"}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>
      <AppModal open={Boolean(checkingId)} onOpenChange={(open) => !open && setCheckingId(null)} type="confirm" title="Số lượng đã mua" primaryLabel={submitting ? "Đang cập nhật..." : "Xác nhận"} secondaryLabel="Hủy" onPrimary={confirmItem}>
        <Input min={0.01} step="0.01" type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      </AppModal>
      <AppModal open={deleteOpen} onOpenChange={setDeleteOpen} type="confirm" title="Xóa các mặt hàng đã chọn?" primaryLabel="Xóa" secondaryLabel="Hủy" onPrimary={confirmDelete}>
        Hành động này sẽ xóa {selectedIds.length} mặt hàng khỏi danh sách.
      </AppModal>
      <AppModal open={completeOpen} onOpenChange={setCompleteOpen} type="confirm" title="Hoàn tất mua sắm?" primaryLabel="Hoàn tất" secondaryLabel="Tiếp tục" onPrimary={confirmComplete}>
        Chỉ danh sách có tất cả item COMPLETED mới được chuyển DONE.
      </AppModal>
    </>
  );
}
