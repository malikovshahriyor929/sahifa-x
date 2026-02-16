"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSessionUserId } from "@/app/shared/auth/getSessionUserId";
import { DEFAULT_BOOK_COVER } from "@/app/shared/dashboard/constants";
import RichTextEditor, {
  plainTextToQuillHtml,
  quillHtmlToPlainText,
} from "@/app/shared/books/editor/RichTextEditor";
import {
  createBookChapter,
  editBookChapter,
  getBookChapterByOrder,
  getBookChapters,
  getBookDetails,
} from "@/server/api";
import { Header } from "@/app/shared/books/reader/components/Header";
import {
  SidebarLeft,
  type SidebarLeftMode,
} from "@/app/shared/books/reader/components/SidebarLeft";
import {
  CHAPTERS_PER_PAGE,
  DEFAULT_AUTHOR_NOTE,
  DEFAULT_READING_SETTINGS,
} from "@/app/shared/books/reader/constants";
import type {
  Chapter,
  ChapterDetail,
  ChapterNavigation,
  ReadingSettings,
} from "@/app/shared/books/reader/types";

type UnknownRecord = Record<string, unknown>;

type BookMeta = {
  title: string;
  coverUrl: string;
  authorId: string | null;
};

const EMPTY_NAVIGATION: ChapterNavigation = {
  prev: null,
  total: 0,
  next: null,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeBookMeta(payload: unknown): BookMeta | null {
  if (!isRecord(payload)) {
    return null;
  }

  const record = payload as UnknownRecord;
  const candidate = [record.data, record.book, record.item, record.result].find((item) =>
    isRecord(item)
  );
  const source = (candidate as UnknownRecord | undefined) ?? record;

  const title = toText(source.title ?? source.name) ?? "Kitob";
  const coverUrl = toText(source.coverUrl ?? source.cover ?? source.image) ?? DEFAULT_BOOK_COVER;
  const authorId = toText(source.authorId ?? source.userId ?? source.ownerId);

  return { title, coverUrl, authorId };
}

function normalizeChapterList(payload: unknown): Chapter[] {
  if (!isRecord(payload)) {
    return [];
  }

  const source = Array.isArray((payload as UnknownRecord).data)
    ? ((payload as UnknownRecord).data as unknown[])
    : [];

  const chapters = source
    .filter((item): item is UnknownRecord => isRecord(item))
    .map((item, index) => {
      const order = toNumber(item.order) ?? index + 1;
      const title = toText(item.title) ?? `Chapter ${order}`;
      const id = toText(item.id ?? item._id) ?? `chapter-${order}`;
      const isPreview =
        typeof item.isPreview === "boolean"
          ? item.isPreview
          : typeof item.is_preview === "boolean"
            ? item.is_preview
            : undefined;

      return {
        id,
        title,
        order,
        isPreview,
      };
    })
    .sort((a, b) => a.order - b.order);

  return chapters;
}

function normalizeChapterNavigation(payload: unknown): ChapterNavigation {
  if (!isRecord(payload)) {
    return EMPTY_NAVIGATION;
  }

  const navSource = isRecord((payload as UnknownRecord).nav)
    ? ((payload as UnknownRecord).nav as UnknownRecord)
    : {};

  const prev = toNumber(navSource.prev);
  const next = toNumber(navSource.next);
  const total = toNumber(navSource.total) ?? 0;

  return {
    prev,
    total,
    next,
  };
}

function normalizeChapterDetail(
  payload: unknown,
  fallbackOrder: number,
  fallbackBookId: string
): ChapterDetail | null {
  if (!isRecord(payload)) {
    return null;
  }

  const candidate = (payload as UnknownRecord).chapter;
  const chapterSource = isRecord(candidate)
    ? (candidate as UnknownRecord)
    : (payload as UnknownRecord);

  const id = toText(chapterSource.id ?? chapterSource._id);
  const title = toText(chapterSource.title);
  const order = toNumber(chapterSource.order) ?? fallbackOrder;
  const content = toText(chapterSource.content) ?? "";
  const bookId = toText(chapterSource.bookId) ?? fallbackBookId;

  if (!id || !title) {
    return null;
  }

  const isPreview =
    typeof chapterSource.isPreview === "boolean"
      ? chapterSource.isPreview
      : typeof chapterSource.is_preview === "boolean"
        ? chapterSource.is_preview
        : undefined;

  return {
    id,
    title,
    order,
    bookId,
    content,
    contentUrl: toText(chapterSource.contentUrl),
    isPreview,
  };
}

function buildChapterPath(locale: string, bookId: string, chapter: number): string {
  return `/${locale}/books/${encodeURIComponent(bookId)}/${encodeURIComponent(String(chapter))}`;
}

function toParagraphs(content: string): string[] {
  const paragraphs = content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs.length > 0
    ? paragraphs
    : ["Ushbu bob uchun matn mavjud emas. Keyinroq qayta urinib ko'ring."];
}

function stripChapterPrefix(title: string, order: number): string {
  const trimmed = title.trim();
  if (!trimmed) {
    return "";
  }

  const englishPrefixRemoved = trimmed.replace(/^chapter\s*\d+\s*:\s*/i, "");
  const uzbekPrefixPattern = new RegExp(`^${order}\\s*[-.]?\\s*bob\\s*:?\\s*`, "i");
  const uzbekPrefixRemoved = englishPrefixRemoved.replace(uzbekPrefixPattern, "");

  return uzbekPrefixRemoved.trim();
}

function formatChapterCardTitle(order: number, rawTitle: string): string {
  const cleanTitle = stripChapterPrefix(rawTitle, order);
  return cleanTitle ? `${order}-bob: ${cleanTitle}` : `${order}-bob`;
}

function getCreatedChapterOrder(payload: unknown): number | null {
  if (!isRecord(payload)) {
    return null;
  }

  const directOrder = toNumber((payload as UnknownRecord).order);
  if (typeof directOrder === "number") {
    return directOrder;
  }

  const chapterSource = isRecord((payload as UnknownRecord).chapter)
    ? ((payload as UnknownRecord).chapter as UnknownRecord)
    : isRecord((payload as UnknownRecord).data)
      ? ((payload as UnknownRecord).data as UnknownRecord)
      : null;

  if (!chapterSource) {
    return null;
  }

  return toNumber(chapterSource.order);
}

export default function BookChapterReaderPage() {
  const params = useParams<{ locale?: string; id?: string; chapter?: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const locale = typeof params?.locale === "string" ? params.locale : "uz";
  const bookId = typeof params?.id === "string" ? params.id : "";
  const currentChapter = useMemo(() => {
    const value = Number.parseInt(params?.chapter ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }, [params?.chapter]);

  const [fontSize, setFontSize] = useState(DEFAULT_READING_SETTINGS.fontSize);
  const [theme, setTheme] = useState<ReadingSettings["theme"]>(DEFAULT_READING_SETTINGS.theme);
  const [sidebarMode, setSidebarMode] = useState<SidebarLeftMode>("default");
  const [bookMeta, setBookMeta] = useState<BookMeta>({
    title: "Kitob",
    coverUrl: DEFAULT_BOOK_COVER,
    authorId: null,
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(null);
  const [chapterNavigation, setChapterNavigation] =
    useState<ChapterNavigation>(EMPTY_NAVIGATION);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createPreview, setCreatePreview] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPreview, setEditPreview] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!bookId) {
      setError("Kitob ID topilmadi.");
      setLoadingChapters(false);
      return;
    }

    let active = true;

    async function loadInitialData() {
      setLoadingChapters(true);

      try {
        const [chaptersPayload, bookPayload] = await Promise.all([
          getBookChapters(bookId, {
            page: 1,
            per_page: CHAPTERS_PER_PAGE,
          }),
          getBookDetails(bookId).catch(() => null),
        ]);

        if (!active) {
          return;
        }

        const normalizedChapters = normalizeChapterList(chaptersPayload);
        setChapters(normalizedChapters);

        if (bookPayload) {
          const normalizedBookMeta = normalizeBookMeta(bookPayload);
          if (normalizedBookMeta) {
            setBookMeta(normalizedBookMeta);
          }
        }

        if (normalizedChapters.length === 0) {
          setError("Boblar topilmadi.");
        }
      } catch {
        if (!active) {
          return;
        }
        setError("Boblar ro'yxatini yuklab bo'lmadi.");
        setChapters([]);
      } finally {
        if (active) {
          setLoadingChapters(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, [bookId]);

  useEffect(() => {
    if (!chapters.length || !bookId) {
      return;
    }

    const hasCurrentChapter = chapters.some((chapter) => chapter.order === currentChapter);
    if (hasCurrentChapter) {
      return;
    }

    const fallbackChapter = chapters[0];
    router.replace(buildChapterPath(locale, bookId, fallbackChapter.order));
  }, [bookId, chapters, currentChapter, locale, router]);

  useEffect(() => {
    if (!bookId) {
      setError("Kitob ID topilmadi.");
      setLoadingDetail(false);
      return;
    }

    let active = true;

    async function loadChapter() {
      setLoadingDetail(true);

      try {
        const payload = await getBookChapterByOrder(bookId, currentChapter);

        if (!active) {
          return;
        }

        const normalizedChapter = normalizeChapterDetail(payload, currentChapter, bookId);
        if (!normalizedChapter) {
          setError("Bob ma'lumotlari noto'g'ri formatda keldi.");
          setChapterDetail(null);
          setChapterNavigation(EMPTY_NAVIGATION);
          return;
        }

        setChapterDetail(normalizedChapter);
        setChapterNavigation(normalizeChapterNavigation(payload));
        setError(null);
      } catch {
        if (!active) {
          return;
        }
        setError("Bob ma'lumotlarini yuklab bo'lmadi.");
        setChapterDetail(null);
        setChapterNavigation(EMPTY_NAVIGATION);
      } finally {
        if (active) {
          setLoadingDetail(false);
        }
      }
    }

    loadChapter();

    return () => {
      active = false;
    };
  }, [bookId, currentChapter]);

  const paragraphs = useMemo(() => {
    if (!chapterDetail) {
      return [];
    }
    return toParagraphs(chapterDetail.content);
  }, [chapterDetail]);

  const quoteText = useMemo(() => {
    if (paragraphs.length === 0) {
      return DEFAULT_AUTHOR_NOTE;
    }
    return paragraphs[Math.min(1, paragraphs.length - 1)];
  }, [paragraphs]);

  const chapterTitleMap = useMemo(() => {
    const map = new Map<number, string>();
    chapters.forEach((chapter) => {
      map.set(chapter.order, chapter.title);
    });
    return map;
  }, [chapters]);

  const rawCurrentTitle =
    chapterDetail?.title ?? chapterTitleMap.get(currentChapter) ?? `${bookMeta.title} - ${currentChapter}-bob`;
  const currentTitle = stripChapterPrefix(rawCurrentTitle, currentChapter) || rawCurrentTitle;

  const prevTitle =
    chapterNavigation.prev !== null ? chapterTitleMap.get(chapterNavigation.prev) ?? "" : "";
  const nextTitle =
    chapterNavigation.next !== null ? chapterTitleMap.get(chapterNavigation.next) ?? "" : "";
  const nextChapterOrder = useMemo(() => {
    if (chapters.length === 0) {
      return Math.max(1, currentChapter + 1);
    }

    return Math.max(...chapters.map((chapter) => chapter.order)) + 1;
  }, [chapters, currentChapter]);

  const isLoading = loadingChapters || loadingDetail;
  const currentUserId = getSessionUserId(session);
  const isOwner = Boolean(currentUserId && bookMeta.authorId && currentUserId === bookMeta.authorId);
  const isDarkTheme = theme === "dark";
  const isSepiaTheme = theme === "sepia";
  const contentPaddingClass =
    sidebarMode === "expanded"
      ? "xl:pl-[26rem] xl:pr-12"
      : sidebarMode === "default"
        ? "xl:pl-[22rem] xl:pr-12"
        : "xl:pl-12 xl:pr-12";
  const rootThemeClass = isDarkTheme
    ? "bg-[linear-gradient(180deg,#0b1718_0%,#102223_100%)] text-slate-100"
    : isSepiaTheme
      ? "bg-[linear-gradient(180deg,#f8f2e7_0%,#f4ecd8_100%)] text-[#3b2f20]"
      : "bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] text-dark-900";
  const titleClass = isDarkTheme
    ? "text-slate-100"
    : isSepiaTheme
      ? "text-[#302414]"
      : "text-dark-900";
  const articleClass = isDarkTheme
    ? "text-slate-200/85"
    : isSepiaTheme
      ? "text-[#4b3a29]/90"
      : "text-dark-900/80";

  function goToChapter(order: number) {
    if (!bookId || order === currentChapter) {
      return;
    }
    router.push(buildChapterPath(locale, bookId, order));
  }

  function openCreateDialog() {
    setCreateError(null);
    setCreateTitle(`Chapter ${nextChapterOrder}: `);
    setCreateContent("");
    setCreatePreview(true);
    setIsCreateOpen(true);
  }

  async function handleCreateChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookId) {
      setCreateError("Kitob topilmadi.");
      return;
    }

    if (!createTitle.trim()) {
      setCreateError("Chapter sarlavhasini kiriting.");
      return;
    }

    const normalizedContent = quillHtmlToPlainText(createContent);
    if (!normalizedContent.trim()) {
      setCreateError("Chapter matnini kiriting.");
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const payload = await createBookChapter(bookId, {
        title: createTitle.trim(),
        content: normalizedContent,
        contentUrl: null,
        isPreview: createPreview,
      });

      let targetOrder = getCreatedChapterOrder(payload);

      if (typeof targetOrder !== "number") {
        const chaptersPayload = await getBookChapters(bookId, {
          page: 1,
          per_page: CHAPTERS_PER_PAGE,
        });
        const normalized = normalizeChapterList(chaptersPayload);
        if (normalized.length > 0) {
          setChapters(normalized);
          targetOrder = normalized[normalized.length - 1]?.order ?? null;
        }
      }

      if (typeof targetOrder === "number") {
        setIsCreateOpen(false);
        router.push(buildChapterPath(locale, bookId, targetOrder));
        return;
      }

      setCreateError("Chapter yaratildi, lekin order topilmadi. Sahifani yangilang.");
    } catch {
      setCreateError("Chapter yaratib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setCreating(false);
    }
  }

  function openEditDialog() {
    if (!chapterDetail) {
      return;
    }
    setEditError(null);
    setEditTitle(chapterDetail.title);
    setEditContent(plainTextToQuillHtml(chapterDetail.content));
    setEditPreview(Boolean(chapterDetail.isPreview));
    setIsEditOpen(true);
  }

  async function handleEditChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!chapterDetail?.id) {
      setEditError("Chapter topilmadi.");
      return;
    }

    if (!editTitle.trim()) {
      setEditError("Sarlavhani kiriting.");
      return;
    }

    const normalizedContent = quillHtmlToPlainText(editContent);

    if (!normalizedContent.trim()) {
      setEditError("Chapter matnini kiriting.");
      return;
    }

    setEditError(null);
    setEditing(true);

    try {
      const payload = await editBookChapter(bookId, chapterDetail.id, {
        title: editTitle.trim(),
        content: normalizedContent,
        contentUrl: null,
        isPreview: editPreview,
      });

      const normalized = normalizeChapterDetail(payload, currentChapter, bookId);
      if (normalized) {
        setChapterDetail(normalized);
      } else {
        setChapterDetail((prev) =>
          prev
            ? {
                ...prev,
                title: editTitle.trim(),
                content: normalizedContent,
                isPreview: editPreview,
              }
            : prev
        );
      }

      setChapters((prev) =>
        prev.map((chapter) =>
          chapter.order === currentChapter
            ? { ...chapter, title: editTitle.trim(), isPreview: editPreview }
            : chapter
        )
      );

      setIsEditOpen(false);
    } catch {
      setEditError("Chapter ni tahrirlab bo'lmadi.");
    } finally {
      setEditing(false);
    }
  }

  if (!bookId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Kitob ID topilmadi.
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-80px)] flex-col font-sans ${rootThemeClass}`}>
      <Header
        locale={locale}
        bookId={bookId}
        chapterOrder={currentChapter}
        chapterTitle={currentTitle}
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={theme}
        setTheme={setTheme}
        canCreateChapter={isOwner}
        onCreateChapter={openCreateDialog}
        creatingChapter={creating}
        canEditChapter={isOwner}
        onEditChapter={openEditDialog}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <SidebarLeft
          chapters={chapters}
          loading={loadingChapters}
          currentChapter={currentChapter}
          onChapterSelect={goToChapter}
          onModeChange={setSidebarMode}
        />

        <main className="custom-scrollbar relative flex-1 overflow-y-auto bg-transparent scroll-smooth">
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b ${
              isDarkTheme ? "from-primary/20" : "from-primary/12"
            } to-transparent`}
          />
          <div
            className={`bg-halftone pointer-events-none absolute right-0 top-0 h-64 w-64 ${
              isDarkTheme ? "opacity-30" : "opacity-20"
            }`}
          />

          <div
            className={`relative z-0 mx-auto w-full px-6 py-12 sm:px-8 sm:py-16 ${contentPaddingClass}`}
          >
            <div className="mb-12 text-center">
              <span className="mb-3 block animate-fade-in text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
                {currentChapter}-BOB
              </span>
              <h2 className={`mb-7 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${titleClass}`}>
                {currentTitle}
              </h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            </div>

            {error ? (
              <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="space-y-4 pb-20">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`reader-skeleton-${index}`}
                    className="h-7 animate-pulse rounded-lg bg-primary/10"
                  />
                ))}
              </div>
            ) : (
              <>
                <article
                  className={`space-y-6 font-serif leading-loose ${articleClass}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {paragraphs.map((paragraph, index) => (
                    <Fragment key={`paragraph-${index}`}>
                      <p>{paragraph}</p>
                      {index === 1 ? (
                        <div
                          className={`group relative my-10 overflow-hidden rounded-r-xl border-l-4 border-primary p-8 shadow-lg ${
                            isDarkTheme
                              ? "bg-white/5 shadow-black/25"
                              : isSepiaTheme
                                ? "bg-[#fff8ea] shadow-black/10"
                                : "bg-white shadow-black/5"
                          }`}
                        >
                          <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <p
                            className={`relative z-10 text-lg font-medium italic ${
                              isDarkTheme
                                ? "text-slate-100"
                                : isSepiaTheme
                                  ? "text-[#3b2f20]"
                                  : "text-dark-900"
                            }`}
                          >
                            {quoteText}
                          </p>
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </article>

                <div className="mt-20 border-t border-primary-light/20 pt-10">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <button
                      type="button"
                      onClick={() =>
                        chapterNavigation.prev !== null ? goToChapter(chapterNavigation.prev) : undefined
                      }
                      disabled={chapterNavigation.prev === null}
                      className={`group flex w-full flex-col items-start gap-2.5 rounded-2xl border px-4 py-3.5 text-left transition-all sm:px-5 sm:py-4 ${
                        chapterNavigation.prev === null
                          ? "cursor-not-allowed border-primary-light/20 bg-white/60 text-dark-900/40"
                          : "border-primary-light/20 bg-white hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                          chapterNavigation.prev === null
                            ? "text-dark-900/45"
                            : "text-dark-900/55 group-hover:text-primary"
                        }`}
                      >
                        Oldingi bob
                      </span>
                      <span className="w-full break-words text-base font-bold leading-snug text-dark-900 sm:text-[1.05rem]">
                        {chapterNavigation.prev !== null
                          ? formatChapterCardTitle(chapterNavigation.prev, prevTitle)
                          : "Oldingi bob mavjud emas"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        chapterNavigation.next !== null ? goToChapter(chapterNavigation.next) : undefined
                      }
                      disabled={chapterNavigation.next === null}
                      className={`flex w-full flex-col items-start gap-2.5 rounded-2xl px-4 py-3.5 text-left transition-all sm:px-5 sm:py-4 md:items-end md:text-right ${
                        chapterNavigation.next === null
                          ? "cursor-not-allowed border border-primary-light/20 bg-white/60 text-dark-900/40"
                          : "translate-y-0 bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-1 hover:bg-primary-dark"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          chapterNavigation.next === null ? "text-dark-900/45" : "text-white/70"
                        }`}
                      >
                        Keyingi bob
                      </span>
                      <span className="w-full break-words text-base font-bold leading-snug sm:text-[1.05rem]">
                        {chapterNavigation.next !== null
                          ? formatChapterCardTitle(chapterNavigation.next, nextTitle)
                          : "Keyingi bob mavjud emas"}
                      </span>
                    </button>
                  </div>
                </div>

              </>
            )}
          </div>
        </main>

      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-primary-light/20 bg-white p-6 shadow-2xl shadow-black/20">
            <h3 className="text-xl font-bold text-dark-900">Yangi chapter qo&apos;shish</h3>
            <p className="mt-1 text-sm text-dark-900/55">
              Order avtomatik qo&apos;shiladi. Faqat sarlavha va matn kiriting.
            </p>

            <form onSubmit={handleCreateChapter} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="create-chapter-title" className="text-sm font-medium text-dark-900/70">
                  Sarlavha
                </label>
                <input
                  id="create-chapter-title"
                  value={createTitle}
                  onChange={(event) => setCreateTitle(event.target.value)}
                  className="h-11 w-full rounded-xl border border-primary-light/25 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-chapter-content" className="text-sm font-medium text-dark-900/70">
                  Matn
                </label>
                <RichTextEditor
                  value={createContent}
                  onChange={setCreateContent}
                  placeholder="Chapter matnini kiriting..."
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-dark-900/70">
                <input
                  type="checkbox"
                  checked={createPreview}
                  onChange={(event) => setCreatePreview(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Preview sifatida ochiq bo&apos;lsin
              </label>

              {createError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {createError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-primary-light/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-dark-900/65 transition hover:bg-primary/10 hover:text-dark-900"
                  disabled={creating}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? "Saqlanmoqda..." : "Chapter qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-primary-light/20 bg-white p-6 shadow-2xl shadow-black/20">
            <h3 className="text-xl font-bold text-dark-900">Chapter ni tahrirlash</h3>
            <p className="mt-1 text-sm text-dark-900/55">
              O&apos;zgarishlar saqlangach, shu sahifada yangilangan matn ko&apos;rinadi.
            </p>

            <form onSubmit={handleEditChapter} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-chapter-title" className="text-sm font-medium text-dark-900/70">
                  Sarlavha
                </label>
                <input
                  id="edit-chapter-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="h-11 w-full rounded-xl border border-primary-light/25 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-chapter-content" className="text-sm font-medium text-dark-900/70">
                  Matn
                </label>
                <RichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Chapter matnini kiriting..."
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-dark-900/70">
                <input
                  type="checkbox"
                  checked={editPreview}
                  onChange={(event) => setEditPreview(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Preview holatida bo&apos;lsin
              </label>

              {editError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {editError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-primary-light/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-dark-900/65 transition hover:bg-primary/10 hover:text-dark-900"
                  disabled={editing}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editing ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
