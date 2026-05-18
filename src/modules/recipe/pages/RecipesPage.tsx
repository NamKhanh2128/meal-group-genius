import { ChefHat, Heart, RefreshCw, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { BackButton } from "@/components/common/PageActions";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SkeletonCards } from "@/components/common/SkeletonCards";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { mealApi } from "@/services/api/mealApi";
import { recipeApi, type RecipeDetail } from "@/services/api/recipeApi";
import type { RecipeSuggestion } from "@/types";

export function RecipesPage() {
  const family = useAuthStore((state) => state.family)!;
  const user = useAuthStore((state) => state.user)!;
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [missingOpen, setMissingOpen] = useState(false);
  const selected = useMemo(() => recipes.find((item) => item.recipe_id === selectedId), [recipes, selectedId]);
  const selectedSuggestion = useMemo(() => suggestions.find((item) => item.recipe.recipe_id === selectedId), [suggestions, selectedId]);

  async function loadData() {
    setLoading(true);
    const [recipeRows, suggestionRows] = await Promise.all([recipeApi.list(), recipeApi.suggestions(family.family_id)]);
    setRecipes(recipeRows);
    setSuggestions(suggestionRows);
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, [family.family_id]);

  return (
    <>
      <ScreenHeader title="Gợi ý món ăn" subtitle={`Tủ lạnh hiện tại được scan để match công thức. Có ${suggestions.length} gợi ý khả dụng.`} actions={<div className="flex gap-2"><BackButton /><Button onClick={loadData} className="bg-[#7655aa]"><RefreshCw className="mr-2 h-4 w-4" />Gợi ý món</Button><Button variant="outline">Lọc khẩu vị</Button></div>} />
      {loading && <SkeletonCards />}
      {!loading && suggestions.length === 0 && (
        <div className="rounded-[8px] bg-white p-10 text-center shadow-card">
          <div className="text-5xl">🍽️</div>
          <h3 className="mt-3 text-xl font-extrabold">Không tìm thấy món phù hợp</h3>
          <div className="mt-4 flex justify-center gap-2"><Button asChild className="bg-[#ffb11f]"><Link to="/shopping/create">Mua thêm nguyên liệu</Link></Button><Button variant="outline" onClick={loadData}>Thử lại</Button></div>
        </div>
      )}
      {!loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recipes.map((recipe) => {
            const suggestion = suggestions.find((item) => item.recipe.recipe_id === recipe.recipe_id);
            const total = recipe.ingredients.length || 1;
            const matched = Math.round(((suggestion?.available_food_ids.length ?? 0) / total) * 100);
            return <article key={recipe.recipe_id} className="overflow-hidden rounded-[8px] bg-white shadow-card"><img src={recipe.image_url} alt={recipe.recipe_name} className="h-44 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="text-lg font-extrabold">{recipe.recipe_name}</h3><button onClick={() => toast.success("Đã lưu yêu thích.")}><Heart className="h-5 w-5 text-[#ff4f7b]" /></button></div><p className="mt-1 line-clamp-2 text-sm text-[#746d82]">{recipe.description}</p><div className="mt-3 text-xs text-[#746d82]">{recipe.difficulty} · {recipe.time_minutes} phút · matched {matched}%</div><div className="mt-3 rounded-[8px] bg-[#f7f4fb] p-3 text-xs"><b>Cần mua:</b> {suggestion?.missing.map((item) => item.food.food_name).join(", ") || "Không thiếu"}</div><div className="mt-4 flex gap-2"><Button className="flex-1 rounded-[8px] bg-[#7655aa]" onClick={() => setSelectedId(recipe.recipe_id)}><ChefHat className="mr-2 h-4 w-4" />Xem</Button><Button asChild variant="outline"><Link to={`/recipes/${recipe.recipe_id}`}>Trang</Link></Button></div></div></article>;
          })}
        </div>
      )}
      <AppModal open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)} type="info" title={selected?.recipe_name ?? "Công thức"} primaryLabel="Nấu món này" secondaryLabel="Đóng" onPrimary={() => { if ((selectedSuggestion?.missing.length ?? 0) > 0) setMissingOpen(true); else toast.success("Bắt đầu nấu món này."); }}>
        {selected && <div className="space-y-4"><img src={selected.image_url} alt={selected.recipe_name} className="h-44 w-full rounded-[8px] object-cover" /><div><b>Ingredients</b><ul className="mt-2 space-y-1">{selected.ingredients.map((item) => <li key={item.id}>{item.food.icon} {item.food.food_name}: {item.quantity} {item.food.unit}</li>)}</ul></div><div><b>Missing ingredients</b><p>{selectedSuggestion?.missing.map((item) => item.food.food_name).join(", ") || "Không thiếu"}</p></div><div><b>Instructions</b><ol className="mt-2 list-decimal pl-5">{selected.instructions.map((step) => <li key={step}>{step}</li>)}</ol></div><div><b>Nutrition</b><p>{selected.calories} kcal</p></div><Button variant="outline" onClick={() => setMissingOpen(true)}><ShoppingCart className="mr-2 h-4 w-4" />Thêm nguyên liệu thiếu vào shopping list</Button></div>}
      </AppModal>
      <AppModal open={missingOpen} onOpenChange={setMissingOpen} type="warning" title="Thiếu nguyên liệu" primaryLabel="Tạo shopping list" secondaryLabel="Chọn món khác" onPrimary={async () => { await mealApi.createShoppingListForMissing(family.family_id, user.user_id, "Nguyên liệu thiếu từ gợi ý món"); toast.success("Đã tạo shopping list cho nguyên liệu thiếu."); }}>
        {selectedSuggestion?.missing.map((item) => <div key={item.food.food_id}>- {item.food.food_name}: {item.quantity} {item.food.unit}</div>) || "Không thiếu nguyên liệu."}
      </AppModal>
    </>
  );
}
