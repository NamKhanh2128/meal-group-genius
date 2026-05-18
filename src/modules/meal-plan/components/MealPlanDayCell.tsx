import { Plus } from "lucide-react";
import type { MealSlot } from "@/app/store/mealPlanStore";
import { useMealPlanStore } from "@/app/store/mealPlanStore";

const SLOTS: MealSlot[] = ["Sáng", "Trưa", "Tối"];

const slotColors: Record<MealSlot, string> = {
  Sáng: "bg-amber-50 border-amber-200 text-amber-700",
  Trưa: "bg-green-50 border-green-200 text-green-700",
  Tối: "bg-violet-50 border-violet-200 text-violet-700",
};

const slotDots: Record<MealSlot, string> = {
  Sáng: "bg-amber-400",
  Trưa: "bg-green-500",
  Tối: "bg-violet-500",
};

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface Props {
  date: string;
  dayIndex: number;
}

export function MealPlanDayCell({ date, dayIndex }: Props) {
  const openEdit = useMealPlanStore((s) => s.openEdit);
  const getSlotRecipes = useMealPlanStore((s) => s.getSlotRecipes);

  const today = new Date().toISOString().slice(0, 10);
  const isToday = date === today;
  const dateNum = new Date(date).getDate();

  return (
    <div className={`flex flex-col rounded-xl border-2 ${isToday ? "border-[#7655aa]" : "border-transparent"} bg-white shadow-sm`}>
      <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${isToday ? "bg-[#7655aa] text-white" : "bg-[#f8f6fb] text-[#7655aa]"}`}>
        <span className="text-xs font-bold">{DAY_NAMES[dayIndex]}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${isToday ? "bg-white/20" : ""}`}>{dateNum}</span>
      </div>
      <div className="flex flex-col gap-1.5 p-2">
        {SLOTS.map((slot) => {
          const slotRecipes = getSlotRecipes(date, slot);
          return (
            <button
              key={slot}
              onClick={() => openEdit(date, slot)}
              className={`flex min-h-[44px] w-full items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left transition hover:opacity-80 ${slotColors[slot]}`}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${slotDots[slot]}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wide">{slot}</div>
                {slotRecipes.length === 0 ? (
                  <div className="flex items-center gap-0.5 text-[10px] opacity-50">
                    <Plus className="h-3 w-3" />
                    <span>Thêm món</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="truncate text-[11px] font-semibold">{slotRecipes[0].recipe_name}</div>
                    {slotRecipes.length > 1 && (
                      <div className="text-[10px] opacity-70">+{slotRecipes.length - 1} món khác</div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
