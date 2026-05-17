export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  familyId?: string;
  status?: "active" | "banned";
  createdAt: string;
}