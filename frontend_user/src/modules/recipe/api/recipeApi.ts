import { endpoints } from "@/shared/constants/endpoints";
import type { Food, Recipe, RecipeIngredient, RecipeSuggestion } from "@/types";
import { addActivity, consumeInventory, db, getSession, saveDb } from "@/shared/lib/mockDb";
import { uid } from "@/shared/utils/storage";

export type RecipeDetail = Recipe & { ingredients: Array<RecipeIngredient & { food: Food }> };

function recipeDetail(recipe: Recipe, ingredients: RecipeIngredient[], foods: Food[]): RecipeDetail {
  return { ...recipe, ingredients: ingredients.filter((item) => item.recipe_id === recipe.recipe_id).map((item) => ({ ...item, food: foods.find((food) => food.food_id === item.food_id)! })) };
}

export const recipeApi = {
  endpoint: endpoints.recipes,

  async list(): Promise<RecipeDetail[]> {
    const state = await db();
    return state.recipes.map((recipe) => recipeDetail(recipe, state.recipe_ingredients, state.foods));
  },

  async detail(recipe_id: string): Promise<RecipeDetail> {
    const state = await db();
    const recipe = state.recipes.find((item) => item.recipe_id === recipe_id);
    if (!recipe) throw new Error("Không tìm thấy công thức.");
    return recipeDetail(recipe, state.recipe_ingredients, state.foods);
  },

  async suggestions(family_id: string): Promise<RecipeSuggestion[]> {
    const state = await db();
    const fridge = state.fridge_items.filter((item) => item.family_id === family_id);
    return state.recipes
      .map((recipe) => {
        const ingredients = state.recipe_ingredients.filter((item) => item.recipe_id === recipe.recipe_id);
        const missing = ingredients
          .filter((ingredient) => !fridge.some((item) => item.food_id === ingredient.food_id && item.quantity >= ingredient.quantity))
          .map((ingredient) => ({ food: state.foods.find((food) => food.food_id === ingredient.food_id)!, quantity: ingredient.quantity }));
        return {
          recipe,
          available_food_ids: ingredients.filter((ingredient) => fridge.some((item) => item.food_id === ingredient.food_id)).map((item) => item.food_id),
          missing,
        };
      })
      .sort((a, b) => a.missing.length - b.missing.length);
  },

  async markCooked(family_id: string, recipe_id: string) {
    const state = await db();
    const ingredients = state.recipe_ingredients.filter((item) => item.recipe_id === recipe_id);
    ingredients.forEach((ingredient) => {
      consumeInventory(state, { family_id, food_id: ingredient.food_id, quantity: ingredient.quantity });
    });
    const session = getSession();
    if (session) addActivity(state, family_id, session.user_id, "recipe", "nấu ăn và cập nhật lại nguyên liệu trong tủ lạnh");
    saveDb(state);
  },

  async toggleFavorite(recipe_id: string): Promise<boolean> {
    const state = await db();
    const recipe = state.recipes.find((r) => r.recipe_id === recipe_id);
    if (!recipe) throw new Error("Không tìm thấy công thức.");
    recipe.is_favorite = !recipe.is_favorite;
    saveDb(state);
    return recipe.is_favorite;
  },

  async listFavorites(): Promise<RecipeDetail[]> {
    const state = await db();
    return state.recipes
      .filter((r) => r.is_favorite)
      .map((recipe) => recipeDetail(recipe, state.recipe_ingredients, state.foods));
  },

  async listPersonal(user_id: string): Promise<RecipeDetail[]> {
    const state = await db();
    return state.recipes
      .filter((r) => r.created_by === user_id)
      .map((recipe) => recipeDetail(recipe, state.recipe_ingredients, state.foods));
  },

  async create(payload: {
    recipe_name: string;
    description: string;
    instructions: string[];
    image_url?: string;
    time_minutes: number;
    calories: number;
    difficulty: string;
    servings?: number;
    ingredients: Array<{ food_id: string; quantity: number }>;
    created_by: string;
  }): Promise<RecipeDetail> {
    const state = await db();
    const recipe_id = uid("recipe");
    const recipe: Recipe = {
      recipe_id,
      recipe_name: payload.recipe_name,
      description: payload.description,
      instructions: payload.instructions,
      image_url: payload.image_url,
      time_minutes: payload.time_minutes,
      calories: payload.calories,
      difficulty: payload.difficulty,
      servings: payload.servings,
      is_favorite: false,
      created_by: payload.created_by,
    };
    state.recipes.push(recipe);
    const newIngredients: RecipeIngredient[] = payload.ingredients.map((ing) => ({
      id: uid("ri"),
      recipe_id,
      food_id: ing.food_id,
      quantity: ing.quantity,
    }));
    state.recipe_ingredients.push(...newIngredients);
    saveDb(state);
    return recipeDetail(recipe, state.recipe_ingredients, state.foods);
  },

  async update(recipe_id: string, payload: {
    recipe_name: string;
    description: string;
    instructions: string[];
    image_url?: string;
    time_minutes: number;
    calories: number;
    difficulty: string;
    servings?: number;
    ingredients: Array<{ food_id: string; quantity: number }>;
  }): Promise<RecipeDetail> {
    const state = await db();
    const recipe = state.recipes.find((r) => r.recipe_id === recipe_id);
    if (!recipe) throw new Error("Không tìm thấy công thức.");
    Object.assign(recipe, {
      recipe_name: payload.recipe_name,
      description: payload.description,
      instructions: payload.instructions,
      image_url: payload.image_url,
      time_minutes: payload.time_minutes,
      calories: payload.calories,
      difficulty: payload.difficulty,
      servings: payload.servings,
    });
    // Replace ingredients
    state.recipe_ingredients = state.recipe_ingredients.filter((ri) => ri.recipe_id !== recipe_id);
    const newIngredients: RecipeIngredient[] = payload.ingredients.map((ing) => ({
      id: uid("ri"),
      recipe_id,
      food_id: ing.food_id,
      quantity: ing.quantity,
    }));
    state.recipe_ingredients.push(...newIngredients);
    saveDb(state);
    return recipeDetail(recipe, state.recipe_ingredients, state.foods);
  },

  async remove(recipe_id: string, user_id: string): Promise<void> {
    const state = await db();
    const recipe = state.recipes.find((r) => r.recipe_id === recipe_id);
    if (!recipe) throw new Error("Không tìm thấy công thức.");
    if (recipe.created_by !== user_id) throw new Error("Bạn không có quyền xóa công thức này.");
    state.recipes = state.recipes.filter((r) => r.recipe_id !== recipe_id);
    state.recipe_ingredients = state.recipe_ingredients.filter((ri) => ri.recipe_id !== recipe_id);
    saveDb(state);
  },
};
