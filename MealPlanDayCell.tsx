/**
 * src/components/meal-plan/MealPlanDayCell.tsx
 * One day column in the weekly calendar.
 */
import { Plus } from "lucide-react";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import type { MealPlan } from "@/types/mealplan";

const SLOTS: MealPlan["slot"][] = ["Sáng", "Trưa", "Tối"];
const SLOT_COLOR: Record<string, string> = {
  Sáng: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Trưa: "bg-green-500/15 text-green-700 dark:text-green-400",
  Tối: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};
const SLOT_DOT: Record<string, string> = {
  Sáng: "bg-amber-400",
  Trưa: "bg-green-400",
  Tối: "bg-violet-400",
};

function isToday(dateStr: string) {
  return new Date().toISOString().slice(0, 10) === dateStr;
}

const VI_DAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

interface Props {
  date: string; // YYYY-MM-DD
}

export function MealPlanDayCell({ date }: Props) {
  const { plansByDate, openEdit } = useMealPlanStore();
  const dayPlans = plansByDate[date] ?? [];
  const today = isToday(date);
  const d = new Date(date + "T00:00:00");
  const dayLabel = VI_DAY[d.getDay()];
  const dayNum = d.getDate();

  return (
    <div
      className={`flex flex-col rounded-2xl border transition ${
        today ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/50 bg-card hover:border-border"
      }`}
    >
      {/* Day header */}
      <div className={`flex items-center justify-between px-3 py-2.5 border-b ${today ? "border-primary/20" : "border-border/40"}`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${today ? "text-primary" : "text-muted-foreground"}`}>
          {dayLabel}
        </span>
        <span className={`text-xl font-extrabold leading-none ${today ? "text-primary" : "text-foreground"}`}>
          {dayNum}
        </span>
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-1.5 p-2 flex-1">
        {SLOTS.map((slot) => {
          const plan = dayPlans.find((p) => p.slot === slot);
          const recipes = plan?.recipes ?? [];

          return (
            <button
              key={slot}
              onClick={() => openEdit(date, slot)}
              className="group w-full rounded-xl p-2 text-left hover:bg-secondary/50 transition"
            >
              {/* Slot label */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`h-1.5 w-1.5 rounded-full ${SLOT_DOT[slot]}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${SLOT_COLOR[slot]}`}>
                  {slot}
                </span>
              </div>

              {recipes.length === 0 ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition">
                  <Plus className="h-3 w-3" />
                  <span>Thêm món</span>
                </div>
              ) : recipes.length === 1 ? (
                <p className="text-xs font-medium truncate">{recipes[0].name}</p>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs font-medium truncate">{recipes[0].name}</p>
                  <p className="text-[10px] text-muted-foreground">+{recipes.length - 1} món khác</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
