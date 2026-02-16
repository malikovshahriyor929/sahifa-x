import Link from "next/link";
import { StarIcon } from "@/app/shared/icons";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

const DEFAULT_BOOK_COVER =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";

type BookCardSize = "sm" | "md" | "lg";

type BookCardData = Pick<Book, "id" | "title" | "coverUrl"> &
  Partial<Pick<Book, "author" | "rating">>;

type SizeClasses = {
  gap: string;
  coverRadius: string;
  title: string;
  author: string;
  badge: string;
  icon: string;
};

type BookCardProps = {
  book: BookCardData;
  link?: string;
  className?: string;
  size?: BookCardSize;
};

const sizeClasses: Record<BookCardSize, SizeClasses> = {
  sm: {
    gap: "gap-2",
    coverRadius: "rounded-xl",
    title: "text-base",
    author: "text-xs",
    badge: "px-1.5 py-0.5 text-[11px]",
    icon: "size-3",
  },
  md: {
    gap: "gap-3",
    coverRadius: "rounded-xl",
    title: "text-lg",
    author: "text-sm",
    badge: "px-2 py-1 text-xs",
    icon: "size-3.5",
  },
  lg: {
    gap: "gap-4",
    coverRadius: "rounded-[24px]",
    title: "text-xl",
    author: "text-base",
    badge: "px-2.5 py-1.5 text-sm",
    icon: "size-4",
  },
};

function toText(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function formatRating(value: number | undefined): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(1);
  }
  return "4.5";
}

export default function BookCard({ book, link, className, size = "md" }: BookCardProps) {
  const styles = sizeClasses[size];
  const title = toText(book.title, "Nomsiz asar");
  const author = toText(book.author, "Noma'lum muallif");
  const coverUrl = toText(book.coverUrl, DEFAULT_BOOK_COVER);
  const ratingText = formatRating(book.rating);

  const card = (
    <>
      <CardContent className="!p-0 !shadow-none">
        <div
          className={cn(
            "relative aspect-[2/3] w-full overflow-hidden shadow-black/30 p-0",
            styles.coverRadius
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Remote URLs come from API data and can vary by domain. */}
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 "
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
          <div
            className={cn(
              "absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 font-bold text-white backdrop-blur-md",
              styles.badge
            )}
          >
            <StarIcon className={cn("text-yellow-400", styles.icon)} />
            {ratingText}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start bg-transparent  !px-1">
        <CardTitle
          className={cn(
            "truncate font-bold leading-tight text-dark-900 transition-colors group-hover:text-primary max-w-[200px] line-clamp-1",
            styles.title
          )}
        >
          {title}
        </CardTitle>
        <CardDescription className={cn("mt-1 text-dark-900/60", styles.author)}>
          {author}
        </CardDescription>
      </CardFooter>
    </>
  );

  return (
    <Card
      className={cn(
        "group flex flex-col border-0 bg-transparent !shadow-none ",
        link && "cursor-pointer",
        styles.gap,
        className,
        "!bg-transparent overflow-hidden"
      )}
    >
      {link ? (
        <Link href={link} className="contents">
          {card}
        </Link>
      ) : (
        card
      )}
    </Card>
  );
}
