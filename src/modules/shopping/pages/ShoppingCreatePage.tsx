import { Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useShoppingStore } from "@/app/store/shoppingStore";
import { BackButton } from "@/components/common/PageActions";
import { FlowSteps } from "@/components/common/FlowSteps";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodApi } from "@/services/api/foodApi";
import { familyApi } from "@/services/api/familyApi";
import type { Food, ShoppingType, User } from "@/types";
import { todayIso } from "@/utils/date";

type Row = { food_id: string; quantity: number };

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
  const [items, setItems] = useState<Row[]>([{ food_id: "", quantity: 1 }]);
  const [validationOpen, setValidationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => { void foodApi.list().then(setFoods); void familyApi.detail(family.family_id).then((data) => setMembers(data.members)); }, [family.family_id]);

  async function saveList() {
    if (items.length === 0 || items.every((item) => !item.food_id)) return setValidationOpen(true);
    if (!title.trim()) return toast.error("Nhập tên danh sách.");
    if (items.some((item) => !item.food_id || item.quantity <= 0)) return toast.error("Mỗi dòng cần chọn thực phẩm và số lượng hợp lệ.");
    await create({ family_id: family.family_id, title, list_type: listType, plan_date: planDate, created_by: user.user_id, items });
    toast.success("Tạo danh sách thành công");
    setShareOpen(true);
  }

  return (
    <>
      <ScreenHeader title="Tạo danh sách mua sắm" subtitle="Chọn kiểu danh sách, nhập mặt hàng, hệ thống phân loại theo category rồi chia sẻ cho gia đình." actions={<BackButton />} />
      <section className="rounded-[8px] bg-white p-6 shadow-card">
        <FlowSteps steps={["Chọn kiểu", "Thêm mặt hàng", "Phân loại", "Lưu danh sách", "Chia sẻ"]} current={3} />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề danh sách" />
          <Select value={listType} onValueChange={(value) => setListType(value as ShoppingType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Theo ngày</SelectItem><SelectItem value="weekly">Theo tuần</SelectItem></SelectContent></Select>
          <Input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
        </div>
        <div className="mt-5 space-y-3">
          {items.map((row, index) => {
            const food = foods.find((item) => item.food_id === row.food_id);
            return <div key={index} className="grid gap-3 md:grid-cols-[1fr_150px_160px_90px]"><Select value={row.food_id} onValueChange={(value) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, food_id: value } : item))}><SelectTrigger><SelectValue placeholder="Name" /></SelectTrigger><SelectContent>{foods.map((item) => <SelectItem key={item.food_id} value={item.food_id}>{item.icon} {item.food_name}</SelectItem>)}</SelectContent></Select><Input type="number" value={row.quantity} onChange={(e) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))} /><Input value={food ? `${food.unit} · ${food.category}` : "unit · category"} readOnly /><Button variant="outline" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>;
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setItems((prev) => [...prev, { food_id: "", quantity: 1 }])}><Plus className="mr-2 h-4 w-4" />Thêm mặt hàng</Button><Button onClick={saveList} className="bg-[#7655aa]">Lưu danh sách</Button><Button variant="outline" onClick={() => navigate(-1)}>Hủy</Button></div>
      </section>
      <AppModal open={validationOpen} onOpenChange={setValidationOpen} type="warning" title="Danh sách cần ít nhất 1 sản phẩm" secondaryLabel="Đóng" />
      <AppModal open={shareOpen} onOpenChange={setShareOpen} type="confirm" title="Chia sẻ danh sách" primaryLabel="Chia sẻ" secondaryLabel="Bỏ qua" onPrimary={() => { toast.success("Đã chia sẻ danh sách cho các thành viên."); navigate("/shopping"); }} onSecondary={() => navigate("/shopping")}>
        <div className="space-y-2">{members.map((member) => <label key={member.user_id} className="flex items-center gap-2 rounded-[8px] bg-[#f8f6fb] p-2"><Checkbox defaultChecked /> <Users className="h-4 w-4" /> {member.full_name}</label>)}</div>
      </AppModal>
    </>
  );
}
