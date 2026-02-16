import { FaStar } from "react-icons/fa";
import { FiFilter, FiSearch } from "react-icons/fi";

type IconProps = {
  className?: string;
};

export function SearchIcon({ className }: IconProps) {
  return <FiSearch className={className} aria-hidden="true" />;
}

export function FilterIcon({ className }: IconProps) {
  return <FiFilter className={className} aria-hidden="true" />;
}

export function StarIcon({ className }: IconProps) {
  return <FaStar className={className} aria-hidden="true" />;
}
