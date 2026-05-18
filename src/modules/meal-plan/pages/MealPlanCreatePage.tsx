import { Bell, Plus, Save, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useMealStore } from "@/app/store/mealStore";
import { BackButton } from "@/components/common/PageActions";
import { FlowSteps } from "@/components/common/FlowSteps";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mealApi } from "@/services/api/mealApi";
import { recipeApi, type RecipeDetail } from "@/services/api/recipeApi";
import type { MealPlanGroup } from "@/types";

export function MealPlanCreatePage() {
  const family = useAuthStore((state) => state.family)!;
  const user = useAuthStore((state) => state.user)!;
  const { generated, suggestions, generate, setGenerated, saveGenerated } = useMealStore();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"day" | "week">("day");
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [customGroup, setCustomGroup] = useState<MealPlanGroup | null>(null);
  const [missingOpen, setMissingOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [notificationTime, setNotificationTime] = useState("17:30");
  const [repeatReminder, setRepeatReminder] = useState("daily");
  const missing = useMemo(() => suggestions.flatMap((item) => item.missing), [suggestions]);
  useEffect(() => { void recipeApi.list().then(setRecipes); }, []);
  useEffect(() => {
    if (!generated.length) return;
    const id = window.setInterval(() => toast.info("Đã autosave draft meal planning."), 30000);
    return () => window.clearInterval(id);
  }, [generated.length]);

  async function makePlan() {
    setStep(1);
    await generate(family.family_id, mode);
    setStep(3);
    toast.success("Hệ thống đã phân tích tủ lạnh và đề xuất bữa ăn.");
  }

  function addRecipe(group: MealPlanGroup, recipe_id: string) {
    setGenerated(generated.map((item) => item === group ? { ...item, recipe_ids: [...item.recipe_ids, recipe_id] } : item));
  }

  function replaceRecipe(group: MealPlanGroup, recipe_id: string) {
    setGenerated(generated.map((item) => item === group ? { ...item, recipe_ids: [recipe_id] } : item));
    setCustomGroup(null);
  }

  function removeRecipe(group: MealPlanGroup, recipe_id: string) {
    setGenerated(generated.map((item) => item === group ? { ...item, recipe_ids: item.recipe_ids.filter((id) => id !== recipe_id) } : item));
  }

  return (
    <>
      <ScreenHeader title="Lập kế hoạch bữa ăn" subtitle="Step by step: chọn ngày/tuần → AI đề xuất → tùy chỉnh → kiểm tra nguyên liệu thiếu → lưu reminder." actions={<BackButton />} />
      <section className="rounded-[8px] bg-white p-6 shadow-card">
        <FlowSteps steps={["Chọn chế độ", "Analyzing fridge", "Plan result", "Customize", "Missing detect", "Save reminder"]} current={step} />
        <div className="mt-5 flex flex-wrap gap-3">
          <Select value={mode} onValueChange={(value) => setMode(value as "day" | "week")}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">Theo ngày</SelectItem><SelectItem value="week">Theo tuần</SelectItem></SelectContent></Select>
          <Button onClick={makePlan} className="bg-[#7655aa]">Tiếp tục / AI đề xuất</Button>
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))}>Quay lại bước trước</Button>
        </div>
        {step === 1 && <div className="mt-6 rounded-[8px] bg-[#f8f6fb] p-8 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#7655aa] border-t-transparent" /><p className="mt-3">Analyzing fridge...</p></div>}
        {generated.length > 0 && (
          <div className="mt-6 space-y-4">
            {generated.map((group) => <div key={`${group.meal_date}-${group.meal_type}`} className="rounded-[8px] border p-4"><div className="mb-3 flex flex-wrap justify-between gap-2"><b>{group.meal_date} · {group.meal_type}</b><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setCustomGroup(group)}><Search className="mr-2 h-4 w-4" />Replace/Add</Button><Button size="sm" variant="outline" onClick={() => setGenerated(generated.filter((item) => item !== group))}>Delete meal</Button></div></div><div className="flex flex-wrap gap-2">{group.recipe_ids.map((id) => { const recipe = recipes.find((item) => item.recipe_id === id); return <span key={id} className="inline-flex items-center gap-2 rounded-full bg-[#eee9f7] px-3 py-1 text-sm font-bold text-[#7655aa]">{recipe?.recipe_name ?? id}<Link to={`/recipes/${id}`} className="underline">chi tiết</Link><button onClick={() => removeRecipe(group, id)}><Trash2 className="h-3 w-3" /></button></span>; })}</div></div>)}
            <div className="rounded-[8px] bg-[#fbfacb] p-4 text-sm"><b>Missing ingredient detect:</b> {missing.length ? missing.map((item) => item.food.food_name).join(", ") : "Đủ nguyên liệu"}.</div>
            <div className="flex flex-wrap gap-3"><Button onClick={() => setMissingOpen(true)} variant="outline"><ShoppingCart className="mr-2 h-4 w-4" />Tạo danh sách mua sắm</Button><Button onClick={() => setReminderOpen(true)} className="bg-[#31c875]"><Save className="mr-2 h-4 w-4" />Lưu kế hoạch</Button><Button asChild variant="outline"><Link to="/recipes"><Plus className="mr-2 h-4 w-4" />Favorite recipe</Link></Button></div>
          </div>
        )}
      </section>
      <AppModal open={Boolean(customGroup)} onOpenChange={(open) => !open && setCustomGroup(null)} type="info" title="Search recipes" secondaryLabel="Đóng">
        <div className="max-h-[420px] space-y-2 overflow-auto">{customGroup && recipes.map((recipe) => <div key={recipe.recipe_id} className="flex items-center justify-between rounded-[8px] bg-[#f8f6fb] p-3"><span>{recipe.recipe_name}</span><div className="flex gap-2"><Button size="sm" onClick={() => replaceRecipe(customGroup, recipe.recipe_id)}>Thay thế</Button><Button size="sm" variant="outline" onClick={() => addRecipe(customGroup, recipe.recipe_id)}>Thêm vào kế hoạch</Button></div></div>)}</div>
      </AppModal>
      <AppModal open={missingOpen} onOpenChange={setMissingOpen} type="warning" title="Thiếu nguyên liệu" primaryLabel="Tạo danh sách mua sắm" secondaryLabel="Bỏ qua" onPrimary={async () => { await mealApi.createShoppingListForMissing(family.family_id, user.user_id, "Bổ sung nguyên liệu từ thực đơn"); toast.success("Đã tự động tạo danh sách bổ sung."); }}>
        {missing.length ? missing.map((item) => <div key={item.food.food_id}>- {item.food.food_name}: {item.quantity} {item.food.unit}</div>) : "Đủ nguyên liệu."}
      </AppModal>
      <AppModal open={reminderOpen} onOpenChange={setReminderOpen} type="confirm" title="Lưu kế hoạch" primaryLabel="Lưu kế hoạch" secondaryLabel="Hủy" onPrimary={async () => { await saveGenerated(); setStep(5); toast.success("Đã lưu kế hoạch"); }}>
        <div className="space-y-3"><label className="block text-sm font-bold">Notification time</label><Input value={notificationTime} onChange={(event) => setNotificationTime(event.target.value)} /><label className="block text-sm font-bold">Repeat reminder</label><Select value={repeatReminder} onValueChange={setRepeatReminder}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Không lặp</SelectItem><SelectItem value="daily">Hằng ngày</SelectItem><SelectItem value="weekly">Hằng tuần</SelectItem></SelectContent></Select><p className="text-xs text-[#746d82]"><Bell className="inline h-3 w-3" /> Hệ thống sẽ thông báo khi đến lịch.</p></div>
      </AppModal>
    </>
  );
}
