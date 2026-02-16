import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MdAdd, MdArrowBack, MdBookmarkBorder, MdEdit, MdPalette } from "react-icons/md";
import type { ReadingSettings } from "../types";

const THEME_OPTIONS: Array<{ value: ReadingSettings["theme"]; label: string }> = [
  { value: "light", label: "Light" },
  { value: "sepia", label: "Sepia" },
  { value: "dark", label: "Dark" },
];

type HeaderProps = {
  locale: string;
  bookId: string;
  chapterOrder: number;
  chapterTitle: string;
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: ReadingSettings["theme"];
  setTheme: (theme: ReadingSettings["theme"]) => void;
  canEditChapter?: boolean;
  onEditChapter?: () => void;
  canCreateChapter?: boolean;
  onCreateChapter?: () => void;
  creatingChapter?: boolean;
};

export function Header({
  locale,
  bookId,
  chapterOrder,
  chapterTitle,
  fontSize,
  setFontSize,
  theme,
  setTheme,
  canEditChapter = false,
  onEditChapter,
  canCreateChapter = false,
  onCreateChapter,
  creatingChapter = false,
}: HeaderProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const isDarkTheme = theme === "dark";
  const isSepiaTheme = theme === "sepia";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b px-4 shadow-sm backdrop-blur-md transition-all sm:px-6 ${
        isDarkTheme
          ? "border-white/10 bg-[#102122]/95"
          : isSepiaTheme
            ? "border-amber-200 bg-[#fff8eb]/95"
            : "border-primary-light/20 bg-white/95"
      }`}
    >
      <div className="flex w-1/4 items-center">
        <Link
          href={`/${locale}/books/${encodeURIComponent(bookId)}`}
          className={`group flex items-center gap-2 transition-colors hover:text-primary ${
            isDarkTheme ? "text-slate-200/70" : isSepiaTheme ? "text-[#5f4b33]/75" : "text-dark-900/65"
          }`}
        >
          <MdArrowBack className="text-xl transition-transform group-hover:-translate-x-1" />
          <span className="hidden text-sm font-medium sm:inline">Kitobga qaytish</span>
        </Link>
      </div>

      <div className="min-w-0 flex-1 px-4 text-center">
        <h1
          className={`truncate text-base font-semibold sm:text-lg ${
            isDarkTheme ? "text-slate-100" : isSepiaTheme ? "text-[#3b2f20]" : "text-dark-900"
          }`}
        >
          {chapterTitle}
          <span
            className={`mx-2 font-normal ${
              isDarkTheme ? "text-slate-200/45" : isSepiaTheme ? "text-[#5f4b33]/45" : "text-dark-900/40"
            }`}
          >
            -
          </span>
          <span className="text-primary">{chapterOrder}-bob</span>
        </h1>
      </div>

      <div className="flex w-1/4 items-center justify-end gap-2">
        <div
          className={`mr-2 hidden items-center rounded-lg border p-1 sm:flex ${
            isDarkTheme
              ? "border-white/15 bg-white/5"
              : isSepiaTheme
                ? "border-amber-200 bg-[#fff3dc]"
                : "border-primary-light/20 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => setFontSize(Math.max(14, fontSize - 1))}
            className={`flex size-8 items-center justify-center rounded transition-colors hover:bg-primary/10 ${
              isDarkTheme ? "text-slate-200/75" : isSepiaTheme ? "text-[#5f4b33]/80" : "text-dark-900/65"
            }`}
            aria-label="Shriftni kichraytirish"
          >
            <span className="text-xs">A-</span>
          </button>
          <div className={`mx-1 h-4 w-px ${isDarkTheme ? "bg-white/15" : "bg-primary-light/20"}`} />
          <button
            type="button"
            onClick={() => setFontSize(Math.min(28, fontSize + 1))}
            className={`flex size-8 items-center justify-center rounded transition-colors hover:bg-primary/10 ${
              isDarkTheme ? "text-slate-200/75" : isSepiaTheme ? "text-[#5f4b33]/80" : "text-dark-900/65"
            }`}
            aria-label="Shriftni kattalashtirish"
          >
            <span className="text-lg">A+</span>
          </button>
        </div>

        <div ref={themeMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen((prev) => !prev)}
            className={`flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10 ${
              isDarkTheme ? "text-slate-200/75" : isSepiaTheme ? "text-[#5f4b33]/80" : "text-dark-900/65"
            }`}
            aria-label="Tema"
            aria-expanded={isThemeMenuOpen}
          >
            <MdPalette size={20} />
          </button>

          {isThemeMenuOpen ? (
            <div
              className={`absolute right-0 top-12 w-36 rounded-xl border p-1 shadow-xl ${
                isDarkTheme
                  ? "border-white/15 bg-[#102122]"
                  : isSepiaTheme
                    ? "border-amber-200 bg-[#fff8eb]"
                    : "border-primary-light/20 bg-white"
              }`}
            >
              {THEME_OPTIONS.map((option) => {
                const active = option.value === theme;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTheme(option.value);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : isDarkTheme
                          ? "text-slate-200/80 hover:bg-white/5"
                          : isSepiaTheme
                            ? "text-[#5f4b33]/85 hover:bg-amber-100/70"
                            : "text-dark-900/75 hover:bg-primary/5"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {canCreateChapter ? (
          <button
            type="button"
            onClick={onCreateChapter}
            disabled={creatingChapter}
            className={`flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDarkTheme ? "text-slate-200/75" : isSepiaTheme ? "text-[#5f4b33]/80" : "text-dark-900/65"
            }`}
            aria-label="Yangi chapter qo'shish"
          >
            <MdAdd size={21} />
          </button>
        ) : null}

        {canEditChapter ? (
          <button
            type="button"
            onClick={onEditChapter}
            className={`flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10 ${
              isDarkTheme ? "text-slate-200/75" : isSepiaTheme ? "text-[#5f4b33]/80" : "text-dark-900/65"
            }`}
            aria-label="Chapter ni tahrirlash"
          >
            <MdEdit size={20} />
          </button>
        ) : null}

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
          aria-label="Saqlash"
        >
          <MdBookmarkBorder size={22} />
        </button>
      </div>
    </header>
  );
}
