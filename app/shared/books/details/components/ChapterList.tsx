import { FaLock, FaUnlock } from "react-icons/fa6";
import type { Chapter } from "../types";

type ChapterListProps = {
  chapters: Chapter[];
  currentChapter: number | null;
  onSelectChapter: (order: number) => void;
};

export function ChapterList({ chapters, currentChapter, onSelectChapter }: ChapterListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-light/20 bg-white shadow-sm shadow-black/5">
      <div className="flex items-center justify-between border-b border-primary-light/20 bg-primary/5 p-4">
        <h3 className="text-lg font-bold text-dark-900">Mundarija</h3>
        <span className="text-xs text-dark-900/50">Oxirgi yangilanish: hozirgina</span>
      </div>

      <div className="divide-y divide-primary-light/20">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectChapter(chapter.order)}
            disabled={chapter.isLocked}
            className={`group flex w-full items-center justify-between p-4 text-left transition-colors ${
              chapter.isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-primary/5"
            } ${chapter.order === currentChapter ? "bg-primary/10" : ""}`}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 font-mono text-sm text-dark-900/45">{chapter.number}</span>
              <div>
                <h4
                  className={`font-medium transition-colors ${
                    chapter.isLocked
                      ? "text-dark-900/45"
                      : chapter.order === currentChapter
                        ? "text-primary"
                        : "text-dark-900/80 group-hover:text-primary"
                  }`}
                >
                  {chapter.title}
                </h4>
                <p className="mt-0.5 text-xs text-dark-900/45">
                  {chapter.readTime} • {chapter.date}
                </p>
              </div>
            </div>

            {chapter.isLocked ? (
              <FaLock className="text-dark-900/45" />
            ) : chapter.isFree ? (
              <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs font-bold uppercase text-emerald-400">
                Bepul
              </span>
            ) : (
              <FaUnlock className="text-dark-900/45" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
