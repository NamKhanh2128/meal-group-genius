export interface FamilyMember {
  userId: string;
  name: string;
  avatar?: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  createdAt: string;
}

export type FeedKind = "shopping" | "fridge" | "meal" | "complete";

export interface FeedItem {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  kind: FeedKind;
  message: string;
  createdAt: string;
}