import { Heart, UtensilsCrossed, Clock, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { recipeApi, type RecipeDetail } from "@/modules/recipe/api/recipeApi";
import { ScreenHeader } from "@/shared/components/ScreenHeader";

export function RecipeFavoritesPage() {
  const [favorites, setFavorites] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await recipeApi.listFavorites();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleRemoveFavorite(e: React.MouseEvent, recipe_id: string) {
    e.preventDefault();
    try {
      await recipeApi.toggleFavorite(recipe_id);
      setFavorites((prev) => prev.filter((r) => r.recipe_id !== recipe_id));
      toast.success("Đã bỏ yêu thích.");
    } catch {
      toast.error("Không thể cập nhật yêu thích.");
    }
  }

  return (
    <>
      <ScreenHeader
        eyebrow="Công thức"
        title="Yêu Thích Của Tôi"
        subtitle="Danh sách công thức bạn đã lưu lại."
        actions={
          <Link to="/recipes" className="inline-flex items-center gap-2 rounded-[8px] border border-[#e8e0f0] bg-white px-4 py-2 text-xs font-bold text-[#7655aa] transition hover:bg-[#eee9f7]">
            ← Tất cả công thức
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[16px] bg-white shadow-card">
              <div className="h-48 rounded-t-[16px] bg-[#e8e0f0]" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded-lg bg-[#e8e0f0]" />
                <div className="h-3 w-full rounded-lg bg-[#e8e0f0]" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] bg-white py-20 shadow-card text-center">
          <Heart className="h-12 w-12 text-[#c4b9d8]" />
          <p className="mt-4 text-sm font-semibold text-[#9188a1]">Bạn chưa yêu thích công thức nào.</p>
          <Link to="/recipes" className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#7655aa] px-5 py-2.5 text-sm font-bold text-white">
            Khám phá công thức
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((recipe) => (
            <Link
              key={recipe.recipe_id}
              to={`/recipes/${recipe.recipe_id}`}
              className="group relative flex flex-col overflow-hidden rounded-[16px] bg-white shadow-card transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(64,38,99,0.18)]"
            >
              <div className="relative h-48 overflow-hidden">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.recipe_name} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eee9f7] to-[#d4c7f0]">
                    <UtensilsCrossed className="h-12 w-12 text-[#7655aa]/40" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemoveFavorite(e, recipe.recipe_id)}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow-sm transition hover:scale-110 hover:bg-red-600"
                  title="Bỏ yêu thích"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${recipe.difficulty === "Dễ làm" ? "bg-[#31c875] text-white" : recipe.difficulty === "Trung bình" ? "bg-[#ffb11f] text-white" : "bg-[#ef3d3d] text-white"}`}>
                  {recipe.difficulty}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-extrabold text-[#252033] line-clamp-1">{recipe.recipe_name}</h3>
                <p className="mt-1 text-xs text-[#746d82] line-clamp-2">{recipe.description}</p>
                <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-[#9188a1]">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{recipe.time_minutes} phút</span>
                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{recipe.calories} kcal</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
