import { Clock, Flame, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { recipeApi, type RecipeDetail } from "@/modules/recipe/api/recipeApi";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { AppModal } from "@/shared/components/AppModal";
import { Button } from "@/components/ui/button";

export function RecipePersonalPage() {
  const user = useAuthStore((state) => state.user)!;
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RecipeDetail | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await recipeApi.listPersonal(user.user_id);
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [user.user_id]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await recipeApi.remove(deleteTarget.recipe_id, user.user_id);
      toast.success(`Đã xóa công thức "${deleteTarget.recipe_name}".`);
      setDeleteTarget(null);
      setDeleteOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa công thức.");
    }
  }

  return (
    <>
      <ScreenHeader
        eyebrow="Công thức"
        title="Công Thức Của Tôi"
        subtitle="Quản lý các công thức bạn đã tạo."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/recipes">← Tất cả công thức</Link></Button>
            <Button asChild className="bg-[#7655aa]"><Link to="/recipes/new"><Plus className="mr-2 h-4 w-4" />Tạo công thức mới</Link></Button>
          </div>
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
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] bg-white py-20 shadow-card text-center">
          <UtensilsCrossed className="h-12 w-12 text-[#c4b9d8]" />
          <p className="mt-4 text-sm font-semibold text-[#9188a1]">Bạn chưa tạo công thức nào.</p>
          <Button asChild className="mt-4 bg-[#7655aa]"><Link to="/recipes/new"><Plus className="mr-2 h-4 w-4" />Tạo công thức đầu tiên</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => (
            <div key={recipe.recipe_id} className="relative flex flex-col overflow-hidden rounded-[16px] bg-white shadow-card">
              <div className="relative h-48 overflow-hidden">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.recipe_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eee9f7] to-[#d4c7f0]">
                    <UtensilsCrossed className="h-12 w-12 text-[#7655aa]/40" />
                  </div>
                )}
                {/* Action buttons */}
                <div className="absolute right-3 top-3 flex gap-2">
                  <Link
                    to={`/recipes/edit/${recipe.recipe_id}`}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#7655aa] shadow-sm transition hover:bg-[#7655aa] hover:text-white"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setDeleteTarget(recipe); setDeleteOpen(true); }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                <Link to={`/recipes/${recipe.recipe_id}`} className="mt-3 block rounded-[8px] bg-[#eee9f7] py-2 text-center text-xs font-bold text-[#7655aa] transition hover:bg-[#7655aa] hover:text-white">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AppModal
        open={deleteOpen}
        onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteTarget(null); }}
        type="warning"
        title={`Xóa công thức "${deleteTarget?.recipe_name}"?`}
        primaryLabel="Xóa"
        secondaryLabel="Hủy"
        onPrimary={handleDelete}
      >
        <p className="text-sm text-[#5f586d]">Hành động này không thể hoàn tác. Công thức và tất cả nguyên liệu sẽ bị xóa vĩnh viễn.</p>
      </AppModal>
    </>
  );
}
