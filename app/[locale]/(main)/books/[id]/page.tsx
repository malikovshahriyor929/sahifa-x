"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSessionUserId } from "@/app/shared/auth/getSessionUserId";
import { DEFAULT_BOOK_COVER } from "@/app/shared/dashboard/constants";
import { normalizeBooks } from "@/app/shared/dashboard/utils";
import RichTextEditor, {
  quillHtmlToPlainText,
} from "@/app/shared/books/editor/RichTextEditor";
import {
  createBookChapter,
  getBookAuthorDetails,
  getBookChapters,
  getBookDetails,
  getBooks,
} from "@/server/api";
import { BookHero } from "@/app/shared/books/details/components/BookHero";
import { ChapterList } from "@/app/shared/books/details/components/ChapterList";
import { Sidebar } from "@/app/shared/books/details/components/Sidebar";
import type { Author, Book, Chapter, SimilarBook } from "@/app/shared/books/details/types";

type UnknownRecord = Record<string, unknown>;
type ActiveTab = "description" | "chapters" | "comments";

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

function getRecordFromCandidates(payload: unknown): UnknownRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const record = payload as UnknownRecord;
  const candidates = [record.data, record.book, record.item, record.result];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  return record;
}

type NormalizedBookDetails = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  language: string;
  status: string;
  rating: number;
  voteCount: number;
  rentPriceCents: number | null;
  currency: string;
  rentDurationDays: number | null;
  authorName: string;
  authorId: string | null;
};

function normalizeBookDetails(payload: unknown): NormalizedBookDetails | null {
  const item = getRecordFromCandidates(payload);
  if (!item) {
    return null;
  }

  const id = toText(item.id ?? item._id);
  if (!id) {
    return null;
  }

  const title = toText(item.title ?? item.name) ?? "Nomsiz asar";
  const authorName = toText(item.author ?? item.authorName) ?? "Noma'lum muallif";
  const coverImage = toText(item.coverUrl ?? item.cover ?? item.image) ?? DEFAULT_BOOK_COVER;
  const category = toText(item.category ?? item.genre) ?? "Boshqa";
  const language = toText(item.language) ?? "Uzbek";
  const status = toText(item.status) ?? "Published";
  const rating = toNumber(item.rating) ?? 4.5;
  const voteCount =
    toNumber(item.voteCount ?? item.votesCount ?? item.reviewsCount ?? item.ratingsCount) ?? 0;
  const rentPriceCents =
    typeof item.rentPriceCents === "number" ? item.rentPriceCents : toNumber(item.rentPriceCents);
  const rentDurationDays =
    typeof item.rentDurationDays === "number"
      ? item.rentDurationDays
      : toNumber(item.rentDurationDays);
  const currency = toText(item.currency) ?? "UZS";
  const description =
    toText(item.description) ?? "Ushbu kitob uchun izoh hozircha mavjud emas.";
  const authorId = toText(item.authorId);

  return {
    id,
    title,
    description,
    coverImage,
    category,
    language,
    status,
    rating,
    voteCount,
    rentPriceCents: typeof rentPriceCents === "number" ? rentPriceCents : null,
    currency,
    rentDurationDays: typeof rentDurationDays === "number" ? rentDurationDays : null,
    authorName,
    authorId,
  };
}

