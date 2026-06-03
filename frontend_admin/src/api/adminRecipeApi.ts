import type { Recipe, RecipeIngredient } from "@/types";
import { db, saveDb, uid } from "@/lib/mockDb";

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & {
    food_name?: string;
    unit?: string;
    icon?: string;
  })[];
};

export const adminRecipeApi = {
  async list(): Promise<RecipeWithIngredients[]> {
    const state = await db();
    return [...state.recipes]
      .sort((a, b) => a.recipe_name.localeCompare(b.recipe_name, "vi"))
      .map((recipe) => {
        const ingredients = state.recipe_ingredients
          .filter((ri) => ri.recipe_id === recipe.recipe_id)
          .map((ri) => {
            const food = state.foods.find((f) => f.food_id === ri.food_id);
            return {
              ...ri,
              food_name: food?.food_name,
              unit: food?.unit,
              icon: food?.icon,
            };
          });
        return {
          ...recipe,
          ingredients,
        };
      });
  },

  async getById(recipe_id: string): Promise<RecipeWithIngredients> {
    const state = await db();
    const recipe = state.recipes.find((r) => r.recipe_id === recipe_id);
    if (!recipe) throw new Error("Không tìm thấy công thức.");

    const ingredients = state.recipe_ingredients
      .filter((ri) => ri.recipe_id === recipe_id)
      .map((ri) => {
        const food = state.foods.find((f) => f.food_id === ri.food_id);
        return {
          ...ri,
          food_name: food?.food_name,
          unit: food?.unit,
          icon: food?.icon,
        };
      });

    return {
      ...recipe,
      ingredients,
    };
  },

  async create(
    payload: Omit<Recipe, "recipe_id">,
    ingredients: Omit<RecipeIngredient, "id" | "recipe_id">[]
  ): Promise<RecipeWithIngredients> {
    const state = await db();
    const recipeNameLower = payload.recipe_name.trim().toLowerCase();

    if (state.recipes.some((r) => r.recipe_name.toLowerCase() === recipeNameLower)) {
      throw new Error("Công thức món ăn này đã tồn tại.");
    }

    const recipe_id = uid("recipe");
    const recipe: Recipe = {
      ...payload,
      recipe_id,
      recipe_name: payload.recipe_name.trim(),
    };

    state.recipes.push(recipe);

    // Save recipe ingredients
    ingredients.forEach((ing) => {
      state.recipe_ingredients.push({
        id: uid("ri"),
        recipe_id,
        food_id: ing.food_id,
        quantity: ing.quantity,
      });
    });

    saveDb(state);

    return this.getById(recipe_id);
  },

  async update(
    recipe_id: string,
    payload: Partial<Recipe>,
    ingredients?: Omit<RecipeIngredient, "id" | "recipe_id">[]
  ): Promise<RecipeWithIngredients> {
    const state = await db();
    const index = state.recipes.findIndex((r) => r.recipe_id === recipe_id);
    if (index < 0) throw new Error("Không tìm thấy công thức.");

    if (payload.recipe_name) {
      const recipeNameLower = payload.recipe_name.trim().toLowerCase();
      if (
        state.recipes.some(
          (r) => r.recipe_id !== recipe_id && r.recipe_name.toLowerCase() === recipeNameLower
        )
      ) {
        throw new Error("Công thức món ăn này đã tồn tại.");
      }
    }

    state.recipes[index] = {
      ...state.recipes[index]!,
      ...payload,
      recipe_name: payload.recipe_name ? payload.recipe_name.trim() : state.recipes[index]!.recipe_name,
    };

    // If ingredients list is provided, replace old recipe ingredients
    if (ingredients) {
      state.recipe_ingredients = state.recipe_ingredients.filter(
        (ri) => ri.recipe_id !== recipe_id
      );

      ingredients.forEach((ing) => {
        state.recipe_ingredients.push({
          id: uid("ri"),
          recipe_id,
          food_id: ing.food_id,
          quantity: ing.quantity,
        });
      });
    }

    saveDb(state);

    return this.getById(recipe_id);
  },

  async delete(recipe_id: string): Promise<void> {
    const state = await db();
    const index = state.recipes.findIndex((r) => r.recipe_id === recipe_id);
    if (index < 0) throw new Error("Không tìm thấy công thức món ăn.");

    // Remove recipe
    state.recipes.splice(index, 1);

    // Clean up related ingredients, meal plans, activities
    state.recipe_ingredients = state.recipe_ingredients.filter(
      (ri) => ri.recipe_id !== recipe_id
    );
    state.meal_plans = state.meal_plans.filter((mp) => mp.recipe_id !== recipe_id);

    saveDb(state);
  },

  async bulkDelete(recipe_ids: string[]): Promise<void> {
    const state = await db();

    state.recipes = state.recipes.filter((r) => !recipe_ids.includes(r.recipe_id));
    state.recipe_ingredients = state.recipe_ingredients.filter(
      (ri) => !recipe_ids.includes(ri.recipe_id)
    );
    state.meal_plans = state.meal_plans.filter((mp) => !recipe_ids.includes(mp.recipe_id));

    saveDb(state);
  },
};
