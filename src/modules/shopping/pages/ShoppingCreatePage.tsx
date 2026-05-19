import { Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useShoppingStore } from "@/app/store/shoppingStore";
import { FlowSteps } from "@/components/common/FlowSteps";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodCategories, foodUnits } from "@/constants/options";
import { foodApi } from "@/services/api/foodApi";
import { familyApi } from "@/services/api/familyApi";
import type { Food, FoodCategory, FoodUnit, ShoppingType, User } from "@/types";
import { todayIso } from "@/utils/date";

type SelectedRow = { food_id: string; quantity: number };
type ManualRow = { food_name: string; quantity: number; unit: FoodUnit; category: FoodCategory };

export function ShoppingCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user)!;
  const family = useAuthStore((state) => state.family)!;
  const create = useShoppingStore((state) => state.create);
  const [foods, setFoods] = useState<Food[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [listType, setListType] = useState<ShoppingType>("daily");
  const [planDate, setPlanDate] = useState(todayIso());
  const [items, setItems] = useState<SelectedRow[]>([{ food_id: "", quantity: 1 }]);
  const [manualItems, setManualItems] = useState<ManualRow[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void foodApi.list().then(setFoods);
    void familyApi.detail(family.family_id).then((data) => {
      setMembers(data.members);
      setSelectedMemberIds(data.members.map((member) => member.user_id));
    });
  }, [family.family_id]);

  async function saveList() {
    const selectedItems = items.filter((item) => item.food_id);
    const validManualItems = manualItems.filter((item) => item.food_name.trim());
    if (selectedItems.length === 0 && validManualItems.length === 0) return setValidationOpen(true);
    if (!title.trim()) return toast.error("Nhập tên danh sách.");
    if ([...selectedItems, ...validManualItems].some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return toast.error("Số lượng phải lớn hơn 0.");
    }
    setSubmitting(true);
    try {
      await create({
        family_id: family.family_id,
        title,
        list_type: listType,
        plan_date: planDate,
        created_by: user.user_id,
        items: [...selectedItems, ...validManualItems],
        share_member_ids: members.length ? selectedMemberIds : undefined,
      });
      toast.success("Tạo danh sách thành công");
      if (members.length > 1) setShareOpen(true);
      else navigate("/shopping");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo danh sách.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ScreenHeader title="Tạo danh sách mua sắm" subtitle="Chọn thực phẩm có sẵn hoặc nhập tay nguyên liệu khác. Option Khác nằm cuối category." />
      <section className="rounded-[8px] bg-white p-6 shadow-card">
        <FlowSteps steps={["Chọn kiểu", "Thêm mặt hàng", "Nhập tay", "Lưu danh sách", "Chia sẻ"]} current={3} />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề danh sách" />
          <Select value={listType} onValueChange={(value) => setListType(value as ShoppingType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Theo ngày</SelectItem><SelectItem value="weekly">Theo tuần</SelectItem></SelectContent></Select>
          <Input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="font-bold">Chọn từ recipe/suggested ingredients</h3>
          {items.map((row, index) => {
            const food = foods.find((item) => item.food_id === row.food_id);
            return (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_150px_170px_80px]">
                <Select value={row.food_id} onValueChange={(value) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, food_id: value } : item))}><SelectTrigger><SelectValue placeholder="Chọn thực phẩm" /></SelectTrigger><SelectContent>{foods.map((item) => <SelectItem key={item.food_id} value={item.food_id}>{item.icon} {item.food_name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" value={row.quantity} onChange={(e) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))} />
                <Input value={food ? `${food.unit} · ${food.category}` : "unit · category"} readOnly />
                <Button variant="outline" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
          })}
          <Button variant="outline" onClick={() => setItems((prev) => [...prev, { food_id: "", quantity: 1 }])}><Plus className="mr-2 h-4 w-4" />Thêm mặt hàng</Button>
        </div>

        <div className="mt-6 rounded-[8px] border border-dashed p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold">Nhập tay nguyên liệu khác</h3>
            <Button variant="outline" size="sm" onClick={() => setManualItems((prev) => [...prev, { food_name: "", quantity: 1, unit: "g", category: "Khác" }])}><Plus className="mr-2 h-4 w-4" />Thêm nguyên liệu</Button>
          </div>
          <div className="space-y-3">
            {manualItems.map((row, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_120px_140px_170px_80px]">
                <Input value={row.food_name} onChange={(e) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, food_name: e.target.value } : item))} placeholder="Tên nguyên liệu" />
                <Input type="number" value={row.quantity} onChange={(e) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))} />
                <Select value={row.unit} onValueChange={(value) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, unit: value as FoodUnit } : item))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{foodUnits.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select>
                <Select value={row.category} onValueChange={(value) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, category: value as FoodCategory } : item))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{foodCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select>
                <Button variant="outline" onClick={() => setManualItems((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={saveList} disabled={submitting} className="bg-[#7655aa]">{submitting ? "Đang lưu..." : "Lưu danh sách"}</Button>
          <Button variant="outline" onClick={() => navigate("/shopping")}>Hủy</Button>
        </div>
      </section>
      <AppModal open={validationOpen} onOpenChange={setValidationOpen} type="warning" title="Danh sách cần ít nhất 1 sản phẩm" secondaryLabel="Đóng" />
      <AppModal open={shareOpen} onOpenChange={setShareOpen} type="confirm" title="Chia sẻ danh sách" primaryLabel="Chia sẻ" secondaryLabel="Bỏ qua" onPrimary={() => { toast.success("Đã chia sẻ danh sách cho các thành viên."); navigate("/shopping"); }} onSecondary={() => navigate("/shopping")}>
        <div className="space-y-2">{members.map((member) => <label key={member.user_id} className="flex items-center gap-2 rounded-[8px] bg-[#f8f6fb] p-2"><Checkbox checked={selectedMemberIds.includes(member.user_id)} onCheckedChange={(checked) => setSelectedMemberIds((prev) => checked ? [...prev, member.user_id] : prev.filter((id) => id !== member.user_id))} /> <Users className="h-4 w-4" /> {member.full_name}</label>)}</div>
      </AppModal>
    </>
  );
}
