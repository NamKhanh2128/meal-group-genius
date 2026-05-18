import { Search, AlertTriangle, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { useMealPlanStore } from "@/app/store/mealPlanStore";
import type { RecipeDetail } from "@/services/api/recipeApi";
import { Input } from "@/components/ui/input";

const FILTERS = ["Tất cả", "Dễ làm", "Trung bình", "Khó"] as const;
type Filter = (typeof FILTERS)[number];

interface Props {
  onSelect: (recipe: RecipeDetail) => void;
}

export function RecipePicker({ onSelect }: Props) {
  const { recipes, suggestions } = useMealPlanStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tất cả");

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchName = r.recipe_name.toLowerCase().includes(query.toLowerCase());
      const matchDiff = filter === "Tất cả" || r.difficulty === filter;
      return matchName && matchDiff;
    });
  }, [recipes, query, filter]);

  // Sort: suggested (fewer missing) first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aMissing = suggestions.find((s) => s.recipe.recipe_id === a.recipe_id)?.missing.length ?? 99;
      const bMissing = suggestions.find((s) => s.recipe.recipe_id === b.recipe_id)?.missing.length ?? 99;
      return aMissing - bMissing;
    });
  }, [filtered, suggestions]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9188a1]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm công thức..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f
                ? "bg-[#7655aa] text-white"
                : "bg-[#f3f0f8] text-[#7655aa] hover:bg-[#e9e3f7]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {sorted.length === 0 && (
          <div className="py-8 text-center text-sm text-[#9188a1]">Không tìm thấy công thức phù hợp</div>
        )}
        {sorted.map((recipe) => {
          const suggestion = suggestions.find((s) => s.recipe.recipe_id === recipe.recipe_id);
          const missingCount = suggestion?.missing.length ?? 0;
          const total = recipe.ingredients.length || 1;
          const matched = Math.round(((suggestion?.available_food_ids.length ?? 0) / total) * 100);
          const canCook = missingCount === 0;

          return (
            <button
              key={recipe.recipe_id}
              onClick={() => onSelect(recipe)}
              className="flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition hover:border-[#7655aa] hover:shadow-sm"
            >
              {recipe.image_url && (
                <img src={recipe.image_url} alt={recipe.recipe_name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-semibold text-[#3d3051]">{recipe.recipe_name}</span>
                  {canCook ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#9188a1]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.time_minutes} phút
                  </span>
                  <span>{recipe.difficulty}</span>
                  <span className={canCook ? "text-green-600" : "text-amber-600"}>
                    {canCook ? "Đủ nguyên liệu" : `Thiếu ${missingCount} nguyên liệu`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f3f0f8]">
                  <div
                    className="h-full rounded-full bg-[#7655aa] transition-all"
                    style={{ width: `${matched}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
