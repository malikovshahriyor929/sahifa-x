import Link from "next/link";
import type { Book } from "@/types";
import { EyeIcon, SparklesIcon } from "./icons";

type TrendingSectionProps = {
  locale: string;
  books: Book[];
  loading: boolean;
};

export default function TrendingSection({ locale, books, loading }: TrendingSectionProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-bold text-dark-900">
          <SparklesIcon className="size-6 text-primary" />
          Trenddagi kitoblar
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`trending-skeleton-${index}`}
              className="aspect-[2/3] animate-pulse rounded-[20px] bg-primary/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/${locale}/books/${encodeURIComponent(book.id)}`}
              className="group relative flex flex-col gap-3"
              aria-label={`${book.title} kitobi tafsilotlari`}
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[20px] shadow-lg shadow-black/20">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${book.coverUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-65" />

                {typeof book.rating === "number" ? (
                  <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                    {book.rating.toFixed(1)}
                  </div>
                ) : null}

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-primary-light">
                    {book.category}
                  </span>
                  <h4 className="line-clamp-2 text-xl font-bold leading-tight text-white">
                    {book.title}
                  </h4>
                  <p className="line-clamp-1 text-sm text-white/80">Muallif: {book.author}</p>
                </div>
              </div>

              <span className="absolute -bottom-14 z-20 mt-1 flex w-full translate-y-4 items-center justify-center gap-2 rounded-xl bg-dark-900 py-3 text-sm font-bold text-white opacity-0 shadow-xl shadow-black/30 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-primary">
                <EyeIcon className="size-4" />
                O&apos;qish
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
