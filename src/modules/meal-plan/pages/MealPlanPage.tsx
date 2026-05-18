import { Calendar, LayoutList, RefreshCw, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useMealPlanStore } from "@/app/store/mealPlanStore";
import { BackButton } from "@/components/common/PageActions";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/ui/button";
import { MealPlanCalendar } from "../components/MealPlanCalendar";
import { MealScheduleTable } from "../components/MealScheduleTable";
import { MealDetailPopup } from "../components/MealDetailPopup";

export function MealPlanPage() {
  const family = useAuthStore((state) => state.family)!;
  const user = useAuthStore((state) => state.user)!;
  const { viewMode, setViewMode, loadWeek, loading, suggestions, createShoppingFromMissing } = useMealPlanStore();

  useEffect(() => {
    void loadWeek(family.family_id);
  }, [family.family_id]);

  const totalMissing = suggestions.reduce((acc, s) => acc + s.missing.length, 0);

  async function handleCreateShopping() {
    try {
      await createShoppingFromMissing(family.family_id, user.user_id);
      toast.success("Đã tạo danh sách mua sắm từ nguyên liệu thiếu.");
    } catch {
      toast.error("Không thể tạo danh sách. Thử lại.");
    }
  }

  return (
    <>
      <ScreenHeader
        title="Kế hoạch bữa ăn"
        subtitle="Lập thực đơn theo tuần, xem gợi ý món từ tủ lạnh và tự động tạo danh sách mua sắm."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <BackButton />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadWeek(family.family_id)}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
            {totalMissing > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateShopping}
                className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <ShoppingCart className="h-4 w-4" />
                Mua nguyên liệu thiếu ({totalMissing})
              </Button>
            )}
          </div>
        }
      />

      {/* View Toggle */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex rounded-xl border bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              viewMode === "calendar"
                ? "bg-[#7655aa] text-white shadow-sm"
                : "text-[#9188a1] hover:text-[#7655aa]"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Lịch tuần
          </button>
          <button
            onClick={() => setViewMode("schedule")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              viewMode === "schedule"
                ? "bg-[#7655aa] text-white shadow-sm"
                : "text-[#9188a1] hover:text-[#7655aa]"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            Bảng thực đơn
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
            <Sparkles className="h-3.5 w-3.5" />
            {suggestions.length} gợi ý từ tủ lạnh
          </div>
        )}
      </div>

      {viewMode === "calendar" ? <MealPlanCalendar /> : <MealScheduleTable />}

      <MealDetailPopup />
    </>
  );
}
