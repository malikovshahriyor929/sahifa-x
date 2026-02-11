export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating?: number;
  category: string;
  readCount?: string;
  isNew?: boolean;
  timestamp?: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  booksCount: number;
  readsCount: string;
}

export interface CurrentUser {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface NavItem {
  icon: "home" | "search" | "idea" | "bookmark" | "library" | "draft" | "settings";
  label: string;
  active?: boolean;
  href?: string;
}

export interface DashboardStats {
  unreadChapters: number;
  totalReads: string;
  booksInLibrary: number;
}

export type ApiBookRecord = {
  id?: string | number;
  _id?: string | number;
  title?: string;
  name?: string;
  author?: string;
  authorName?: string;
  coverUrl?: string;
  cover?: string;
  image?: string;
  rating?: number | string;
  category?: string;
  genre?: string;
  readCount?: string | number;
  reads?: string | number;
  isNew?: boolean;
  timestamp?: string;
  createdAt?: string;
  description?: string;
};
