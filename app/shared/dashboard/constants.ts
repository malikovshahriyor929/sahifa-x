import type { NavItem } from "@/types";

export const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: "home", label: "Asosiy", active: true },
  { icon: "search", label: "Qidiruv" },
  { icon: "idea", label: "Idea Lab", href: "books" },
  { icon: "bookmark", label: "Saqlanganlar" },
];

export const PERSONAL_NAV_ITEMS: NavItem[] = [
  { icon: "library", label: "Kutubxonam" },
  { icon: "draft", label: "Qoralamalar" },
  { icon: "settings", label: "Sozlamalar" },
];

export const DEFAULT_BOOK_COVER =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
