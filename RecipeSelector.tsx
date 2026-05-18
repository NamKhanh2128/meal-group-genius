/**
 * src/components/meal-plan/RecipeSelector.tsx
 * Shows all recipes with fridge-based suggestions. User can click to select.
 */
import { useEffect, useState } from "react";
import { Search, Sparkles, Clock, Flame, Plus } from "lucide-react";
import { recipeService } from "@/services/recipe.service";
import type { Recipe } from "@/types";

interface Suggestion {
  recipe: Recipe;
  have: string[];
  missing: string[];
}

interface Props {
  familyId: string;
  selectedIds: string[];
  onSelect: (recipe: Recipe) => void;
}

const CATEGORIES = ["Tất cả", "Dễ làm", "Trung bình", "Khó"];

export function RecipeSelector({ familyId, selectedIds, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    recipeService.suggest(familyId).then((s) => {
      setSuggestions(s);
      setLoading(false);
    });
  }, [familyId]);

  const filtered = suggestions.filter((s) => {
    const matchQ = s.recipe.name.toLowerCase().includes(query.toLowerCase());
    const matchD = difficulty === "Tất cả" || s.recipe.difficulty === difficulty;
    return matchQ && matchD;
  });

  return (
    <div className="space-y-3">
      {/* Search + filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm món..."
            className="w-full rounded-xl bg-secondary/40 pl-9 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setDifficulty(c)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                difficulty === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      {loading ? (
        <div className="text-center py-6 text-sm text-muted-foreground">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">Không tìm thấy món nào</div>
      ) : (
        <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
          {filtered.map(({ recipe, missing }) => {
            const isSelected = selectedIds.includes(recipe.id);
            const canMake = missing.length === 0;
            return (
              <button
                key={recipe.id}
                disabled={isSelected}
                onClick={() => !isSelected && onSelect(recipe)}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition w-full ${
                  isSelected
                    ? "bg-primary/10 ring-2 ring-primary/30 opacity-60 cursor-default"
                    : "bg-secondary/30 hover:bg-secondary/60 cursor-pointer"
                }`}
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-sm truncate">
                    {canMake && <Sparkles className="h-3 w-3 text-warning shrink-0" />}
                    {recipe.name}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.timeMinutes} phút</span>
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{recipe.calories} kcal</span>
                    {missing.length > 0 && (
                      <span className="text-warning/80">thiếu {missing.length} nguyên liệu</span>
                    )}
                  </div>
                </div>
                {!isSelected && (
                  <div className="shrink-0 rounded-full bg-primary/10 p-1">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
