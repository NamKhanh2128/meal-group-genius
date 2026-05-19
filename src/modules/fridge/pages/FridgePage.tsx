import { Download, Edit, Filter, Plus, Search, SortAsc, Trash2, Utensils, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useFridgeStore } from "@/app/store/fridgeStore";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodCategories, foodLocations } from "@/constants/options";
import { daysUntil, formatDate } from "@/utils/date";

export function FridgePage() {
  const navigate = useNavigate();
  const family = useAuthStore((state) => state.family)!;
  const { items, load, remove, update, loading } = useFridgeStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expiry, setExpiry] = useState("all");
  const [location, setLocation] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [consumeId, setConsumeId] = useState<string | null>(null);
  const [consumeQuantity, setConsumeQuantity] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => { void load(family.family_id); }, [family.family_id, load]);

  const expiring = items.filter((item) => daysUntil(item.expiry_date) <= 3);
  const filtered = useMemo(() => items.filter((item) => {
    const matchesName = item.food.food_name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || item.food.category === category;
    const matchesExpiry = expiry === "all" || (expiry === "soon" ? daysUntil(item.expiry_date) <= 3 : daysUntil(item.expiry_date) < 0);
    const matchesLocation = location === "all" || item.location === location;
    return matchesName && matchesCategory && matchesExpiry && matchesLocation;
  }).sort((a, b) => sortAsc ? daysUntil(a.expiry_date) - daysUntil(b.expiry_date) : daysUntil(b.expiry_date) - daysUntil(a.expiry_date)), [items, query, category, expiry, location, sortAsc]);

  async function confirmDelete() {
    if (!deleteId) return;
    const deleted = items.find((item) => item.fridge_item_id === deleteId);
    await remove(deleteId, family.family_id);
    toast.success("Đã xóa", { action: { label: "Hoàn tác", onClick: () => toast.info(`Khôi phục ${deleted?.food.food_name ?? "thực phẩm"} sẽ gọi API undo delete.`) } });
  }

  async function confirmConsume() {
    const item = items.find((row) => row.fridge_item_id === consumeId);
    if (!item) return;
    if (!Number.isFinite(consumeQuantity) || consumeQuantity <= 0) return toast.error("Số lượng dùng phải lớn hơn 0.");
    await update(item.fridge_item_id, { food_id: item.food_id, quantity: Math.max(0, item.quantity - consumeQuantity), expiry_date: item.expiry_date, location: item.location }, family.family_id);
    toast.success("Đã cập nhật số lượng trong tủ lạnh.");
  }

  function exportCsv() {
    const content = filtered.map((item) => `${item.food.food_name},${item.quantity},${item.food.unit},${item.expiry_date},${item.food.category},${item.location}`).join("\n");
    const blob = new Blob([`name,quantity,unit,expiry,category,location\n${content}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fridge-items.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <ScreenHeader
        title="Quản lý tủ lạnh"
        subtitle="Hiển thị danh sách kho thực phẩm, lọc, thêm, cập nhật, xóa và xem cảnh báo hết hạn theo UC003."
        actions={<Button asChild className="rounded-[8px] bg-[#ffb11f]"><Link to="/fridge/add"><Plus className="mr-2 h-4 w-4" />Thêm thực phẩm</Link></Button>}
      />

      {expiring.length > 0 && (
        <div className="mb-5 rounded-[8px] border border-[#ffb11f] bg-[#fff7df] p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <b className="text-[#9a5a00]">Cảnh báo: {expiring.length} thực phẩm sắp hết hạn trong 3 ngày.</b>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setExpiry("soon"); setFilterOpen(false); }}>Xem chi tiết</Button>
              <Button size="sm" className="bg-[#7655aa]" onClick={() => navigate("/meal-planner")}>Gợi ý món từ tủ lạnh</Button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[8px] bg-white p-5 shadow-card">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[260px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-[#9188a1]" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Search by name" /></div>
          <Button variant="outline" onClick={() => setFilterOpen(true)}><Filter className="mr-2 h-4 w-4" />Lọc</Button>
          <Button variant="outline" onClick={() => setSortAsc((value) => !value)}><SortAsc className="mr-2 h-4 w-4" />Sort</Button>
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
        <div className="mt-5 grid gap-3 lg:hidden">
          {filtered.map((item) => <FoodCard key={item.fridge_item_id} item={item} onDelete={() => setDeleteId(item.fridge_item_id)} />)}
        </div>
        <div className="mt-5 hidden overflow-hidden rounded-[8px] border lg:block">
          <table className="w-full text-sm">
            <thead className="bg-[#fbfacb] text-left"><tr><th className="p-3">Name</th><th>Quantity</th><th>Unit</th><th>HSD</th><th>Category</th><th>Location</th><th className="text-right pr-3">Actions</th></tr></thead>
            <tbody>
              {filtered.map((item) => <tr key={item.fridge_item_id} className="border-t"><td className="p-3 font-bold">{item.food.icon} {item.food.food_name}</td><td>{item.quantity}</td><td>{item.food.unit}</td><td><span className={daysUntil(item.expiry_date) <= 3 ? "font-bold text-red-600" : ""}>{formatDate(item.expiry_date)}</span></td><td>{item.food.category}</td><td>{item.location}</td><td className="space-x-2 pr-3 text-right"><Button asChild size="sm" variant="outline"><Link to={`/fridge/edit/${item.fridge_item_id}`}><Edit className="h-4 w-4" /></Link></Button><Button size="sm" variant="outline" onClick={() => { setConsumeId(item.fridge_item_id); setConsumeQuantity(1); }}><Utensils className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteId(item.fridge_item_id)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#746d82]">{loading ? "Đang tải..." : "Tủ lạnh trống hoặc không có kết quả phù hợp."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <AppModal open={filterOpen} onOpenChange={setFilterOpen} title="Bộ lọc tủ lạnh" type="info" primaryLabel="Áp dụng" secondaryLabel="Đóng">
        <div className="space-y-3">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tên thực phẩm" />
          <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả danh mục</SelectItem>{foodCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Select value={expiry} onValueChange={setExpiry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả HSD</SelectItem><SelectItem value="soon">Sắp hết hạn</SelectItem><SelectItem value="expired">Đã hết hạn</SelectItem></SelectContent></Select>
          <Select value={location} onValueChange={setLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả vị trí</SelectItem>{foodLocations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" onClick={() => { setQuery(""); setCategory("all"); setExpiry("all"); setLocation("all"); }}>Reset</Button>
        </div>
      </AppModal>

      <AppModal open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)} type="confirm" title="Xóa thực phẩm?" primaryLabel="Xóa" secondaryLabel="Hủy" onPrimary={confirmDelete}>
        Hành động này không thể hoàn tác.
      </AppModal>
      <AppModal open={Boolean(consumeId)} onOpenChange={(open) => !open && setConsumeId(null)} type="confirm" title="Dùng nhanh thực phẩm" primaryLabel="Cập nhật" secondaryLabel="Hủy" onPrimary={confirmConsume}>
        <Input type="number" min={0.01} step="0.01" value={consumeQuantity} onChange={(event) => setConsumeQuantity(Number(event.target.value))} />
      </AppModal>
    </>
  );
}

function FoodCard({ item, onDelete }: { item: ReturnType<typeof useFridgeStore.getState>["items"][number]; onDelete: () => void }) {
  return (
    <div className="rounded-[8px] border bg-white p-4">
      <div className="flex items-center justify-between"><b>{item.food.icon} {item.food.food_name}</b><span className="text-sm">{item.quantity} {item.food.unit}</span></div>
      <div className="mt-2 text-sm text-[#746d82]">{item.food.category} · {item.location} · HSD {formatDate(item.expiry_date)}</div>
      <div className="mt-3 flex gap-2"><Button asChild size="sm" variant="outline"><Link to={`/fridge/edit/${item.fridge_item_id}`}>Edit</Link></Button><Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button></div>
    </div>
  );
}
