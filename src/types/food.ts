export type FoodCategory = "Rau củ" | "Thịt cá" | "Đồ khô" | "Sữa & Trứng" | "Gia vị" | "Khác";
export type FoodLocation = "Ngăn mát" | "Ngăn đông" | "Kệ thường";
export type FoodUnit = "kg" | "g" | "lít" | "ml" | "quả" | "củ" | "miếng" | "gói";

export interface FoodItem {
  id: string;
  familyId: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  category: FoodCategory;
  location: FoodLocation;
  expiryDate: string; // ISO
  createdAt: string;
  icon?: string;
}