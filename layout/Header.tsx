import Link from "next/link";
import { MAIN_NAV_ITEMS, PERSONAL_NAV_ITEMS } from "@/app/shared/dashboard/constants";
import { renderNavIcon, resolveNavHref } from "@/app/shared/dashboard/navigation";
import { BellIcon, BookIcon, MenuIcon, SearchIcon } from "@/app/shared/dashboard/components/icons";
import SignOutButton from "@/app/shared/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/types";

type HeaderProps = {
  currentUser: CurrentUser;
  locale: string;
};

const MENU_SECTIONS = [
  { title: "Menu", items: MAIN_NAV_ITEMS },
  { title: "Shaxsiy", items: PERSONAL_NAV_ITEMS },
];

function MobileMenu({ locale }: { locale: string }) {
  return (
    <div className="relative md:hidden">
      <input id="mobile-menu-toggle" type="checkbox" className="peer sr-only" />
      <label
        htmlFor="mobile-menu-toggle"
        className="inline-flex size-10 items-center justify-center rounded-xl border border-primary-light/40 text-primary/70 transition hover:bg-primary/10 hover:text-primary"
        aria-label="Menu"
      >
        <MenuIcon className="size-5" />
      </label>
      <div className="absolute left-0 top-full z-30 mt-3 w-72 rounded-2xl border border-primary-light/40 bg-white p-4 shadow-2xl shadow-primary/10 opacity-0 pointer-events-none transition duration-200 peer-checked:opacity-100 peer-checked:pointer-events-auto">
        {MENU_SECTIONS.map((section, index) => (
          <div key={section.title} className={index === 0 ? "" : "mt-4"}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-dark/50">
              {section.title}
            </p>
            <nav className="flex flex-col">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={resolveNavHref(item, locale)}
                  className="mb-1.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-primary-dark/80 transition hover:bg-primary/10 hover:text-primary-dark"
                >
                  {renderNavIcon(item.icon, "size-4")}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header({ currentUser, locale }: HeaderProps) {
  const safeName = currentUser.name?.trim() || "Foydalanuvchi";
  const safeRole = currentUser.role?.trim() || "Reader";
  const safeAvatar = currentUser.avatarUrl?.trim() || "";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-primary-light/20 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <MobileMenu locale={locale} />
        <Link href={`/${locale}`} className="flex w-auto shrink-0 items-center gap-3 md:w-64">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25">
            <BookIcon className="size-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-dark-900">SAHIFA-X</h1>
        </Link>
      </div>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto rounded-[20px] border border-primary-light/30 bg-primary/10 px-3 py-2 transition hover:bg-primary/15 data-[state=open]:bg-primary/15"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-dark-900">{safeName}</p>
                <p className="text-xs text-primary-dark">{safeRole}</p>
              </div>
              <Avatar className="size-10 min-w-10 shrink-0 border border-primary-light/40 shadow-md">
                <AvatarImage src={safeAvatar || undefined} alt={safeName} />
                <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="px-3 pb-1">
              <p className="text-sm font-semibold text-dark-900">{safeName}</p>
              <p className="text-xs font-medium text-primary-dark/80">{safeRole}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/profile`} className="font-medium text-dark-900/85">
                My profile
              </Link>
            </DropdownMenuItem>
            <div className="px-1 pb-1 pt-2">
              <SignOutButton locale={locale} className="h-9 w-full rounded-lg border-primary-light/30 px-3" />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
