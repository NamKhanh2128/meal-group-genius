import { BookOpen, Clock, Flame, Heart, Search, Star, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { recipeApi, type RecipeDetail } from "@/modules/recipe/api/recipeApi";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DIFFICULTIES = ["Tất cả", "Dễ làm", "Trung bình", "Khó"];
const SORT_OPTIONS = [
  { value: "name", label: "Tên A→Z" },
  { value: "time", label: "Thời gian nhanh nhất" },
  { value: "calories", label: "Ít calo nhất" },
];
const PAGE_SIZE = 6;

export function RecipeListPage() {
  const user = useAuthStore((state) => state.user)!;
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("Tất cả");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const data = await recipeApi.list();
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleToggleFavorite(e: React.MouseEvent, recipe_id: string) {
    e.preventDefault();
    try {
      const isFav = await recipeApi.toggleFavorite(recipe_id);
      setRecipes((prev) => prev.map((r) => r.recipe_id === recipe_id ? { ...r, is_favorite: isFav } : r));
      toast.success(isFav ? "Đã thêm vào yêu thích." : "Đã bỏ yêu thích.");
    } catch {
      toast.error("Không thể cập nhật yêu thích.");
    }
  }

  const filtered = useMemo(() => {
    let result = recipes;
    if (search) result = result.filter((r) => r.recipe_name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));
    if (difficulty !== "Tất cả") result = result.filter((r) => r.difficulty === difficulty);
    if (sort === "name") result = [...result].sort((a, b) => a.recipe_name.localeCompare(b.recipe_name));
    else if (sort === "time") result = [...result].sort((a, b) => a.time_minutes - b.time_minutes);
    else if (sort === "calories") result = [...result].sort((a, b) => a.calories - b.calories);
    return result;
  }, [recipes, search, difficulty, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, difficulty, sort]);

  return (
    <>
      <ScreenHeader
        eyebrow="Khám phá"
        title="Công Thức Nấu Ăn"
        subtitle="Tìm kiếm, lưu yêu thích và tạo công thức riêng của bạn."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/recipes/favorites"><Heart className="mr-2 h-4 w-4" />Yêu thích</Link></Button>
            <Button asChild className="bg-[#7655aa]"><Link to="/recipes/personal"><UtensilsCrossed className="mr-2 h-4 w-4" />Công thức của tôi</Link></Button>
          </div>
        }
      />

      {/* Search + Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9188a1]" />
          <Input
            placeholder="Tìm kiếm công thức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${difficulty === d ? "bg-[#7655aa] text-white shadow-sm" : "bg-white text-[#746d82] hover:bg-[#eee9f7]"}`}
            >
              {d}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-[8px] border border-[#e8e0f0] bg-white px-3 py-2 text-xs font-semibold text-[#4a3d60] focus:outline-none focus:ring-2 focus:ring-[#7655aa]/30"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Recipe Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[16px] bg-white shadow-card">
              <div className="h-48 rounded-t-[16px] bg-[#e8e0f0]" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded-lg bg-[#e8e0f0]" />
                <div className="h-3 w-full rounded-lg bg-[#e8e0f0]" />
                <div className="h-3 w-1/2 rounded-lg bg-[#e8e0f0]" />
              </div>
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] bg-white py-20 shadow-card">
          <BookOpen className="h-12 w-12 text-[#c4b9d8]" />
          <p className="mt-4 text-sm font-semibold text-[#9188a1]">Không tìm thấy công thức nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paged.map((recipe) => (
            <Link
              key={recipe.recipe_id}
              to={`/recipes/${recipe.recipe_id}`}
              className="group relative flex flex-col overflow-hidden rounded-[16px] bg-white shadow-card transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(64,38,99,0.18)]"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.recipe_name} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eee9f7] to-[#d4c7f0]">
                    <UtensilsCrossed className="h-12 w-12 text-[#7655aa]/40" />
                  </div>
                )}
                {/* Difficulty badge */}
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${recipe.difficulty === "Dễ làm" ? "bg-[#31c875] text-white" : recipe.difficulty === "Trung bình" ? "bg-[#ffb11f] text-white" : "bg-[#ef3d3d] text-white"}`}>
                  {recipe.difficulty}
                </span>
                {/* Favorite button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, recipe.recipe_id)}
                  className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full shadow-sm transition hover:scale-110 ${recipe.is_favorite ? "bg-red-500 text-white" : "bg-white/80 text-[#9188a1] hover:bg-white"}`}
                  title={recipe.is_favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                >
                  <Heart className={`h-4 w-4 ${recipe.is_favorite ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-extrabold text-[#252033] line-clamp-1">{recipe.recipe_name}</h3>
                <p className="mt-1 text-xs text-[#746d82] line-clamp-2">{recipe.description}</p>
                <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-[#9188a1]">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{recipe.time_minutes} phút</span>
                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{recipe.calories} kcal</span>
                  {recipe.servings && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{recipe.servings} người</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-[8px] border border-[#e8e0f0] bg-white px-4 py-2 text-xs font-bold text-[#7655aa] transition hover:bg-[#eee9f7] disabled:opacity-40"
          >
            ‹ Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-[8px] text-xs font-bold transition ${p === page ? "bg-[#7655aa] text-white shadow-sm" : "border border-[#e8e0f0] bg-white text-[#746d82] hover:bg-[#eee9f7]"}`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-[8px] border border-[#e8e0f0] bg-white px-4 py-2 text-xs font-bold text-[#7655aa] transition hover:bg-[#eee9f7] disabled:opacity-40"
          >
            Tiếp ›
          </button>
        </div>
      )}
    </>
  );
}
