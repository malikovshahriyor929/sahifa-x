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

export default function DashboardApp({ locale, user }: DashboardAppProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [myBooksTotal, setMyBooksTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const [booksPayload, myBooksPayload] = await Promise.all([
          getBooks(),
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
    name: user?.name ?? user?.email ?? "",
    role: "",
    avatarUrl: user?.image ?? "",
  };

  const trendingBooks = useMemo(() => {
    return pickTrendingBooks(books);
  }, [books]);

  const newArrivalBooks = useMemo(() => {
    return pickNewArrivalBooks(books);
  }, [books]);

  const topAuthors = useMemo<Author[]>(() => {
    return deriveTopAuthors(books);
  }, [books]);

  const topGenres = useMemo(() => {
    return deriveTopGenres(books);
  }, [books]);

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
    const continueBook = myBooks[0] ?? books[0];
    if (continueBook?.id) {
      return `/${locale}/books/${encodeURIComponent(continueBook.id)}`;
    }
    return `/${locale}/search`;
  }, [books, locale, myBooks]);

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
      startWritingHref={startWritingHref}
      continueReadingHref={continueReadingHref}
    />
  );
}