function formatDate(value: unknown): string {
  const raw = toText(value);
  if (!raw) {
    return "Noma'lum sana";
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "Noma'lum sana";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatRentalPrice(cents: number | null, currency: string, locale: string): string {
  if (typeof cents !== "number") {
    return `0 ${currency}`;
  }

  const amount = cents / 100;

  try {
    const localeTag = locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ";
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function normalizeChapters(payload: unknown): Chapter[] {
  if (!isRecord(payload)) {
    return [];
  }

  const maybeData = (payload as UnknownRecord).data;
  if (!Array.isArray(maybeData)) {
    return [];
  }

  return maybeData
    .filter((item): item is UnknownRecord => isRecord(item))
    .map((item, index) => {
      const order = toNumber(item.order) ?? index + 1;
      const isPreview =
        typeof item.isPreview === "boolean"
          ? item.isPreview
          : typeof item.is_preview === "boolean"
            ? item.is_preview
            : true;

      return {
        id: toText(item.id ?? item._id) ?? `chapter-${order}`,
        order,
        number: String(order).padStart(2, "0"),
        title: toText(item.title) ?? `Chapter ${order}`,
        readTime: `${Math.max(8, Math.round(10 + order * 1.5))} daqiqa o'qish`,
        date: formatDate(item.updatedAt ?? item.createdAt),
        isLocked: !isPreview,
        isFree: Boolean(isPreview),
      };
    })
    .sort((a, b) => a.order - b.order);
}

function getFirstChapterOrder(chapters: Chapter[]): number | null {
  if (!chapters.length) {
    return null;
  }
  return chapters[0].order;
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

function normalizeAuthor(
  payload: unknown,
  fallbackName: string,
  fallbackAuthorId: string | null
): Author {
  const record = getRecordFromCandidates(payload);
  const source = record ?? {};

  const name =
    toText((source as UnknownRecord).name ?? (source as UnknownRecord).fullName ?? (source as UnknownRecord).authorName) ??
    fallbackName;
  const authorId =
    fallbackAuthorId ??
    toText(
      (source as UnknownRecord).authorId ??
        (source as UnknownRecord).id ??
        (source as UnknownRecord)._id
    );
  const avatar =
    toText((source as UnknownRecord).avatarUrl ?? (source as UnknownRecord).avatar ?? (source as UnknownRecord).image) ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0f8d8f&color=fff&bold=true`;
  const bookCount = toNumber((source as UnknownRecord).bookCount ?? (source as UnknownRecord).booksCount) ?? 0;
  const bio =
    toText((source as UnknownRecord).bio ?? (source as UnknownRecord).description) ??
    "Fantastika va sarguzasht janrlarida ijod qiluvchi muallif.";

  return {
    name,
    authorId,
    role: "Muallif",
    bookCount,
    avatar,
    bio,
  };
}

export default function BookDetailsPage() {
  const params = useParams<{ locale?: string; id?: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const locale = typeof params?.locale === "string" ? params.locale : "uz";
  const bookId = typeof params?.id === "string" ? params.id : "";

  const [activeTab, setActiveTab] = useState<ActiveTab>("description");
  const [book, setBook] = useState<Book | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [firstChapterOrder, setFirstChapterOrder] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [newChapterPreview, setNewChapterPreview] = useState(true);
  const [chapterActionError, setChapterActionError] = useState<string | null>(null);
  const [creatingChapter, setCreatingChapter] = useState(false);

  useEffect(() => {
    if (!bookId) {
      setError("Kitob ID topilmadi.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadBook() {
      setLoading(true);
      setError(null);

      try {
        const [detailsPayload, chaptersPayload, booksPayload] = await Promise.all([
          getBookDetails(bookId),
          getBookChapters(bookId, { page: 1, per_page: 100 }),
          getBooks({ page: 1, perPage: 20 }).catch(() => null),
        ]);
        if (!active) {
          return;
        }

        const normalizedDetails = normalizeBookDetails(detailsPayload);
        if (!normalizedDetails) {
          setError("Kitob ma'lumotlari noto'g'ri formatda keldi.");
          setBook(null);
          setAuthor(null);
          setChapters([]);
          setSimilarBooks([]);
          setFirstChapterOrder(null);
          return;
        }

        const [authorPayload, normalizedSimilar] = await Promise.all([
          normalizedDetails.authorId
            ? getBookAuthorDetails(normalizedDetails.authorId).catch(() => null)
            : Promise.resolve(null),
          Promise.resolve(booksPayload ? normalizeBooks(booksPayload) : []),
        ]);
        if (!active) {
          return;
        }

        const normalizedChapters = normalizeChapters(chaptersPayload);
        const firstChapter = getFirstChapterOrder(normalizedChapters);
        const similar = normalizedSimilar
          .filter((item) => item.id !== normalizedDetails.id)
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            title: item.title,
            coverImage: item.coverUrl,
            href: `/${locale}/books/${encodeURIComponent(item.id)}`,
          }));

        const normalizedBook: Book = {
          id: normalizedDetails.id,
          title: normalizedDetails.title,
          coverImage: normalizedDetails.coverImage,
          genres: [normalizedDetails.category, normalizedDetails.language],
          description: normalizedDetails.description,
          rating: normalizedDetails.rating,
          voteCount: normalizedDetails.voteCount,
          status: normalizedDetails.status,
          price: formatRentalPrice(
            normalizedDetails.rentPriceCents,
            normalizedDetails.currency,
            locale
          ),
          rentalPeriod:
            typeof normalizedDetails.rentDurationDays === "number"
              ? `${normalizedDetails.rentDurationDays} kun`
              : "14 kun",
        };

        setBook(normalizedBook);
        setAuthor(
          normalizeAuthor(
            authorPayload,
            normalizedDetails.authorName,
            normalizedDetails.authorId
          )
        );
        setChapters(normalizedChapters);
        setSimilarBooks(similar);
        setFirstChapterOrder(firstChapter);
      } catch {
        if (!active) {
          return;
        }
        setError("Kitob ma'lumotlarini yuklab bo'lmadi.");
        setBook(null);
        setAuthor(null);
        setChapters([]);
        setSimilarBooks([]);
        setFirstChapterOrder(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      active = false;
    };
  }, [bookId, locale]);

  const resolvedFirstChapter = useMemo(() => {
    if (typeof firstChapterOrder === "number") {
      return firstChapterOrder;
    }
    if (chapters.length > 0) {
      return chapters[0].order;
    }
    return 1;
  }, [chapters, firstChapterOrder]);

  const nextChapterOrder = useMemo(() => {
    if (!chapters.length) {
      return 1;
    }
    return Math.max(...chapters.map((chapter) => chapter.order)) + 1;
  }, [chapters]);

  const currentUserId = getSessionUserId(session);
  const isOwner = Boolean(currentUserId && author?.authorId && currentUserId === author.authorId);

  function goToChapter(order: number) {
    if (!bookId) {
      return;
    }
    router.push(`/${locale}/books/${encodeURIComponent(bookId)}/${encodeURIComponent(String(order))}`);
  }

  function goToRead() {
    goToChapter(resolvedFirstChapter);
  }

  function openCreateChapterDialog() {
    setChapterActionError(null);
    setNewChapterTitle(`Chapter ${nextChapterOrder}: `);
    setNewChapterContent("");
    setNewChapterPreview(true);
    setIsCreateChapterOpen(true);
  }

  async function handleCreateChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookId) {
      setChapterActionError("Kitob topilmadi.");
      return;
    }

    if (!newChapterTitle.trim()) {
      setChapterActionError("Chapter sarlavhasini kiriting.");
      return;
    }

    const normalizedContent = quillHtmlToPlainText(newChapterContent);

    if (!normalizedContent.trim()) {
      setChapterActionError("Chapter matnini kiriting.");
      return;
    }

    setChapterActionError(null);
    setCreatingChapter(true);

    try {
      const payload = await createBookChapter(bookId, {
        title: newChapterTitle.trim(),
        content: normalizedContent,
        contentUrl: null,
        isPreview: newChapterPreview,
      });

      let targetOrder = getCreatedChapterOrder(payload);
      if (typeof targetOrder !== "number") {
        const chaptersPayload = await getBookChapters(bookId, { page: 1, per_page: 100 });
        const normalized = normalizeChapters(chaptersPayload);
        if (normalized.length > 0) {
          setChapters(normalized);
          targetOrder = normalized[normalized.length - 1]?.order ?? null;
        }
      }

      if (typeof targetOrder === "number") {
        setIsCreateChapterOpen(false);
        router.push(`/${locale}/books/${encodeURIComponent(bookId)}/${encodeURIComponent(String(targetOrder))}`);
        return;
      }

      setChapterActionError("Chapter yaratildi, lekin order topilmadi. Sahifani yangilang.");
    } catch {
      setChapterActionError("Chapter yaratib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setCreatingChapter(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] px-6 py-8">
        <div className="mx-auto max-w-[1200px] space-y-5">
          <div className="h-6 w-60 animate-pulse rounded bg-primary/10" />
          <div className="h-[520px] animate-pulse rounded-3xl bg-primary/10" />
        </div>
      </div>
    );
  }

  if (error || !book || !author) {
    return (
      <div className="min-h-full bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] px-6 py-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error ?? "Kitob topilmadi."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] text-dark-900">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-6">
        <nav className="flex text-sm font-medium text-dark-900/55">
          <Link href={`/${locale}`} className="transition-colors hover:text-primary">
            Asosiy
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/search`} className="transition-colors hover:text-primary">
            Kitoblar
          </Link>
          <span className="mx-2">/</span>
          <span className="max-w-[220px] truncate text-dark-900">{book.title}</span>
        </nav>
      </div>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="group relative w-full overflow-hidden rounded-[20px] border border-primary-light/20 shadow-2xl shadow-black/10">
              <div className="aspect-[2/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- Remote URLs are dynamic from API payload. */}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-6">
            <BookHero
              book={book}
              author={author}
              onRead={goToRead}
              canManageChapters={isOwner}
              onAddChapter={openCreateChapterDialog}
              creatingChapter={creatingChapter}
            />
          </div>

          <div className="md:col-span-12 lg:col-span-3">
            <Sidebar author={author} similarBooks={similarBooks} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-9">
            <div className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-primary-light/20">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`pb-3 px-1 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === "description"
                    ? "border-b-2 border-primary text-primary"
                    : "text-dark-900/55 hover:text-dark-900"
                }`}
              >
                Tavsif
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chapters")}
                className={`pb-3 px-1 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === "chapters"
                    ? "border-b-2 border-primary text-primary"
                    : "text-dark-900/55 hover:text-dark-900"
                }`}
              >
                Boblar
                <span className="ml-1 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] text-primary">
                  {chapters.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`pb-3 px-1 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === "comments"
                    ? "border-b-2 border-primary text-primary"
                    : "text-dark-900/55 hover:text-dark-900"
                }`}
              >
                Izohlar
                <span className="ml-1 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] text-primary">
                  45
                </span>
              </button>
            </div>

            <div className="min-h-[300px]">
              {activeTab === "description" ? (
                <div className="animate-in fade-in rounded-2xl border border-primary-light/20 bg-white p-6 duration-300 shadow-sm shadow-black/5">
                  <h3 className="mb-4 text-xl font-bold text-dark-900">Annotatsiya</h3>
                  <p className="mb-4 leading-relaxed text-dark-900/75">{book.description}</p>
                  <p className="leading-relaxed text-dark-900/75">
                    Ushbu asar {author.name} tomonidan yozilgan bo&apos;lib, asosiy yo&apos;nalishlari:
                    {" "}
                    {book.genres.join(", ")}.
                  </p>
                </div>
              ) : null}

              {activeTab === "chapters" ? (
                <div className="animate-in fade-in duration-300">
                  <ChapterList
                    chapters={chapters}
                    currentChapter={firstChapterOrder}
                    onSelectChapter={goToChapter}
                  />
                </div>
              ) : null}

              {activeTab === "comments" ? (
                <div className="animate-in fade-in flex flex-col items-center justify-center rounded-2xl border border-primary-light/20 bg-white py-12 text-dark-900/55 duration-300 shadow-sm shadow-black/5">
                  <p>Izohlar yuklanmoqda...</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {isCreateChapterOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-primary-light/20 bg-white p-6 shadow-2xl shadow-black/20">
            <h3 className="text-xl font-bold text-dark-900">Yangi chapter qo&apos;shish</h3>
            <p className="mt-1 text-sm text-dark-900/55">
              Order avtomatik qo&apos;shiladi. Faqat sarlavha va matn kiriting.
            </p>

            <form onSubmit={handleCreateChapter} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-chapter-title" className="text-sm font-medium text-dark-900/70">
                  Sarlavha
                </label>
                <input
                  id="new-chapter-title"
                  value={newChapterTitle}
                  onChange={(event) => setNewChapterTitle(event.target.value)}
                  className="h-11 w-full rounded-xl border border-primary-light/25 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="new-chapter-content" className="text-sm font-medium text-dark-900/70">
                  Matn
                </label>
                <RichTextEditor
                  value={newChapterContent}
                  onChange={setNewChapterContent}
                  placeholder="Chapter matnini kiriting..."
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-dark-900/70">
                <input
                  type="checkbox"
                  checked={newChapterPreview}
                  onChange={(event) => setNewChapterPreview(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Preview sifatida ochiq bo&apos;lsin
              </label>

              {chapterActionError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {chapterActionError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-primary-light/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateChapterOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-dark-900/65 transition hover:bg-primary/10 hover:text-dark-900"
                  disabled={creatingChapter}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creatingChapter}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingChapter ? "Saqlanmoqda..." : "Chapter qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
