import {
  DEFAULT_BOOK_COVER,
  NEW_ARRIVALS,
  TOP_AUTHORS,
  TOP_GENRES,
  TRENDING_BOOKS,
} from "./constants";
import type { ApiBookRecord, Author, Book } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringId(value: unknown, fallback: string): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function toText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toReadCount(value: unknown): string | undefined {
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function normalizeOneBook(item: ApiBookRecord, index: number): Book {
  return {
    id: toStringId(item.id ?? item._id, `book-${index + 1}`),
    title: toText(item.title ?? item.name, `Nomsiz asar ${index + 1}`),
    author: toText(item.author ?? item.authorName, "Noma'lum muallif"),
    coverUrl: toText(item.coverUrl ?? item.cover ?? item.image, DEFAULT_BOOK_COVER),
    rating: toNumber(item.rating),
    category: toText(item.category ?? item.genre, "Boshqa"),
    readCount: toReadCount(item.readCount ?? item.reads),
    isNew: Boolean(item.isNew),
    timestamp: typeof item.timestamp === "string" ? item.timestamp : undefined,
    description:
      typeof item.description === "string" ? item.description : undefined,
  };
}

function getArrayFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isObject(payload)) {
    const candidates = [
      payload.data,
      payload.books,
      payload.results,
      payload.items,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
      if (isObject(candidate) && Array.isArray(candidate.items)) {
        return candidate.items;
      }
    }
  }

  return [];
}

export function normalizeBooks(payload: unknown): Book[] {
  const items = getArrayFromPayload(payload);
  const normalized = items
    .filter((item): item is ApiBookRecord => isObject(item))
    .map((item, index) => normalizeOneBook(item, index));

  return normalized;
}

export function fallbackBooks(): Book[] {
  const merged = [...TRENDING_BOOKS, ...NEW_ARRIVALS];
  const byId = new Map<string, Book>();
  merged.forEach((book) => {
    byId.set(book.id, book);
  });
  return [...byId.values()];
}

export function pickTrendingBooks(books: Book[]): Book[] {
  if (!books.length) {
    return TRENDING_BOOKS;
  }

  return [...books]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);
}

export function pickNewArrivalBooks(books: Book[]): Book[] {
  if (!books.length) {
    return NEW_ARRIVALS;
  }

  const sorted = [...books].sort((a, b) => {
    const at = a.timestamp ?? "";
    const bt = b.timestamp ?? "";
    return bt.localeCompare(at);
  });

  return sorted.slice(0, 6);
}

export function deriveTopGenres(books: Book[]): string[] {
  if (!books.length) {
    return TOP_GENRES;
  }

  const counts = new Map<string, number>();
  books.forEach((book) => {
    const genre = book.category || "Boshqa";
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([genre]) => genre);
}

export function deriveTopAuthors(books: Book[]): Author[] {
  if (!books.length) {
    return TOP_AUTHORS;
  }

  const map = new Map<string, { booksCount: number; reads: number }>();
  books.forEach((book) => {
    const key = book.author || "Noma'lum";
    const current = map.get(key) ?? { booksCount: 0, reads: 0 };
    const reads = Number(String(book.readCount ?? "0").replace(/[^\d.]/g, ""));

    map.set(key, {
      booksCount: current.booksCount + 1,
      reads: current.reads + (Number.isFinite(reads) ? reads : 0),
    });
  });

  return [...map.entries()]
    .sort((a, b) => b[1].booksCount - a[1].booksCount)
    .slice(0, 5)
    .map(([name, stats], index) => ({
      id: `author-${index + 1}`,
      name,
      booksCount: stats.booksCount,
      readsCount: `${Math.max(1, Math.round(stats.reads))}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=0f8d8f&color=fff&bold=true`,
    }));
}
