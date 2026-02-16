"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, PERSONAL_NAV_ITEMS } from "@/app/shared/dashboard/constants";
import { renderNavIcon, resolveNavHref } from "@/app/shared/dashboard/navigation";
import type { NavItem } from "@/types";

type SidebarProps = {
  locale: string;
};

function resolveHref(item: NavItem, locale: string) {
  return resolveNavHref(item, locale);
}

function isActive(item: NavItem, pathname: string, href: string, locale: string) {
  if (item.icon === "search") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (item.icon === "idea") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (item.icon === "home") {
    return pathname === href || pathname === `/${locale}`;
  }

  return false;
}

function navIcon(icon: NavItem["icon"], className: string) {
  return renderNavIcon(icon, className);
}

function NavLink({ item, href, active }: { item: NavItem; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`mb-1.5 flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : "text-primary-dark/80 hover:bg-primary/10 hover:text-primary-dark"
      }`}
    >
      {navIcon(item.icon, "size-5")}
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-primary-light/20 bg-white px-4 py-6 md:flex">
      <div className="mb-2 px-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-dark/50">Menu</p>
      </div>
      <nav className="mb-4 flex flex-col">
        {MAIN_NAV_ITEMS.map((item) => {
          const href = resolveHref(item, locale);
          return (
            <NavLink
              key={item.label}
              item={item}
              href={href}
              active={isActive(item, pathname, href, locale)}
            />
          );
        })}
      </nav>

      <div className="mx-4 my-2 h-px bg-primary-light/30" />

      <div className="mb-2 mt-4 px-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-dark/50">Shaxsiy</p>
      </div>
      <nav className="flex flex-col">
        {PERSONAL_NAV_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} href={resolveHref(item, locale)} active={false} />
        ))}
      </nav>

      {/* <div className="mt-auto pt-6">
        <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-dark-900 p-4">
          <div className="absolute right-0 top-0 p-2 opacity-10 transition-opacity group-hover:opacity-20">
            <SparklesIcon className="size-14" />
          </div>
          <div className="relative z-10 mb-2 flex items-center gap-2 text-primary-light">
            <SparklesIcon className="size-4" />
            <span className="text-xs font-bold uppercase">Pro A&apos;zolik</span>
          </div>
          <p className="relative z-10 mb-4 text-xs leading-relaxed text-white/80">
            Cheksiz o&apos;qish va maxsus imkoniyatlarga ega bo&apos;ling.
          </p>
          <button className="relative z-10 w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark">
            Upgrade qilish
          </button>
        </div>
      </div> */}
    </aside>
  );
}
