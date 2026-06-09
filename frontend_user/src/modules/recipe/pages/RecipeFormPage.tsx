import { Minus, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { recipeApi } from "@/modules/recipe/api/recipeApi";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/shared/lib/mockDb";
import type { Food } from "@/types";

type Mode = "create" | "edit";
type IngredientRow = { food_id: string; quantity: number };

const DIFFICULTIES = ["Dễ làm", "Trung bình", "Khó"];

export function RecipeFormPage({ mode }: { mode: Mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user)!;

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [calories, setCalories] = useState(400);
  const [difficulty, setDifficulty] = useState("Dễ làm");
  const [servings, setServings] = useState(2);
  const [instructions, setInstructions] = useState<string[]>(["", "", ""]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ food_id: "", quantity: 1 }]);

  useEffect(() => {
    db().then((state) => setFoods(state.foods));
  }, []);

  useEffect(() => {
    if (mode === "edit" && id) {
      void recipeApi.detail(id).then((recipe) => {
        setName(recipe.recipe_name);
        setDescription(recipe.description);
        setImageUrl(recipe.image_url ?? "");
        setTimeMinutes(recipe.time_minutes);
        setCalories(recipe.calories);
        setDifficulty(recipe.difficulty);
        setServings(recipe.servings ?? 2);
        setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [""]);
        setIngredients(recipe.ingredients.map((ing) => ({ food_id: ing.food_id, quantity: ing.quantity })));
        setLoading(false);
      }).catch(() => {
        toast.error("Không tìm thấy công thức.");
        navigate("/recipes/personal");
      });
    }
  }, [mode, id, navigate]);

  function addInstruction() { setInstructions((prev) => [...prev, ""]); }
  function removeInstruction(i: number) { setInstructions((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateInstruction(i: number, val: string) { setInstructions((prev) => prev.map((s, idx) => idx === i ? val : s)); }

  function addIngredient() { setIngredients((prev) => [...prev, { food_id: "", quantity: 1 }]); }
  function removeIngredient(i: number) { setIngredients((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateIngredient(i: number, field: keyof IngredientRow, val: string | number) {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Vui lòng nhập tên công thức.");
    if (instructions.filter((s) => s.trim()).length === 0) return toast.error("Vui lòng nhập ít nhất 1 bước chế biến.");
    const validIngredients = ingredients.filter((ing) => ing.food_id && ing.quantity > 0);

    setSubmitting(true);
    try {
      const payload = {
        recipe_name: name.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || undefined,
        time_minutes: timeMinutes,
        calories,
        difficulty,
        servings,
        instructions: instructions.filter((s) => s.trim()),
        ingredients: validIngredients,
        created_by: user.user_id,
      };

      if (mode === "create") {
        await recipeApi.create(payload);
        toast.success("Đã tạo công thức mới!");
      } else if (mode === "edit" && id) {
        await recipeApi.update(id, payload);
        toast.success("Đã cập nhật công thức!");
      }
      navigate("/recipes/personal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu công thức.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7655aa] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ScreenHeader
        eyebrow="Công thức của tôi"
        title={mode === "create" ? "Tạo Công Thức Mới" : "Chỉnh Sửa Công Thức"}
        subtitle={mode === "create" ? "Chia sẻ công thức nấu ăn của bạn với gia đình." : "Cập nhật thông tin công thức."}
        actions={
          <Button variant="outline" onClick={() => navigate("/recipes/personal")}>
            <X className="mr-2 h-4 w-4" />Hủy
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-[8px] bg-white p-6 shadow-card space-y-4">
          <h3 className="font-extrabold text-[#252033]">Thông tin cơ bản</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">Tên công thức *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: Cơm bò lúc lắc" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">URL hình ảnh</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#746d82]">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[8px] border border-[#e8e0f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7655aa]/30 resize-none"
              placeholder="Mô tả ngắn về công thức..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">Thời gian (phút)</label>
              <Input type="number" min={1} value={timeMinutes} onChange={(e) => setTimeMinutes(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">Calories (kcal)</label>
              <Input type="number" min={0} value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">Khẩu phần (người)</label>
              <Input type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#746d82]">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-[8px] border border-[#e8e0f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7655aa]/30"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="rounded-[8px] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#252033]">Nguyên liệu</h3>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Thêm
            </Button>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  value={ing.food_id}
                  onChange={(e) => updateIngredient(i, "food_id", e.target.value)}
                  className="flex-1 rounded-[8px] border border-[#e8e0f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7655aa]/30"
                >
                  <option value="">-- Chọn thực phẩm --</option>
                  {foods.map((f) => (
                    <option key={f.food_id} value={f.food_id}>{f.icon} {f.food_name} ({f.unit})</option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, "quantity", Number(e.target.value))}
                  className="w-24"
                  placeholder="Số lượng"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] text-red-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-[8px] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#252033]">Các bước chế biến</h3>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Thêm bước
            </Button>
          </div>
          <div className="space-y-3">
            {instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-2 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7655aa] text-xs font-bold text-white">{i + 1}</span>
                <textarea
                  value={step}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  rows={2}
                  className="flex-1 rounded-[8px] border border-[#e8e0f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7655aa]/30 resize-none"
                  placeholder={`Bước ${i + 1}...`}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(i)}
                    className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/recipes/personal")}>Hủy</Button>
          <Button type="submit" className="bg-[#7655aa]" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Đang lưu..." : mode === "create" ? "Tạo công thức" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </>
  );
}
