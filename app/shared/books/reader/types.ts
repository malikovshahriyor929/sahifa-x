export interface Chapter {
  id: string;
  title: string;
  order: number;
  isPreview?: boolean;
}

export interface ChapterDetail extends Chapter {
  bookId: string;
  content: string;
  contentUrl?: string | null;
}

export interface ChapterNavigation {
  prev: number | null;
  total: number;
  next: number | null;
}

export interface ReadingSettings {
  fontSize: number;
  theme: "dark" | "light" | "sepia";
}

export interface Comment {
  id: string;
  user: string;
  text: string;
}
