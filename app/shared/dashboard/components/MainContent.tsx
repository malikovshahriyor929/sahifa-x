import Hero from "./Hero";
import NewArrivalsSection from "./NewArrivalsSection";
import RightSidebar from "./RightSidebar";
import TrendingSection from "./TrendingSection";
import type { Author, Book, CurrentUser, DashboardStats } from "../types";

type MainContentProps = {
  locale: string;
  loading: boolean;
  currentUser: CurrentUser;
  stats: DashboardStats;
  trendingBooks: Book[];
  newArrivals: Book[];
  topAuthors: Author[];
  topGenres: string[];
};

export default function MainContent({
  locale,
  loading,
  currentUser,
  stats,
  trendingBooks,
  newArrivals,
  topAuthors,
  topGenres,
}: MainContentProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8">
      <Hero currentUser={currentUser} stats={stats} />
      <TrendingSection books={trendingBooks} loading={loading} />
      <div className="grid grid-cols-1 gap-8 pb-10 lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-8">
          <NewArrivalsSection books={newArrivals} loading={loading} />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <RightSidebar locale={locale} topAuthors={topAuthors} topGenres={topGenres} />
        </div>
      </div>
    </div>
  );
}
