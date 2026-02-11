import type { Author } from "../types";
import { GridIcon, PlusUserIcon, UsersIcon } from "./icons";

type RightSidebarProps = {
  locale: string;
  topAuthors: Author[];
  topGenres: string[];
};

export default function RightSidebar({
  locale,
  topAuthors,
  topGenres,
}: RightSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-primary-light/25 bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-dark-900">
          <UsersIcon className="size-5 text-primary" />
          Haftaning mualliflari
        </h3>

        <div className="flex flex-col gap-5">
          {topAuthors.map((author) => (
            <article key={author.id} className="group flex items-center gap-3">
              <div
                className="size-10 rounded-full bg-cover ring-2 ring-transparent transition-all group-hover:ring-primary/50"
                style={{ backgroundImage: `url('${author.avatarUrl}')` }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold leading-none text-dark-900 transition-colors group-hover:text-primary">
                  {author.name}
                </h4>
                <p className="mt-1 truncate text-xs text-dark-900/55">
                  {author.booksCount} asar • {author.readsCount} o&apos;qilgan
                </p>
              </div>
              <button className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white">
                <PlusUserIcon className="size-4" />
              </button>
            </article>
          ))}
        </div>

        <button className="mt-6 w-full rounded-xl border border-dashed border-primary-light/40 py-2.5 text-xs font-bold text-primary transition hover:border-primary hover:bg-primary/10">
          Barchasini ko&apos;rish
        </button>
      </section>

      <section className="rounded-2xl border border-primary-light/25 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-dark-900">
          <GridIcon className="size-5 text-primary" />
          Top janrlar
        </h3>

        <div className="flex flex-wrap gap-2">
          {topGenres.map((genre) => (
            <button
              key={`${locale}-${genre}`}
              className="rounded-lg border border-transparent bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-dark transition-all hover:border-primary/30 hover:bg-primary hover:text-white"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
