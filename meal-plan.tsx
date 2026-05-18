/**
 * src/routes/_main/meal-plan.tsx  (v2 – multi-recipe per meal)
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/PageHero";
import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { migrateMealPlans } from "@/services/mealplan.service";
import { MealPlanCalendar } from "@/components/meal-plan/MealPlanCalendar";
import { EditMealPlanDialog } from "@/components/meal-plan/EditMealPlanDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/meal-plan")({
  head: () => ({ meta: [{ title: "Thực đơn — NATEAT" }] }),
  component: MealPlanPage,
});

function MealPlanPage() {
  const { group, pushFeed } = useGroup();
  const { user } = useAuth();
  const { loadWeek, saveAndCreateShopping, loading, plansByDate } = useMealPlanStore();
  const [saving, setSaving] = useState(false);

  // Run migration once and load week
  useEffect(() => {
    migrateMealPlans();
    if (group) loadWeek(group.id);
  }, [group]);

  const totalMeals = Object.values(plansByDate)
    .flat()
    .filter((p) => p.recipes.length > 0).length;

  async function handleSave() {
    if (!group || !user) return;
    setSaving(true);
    try {
      const created = await saveAndCreateShopping(user.id);
      if (created) {
        await pushFeed("shopping", "tạo danh sách mua sắm từ kế hoạch bữa ăn tuần này");
        toast.success("✅ Đã lưu kế hoạch và tạo danh sách mua sắm bổ sung nguyên liệu còn thiếu!", {
          duration: 5000,
        });
      } else {
        toast.success("✅ Kế hoạch đã lưu! Tủ lạnh đủ nguyên liệu cho tuần này 🎉");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHero
        title="Thực đơn tuần 📅"
        subtitle="Lên kế hoạch Sáng / Trưa / Tối cho cả gia đình — hệ thống tự kiểm tra tủ lạnh và tạo danh sách mua sắm."
      />

      {/* Stats bar */}
      {totalMeals > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent/40 px-5 py-3 text-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>
            <strong>{totalMeals}</strong> bữa đã lên kế hoạch trong tuần này
          </span>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-3xl bg-card p-5 shadow-card">
        {group ? (
          <MealPlanCalendar />
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Đang tải...
          </div>
        )}
      </div>

      {/* Save / create shopping list */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || loading || totalMeals === 0}
          className="rounded-2xl gap-2 px-6"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          Lưu kế hoạch & kiểm tra nguyên liệu
        </Button>
      </div>

      {/* Edit modal */}
      {group && <EditMealPlanDialog familyId={group.id} />}
    </div>
  );
}
