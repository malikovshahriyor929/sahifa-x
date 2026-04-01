import Hero from "./Hero";
import NewArrivalsSection from "./NewArrivalsSection";
import RightSidebar from "./RightSidebar";
import TrendingSection from "./TrendingSection";
import type { Author, Book, CurrentUser, DashboardStats } from "@/types";

type MainContentProps = {
  locale: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentUser: CurrentUser;
  stats: DashboardStats;
  trendingBooks: Book[];
  newArrivals: Book[];
  topAuthors: Author[];
  topGenres: string[];
  startWritingHref: string;
  continueReadingHref: string;
};

export default function MainContent({
  locale,
  loading,
  error,
  onRetry,
  currentUser,
  stats,
  trendingBooks,
  newArrivals,
  topAuthors,
  topGenres,
  startWritingHref,
  continueReadingHref,
}: MainContentProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8">
      <Hero
        currentUser={currentUser}
        stats={stats}
        startWritingHref={startWritingHref}
        continueReadingHref={continueReadingHref}
      />

      {error ? (
        <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-800 shadow-sm md:flex-row md:items-center">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
          >
            Qayta urinish
          </button>
        </div>
      ) : null}

      <TrendingSection locale={locale} books={trendingBooks} loading={loading} />
      <div className="grid grid-cols-1 gap-8 pb-10 lg:grid-cols-12 mt-5">
        <div className="col-span-1 lg:col-span-8">
          <NewArrivalsSection locale={locale} books={newArrivals} loading={loading} />
        </div>
        <div className="col-span-1 lg:col-span-4 ">
          <RightSidebar locale={locale} topAuthors={topAuthors} topGenres={topGenres} />
        </div>
      </div>
    </div>
  );
}
