"use client";

import { useEffect, useMemo, useState } from "react";
import { getBooks, getMyBooks } from "@/server/api";
import MainContent from "./components/MainContent";
import {
  CURRENT_USER,
  DASHBOARD_STATS,
  NEW_ARRIVALS,
  TOP_AUTHORS,
  TOP_GENRES,
  TRENDING_BOOKS,
} from "./constants";
import {
  deriveTopAuthors,
  deriveTopGenres,
  fallbackBooks,
  normalizeBooks,
  pickNewArrivalBooks,
  pickTrendingBooks,
} from "./utils";
import type { Author, Book, CurrentUser, DashboardStats } from "./types";

type DashboardAppProps = {
  locale: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

export default function DashboardApp({ locale, user }: DashboardAppProps) {
  const [books, setBooks] = useState<Book[]>(fallbackBooks());
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const [booksPayload, myBooksPayload] = await Promise.all([
          getBooks(),
          getMyBooks().catch(() => null),
        ]);

        if (!active) {
          return;
        }

        const normalizedBooks = normalizeBooks(booksPayload);
        const normalizedMyBooks = myBooksPayload
          ? normalizeBooks(myBooksPayload)
          : [];

        if (normalizedBooks.length > 0) {
          setBooks(normalizedBooks);
        } else {
          setBooks(fallbackBooks());
        }

        setMyBooks(normalizedMyBooks);
      } catch {
        if (!active) {
          return;
        }
        setBooks(fallbackBooks());
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
  }, []);

  const safeUser: CurrentUser = {
    name: user?.name ?? CURRENT_USER.name,
    role: CURRENT_USER.role,
    avatarUrl: user?.image ?? CURRENT_USER.avatarUrl,
  };

  const trendingBooks = useMemo(() => {
    const picked = pickTrendingBooks(books);
    return picked.length ? picked : TRENDING_BOOKS;
  }, [books]);

  const newArrivalBooks = useMemo(() => {
    const picked = pickNewArrivalBooks(books);
    return picked.length ? picked : NEW_ARRIVALS;
  }, [books]);

  const topAuthors = useMemo<Author[]>(() => {
    const derived = deriveTopAuthors(books);
    return derived.length ? derived : TOP_AUTHORS;
  }, [books]);

  const topGenres = useMemo(() => {
    const derived = deriveTopGenres(books);
    return derived.length ? derived : TOP_GENRES;
  }, [books]);

  const stats: DashboardStats = useMemo(() => {
    const libraryCount = myBooks.length || DASHBOARD_STATS.booksInLibrary;
    const totalReadsNumber = books.reduce((sum, book) => {
      const parsed = Number(String(book.readCount ?? "0").replace(/[^\d.]/g, ""));
      return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);

    return {
      unreadChapters: DASHBOARD_STATS.unreadChapters,
      booksInLibrary: libraryCount,
      totalReads: totalReadsNumber > 0 ? formatCompact(totalReadsNumber) : DASHBOARD_STATS.totalReads,
    };
  }, [books, myBooks.length]);

  return (
    <MainContent
      locale={locale}
      loading={loading}
      currentUser={safeUser}
      stats={stats}
      trendingBooks={trendingBooks}
      newArrivals={newArrivalBooks}
      topAuthors={topAuthors}
      topGenres={topGenres}
    />
  );
}
