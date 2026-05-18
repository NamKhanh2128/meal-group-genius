/**
 * src/components/meal-plan/EditMealPlanDialog.tsx
 * Modal for adding / removing recipes from a single meal slot.
 */
import { useEffect } from "react";
import { X, Trash2, ChefHat } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { RecipeSelector } from "./RecipeSelector";
import { MissingIngredientsWarning } from "./MissingIngredientsWarning";
import type { Recipe } from "@/types";

const SLOT_EMOJI: Record<string, string> = { Sáng: "🌅", Trưa: "☀️", Tối: "🌙" };

interface Props {
  familyId: string;
}

export function EditMealPlanDialog({ familyId }: Props) {
  const {
    editingDate,
    editingSlot,
    plansByDate,
    missingIngredients,
    closeEdit,
    addRecipe,
    removeRecipe,
    checkMissing,
  } = useMealPlanStore();

  const open = !!editingDate && !!editingSlot;

  // Find current plans for this slot
  const dayPlans = editingDate ? (plansByDate[editingDate] ?? []) : [];
  const slotPlan = dayPlans.find((p) => p.slot === editingSlot);
  const currentRecipes: Recipe[] = slotPlan?.recipes ?? [];
  const selectedIds = currentRecipes.map((r) => r.id);

  useEffect(() => {
    if (open) checkMissing();
  }, [open, editingDate, editingSlot]);

  async function handleSelect(recipe: Recipe) {
    await addRecipe(recipe.id);
  }

  async function handleRemove(recipeId: string) {
    if (!slotPlan) return;
    await removeRecipe(slotPlan.id, recipeId);
  }

  const dateLabel = editingDate
    ? new Date(editingDate + "T00:00:00").toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeEdit()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {editingSlot && <span>{SLOT_EMOJI[editingSlot]}</span>}
            Bữa {editingSlot} · {dateLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Current recipes in this slot */}
          {currentRecipes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Món đã chọn ({currentRecipes.length})
              </p>
              {currentRecipes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl bg-primary/8 px-3 py-2.5"
                >
                  {r.image && (
                    <img src={r.image} alt={r.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                  )}
                  {!r.image && (
                    <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0">
                      <ChefHat className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="flex-1 font-medium text-sm">{r.name}</span>
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Missing ingredients warning */}
          <MissingIngredientsWarning items={missingIngredients} />

          {/* Divider */}
          <div className="border-t" />

          {/* Recipe selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thêm món từ danh sách
            </p>
            <RecipeSelector familyId={familyId} selectedIds={selectedIds} onSelect={handleSelect} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={closeEdit} variant="outline" className="rounded-xl">
            Xong
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
