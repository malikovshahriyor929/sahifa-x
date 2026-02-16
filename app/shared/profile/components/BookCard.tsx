import Link from "next/link";
import { MdComment, MdDelete, MdEdit, MdEditNote, MdStar, MdVisibility } from "react-icons/md";
import type { ProfileBook } from "../types";
import Badge from "./ui/Badge";

type BookCardProps = {
  book: ProfileBook;
};

export default function BookCard({ book }: BookCardProps) {
  const isPublished = book.status === "PUBLISHED";

  return (
    <div className="group relative flex flex-col gap-3">
      <Link href={book.href} className="relative aspect-[2/3] w-full overflow-hidden rounded-[20px] border border-primary-light/20 shadow-lg shadow-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element -- API cover URLs are dynamic and can be external. */}
        <img
          src={book.coverUrl}
          alt={book.title}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            !isPublished ? "grayscale opacity-75" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85" />

        <div className="absolute left-3 top-3">
          <Badge variant={isPublished ? "success" : "warning"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>

        {isPublished && typeof book.rating === "number" ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
            <MdStar className="text-sm text-yellow-400" /> {book.rating.toFixed(1)}
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 right-4">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-primary-light">
            {book.genre}
          </span>
          <h4 className="mb-1 line-clamp-2 text-xl font-bold leading-tight text-white">
            {book.title}
          </h4>

          {isPublished ? (
            <div className="mt-2 flex items-center gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <MdVisibility className="text-sm" /> {book.views ?? "0"}
              </span>
              <span className="flex items-center gap-1">
                <MdComment className="text-sm" /> {book.comments ?? 0}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs italic text-white/75">{book.lastEdited ?? "Yangilanmagan"}</p>
          )}
        </div>
      </Link>

      <div className="flex gap-2">
        <Link
          href={book.href}
          className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors ${
            isPublished
              ? "bg-primary/90 text-white hover:bg-primary-dark"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {isPublished ? (
            <>
              <MdEdit className="text-base" /> Tahrirlash
            </>
          ) : (
            <>
              <MdEditNote className="text-base" /> Davom etish
            </>
          )}
        </Link>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-dark-900/60 transition-colors hover:bg-rose-500/15 hover:text-rose-500"
        >
          <MdDelete className="text-base" />
        </button>
      </div>
    </div>
  );
}

