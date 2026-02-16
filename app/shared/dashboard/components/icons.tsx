import { FaStar } from "react-icons/fa";
import {
  FiArrowRight,
  FiBell,
  FiBook,
  FiBookOpen,
  FiBookmark,
  FiEdit3,
  FiEye,
  FiFilter,
  FiGrid,
  FiHome,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUserPlus,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

type IconProps = {
  className?: string;
};

export function SearchIcon({ className }: IconProps) {
  return <FiSearch className={className} aria-hidden="true" />;
}

export function MenuIcon({ className }: IconProps) {
  return <FiMenu className={className} aria-hidden="true" />;
}

export function BellIcon({ className }: IconProps) {
  return <FiBell className={className} aria-hidden="true" />;
}

export function BookIcon({ className }: IconProps) {
  return <FiBookOpen className={className} aria-hidden="true" />;
}

export function HomeIcon({ className }: IconProps) {
  return <FiHome className={className} aria-hidden="true" />;
}

export function BookmarkIcon({ className }: IconProps) {
  return <FiBookmark className={className} aria-hidden="true" />;
}

export function IdeaIcon({ className }: IconProps) {
  return <FiZap className={className} aria-hidden="true" />;
}

export function LibraryIcon({ className }: IconProps) {
  return <FiBook className={className} aria-hidden="true" />;
}

export function DraftIcon({ className }: IconProps) {
  return <FiEdit3 className={className} aria-hidden="true" />;
}

export function SettingsIcon({ className }: IconProps) {
  return <FiSettings className={className} aria-hidden="true" />;
}

export function ArrowRightIcon({ className }: IconProps) {
  return <FiArrowRight className={className} aria-hidden="true" />;
}

export function EyeIcon({ className }: IconProps) {
  return <FiEye className={className} aria-hidden="true" />;
}

export function UsersIcon({ className }: IconProps) {
  return <FiUsers className={className} aria-hidden="true" />;
}

export function PlusUserIcon({ className }: IconProps) {
  return <FiUserPlus className={className} aria-hidden="true" />;
}

export function GridIcon({ className }: IconProps) {
  return <FiGrid className={className} aria-hidden="true" />;
}

export function SparklesIcon({ className }: IconProps) {
  return <HiSparkles className={className} aria-hidden="true" />;
}

export function FilterIcon({ className }: IconProps) {
  return <FiFilter className={className} aria-hidden="true" />;
}

export function StarIcon({ className }: IconProps) {
  return <FaStar className={className} aria-hidden="true" />;
}
