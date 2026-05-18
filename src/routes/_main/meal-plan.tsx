import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { mealPlanService } from "@/services/mealplan.service";
import { recipeService } from "@/services/recipe.service";
import { fridgeService } from "@/services/fridge.service";
import { shoppingService } from "@/services/shopping.service";
import type { MealPlanItem, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChefHat, ShoppingCart, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_main/meal-plan")({
  head: () => ({ meta: [{ title: "Thực đơn — NATEAT" }] }),
  component: MealPlanPage,
});

const SLOTS: MealPlanItem["slot"][] = ["Sáng", "Trưa", "Tối"];

function weekDates(offset = 0): string[] {
  const base = new Date();
  base.setDate(base.getDate() - base.getDay() + 1 + offset * 7); // start Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function MealPlanPage() {
  const { group, pushFeed } = useGroup();
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealPlanItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const refresh = async () => { if (group) setMeals(await mealPlanService.list(group.id)); };
  useEffect(() => { refresh(); recipeService.list().then(setRecipes); }, [group]);

  const dates = weekDates(weekOffset);

  function getMeals(date: string, slot: MealPlanItem["slot"]) {
    return meals.filter((m) => m.date === date && m.slot === slot);
  }

  async function addMeal(date: string, slot: MealPlanItem["slot"], recipeId: string, servings: number, time?: string) {
    if (!group) return;
    const r = recipes.find((x) => x.id === recipeId);
    if (!r) return;
    await mealPlanService.add({ familyId: group.id, date, slot, recipeId, recipeName: r.name, image: r.image, status: "Kế hoạch", servings, time });
    await pushFeed("meal", `thêm món "${r.name}" vào ${slot} ${date}`);
    refresh();

    // Activity flow: kiểm tra nguyên liệu trong tủ lạnh sau khi lên kế hoạch
    const fridgeItems = await fridgeService.list(group.id);
    const have = new Set(fridgeItems.map((f) => f.name.toLowerCase()));
    const missing = r.ingredients.filter((i) => !have.has(i.name.toLowerCase()));
    if (missing.length > 0) {
      toast.warning(`Thiếu ${missing.length} nguyên liệu: ${missing.map((m) => m.name).join(", ")}. Đang tạo danh sách bổ sung…`);
      const existing = (await shoppingService.list(group.id)).find((l) => !l.completed);
      let target = existing;
      if (!target) {
        target = await shoppingService.create({
          familyId: group.id, title: `Bổ sung cho ${r.name}`, type: "daily",
          planDate: date, createdBy: user!.id,
        });
      }
      for (const m of missing) {
        await shoppingService.addItem(target.id, { name: m.name, quantity: m.quantity, unit: m.unit, category: "Khác" });
      }
      await pushFeed("shopping", `tự động bổ sung ${missing.length} nguyên liệu thiếu cho "${r.name}"`);
    } else {
      toast.success("Đủ nguyên liệu trong tủ lạnh!");
    }
  }

  async function setStatus(m: MealPlanItem, status: MealPlanItem["status"]) {
    await mealPlanService.setStatus(m.id, status);
    // Activity flow: Nấu xong → trừ kho tủ lạnh
    if (status === "Đã xong" && group) {
      const r = recipes.find((x) => x.id === m.recipeId);
      if (r) {
        await fridgeService.deductIngredients(group.id, r.ingredients);
        await pushFeed("complete", `nấu xong "${m.recipeName}" - đã trừ ${r.ingredients.length} nguyên liệu khỏi tủ lạnh`);
        toast.success("Đã trừ nguyên liệu khỏi tủ lạnh");
      }
    }
    refresh();
  }

  async function removeMeal(m: MealPlanItem) {
    await mealPlanService.remove(m.id);
    refresh();
  }

  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="space-y-6">
      <PageHero title="Thực đơn tuần 📅" subtitle="Lên kế hoạch Sáng / Trưa / Tối cho cả tuần · 1 bữa có thể có nhiều món">
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setWeekOffset(weekOffset - 1)} className="bg-white/10 border-white/30 text-primary-foreground rounded-xl">← Tuần trước</Button>
          <Button variant="outline" onClick={() => setWeekOffset(0)} className="bg-white/10 border-white/30 text-primary-foreground rounded-xl">Hôm nay</Button>
          <Button variant="outline" onClick={() => setWeekOffset(weekOffset + 1)} className="bg-white/10 border-white/30 text-primary-foreground rounded-xl">Tuần sau →</Button>
        </div>
      </PageHero>

      <div className="rounded-3xl bg-card p-4 md:p-6 shadow-card overflow-x-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: "100px repeat(7, minmax(150px, 1fr))" }}>
          <div />
          {dates.map((d, i) => (
            <div key={d} className="text-center">
              <div className="text-xs font-semibold text-muted-foreground">{dayNames[i]}</div>
              <div className="text-sm font-bold">{d.slice(8, 10)}/{d.slice(5, 7)}</div>
            </div>
          ))}
          {SLOTS.map((slot) => (
            <>
              <div key={slot} className="font-bold text-sm self-start pt-3">{slot}</div>
              {dates.map((date) => {
                const list = getMeals(date, slot);
                return (
                  <div key={date + slot} className="min-h-[120px] rounded-2xl bg-secondary/30 p-2 space-y-2">
                    {list.map((m) => (
                      <div key={m.id} className="rounded-xl bg-card p-2 shadow-sm border border-border/60">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate flex-1" title={m.recipeName}>{m.recipeName}</span>
                          <button onClick={() => removeMeal(m)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                        <Select value={m.status} onValueChange={(v) => setStatus(m, v as MealPlanItem["status"])}>
                          <SelectTrigger className="h-7 mt-1 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kế hoạch">Kế hoạch</SelectItem>
                            <SelectItem value="Đang nấu">Đang nấu</SelectItem>
                            <SelectItem value="Đã xong">Đã xong</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <AddMealButton date={date} slot={slot} recipes={recipes} onAdd={addMeal} />
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Recipes catalog */}
      <div className="rounded-3xl bg-card p-6 shadow-card">
        <h3 className="font-bold text-lg flex items-center gap-2"><ChefHat className="h-5 w-5 text-primary" />Công thức mẫu</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <div key={r.id} className="rounded-2xl overflow-hidden border border-border bg-card">
              {r.image && <img src={r.image} alt={r.name} className="h-32 w-full object-cover" />}
              <div className="p-3">
                <div className="font-bold">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.timeMinutes} phút · {r.calories} kcal · {r.difficulty}</div>
                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">Nguyên liệu: {r.ingredients.map((i) => i.name).join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddMealButton({ date, slot, recipes, onAdd }: { date: string; slot: MealPlanItem["slot"]; recipes: Recipe[]; onAdd: (date: string, slot: MealPlanItem["slot"], recipeId: string, servings: number, time?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [servings, setServings] = useState(4);
  const [time, setTime] = useState("");
  useEffect(() => { if (!recipeId && recipes[0]) setRecipeId(recipes[0].id); }, [recipes, recipeId]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full rounded-lg border border-dashed border-border/80 p-2 text-xs text-muted-foreground hover:bg-secondary transition flex items-center justify-center gap-1">
          <Plus className="h-3 w-3" /> Thêm món
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Thêm món cho {slot} - {date}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Công thức</Label>
            <Select value={recipeId} onValueChange={setRecipeId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{recipes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Số người</Label><Input type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} /></div>
            <div><Label>Giờ ăn</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { if (!recipeId) return; onAdd(date, slot, recipeId, servings, time || undefined); setOpen(false); }} className="rounded-xl">
            <CheckCheck className="h-4 w-4 mr-1.5" />Thêm món
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
