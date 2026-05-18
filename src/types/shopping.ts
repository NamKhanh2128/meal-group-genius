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
  planDate?: string;       // ISO yyyy-mm-dd
  status: "DRAFT" | "DONE"; // mirrors DB status
  items: ShoppingItem[];
  completed: boolean;       // legacy alias of (status === "DONE")
  createdAt: string;
  createdBy: string;
}