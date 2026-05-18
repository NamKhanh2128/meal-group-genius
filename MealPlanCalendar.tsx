/**
 * src/components/meal-plan/MealPlanCalendar.tsx
 * Weekly 7-column calendar grid with prev/next navigation.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { MealPlanDayCell } from "./MealPlanDayCell";

export function MealPlanCalendar() {
  const { weekDays, weekAnchor, prevWeek, nextWeek, loading } = useMealPlanStore();

  const monthLabel = new Date(weekAnchor).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevWeek} className="rounded-xl">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">{monthLabel}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(weekDays[0] + "T00:00:00").toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
            {" – "}
            {new Date(weekDays[6] + "T00:00:00").toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={nextWeek} className="rounded-xl">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 overflow-x-auto">
          {weekDays.map((d) => (
            <MealPlanDayCell key={d} date={d} />
          ))}
        </div>
      )}
    </div>
  );
}
