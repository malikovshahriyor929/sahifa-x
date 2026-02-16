import { NavItem } from "@/types";
import {
  BookmarkIcon,
  DraftIcon,
  HomeIcon,
  IdeaIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
} from "./components/icons";

export function resolveNavHref(item: NavItem, locale: string) {
  if (item.href) {
    if (item.href.startsWith("/")) {
      return item.href;
    }
    return `/${locale}/${item.href}`;
  }

  switch (item.icon) {
    case "search":
      return `/${locale}/search`;
    default:
      return `/${locale}`;
  }
}

export function renderNavIcon(icon: NavItem["icon"], className: string) {
  switch (icon) {
    case "home":
      return <HomeIcon className={className} />;
    case "search":
      return <SearchIcon className={className} />;
    case "idea":
      return <IdeaIcon className={className} />;
    case "bookmark":
      return <BookmarkIcon className={className} />;
    case "library":
      return <LibraryIcon className={className} />;
    case "draft":
      return <DraftIcon className={className} />;
    case "settings":
      return <SettingsIcon className={className} />;
    default:
      return <HomeIcon className={className} />;
  }
}
