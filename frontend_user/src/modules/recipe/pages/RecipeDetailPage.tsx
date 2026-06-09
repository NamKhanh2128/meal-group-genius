import { ChefHat, Clock, Flame, Heart, PackageMinus, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { recipeApi, type RecipeDetail } from "@/modules/recipe/api/recipeApi";
import type { RecipeSuggestion } from "@/types";

export function RecipeDetailPage() {
  const { id } = useParams();
  const family = useAuthStore((state) => state.family)!;
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [suggestion, setSuggestion] = useState<RecipeSuggestion | null>(null);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    if (id) {
      void recipeApi.detail(id).then(setRecipe);
      void recipeApi.suggestions(family.family_id).then((list) => setSuggestion(list.find((item) => item.recipe.recipe_id === id) ?? null));
    }
  }, [id, family.family_id]);

  async function handleToggleFavorite() {
    if (!recipe) return;
    setTogglingFav(true);
    try {
      const isFav = await recipeApi.toggleFavorite(recipe.recipe_id);
      setRecipe((prev) => prev ? { ...prev, is_favorite: isFav } : prev);
      toast.success(isFav ? "Đã thêm vào yêu thích." : "Đã bỏ yêu thích.");
    } catch {
      toast.error("Không thể cập nhật yêu thích.");
    } finally {
      setTogglingFav(false);
    }
  }

  if (!recipe) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7655aa] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ScreenHeader
        title={recipe.recipe_name}
        subtitle={recipe.description}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleFavorite}
              disabled={togglingFav}
              className={recipe.is_favorite ? "border-red-400 text-red-500 hover:bg-red-50" : ""}
            >
              <Heart className={`mr-2 h-4 w-4 ${recipe.is_favorite ? "fill-current text-red-500" : ""}`} />
              {recipe.is_favorite ? "Đã yêu thích" : "Yêu thích"}
            </Button>
            <Button
              onClick={async () => {
                await recipeApi.markCooked(family.family_id, recipe.recipe_id);
                toast.success("Đã nấu ăn và cập nhật lại nguyên liệu trong tủ lạnh.");
              }}
              className="bg-[#31c875]"
            >
              <PackageMinus className="mr-2 h-4 w-4" />Sau khi nấu
            </Button>
          </div>
        }
      />

      {/* Metrics row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-card">
          <Clock className="h-5 w-5 text-[#7655aa]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9188a1]">Thời gian</p>
            <p className="font-extrabold text-[#252033]">{recipe.time_minutes} phút</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-card">
          <Flame className="h-5 w-5 text-[#ff7043]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9188a1]">Calo</p>
            <p className="font-extrabold text-[#252033]">{recipe.calories} kcal</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-card">
          <Star className="h-5 w-5 text-[#ffb11f]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9188a1]">Độ khó</p>
            <p className="font-extrabold text-[#252033]">{recipe.difficulty}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-card">
          <Users className="h-5 w-5 text-[#31c875]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9188a1]">Khẩu phần</p>
            <p className="font-extrabold text-[#252033]">{recipe.servings ?? 2} người</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <img
            className="h-80 w-full rounded-[8px] object-cover shadow-card"
            src={recipe.image_url}
            alt={recipe.recipe_name}
          />
          {suggestion && (
            <div className="rounded-[8px] bg-[#fbfacb] p-4 shadow-card">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#8a7a10]">Nguyên liệu cần mua thêm</p>
              {suggestion.missing.length === 0 ? (
                <p className="text-sm font-semibold text-[#31c875]">✓ Đủ nguyên liệu trong tủ lạnh!</p>
              ) : (
                <ul className="space-y-1">
                  {suggestion.missing.map((item) => (
                    <li key={item.food.food_id} className="flex items-center gap-2 text-sm">
                      <span>{item.food.icon}</span>
                      <span className="font-semibold">{item.food.food_name}</span>
                      <span className="text-[#9188a1]">({item.quantity} {item.food.unit})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Ingredients */}
          <div className="rounded-[8px] bg-white p-6 shadow-card">
            <h3 className="mb-4 font-extrabold text-[#252033]">Nguyên liệu</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-[8px] bg-[#f8f6fb] p-3">
                  <span className="text-xl">{item.food.icon}</span>
                  <span className="flex-1 font-semibold">{item.food.food_name}</span>
                  <span className="text-sm font-bold text-[#7655aa]">{item.quantity} {item.food.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="rounded-[8px] bg-white p-6 shadow-card">
            <h3 className="mb-4 font-extrabold text-[#252033]">Hướng dẫn chế biến</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7655aa] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-[#3d3051]">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={async () => {
                await recipeApi.markCooked(family.family_id, recipe.recipe_id);
                toast.success("Đã nấu ăn và cập nhật lại nguyên liệu trong tủ lạnh.");
              }}
              className="bg-[#ffb11f]"
            >
              <ChefHat className="mr-2 h-4 w-4" />Bắt đầu nấu
            </Button>
            <Button asChild variant="outline">
              <Link to="/recipes">← Tất cả công thức</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
