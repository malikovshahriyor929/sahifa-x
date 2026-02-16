import { BsFillTagFill } from "react-icons/bs";
import { FaBookmark, FaCartShopping, FaShareNodes, FaStar } from "react-icons/fa6";
import { MdAdd, MdVerified } from "react-icons/md";
import type { Author, Book } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

type BookHeroProps = {
  book: Book;
  author: Author;
  onRead: () => void;
  canManageChapters?: boolean;
  onAddChapter?: () => void;
  creatingChapter?: boolean;
};

export function BookHero({
  book,
  author,
  onRead,
  canManageChapters = false,
  onAddChapter,
  creatingChapter = false,
}: BookHeroProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {book.genres.map((genre, index) => (
          <Badge
            key={`${genre}-${index}`}
            variant={index === 0 ? "secondary" : index === 1 ? "accent" : "default"}
          >
            {genre}
          </Badge>
        ))}
        <Badge variant="default">
          <MdVerified className="mr-1 text-sm" />
          {book.status}
        </Badge>
      </div>

      <div>
        <h1 className="mb-2 text-3xl font-bold leading-tight text-dark-900 md:text-5xl">
          {book.title}
        </h1>
        <div className="mb-6 mt-4 flex items-center gap-3 text-dark-900/55">
          <div
            className="h-8 w-8 rounded-full border border-primary-light/30 bg-cover bg-center"
            style={{ backgroundImage: `url(${author.avatar})` }}
          />
          <span className="font-medium text-dark-900">{author.name}</span>
          <span className="h-1 w-1 rounded-full bg-dark-900/35" />
          <div className="flex items-center gap-1 text-yellow-400">
            <FaStar />
            <span className="font-bold text-dark-900">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-dark-900/45">({book.voteCount} ovoz)</span>
          </div>
        </div>

        <p className="mb-6 border-l-2 border-primary pl-4 text-lg leading-relaxed text-dark-900/70 italic">
          {book.description}
        </p>
      </div>

      <div className="rounded-2xl border border-primary-light/20 bg-white p-5 shadow-sm shadow-black/5">
        <div className="mb-4 flex items-center gap-2">
          <BsFillTagFill className="text-primary" />
          <span className="text-sm font-bold uppercase text-dark-900/70">Ijara shartlari</span>
        </div>

        {/*
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-primary-light/20 bg-primary/5 px-4 py-2">
              <FaCartShopping className="text-xl text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-dark-900/55">Ijara narxi</p>
                <p className="text-lg font-bold leading-none text-primary">
                  {book.price}
                  <span className="text-sm font-normal text-dark-900/45"> / {book.rentalPeriod}</span>
                </p>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-dark-900/50">To&apos;lovdan so&apos;ng darhol</p>
              <p className="text-xs text-dark-900/50">o&apos;qishni boshlashingiz mumkin</p>
            </div>
          </div>
        */}

        <div className="flex flex-wrap gap-3">
          {canManageChapters ? (
            <Button
              variant="secondary"
              className="gap-2"
              onClick={onAddChapter}
              disabled={creatingChapter}
              aria-label="Bob qo'shish"
            >
              <MdAdd className="text-lg" />
              Bob qo&apos;shish
            </Button>
          ) : null}
          <Button variant="primary" className="group flex-1 gap-2" onClick={onRead}>
            <FaCartShopping className="transition-transform group-hover:translate-x-0.5" />
            Ijara va O&apos;qish
          </Button>
          <Button variant="secondary" size="icon" aria-label="Saqlash">
            <FaBookmark />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Ulashish">
            <FaShareNodes />
          </Button>
        </div>
      </div>
    </div>
  );
}
