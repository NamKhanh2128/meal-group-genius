import { Plus, Share2, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useShoppingStore } from "@/modules/shopping/store/shoppingStore";
import { FlowSteps } from "@/shared/components/FlowSteps";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { AppModal } from "@/shared/components/AppModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodCategories, foodUnits } from "@/shared/constants/options";
import { foodApi } from "@/shared/api/foodApi";
import { familyApi } from "@/modules/family/api/familyApi";
import type { Food, FoodCategory, FoodUnit, ShoppingType, User } from "@/types";
import { todayIso } from "@/shared/utils/date";

// Sentinel value for "Khác" option in food select
const OTHER_SENTINEL = "__other__";

type RowMode = "select" | "manual";
type SelectedRow = { food_id: string; quantity: number };
type ManualRow = { food_name: string; quantity: number; unit: FoodUnit; category: FoodCategory };
// Unified row type for the "select from list" section
type SelectSectionRow =
  | { mode: "select"; food_id: string; quantity: number }
  | { mode: "manual"; food_name: string; quantity: number; unit: FoodUnit; category: FoodCategory };

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
  // Unified rows (each row is either "select" or "manual" mode)
  const [rows, setRows] = useState<SelectSectionRow[]>([{ mode: "select", food_id: "", quantity: 1 }]);
  // Extra manual-only rows (the bottom "Nhập tay" section — kept for backward compat)
  const [manualItems, setManualItems] = useState<ManualRow[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedListId, setSavedListId] = useState<string | null>(null);

  useEffect(() => {
    void foodApi.list().then(setFoods);
    void familyApi.detail(family.family_id).then((data) => {
      setMembers(data.members);
      setSelectedMemberIds(data.members.map((member) => member.user_id));
    });
  }, [family.family_id]);

  function updateRow(index: number, patch: Partial<SelectSectionRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? ({ ...row, ...patch } as SelectSectionRow) : row)));
  }

  function handleFoodSelect(index: number, value: string) {
    if (value === OTHER_SENTINEL) {
      // Switch row to manual mode
      setRows((prev) =>
        prev.map((row, i) =>
          i === index
            ? { mode: "manual", food_name: "", quantity: (row as { quantity: number }).quantity, unit: "g", category: "Khác" }
            : row,
        ),
      );
    } else {
      setRows((prev) =>
        prev.map((row, i) =>
          i === index ? { mode: "select", food_id: value, quantity: (row as { quantity: number }).quantity } : row,
        ),
      );
    }
  }

  function addRow() {
    setRows((prev) => [...prev, { mode: "select", food_id: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function buildItems(): Array<{ food_id: string; quantity: number } | ManualRow> {
    const fromRows = rows
      .map((row) => {
        if (row.mode === "select" && row.food_id) return { food_id: row.food_id, quantity: row.quantity };
        if (row.mode === "manual" && row.food_name.trim())
          return { food_name: row.food_name, quantity: row.quantity, unit: row.unit, category: row.category };
        return null;
      })
      .filter(Boolean) as Array<{ food_id: string; quantity: number } | ManualRow>;
    const fromManual = manualItems.filter((item) => item.food_name.trim());
    return [...fromRows, ...fromManual];
  }

  async function saveList() {
    const allItems = buildItems();
    if (allItems.length === 0) return setValidationOpen(true);
    if (!title.trim()) return toast.error("Nhập tên danh sách.");
    if (allItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
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
        items: allItems,
        share_member_ids: members.length ? selectedMemberIds : undefined,
      });
      toast.success("Tạo danh sách thành công");
      setSavedListId("saved"); // mark as saved so Share button is enabled
      if (members.length > 1) setShareOpen(true);
      else navigate("/shopping");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo danh sách.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleShare() {
    if (!savedListId) {
      toast.error("Lưu danh sách trước khi chia sẻ.");
      return;
    }
    setShareOpen(true);
  }

  return (
    <>
      <ScreenHeader title="Tạo danh sách mua sắm" subtitle='Chọn thực phẩm có sẵn hoặc chọn "Khác" để nhập tay ngay trong dòng.' />
      <section className="rounded-[8px] bg-white p-6 shadow-card">
        <FlowSteps steps={["Chọn kiểu", "Thêm mặt hàng", "Nhập tay", "Lưu danh sách", "Chia sẻ"]} current={3} />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề danh sách" />
          <Select value={listType} onValueChange={(value) => setListType(value as ShoppingType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Theo ngày</SelectItem>
              <SelectItem value="weekly">Theo tuần</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
        </div>

        {/* Unified row section */}
        <div className="mt-5 space-y-3">
          <h3 className="font-bold">Chọn thực phẩm</h3>
          {rows.map((row, index) => {
            if (row.mode === "select") {
              const food = foods.find((item) => item.food_id === row.food_id);
              return (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_150px_170px_80px]">
                  <Select
                    value={row.food_id}
                    onValueChange={(value) => handleFoodSelect(index, value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Chọn thực phẩm" /></SelectTrigger>
                    <SelectContent>
                      {foods.map((item) => (
                        <SelectItem key={item.food_id} value={item.food_id}>
                          {item.icon} {item.food_name}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_SENTINEL}>
                        <span className="font-semibold text-[#7655aa]">✏️ Khác (nhập tay)</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                  />
                  <Input value={food ? `${food.unit} · ${food.category}` : "unit · category"} readOnly />
                  <Button variant="outline" onClick={() => removeRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            }

            // Manual mode row (switched via "Khác")
            return (
              <div key={index} className="grid gap-3 rounded-lg border border-dashed border-[#7655aa] bg-[#f8f6fb] p-3 md:grid-cols-[1fr_120px_140px_170px_80px]">
                <Input
                  value={row.food_name}
                  onChange={(e) => updateRow(index, { food_name: e.target.value })}
                  placeholder="Tên nguyên liệu"
                  autoFocus
                />
                <Input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                />
                <Select
                  value={row.unit}
                  onValueChange={(value) => updateRow(index, { unit: value as FoodUnit })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {foodUnits.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={row.category}
                  onValueChange={(value) => updateRow(index, { category: value as FoodCategory })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {foodCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => removeRow(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button variant="outline" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />Thêm mặt hàng
          </Button>
        </div>

        {/* Extra manual section (kept) */}
        <div className="mt-6 rounded-[8px] border border-dashed p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold">Nhập tay nguyên liệu khác</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualItems((prev) => [...prev, { food_name: "", quantity: 1, unit: "g", category: "Khác" }])}
            >
              <Plus className="mr-2 h-4 w-4" />Thêm nguyên liệu
            </Button>
          </div>
          <div className="space-y-3">
            {manualItems.map((row, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_120px_140px_170px_80px]">
                <Input
                  value={row.food_name}
                  onChange={(e) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, food_name: e.target.value } : item))}
                  placeholder="Tên nguyên liệu"
                />
                <Input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item))}
                />
                <Select
                  value={row.unit}
                  onValueChange={(value) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, unit: value as FoodUnit } : item))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{foodUnits.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                </Select>
                <Select
                  value={row.category}
                  onValueChange={(value) => setManualItems((prev) => prev.map((item, i) => i === index ? { ...item, category: value as FoodCategory } : item))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{foodCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setManualItems((prev) => prev.filter((_, i) => i !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={saveList} disabled={submitting} className="bg-[#7655aa]">
            {submitting ? "Đang lưu..." : "Lưu danh sách"}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={!savedListId}
            className={savedListId ? "border-[#7655aa] text-[#7655aa] hover:bg-[#f8f6fb]" : ""}
          >
            <Share2 className="mr-2 h-4 w-4" />Chia sẻ
          </Button>
          <Button variant="outline" onClick={() => navigate("/shopping")}>Hủy</Button>
        </div>
      </section>

      <AppModal
        open={validationOpen}
        onOpenChange={setValidationOpen}
        type="warning"
        title="Danh sách cần ít nhất 1 sản phẩm"
        secondaryLabel="Đóng"
      />
      <AppModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        type="confirm"
        title="Chia sẻ danh sách"
        primaryLabel="Chia sẻ"
        secondaryLabel="Bỏ qua"
        onPrimary={() => { toast.success("Đã chia sẻ danh sách cho các thành viên."); navigate("/shopping"); }}
        onSecondary={() => navigate("/shopping")}
      >
        <div className="space-y-2">
          {members.map((member) => (
            <label key={member.user_id} className="flex items-center gap-2 rounded-[8px] bg-[#f8f6fb] p-2">
              <Checkbox
                checked={selectedMemberIds.includes(member.user_id)}
                onCheckedChange={(checked) =>
                  setSelectedMemberIds((prev) =>
                    checked ? [...prev, member.user_id] : prev.filter((id) => id !== member.user_id),
                  )
                }
              />
              <Users className="h-4 w-4" /> {member.full_name}
            </label>
          ))}
        </div>
      </AppModal>
    </>
  );
}
