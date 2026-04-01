"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import BookCard from "@/app/shared/components/BookCard";
import { getBooks } from "@/server/api";
import { normalizeBooks } from "@/app/shared/dashboard/utils";
import { FilterIcon, SearchIcon } from "@/app/shared/icons";
import type { Book } from "@/types";

const CATEGORY_OPTIONS = [
  "Barchasi",
  "Dasturlash",
  "Manga",
  "Fantastika",
  "Detektiv",
  "Triller",
  "Tarixiy",
  "Drama",
];

const LANGUAGE_OPTIONS = ["Barchasi", "O'zbekcha", "Russian", "English", "Qaraqalpaq"];
const STATUS_OPTIONS = [
  { label: "Barchasi", value: "barchasi" },
  { label: "Tugallangan", value: "tugallangan" },
  { label: "Davom etmoqda", value: "davom etmoqda" },
] as const;

const PER_PAGE = 10;

type SearchFilters = {
  search: string;
  category: string;
  language: string;
  status: string;
  minPages: string;
  maxPages: string;
};

const DEFAULT_FILTERS: SearchFilters = {
  search: "",
  category: "Barchasi",
  language: "Barchasi",
  status: "barchasi",
  minPages: "0",
  maxPages: "500",
};

function mergeBooks(existing: Book[], incoming: Book[]) {
  const byId = new Map<string, Book>();
  [...existing, ...incoming].forEach((book) => {
    byId.set(book.id, book);
  });
  return [...byId.values()];
}

function parsePagesValue(value: string, fallback: number) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) {
    return fallback;
  }

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildBookParams(filters: SearchFilters, page: number) {
  const minPages = parsePagesValue(filters.minPages, 0);
  const maxPages = Math.max(minPages, parsePagesValue(filters.maxPages, 500));

  return {
    search: filters.search.trim(),
    status: filters.status || DEFAULT_FILTERS.status,
    minPages,
    maxPages,
    page,
    perPage: PER_PAGE,
    ...(filters.category !== DEFAULT_FILTERS.category ? { category: filters.category } : {}),
    ...(filters.language !== DEFAULT_FILTERS.language ? { language: filters.language } : {}),
  };
}

