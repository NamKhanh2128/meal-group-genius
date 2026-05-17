import { storage, delay } from "@/utils/storage";
import type { Recipe, FoodItem } from "@/types";

export const recipeService = {
  async list(): Promise<Recipe[]> {
    // TODO: Replace with real API call
    await delay(150);
    return storage.get<Recipe[]>("recipes", []);
  },
  async get(id: string): Promise<Recipe | null> {
    await delay(100);
    return (await this.list()).find((r) => r.id === id) ?? null;
  },
  async suggest(familyId: string): Promise<{ recipe: Recipe; have: string[]; missing: string[] }[]> {
    // TODO: Replace with real API call
    await delay(200);
    const recipes = await this.list();
    const fridge = storage.get<FoodItem[]>("fridge", []).filter((f) => f.familyId === familyId);
    const fridgeNames = new Set(fridge.map((f) => f.name.toLowerCase()));
    return recipes.map((recipe) => {
      const have: string[] = [];
      const missing: string[] = [];
      for (const ing of recipe.ingredients) {
        if (fridgeNames.has(ing.name.toLowerCase())) have.push(ing.name);
        else missing.push(ing.name);
      }
      return { recipe, have, missing };
    });
  },
};