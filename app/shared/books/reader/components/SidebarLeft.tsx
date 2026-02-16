import { Fragment, useEffect, useState } from "react";
import { MdClose, MdCloseFullscreen, MdLock, MdMenuBook, MdOpenInFull } from "react-icons/md";
import type { Chapter } from "../types";

export type SidebarLeftMode = "collapsed" | "default" | "expanded";

type SidebarLeftProps = {
  chapters: Chapter[];
  loading: boolean;
  currentChapter: number;
  onChapterSelect: (order: number) => void;
  onModeChange?: (mode: SidebarLeftMode) => void;
};

export function SidebarLeft({
  chapters,
  loading,
  currentChapter,
  onChapterSelect,
  onModeChange,
}: SidebarLeftProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const mode: SidebarLeftMode = collapsed ? "collapsed" : isExpanded ? "expanded" : "default";
  const panelWidthClass = isExpanded ? "w-[22rem]" : "w-72";

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  if (collapsed) {
    return (
      <aside className="pointer-events-none absolute left-6 top-6 z-10 hidden xl:flex">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-primary-light/30 bg-white text-primary shadow-lg shadow-black/10 transition hover:bg-primary/10"
          aria-label="Mundarijani ochish"
        >
          <MdMenuBook size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`pointer-events-none absolute bottom-6 left-6 top-6 z-10 hidden ${panelWidthClass} flex-col gap-4 transition-[width] duration-200 xl:flex`}
    >
      <div className="pointer-events-auto flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-primary-light/20 bg-white shadow-xl shadow-black/10">
        <div className="flex items-center justify-between border-b border-primary-light/20 bg-primary/5 p-4">
          <h3 className="text-sm font-bold text-dark-900">Mundarija</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex size-8 items-center justify-center rounded-lg text-dark-900/60 transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label={isExpanded ? "Mundarijani kichraytirish" : "Mundarijani kattalashtirish"}
            >
              {isExpanded ? <MdCloseFullscreen size={18} /> : <MdOpenInFull size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex size-8 items-center justify-center rounded-lg text-dark-900/60 transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Mundarijani yopish"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar min-h-[400px] flex-1 space-y-1 overflow-y-auto p-2">
          {loading ? (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`chapter-skeleton-${index}`}
                  className="h-11 animate-pulse rounded-lg bg-primary/10"
                />
              ))}
            </>
          ) : (
            chapters.map((chapter) => {
              const isActive = chapter.order === currentChapter;
              const isPremium = chapter.isPreview === false;

              return (
                <Fragment key={chapter.id}>
                  {chapter.order === 6 ? (
                    <div className="mb-1 mt-4 py-2 pl-3 text-[10px] font-bold uppercase tracking-wider text-dark-900/45">
                      Qolgan boblar
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onChapterSelect(chapter.order)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-all duration-200 ${
                      isActive
                        ? "border border-primary/20 bg-primary/10 font-bold text-primary"
                        : "text-dark-900/70 hover:bg-primary/5 hover:text-primary-dark"
                    } ${isPremium ? "opacity-70" : ""}`}
                  >
                    <span className="truncate">{chapter.title}</span>
                    {isPremium ? (
                      <span className="flex items-center gap-1 rounded border border-primary-light/25 px-1.5 py-0.5 text-[10px] text-dark-900/55">
                        <MdLock size={10} />
                        Premium
                      </span>
                    ) : null}
                  </button>
                </Fragment>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
