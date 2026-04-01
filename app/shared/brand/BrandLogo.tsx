import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  locale: string;
  size?: number;
  showWordmark?: boolean;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  locale,
  size = 40,
  showWordmark = true,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href={`/${locale}`}
      className={`flex w-auto shrink-0 items-center gap-3 ${className}`.trim()}
      aria-label="Sahifa X"
    >
      <Image
        src="/logo.png"
        alt="Sahifa X logo"
        width={size}
        height={size}
        priority={priority}
        className="rounded-full object-cover shadow-sm"
      />
      {showWordmark ? (
        <span className="text-xl font-bold tracking-tight text-dark-900">SAHIFA-X</span>
      ) : null}
    </Link>
  );
}
