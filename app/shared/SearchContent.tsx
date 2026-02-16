"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import BookCard from "@/app/shared/components/BookCard";
import { getBooks } from "@/server/api";
import { normalizeBooks } from "@/app/shared/dashboard/utils";
import { FilterIcon, SearchIcon } from "@/app/shared/icons";
import type { Book } from "@/types";

const FILTER_TAGS = [
  "Barchasi",
  "Manga",
  "Fantastika",
  "Detektiv",
  "Triller",
  "Tarixiy",
  "Drama",
];

const LANGUAGES = ["O'zbekcha", "Russian", "English", "Qaraqalpaq"];

const PER_PAGE = 10;

function mergeBooks(existing: Book[], incoming: Book[]) {
  const byId = new Map<string, Book>();
  [...existing, ...incoming].forEach((book) => {
    byId.set(book.id, book);
  });
  return [...byId.values()];
}

export default function SearchContent() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : "uz";
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const skipInitialQueryRef = useRef(true);

  const fetchBooks = useCallback(async (nextPage: number, nextQuery: string, append: boolean) => {
    const requestId = ++requestIdRef.current;
    setError(null);
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const payload = await getBooks({
        search: nextQuery.trim(),
        page: nextPage,
        perPage: PER_PAGE,
      });
      const normalized = normalizeBooks(payload);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setHasMore(normalized.length >= PER_PAGE);
      setPage(nextPage + 1);
      setBooks((prev) => (append ? mergeBooks(prev, normalized) : normalized));
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setError("Ma'lumotlarni yuklab bo'lmadi.");
      if (!append) {
        setBooks([]);
      }
      setHasMore(false);
    } finally {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(1, query, false);
  }, [fetchBooks]);

  useEffect(() => {
    if (skipInitialQueryRef.current) {
      skipInitialQueryRef.current = false;
      return;
    }

    const handler = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setBooks([]);
      fetchBooks(1, query, false);
    }, 400);

    return () => clearTimeout(handler);
  }, [fetchBooks, query]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchBooks(page, query, true);
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchBooks, hasMore, loading, loadingMore, page, query]);

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-8">
            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-dark-900">
              <SearchIcon className="size-8 text-primary" />
              Qidiruv
            </h2>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-primary/55 transition-colors group-focus-within:text-primary">
                <SearchIcon className="size-6" />
              </div>
              <input
                type="text"
                className="block w-full rounded-[20px] border border-primary-light/20 bg-white py-5 pl-16 pr-6 text-lg text-dark-900 shadow-xl shadow-black/5 outline-none transition-all placeholder:text-dark-900/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                placeholder="Kitob, muallif yoki janr qidiring..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {FILTER_TAGS.map((tag, index) => (
                <button
                  key={tag}
                  type="button"
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                    index === 0
                      ? "border-primary bg-primary text-white"
                      : "border-primary-light/30 bg-white text-dark-900/75 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 pb-12 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`search-skeleton-${index}`}
                  className="aspect-[2/3] animate-pulse rounded-[20px] bg-primary/10"
                />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary-light/30 bg-white/70 p-10 text-center text-sm text-dark-900/60">
              Hech narsa topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 pb-6 sm:grid-cols-2 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  link={`/${locale}/books/${encodeURIComponent(book.id)}`}
                />
              ))}
            </div>
          )}

          {error ? (
            <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : null}

          <div ref={loadMoreRef} className="h-6" />

          {loadingMore ? (
            <div className="grid grid-cols-1 gap-8 pb-12 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`search-more-${index}`}
                  className="aspect-[2/3] animate-pulse rounded-[20px] bg-primary/10"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-primary-light/20 bg-white p-8 xl:block">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-dark-900">
            <FilterIcon className="size-5 text-primary" />
            Filtrlar
          </h3>
          <button type="button" className="text-sm font-semibold text-primary hover:text-primary-dark">
            Tozalash
          </button>
        </div>

        <div className="mb-10">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-dark-900/40">Holati</h4>
          <div className="space-y-3">
            <label className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="status"
                  defaultChecked
                  className="peer size-5 appearance-none rounded-full border border-primary/40 bg-transparent checked:border-primary checked:ring-1 checked:ring-primary checked:ring-offset-2 checked:ring-offset-white"
                />
                <div className="absolute inset-0 m-auto size-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <span className="text-sm font-medium text-dark-900/80 transition-colors group-hover:text-primary">
                Barchasi
              </span>
            </label>
            <label className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="status"
                  className="peer size-5 appearance-none rounded-full border border-primary/40 bg-transparent checked:border-primary checked:ring-1 checked:ring-primary checked:ring-offset-2 checked:ring-offset-white"
                />
                <div className="absolute inset-0 m-auto size-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <span className="text-sm font-medium text-dark-900/80 transition-colors group-hover:text-primary">
                Tugallangan
              </span>
            </label>
            <label className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="status"
                  className="peer size-5 appearance-none rounded-full border border-primary/40 bg-transparent checked:border-primary checked:ring-1 checked:ring-primary checked:ring-offset-2 checked:ring-offset-white"
                />
                <div className="absolute inset-0 m-auto size-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <span className="text-sm font-medium text-dark-900/80 transition-colors group-hover:text-primary">
                Davom etmoqda
              </span>
            </label>
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-dark-900/40">Sahifalar soni</h4>
            <span className="text-xs font-bold text-primary">0 - 500+</span>
          </div>
          <div className="relative mt-2 h-1.5 w-full rounded-full bg-primary/15">
            <div className="absolute h-full w-3/4 rounded-full bg-primary" />
            <div className="absolute left-0 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-lg" />
            <div className="absolute left-3/4 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-lg" />
          </div>
        </div>

        <div className="mb-10">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-dark-900/40">Til</h4>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((language, index) => (
              <button
                key={language}
                type="button"
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  index === 0
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-primary-light/30 bg-transparent text-dark-900/65 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark active:scale-[0.98]"
        >
          Natijalarni ko&apos;rish
        </button>
      </aside>
    </div>
  );
}
