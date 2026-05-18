import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles, Clock, Flame, Star, Play, ShoppingCart, Plus,
  AlertCircle, ChefHat, Snowflake, ScrollText, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { recipeService } from "@/services/recipe.service";
import { fridgeService } from "@/services/fridge.service";
import { shoppingService } from "@/services/shopping.service";
import { mealPlanService } from "@/services/mealplan.service";
import { fmtRelative, fmtDate, daysUntil } from "@/utils/dateHelpers";
import type { Recipe, FoodItem, ShoppingList, MealPlanItem } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/dashboard")({
  head: () => ({ meta: [{ title: "Trang chủ — NATEAT" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { group, feed, pushFeed } = useGroup();
  const [suggestion, setSuggestion] = useState<{ recipe: Recipe; have: string[]; missing: string[] } | null>(null);
  const [fridge, setFridge] = useState<FoodItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [meals, setMeals] = useState<MealPlanItem[]>([]);

  useEffect(() => {
    if (!group) return;
    recipeService.suggest(group.id).then((s) => setSuggestion(s.sort((a, b) => a.missing.length - b.missing.length)[0] ?? null));
    fridgeService.list(group.id).then(setFridge);
    shoppingService.list(group.id).then(setLists);
    mealPlanService.list(group.id).then((all) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      setMeals(all.filter((m) => m.date === todayStr));
    });
  }, [group]);

  const expiring = fridge.filter((f) => daysUntil(f.expiryDate) <= 3);
  const list = lists.find((l) => !l.completed) ?? lists[0];

  async function addMissingToShopping() {
    if (!suggestion || !group) return;
    let target = list;
    if (!target) {
      target = await shoppingService.create({
        familyId: group.id, title: "Bổ sung từ gợi ý", type: "daily",
        planDate: new Date().toISOString().slice(0, 10), createdBy: user!.id,
      });
    }
    for (const name of suggestion.missing) {
      await shoppingService.addItem(target.id, { name, quantity: 1, unit: "gói", category: "Gia vị" });
    }
    await pushFeed("shopping", `thêm ${suggestion.missing.length} mục từ "${suggestion.recipe.name}" vào danh sách`);
    setLists(await shoppingService.list(group.id));
    toast.success("Đã thêm nguyên liệu thiếu vào danh sách mua sắm");
  }

  return (
    <div className="-mx-6 -my-6 min-h-[calc(100vh-4rem)] bg-gradient-to-b from-primary to-primary-deep px-6 py-8">
      <div className="mx-auto max-w-[1340px] space-y-6">
        {/* Greeting */}
        <div className="text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Chào {user?.name ?? "bạn"}! 👋</h1>
          <p className="mt-2 text-primary-foreground/85">
            Tủ lạnh: {fridge.length} món · {expiring.length} sắp hết hạn · 3 món gợi ý hôm nay
          </p>
        </div>

        {/* Suggestion card */}
        {suggestion && (
          <section className="rounded-3xl bg-primary-deep/40 ring-1 ring-white/10 backdrop-blur-sm p-6 md:p-8 text-primary-foreground shadow-elevated relative overflow-hidden">
            <div className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full bg-primary-glow/25 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1.2fr_auto_auto] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-warning-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Gợi ý hôm nay
                </span>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
                  {suggestion.recipe.name}
                  <br />
                  <span className="text-2xl md:text-3xl font-bold opacity-90">từ nguyên liệu sẵn có</span>
                </h2>
                <div className="mt-4 space-y-1.5 text-sm">
                  {suggestion.have.length > 0 && (
                    <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /><span><span className="opacity-80">Có sẵn:</span> {suggestion.have.join(", ")}</span></div>
                  )}
                  {suggestion.missing.length > 0 && (
                    <div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 text-destructive" /><span><span className="opacity-80">Còn thiếu:</span> {suggestion.missing.join(", ")}</span></div>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={addMissingToShopping} className="bg-warning hover:bg-warning/90 text-warning-foreground font-semibold rounded-xl px-5 h-11">Xem công thức →</Button>
                  <Button variant="outline" asChild className="bg-white/10 border-white/30 hover:bg-white/20 text-primary-foreground rounded-xl px-5 h-11">
                    <Link to="/meal-plan">Thêm thực đơn</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <Stat icon={<Clock className="h-4 w-4" />} label="THỜI GIAN" value={`${suggestion.recipe.timeMinutes} phút`} />
                <Stat icon={<Flame className="h-4 w-4" />} label="CALO" value={`${suggestion.recipe.calories} kcal`} />
                <Stat icon={<Star className="h-4 w-4" />} label="ĐỘ KHÓ" value={suggestion.recipe.difficulty} accent />
              </div>

              {suggestion.recipe.image && (
                <div className="relative overflow-hidden rounded-2xl shadow-elevated lg:w-[340px]">
                  <img src={suggestion.recipe.image} alt={suggestion.recipe.name} className="h-56 w-full object-cover" loading="lazy" />
                  <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">Món Ăn Ngon Mỗi Ngày</div>
                  <div className="absolute bottom-12 left-3 text-white font-bold drop-shadow">{suggestion.recipe.name}</div>
                  <button className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground">
                    <Play className="h-3 w-3 fill-current" /> Xem video hướng dẫn
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Meals + shopping */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/10 p-6 text-primary-foreground">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Meal Plan</div>
            <h3 className="mt-1 text-xl font-bold">Thực đơn hôm nay</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {meals.map((m) => <MealCard key={m.id} m={m} />)}
              {meals.length === 0 && <div className="col-span-3 text-sm opacity-80">Chưa có bữa nào hôm nay.</div>}
            </div>
            <div className="mt-4 text-center">
              <Link to="/meal-plan" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:opacity-90">
                <Plus className="h-4 w-4" /> Thêm bữa ăn
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {list && (
              <div className="rounded-3xl bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-info/15 text-info"><ShoppingCart className="h-5 w-5" /></div>
                  <div>
                    <div className="font-bold text-lg leading-tight">{list.title}</div>
                    <div className="text-xs text-muted-foreground">{list.items.length} items</div>
                  </div>
                </div>
                {(() => {
                  const done = list.items.filter((i) => i.bought).length;
                  const pct = list.items.length ? Math.round((done / list.items.length) * 100) : 0;
                  return (
                    <>
                      <div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{pct}%</span></div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-info to-primary transition-all" style={{ width: `${pct}%` }} /></div>
                    </>
                  );
                })()}
                <ul className="mt-4 space-y-2">
                  {list.items.slice(0, 5).map((it) => (
                    <li key={it.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${it.bought ? "bg-secondary/60" : "bg-secondary/30"}`}>
                      <div className={`grid h-6 w-6 place-items-center rounded-full ${it.bought ? "bg-success text-success-foreground" : "border-2 border-border bg-card"}`}>{it.bought && <CheckCircle2 className="h-4 w-4" />}</div>
                      <span className={`flex-1 text-sm ${it.bought ? "line-through text-muted-foreground" : ""}`}>{it.name} ({it.quantity}{it.unit})</span>
                    </li>
                  ))}
                </ul>
                <Link to="/shopping" className="mt-4 block w-full rounded-xl bg-gradient-to-r from-info to-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition">Xem tất cả →</Link>
              </div>
            )}

            {expiring.length > 0 && (
              <div className="rounded-3xl bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold"><span className="grid h-2 w-2 rounded-full bg-destructive" />Sắp hết hạn</div>
                  <Link to="/fridge" className="text-xs font-semibold text-primary hover:underline">Mở tủ lạnh →</Link>
                </div>
                <div className="mt-3 space-y-2">
                  {expiring.slice(0, 4).map((f) => {
                    const d = daysUntil(f.expiryDate);
                    return (
                      <div key={f.id} className={`flex items-center gap-3 rounded-xl p-3 ${d <= 2 ? "bg-destructive/10" : "bg-warning/10"}`}>
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-card text-lg shadow-sm">{f.icon ?? "🍱"}</div>
                        <div className="flex-1"><div className="font-semibold text-sm">{f.name}</div><div className="text-xs text-muted-foreground">Hết hạn: {fmtDate(f.expiryDate)}</div></div>
                        <span className={`rounded-md px-2 py-1 text-xs font-bold text-white ${d <= 2 ? "bg-destructive" : "bg-warning"}`}>{Math.max(0, d)} ngày</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Family feed */}
        <div className="rounded-3xl bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><span className="h-2 w-2 rounded-full bg-primary" /> Family feed</span>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <h3 className="mt-3 text-xl font-bold">Hoạt động gia đình</h3>
          <p className="text-sm text-muted-foreground">Cập nhật mới từ các thành viên trong nhà</p>
          <div className="mt-5 relative space-y-4 pl-12">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
            {feed.map((f) => (
              <div key={f.id} className="relative">
                <div className="absolute -left-[34px] top-1 grid h-9 w-9 place-items-center rounded-xl bg-card border-2 border-border"><FeedIcon kind={f.kind} /></div>
                <div className="rounded-2xl bg-secondary/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><span className="font-bold text-warning">{f.userName}</span><span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">thành viên</span></div>
                    <span className="text-xs text-muted-foreground">{fmtRelative(f.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-sm">{f.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-primary-foreground/70">{icon} {label}</div>
      <div className={`mt-0.5 text-lg font-bold ${accent ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

function MealCard({ m }: { m: MealPlanItem }) {
  const statusStyle =
    m.status === "Đã xong" ? "bg-success text-success-foreground"
      : m.status === "Đang nấu" ? "bg-warning text-warning-foreground"
        : "bg-info text-white";
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm text-card-foreground">
      <div className="relative h-32">
        {m.image && <img src={m.image} alt={m.recipeName} className="h-full w-full object-cover" loading="lazy" />}
        <span className="absolute top-2 left-2 rounded-full bg-card/95 px-2.5 py-0.5 text-xs font-semibold">{m.slot}</span>
        <span className={`absolute bottom-2 right-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>{m.status}</span>
        <div className="absolute bottom-2 left-2 right-20 text-white font-bold drop-shadow truncate">{m.recipeName}</div>
      </div>
      <div className="p-3 text-xs text-muted-foreground">
        <div>👥 {m.status === "Đã xong" ? "Đã nấu" : m.status === "Đang nấu" ? "Đang chuẩn bị" : "Đã lên kế hoạch"} · {m.servings} người</div>
        <div className="mt-0.5">⏰ {m.time ?? "Chưa đặt giờ"}</div>
      </div>
    </div>
  );
}

function FeedIcon({ kind }: { kind: string }) {
  if (kind === "shopping") return <ShoppingCart className="h-4 w-4 text-warning" />;
  if (kind === "fridge") return <Snowflake className="h-4 w-4 text-info" />;
  if (kind === "meal") return <ScrollText className="h-4 w-4 text-success" />;
  return <ChefHat className="h-4 w-4 text-primary" />;
}
