import type { FoodCategory, FoodUnit } from "./food";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  category: FoodCategory;
  bought: boolean;
  assigneeId?: string;
}

export interface ShoppingList {
  id: string;
  familyId: string;
  title: string;
  type: "daily" | "weekly";
  items: ShoppingItem[];
  completed: boolean;
  createdAt: string;
  createdBy: string;
}