export default function SearchContent() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : "uz";
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const skipInitialFilterSyncRef = useRef(true);

  const fetchBooks = useCallback(async (nextPage: number, nextFilters: SearchFilters, append: boolean) => {
    const requestId = ++requestIdRef.current;
    setError(null);
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const payload = await getBooks(buildBookParams(nextFilters, nextPage));
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

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters(nextFilters: SearchFilters) {
    setAppliedFilters({ ...nextFilters });
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
  }

  useEffect(() => {
    fetchBooks(1, appliedFilters, false);
  }, [appliedFilters, fetchBooks]);

  useEffect(() => {
    if (skipInitialFilterSyncRef.current) {
      skipInitialFilterSyncRef.current = false;
      return;
    }

    const handler = setTimeout(() => {
      applyFilters(filters);
    }, 400);

    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchBooks(page, appliedFilters, true);
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [appliedFilters, fetchBooks, hasMore, loading, loadingMore, page]);

  const activeFiltersCount = [
    filters.category !== DEFAULT_FILTERS.category,
    filters.language !== DEFAULT_FILTERS.language,
    filters.status !== DEFAULT_FILTERS.status,
    filters.minPages !== DEFAULT_FILTERS.minPages || filters.maxPages !== DEFAULT_FILTERS.maxPages,
  ].filter(Boolean).length;

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-8 rounded-[28px] border border-primary-light/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold text-dark-900">
                  <SearchIcon className="size-8 text-primary" />
                  Qidiruv
                </h2>
                <p className="mt-2 text-sm text-dark-900/60">
                  Kitob, muallif yoki janr bo&apos;yicha mos asarlarni toping.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary-light/25 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary-dark">
                <span className="size-2 rounded-full bg-primary" />
                {loading ? "Yuklanmoqda..." : `${books.length} ta natija`}
              </div>
            </div>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-primary/55 transition-colors group-focus-within:text-primary">
                <SearchIcon className="size-6" />
              </div>
              <input
                type="text"
                className="block w-full rounded-[20px] border border-primary-light/20 bg-white py-5 pl-16 pr-6 text-lg text-dark-900 shadow-xl shadow-black/5 outline-none transition-all placeholder:text-dark-900/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                placeholder="Kitob, muallif yoki janr qidiring..."
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
              />
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {CATEGORY_OPTIONS.map((tag) => {
                const isActive = filters.category === tag;

                return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateFilter("category", tag)}
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-primary-light/30 bg-white text-dark-900/75 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {tag}
                </button>
                );
              })}
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
            <div className="rounded-[28px] border border-dashed border-primary-light/30 bg-white/80 p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SearchIcon className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-dark-900">Hech narsa topilmadi</h3>
              <p className="mt-2 text-sm text-dark-900/60">
                So&apos;rovni o&apos;zgartirib ko&apos;ring yoki filtrlardan bir qismini tozalang.
              </p>
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
            <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
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
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {activeFiltersCount} faol
              </span>
            ) : null}
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Tozalash
            </button>
          </div>
        </div>

        <div className="mb-10">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-dark-900/40">Holati</h4>
          <div className="space-y-3">
            {STATUS_OPTIONS.map((option) => (
              <label key={option.value} className="group flex cursor-pointer items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={filters.status === option.value}
                    onChange={(event) => updateFilter("status", event.target.value)}
                    className="peer size-5 appearance-none rounded-full border border-primary/40 bg-transparent checked:border-primary checked:ring-1 checked:ring-primary checked:ring-offset-2 checked:ring-offset-white"
                  />
                  <div className="absolute inset-0 m-auto size-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <span className="text-sm font-medium text-dark-900/80 transition-colors group-hover:text-primary">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-dark-900/40">Sahifalar soni</h4>
            <span className="text-xs font-bold text-primary">
              {parsePagesValue(filters.minPages, 0)} - {Math.max(
                parsePagesValue(filters.minPages, 0),
                parsePagesValue(filters.maxPages, 500)
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-dark-900/50">Min</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={filters.minPages}
                onChange={(event) => updateFilter("minPages", event.target.value)}
                className="w-full rounded-2xl border border-primary-light/20 bg-white px-4 py-3 text-sm text-dark-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-dark-900/50">Max</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={filters.maxPages}
                onChange={(event) => updateFilter("maxPages", event.target.value)}
                className="w-full rounded-2xl border border-primary-light/20 bg-white px-4 py-3 text-sm text-dark-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
            </label>
          </div>
        </div>

        <div className="relative mb-10 ">
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Soon
          </span>
          <h4 className="mb-4 blur-md text-xs font-bold uppercase tracking-widest text-dark-900/40">Til</h4>
          <div className="grid grid-cols-2 gap-2 blur-md">
            {LANGUAGE_OPTIONS.map((language) => {
              const isActive = filters.language === language;

              return (
                <button
                  key={language}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateFilter("language", language)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "border-primary/80 bg-primary/90 text-white shadow-lg shadow-primary/20 backdrop-blur-md"
                      : "border-primary-light/30 bg-white/55 text-dark-900/65 backdrop-blur-md hover:border-primary/50 hover:bg-white/75 hover:text-primary"
                  }`}
                >
                  {language}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Soon
          </span>
          <button
            type="button"
            onClick={() => applyFilters(filters)}
            className="w-full blur-md rounded-2xl border border-primary/70 bg-primary/90 py-4 font-bold text-white shadow-lg shadow-primary/30 backdrop-blur-md transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            Natijalarni ko&apos;rish
          </button>
        </div>
      </aside>
    </div>
  );
}
