import type { ReactNode } from "react";

export type ProfileBookStatus = "PUBLISHED" | "DRAFT";

export interface ProfileBook {
  id: string;
  title: string;
  genre: string;
  coverUrl: string;
  status: ProfileBookStatus;
  rating?: number;
  views?: string;
  comments?: number;
  lastEdited?: string;
  updatedAt?: string;
  href: string;
}

export interface UserStats {
  works: number;
  followers: string;
  likes: string;
}

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  role: string;
  isPremium: boolean;
  stats: UserStats;
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  colorClass: string;
  opacity?: boolean;
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  dotColor: string;
}
