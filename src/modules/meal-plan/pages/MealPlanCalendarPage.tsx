import { useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useMealStore } from "@/app/store/mealStore";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { formatDate } from "@/utils/date";

export function MealPlanCalendarPage() {
  const family = useAuthStore((state) => state.family)!;
  const { groups, load } = useMealStore();
  useEffect(() => { void load(family.family_id); }, [family.family_id, load]);
  return (
    <>
      <ScreenHeader title="Lịch thực đơn" subtitle="Kế hoạch đã lưu theo meal_date, meal_type và nhiều recipe_id mỗi bữa." />
      <div className="grid gap-4 md:grid-cols-3">{groups.map((group) => <div key={`${group.meal_date}-${group.meal_type}`} className="rounded-[8px] bg-white p-5 shadow-card"><b>{formatDate(group.meal_date)}</b><p>{group.meal_type}</p><p className="text-sm text-[#746d82]">{group.recipe_ids.length} món</p></div>)}</div>
    </>
  );
}
