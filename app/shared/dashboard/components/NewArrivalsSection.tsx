import Link from "next/link";
import type { Book } from "@/types";
import { EyeIcon, SparklesIcon } from "./icons";

type NewArrivalsSectionProps = {
  locale: string;
  books: Book[];
  loading: boolean;
};

const categoryColors: Record<string, string> = {
  Triller: "text-primary bg-primary/10",
  Tarixiy: "text-primary-dark bg-primary/10",
  Psixologiya: "text-dark-900 bg-primary-light/20",
  Sarguzasht: "text-primary-dark bg-primary-light/20",
};

export default function NewArrivalsSection({ locale, books, loading }: NewArrivalsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-bold text-dark-900">
          <SparklesIcon className="size-5 text-primary" />
          Yangilar
        </h3>
        <Link
          href={`/${locale}/search`}
          className="text-sm font-bold text-primary transition hover:text-primary-dark hover:underline"
        >
          Barchasini ko&apos;rish
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`arrival-skeleton-${index}`}
              className="h-[184px] animate-pulse rounded-2xl bg-primary/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/${locale}/books/${encodeURIComponent(book.id)}`}
              className="group flex cursor-pointer gap-4 rounded-2xl border border-primary-light/25 bg-white p-3 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
              aria-label={`${book.title} kitobi tafsilotlari`}
            >
              <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg shadow-md">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${book.coverUrl}')` }}
                />
              </div>

              <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-xs text-dark-900/55">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        categoryColors[book.category] ?? "bg-primary/10 text-primary"
                      }`}
                    >
                      {book.category}
                    </span>
                    {book.timestamp ? <span>• {book.timestamp}</span> : null}
                  </div>
                  <h4 className="line-clamp-1 text-lg font-bold text-dark-900 transition-colors group-hover:text-primary">
                    {book.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dark-900/60">
                    {book.description ?? "Yangi qo'shilgan asar."}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-primary-light/20 pt-3">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary-light/20 text-[10px] font-bold text-primary-dark">
                    {book.author[0] ?? "?"}
                  </div>
                  <span className="text-xs font-medium text-dark-900/65">{book.author}</span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-dark-900/55">
                    <EyeIcon className="size-3.5" />
                    {book.readCount ?? "0"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
