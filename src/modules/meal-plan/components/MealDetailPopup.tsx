import { Plus, Trash2, Eye, AlertTriangle, ShoppingCart, Clock, Flame, ChefHat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { useMealPlanStore } from "@/app/store/mealPlanStore";
import type { MealSlot } from "@/app/store/mealPlanStore";
import type { RecipeDetail } from "@/services/api/recipeApi";
import { RecipePicker } from "./RecipePicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SLOT_LABELS: Record<MealSlot, string> = {
  Sáng: "Bữa sáng",
  Trưa: "Bữa trưa",
  Tối: "Bữa tối",
};

const SLOT_COLORS: Record<MealSlot, string> = {
  Sáng: "text-amber-600 bg-amber-50",
  Trưa: "text-green-700 bg-green-50",
  Tối: "text-violet-700 bg-violet-50",
};

interface RecipeDetailModalProps {
  recipe: RecipeDetail;
  date: string;
  slot: MealSlot;
  onClose: () => void;
}

function RecipeDetailView({ recipe, date, slot, onClose }: RecipeDetailModalProps) {
  const { getMissingForRecipe, removeRecipeFromSlot } = useMealPlanStore();
  const missing = getMissingForRecipe(recipe.recipe_id);
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await removeRecipeFromSlot(date, slot, recipe.recipe_id);
    toast.success("Đã xóa món khỏi kế hoạch.");
    onClose();
  }

  return (
    <div className="space-y-4">
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.recipe_name} className="h-48 w-full rounded-xl object-cover" />
      )}
      <div className="flex flex-wrap gap-4 text-sm text-[#746d82]">
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.time_minutes} phút</span>
        <span className="flex items-center gap-1"><Flame className="h-4 w-4" />{recipe.calories} kcal</span>
        <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" />{recipe.difficulty}</span>
      </div>

      {missing.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            Thiếu {missing.length} nguyên liệu
          </div>
          <ul className="space-y-1">
            {missing.map((item) => (
              <li key={item.food.food_id} className="text-sm text-amber-700">
                {item.food.icon} {item.food.food_name}: cần {item.quantity} {item.food.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-2 font-bold text-[#3d3051]">Nguyên liệu</div>
        <ul className="space-y-1">
          {recipe.ingredients.map((item) => (
            <li key={item.id} className="text-sm text-[#746d82]">
              {item.food.icon} {item.food.food_name}: {item.quantity} {item.food.unit}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2 font-bold text-[#3d3051]">Cách làm</div>
        <ol className="list-decimal space-y-2 pl-5">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="text-sm text-[#746d82]">{step}</li>
          ))}
        </ol>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={removing}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Xóa khỏi kế hoạch
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <a href={`/recipes/${recipe.recipe_id}`}>
            <Eye className="h-4 w-4" />
            Trang công thức
          </a>
        </Button>
      </div>
    </div>
  );
}

export function MealDetailPopup() {
  const { editingDate, editingSlot, closeEdit, getSlotRecipes, addRecipeToSlot, createShoppingFromMissing, getMissingForRecipe } = useMealPlanStore();
  const [showPicker, setShowPicker] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<RecipeDetail | null>(null);
  const [adding, setAdding] = useState(false);
  const [creatingShopping, setCreatingShopping] = useState(false);
  const familyId = useMealPlanStore((s) => s.familyId);
  const userId = useAuthStore((s) => s.user?.user_id ?? "user-1");

  const open = Boolean(editingDate && editingSlot);

  function handleClose() {
    setShowPicker(false);
    setViewingRecipe(null);
    closeEdit();
  }

  async function handleAddRecipe(recipe: RecipeDetail) {
    if (!editingDate || !editingSlot) return;
    setAdding(true);
    try {
      await addRecipeToSlot(editingDate, editingSlot, recipe.recipe_id);
      toast.success(`Đã thêm ${recipe.recipe_name} vào ${SLOT_LABELS[editingSlot]}.`);
      setShowPicker(false);
    } catch {
      toast.error("Không thể thêm món. Thử lại.");
    } finally {
      setAdding(false);
    }
  }

  async function handleCreateShopping() {
    if (!familyId) return;
    setCreatingShopping(true);
    try {
      await createShoppingFromMissing(familyId, userId);
      toast.success("Đã tạo danh sách mua sắm nguyên liệu thiếu.");
    } catch {
      toast.error("Không thể tạo danh sách. Thử lại.");
    } finally {
      setCreatingShopping(false);
    }
  }

  const slotRecipes = editingDate && editingSlot ? getSlotRecipes(editingDate, editingSlot) : [];
  const slotLabel = editingSlot ? SLOT_LABELS[editingSlot] : "";
  const slotColor = editingSlot ? SLOT_COLORS[editingSlot] : "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-extrabold text-[#3d3051]">
                {viewingRecipe ? viewingRecipe.recipe_name : slotLabel}
              </DialogTitle>
              {editingDate && (
                <div className="mt-0.5 flex items-center gap-2 text-xs text-[#9188a1]">
                  <span>{new Date(editingDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}</span>
                  {editingSlot && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${slotColor}`}>{slotLabel}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {viewingRecipe && editingDate && editingSlot ? (
            <div>
              <button
                onClick={() => setViewingRecipe(null)}
                className="mb-4 flex items-center gap-1.5 text-sm text-[#7655aa] hover:underline"
              >
                ← Quay lại danh sách món
              </button>
              <RecipeDetailView
                recipe={viewingRecipe}
                date={editingDate}
                slot={editingSlot}
                onClose={handleClose}
              />
            </div>
          ) : showPicker ? (
            <div>
              <button
                onClick={() => setShowPicker(false)}
                className="mb-4 flex items-center gap-1.5 text-sm text-[#7655aa] hover:underline"
              >
                ← Quay lại
              </button>
              <RecipePicker onSelect={handleAddRecipe} />
            </div>
          ) : (
            <div className="space-y-4">
              {slotRecipes.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-[#d1c5e8] py-10 text-center">
                  <div className="text-4xl">🍽️</div>
                  <div className="mt-2 text-sm font-semibold text-[#9188a1]">Chưa có món nào cho {slotLabel}</div>
                  <div className="mt-1 text-xs text-[#b9b0c9]">Bấm thêm món để lên kế hoạch</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {slotRecipes.map((recipe) => {
                    const missing = getMissingForRecipe(recipe.recipe_id);
                    return (
                      <div key={recipe.recipe_id} className="flex items-center gap-3 rounded-xl border bg-[#faf9fd] p-3">
                        {recipe.image_url && (
                          <img src={recipe.image_url} alt={recipe.recipe_name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-[#3d3051]">{recipe.recipe_name}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#9188a1]">
                            <span>{recipe.time_minutes} phút</span>
                            <span>{recipe.calories} kcal</span>
                            {missing.length > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                Thiếu {missing.length} NL
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setViewingRecipe(recipe)}
                          className="shrink-0 rounded-lg p-1.5 text-[#9188a1] transition hover:bg-[#e9e3f7] hover:text-[#7655aa]"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() => setShowPicker(true)}
                  className="gap-1.5 bg-[#7655aa]"
                  disabled={adding}
                >
                  <Plus className="h-4 w-4" />
                  Thêm món
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCreateShopping}
                  disabled={creatingShopping}
                  className="gap-1.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {creatingShopping ? "Đang tạo..." : "Tạo danh sách mua sắm"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
