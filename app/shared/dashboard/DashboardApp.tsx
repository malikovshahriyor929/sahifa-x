"use client";

import { useEffect, useMemo, useState } from "react";
import { getBooks, getMyBooks } from "@/server/api";
import MainContent from "./components/MainContent";
import {
  deriveTopAuthors,
  deriveTopGenres,
  normalizeBooks,
  pickNewArrivalBooks,
  pickTrendingBooks,
} from "./utils";
import type { Author, Book, CurrentUser, DashboardStats } from "@/types";

type DashboardAppProps = {
  locale: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getMyBooksTotal(payload: unknown, fallback: number): number {
  if (!isRecord(payload)) {
    return fallback;
  }

  const directMeta = isRecord(payload._meta) ? payload._meta : null;
  const nestedData = isRecord(payload.data) ? payload.data : null;
  const nestedMeta = nestedData && isRecord(nestedData._meta) ? nestedData._meta : null;

  const total =
    toNumber(directMeta?.total) ??
    toNumber(directMeta?.count) ??
    toNumber(nestedMeta?.total) ??
    toNumber(nestedMeta?.count);

  return typeof total === "number" ? total : fallback;
}

function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function normalizeDisplayName(value?: string | null): string {
  if (!value) {
    return "Foydalanuvchi";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "Foydalanuvchi";
  }

  return trimmed.length > 40 ? `${trimmed.slice(0, 37)}...` : trimmed;
}

export default function DashboardApp({ locale, user }: DashboardAppProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [myBooksTotal, setMyBooksTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [booksPayload, myBooksPayload] = await Promise.all([
          getBooks({ page: 1, per_page: 24 }),
          getMyBooks({ page: 1, per_page: 10 }).catch(() => null),
        ]);

        if (!active) {
          return;
        }

        const normalizedBooks = normalizeBooks(booksPayload);
        const normalizedMyBooks = myBooksPayload
          ? normalizeBooks(myBooksPayload)
          : [];
        const normalizedMyBooksTotal = getMyBooksTotal(
          myBooksPayload,
          normalizedMyBooks.length
        );

        setBooks(normalizedBooks);

        setMyBooks(normalizedMyBooks);
        setMyBooksTotal(normalizedMyBooksTotal);
      } catch {
        if (!active) {
          return;
        }
        setBooks([]);
        setMyBooks([]);
        setMyBooksTotal(0);
        setError("Dashboard ma'lumotlarini yuklab bo'lmadi.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const safeUser: CurrentUser = {
    name: normalizeDisplayName(user?.name ?? user?.email),
    role: "Kitobxon",
    avatarUrl: user?.image ?? "",
  };

  const dashboardBooks = useMemo(() => {
    return books.length > 0 ? books : myBooks;
  }, [books, myBooks]);

  const trendingBooks = useMemo(() => {
    return pickTrendingBooks(dashboardBooks);
  }, [dashboardBooks]);

  const newArrivalBooks = useMemo(() => {
    return pickNewArrivalBooks(dashboardBooks);
  }, [dashboardBooks]);

  const topAuthors = useMemo<Author[]>(() => {
    return deriveTopAuthors(dashboardBooks);
  }, [dashboardBooks]);

  const topGenres = useMemo(() => {
    return deriveTopGenres(dashboardBooks);
  }, [dashboardBooks]);

  const stats: DashboardStats = useMemo(() => {
    const libraryCount = myBooksTotal;
    const totalReadsNumber = myBooks.reduce((sum, book) => {
      const parsed = Number(String(book.readCount ?? "0").replace(/[^\d.]/g, ""));
      return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);

    return {
      unreadChapters: 0,
      booksInLibrary: libraryCount,
      totalReads: totalReadsNumber > 0 ? formatCompact(totalReadsNumber) : "0",
    };
  }, [myBooks, myBooksTotal]);

  const startWritingHref = `/${locale}/books`;
  const continueReadingHref = useMemo(() => {
    const continueBook = myBooks[0] ?? dashboardBooks[0];
    if (continueBook?.id) {
      return `/${locale}/books/${encodeURIComponent(continueBook.id)}`;
    }
    return `/${locale}/search`;
  }, [dashboardBooks, locale, myBooks]);

  return (
    <MainContent
      locale={locale}
      loading={loading}
      error={error}
      onRetry={() => setReloadKey((prev) => prev + 1)}
      currentUser={safeUser}
      stats={stats}
      trendingBooks={trendingBooks}
      newArrivals={newArrivalBooks}
      topAuthors={topAuthors}
      topGenres={topGenres}
      startWritingHref={startWritingHref}
      continueReadingHref={continueReadingHref}
    />
  );
}
