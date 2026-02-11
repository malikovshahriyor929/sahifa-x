import type { CurrentUser, DashboardStats } from "../types";
import { ArrowRightIcon, BookIcon, DraftIcon } from "./icons";

type HeroProps = {
  currentUser: CurrentUser;
  stats: DashboardStats;
};

export default function Hero({ currentUser, stats }: HeroProps) {
  return (
    <section className="relative flex min-h-[260px] w-full overflow-hidden rounded-[24px] border border-primary-light/20 bg-gradient-to-br from-dark-900 to-primary-dark shadow-xl shadow-primary-dark/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,179,181,0.18),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(15,141,143,0.3),transparent_50%)]" />

      <div className="relative z-10 flex w-full flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-end md:p-10">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-bold text-primary-light">
            <span className="size-2 animate-pulse rounded-full bg-primary-light" />
            Bugungi ilhom
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Salom, <span className="text-primary-light">{currentUser.name}</span>
          </h2>

          <p className="max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            Bugungi ilhomingizni kutyapmiz. Kutubxonangizda <strong>{stats.unreadChapters}</strong> ta o&apos;qilmagan bob bor.
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-white/80">
            <span className="rounded-full border border-white/15 px-3 py-1">
              O&apos;qishlar: {stats.totalReads}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              Kutubxona: {stats.booksInLibrary} ta kitob
            </span>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-3 md:w-auto">
          <button className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark md:flex-none">
            <DraftIcon className="size-4" />
            Yozishni boshlash
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/20 md:flex-none">
            <BookIcon className="size-4" />
            O&apos;qishni davom ettirish
          </button>
        </div>
      </div>
    </section>
  );
}
