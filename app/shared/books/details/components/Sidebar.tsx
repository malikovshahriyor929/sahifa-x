import Link from "next/link";
import { FaUserPlus } from "react-icons/fa6";
import { PiPenNibBold } from "react-icons/pi";
import type { Author, SimilarBook } from "../types";
import { Button } from "./ui/Button";

type SidebarProps = {
  author: Author;
  similarBooks: SimilarBook[];
};

export function Sidebar({ author, similarBooks }: SidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-[20px] border border-primary-light/20 bg-white p-6 shadow-sm shadow-black/5">
        <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-[0.07] text-primary">
          <PiPenNibBold size={80} />
        </div>

        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-dark-900/55">Muallif haqida</h3>

        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-full border-2 border-primary bg-primary/10 bg-cover bg-center"
            style={{ backgroundImage: `url(${author.avatar})` }}
          />
          <div>
            <h4 className="text-sm font-bold text-dark-900">{author.name}</h4>
            <p className="text-xs text-dark-900/55">{author.bookCount} ta kitob</p>
            {author.authorId ? (
              <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-dark-900/45" title={author.authorId}>
                ID: {author.authorId}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-dark-900/70">{author.bio}</p>

        <Button variant="outline" className="w-full gap-2 text-xs uppercase tracking-wide">
          <FaUserPlus />
          Obuna bo&apos;lish
        </Button>
      </div>

      <div className="rounded-[20px] border border-primary-light/20 bg-white p-5 shadow-sm shadow-black/5">
        <h3 className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-dark-900/55">
          O&apos;xshash kitoblar
          <span className="text-[10px] text-primary">Barchasi</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {similarBooks.map((book) => (
            <Link key={book.id} href={book.href} className="group cursor-pointer">
              <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-xl border border-primary-light/20">
                {/* eslint-disable-next-line @next/next/no-img-element -- Remote URLs are dynamic from API payload. */}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <p className="line-clamp-1 text-xs font-bold text-dark-900 transition-colors group-hover:text-primary">
                {book.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
