import Link from "next/link";
import SignOutButton from "@/app/shared/components/SignOutButton";
import type { CurrentUser } from "../types";
import { BellIcon, BookIcon, SearchIcon } from "./icons";

type HeaderProps = {
  currentUser: CurrentUser;
  locale: string;
};

export default function Header({ currentUser, locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-primary-light/20 bg-white/95 px-4 backdrop-blur md:px-6">
      <Link href={`/${locale}`} className="flex w-64 shrink-0 items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25">
          <BookIcon className="size-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-dark-900">SAHIFA-X</h1>
      </Link>

      <div className="hidden max-w-2xl flex-1 px-8 md:block">
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-primary/55 transition-colors group-focus-within:text-primary">
            <SearchIcon className="size-5" />
          </div>
          <input
            type="text"
            className="block w-full rounded-2xl border border-transparent bg-primary/10 py-3 pl-11 pr-4 text-sm text-dark-900 outline-none transition-all placeholder:text-dark-900/50 focus:border-primary-light focus:bg-white focus:ring-2 focus:ring-primary/40"
            placeholder="Kitob, muallif yoki janrni qidiring..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:w-64 md:justify-end">
        <button className="relative rounded-xl p-2.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary">
          <BellIcon className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <div className="hidden h-8 w-px bg-primary-light/30 sm:block" />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-dark-900">{currentUser.name}</p>
          <p className="text-xs text-primary-dark">{currentUser.role}</p>
        </div>

        <div
          className="size-10 rounded-full border border-primary-light/40 bg-cover bg-center shadow-md"
          style={{ backgroundImage: `url('${currentUser.avatarUrl}')` }}
        />

        <SignOutButton locale={locale} />
      </div>
    </header>
  );
}
