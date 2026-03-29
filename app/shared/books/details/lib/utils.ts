import { DEFAULT_BOOK_COVER } from "@/app/shared/dashboard/constants";
import type {
  Author,
  Chapter,
  DetailsApiRecord,
} from "@/app/shared/books/details/types";

type UnknownRecord = Record<string, unknown>;

export type NormalizedBookDetails = {
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
  isAuthor: boolean;
  isSaved: boolean;
  savesCount: number;
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

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : null;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return null;
}

function getRecordFromCandidates(payload: unknown): DetailsApiRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const record = payload as DetailsApiRecord;
  const candidates = [record.data, record.book, record.item, record.result];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate as DetailsApiRecord;
    }
  }

  return record;
}

export function normalizeBookDetails(
  payload: unknown,
): NormalizedBookDetails | null {
  const item = getRecordFromCandidates(payload);
  if (!item) {
    return null;
  }

  const id = toText(item.id ?? item._id);
  if (!id) {
    return null;
  }

  const title = toText(item.title ?? item.name) ?? "Nomsiz asar";
  const authorName =
    toText(item.author ?? item.authorName) ?? "Noma'lum muallif";
  const coverImage =
    toText(item.coverUrl ?? item.cover ?? item.image) ?? DEFAULT_BOOK_COVER;
  const category = toText(item.category ?? item.genre) ?? "Boshqa";
  const language = toText(item.language) ?? "Uzbek";
  const status = toText(item.status) ?? "Published";
  const rating = toNumber(item.rating) ?? 4.5;
  const voteCount =
    toNumber(
      item.voteCount ??
        item.votesCount ??
        item.reviewsCount ??
        item.ratingsCount,
    ) ?? 0;
  const rentPriceCents =
    typeof item.rentPriceCents === "number"
      ? item.rentPriceCents
      : toNumber(item.rentPriceCents);
  const rentDurationDays =
    typeof item.rentDurationDays === "number"
      ? item.rentDurationDays
      : toNumber(item.rentDurationDays);
  const currency = toText(item.currency) ?? "UZS";
  const description =
    toText(item.description) ?? "Ushbu kitob uchun izoh hozircha mavjud emas.";
  const authorId = toText(item.authorId);
  const isAuthor = toBoolean(item.is_Author ?? item.isAuthor) ?? false;
  const isSaved =
    toBoolean(item.is_saved ?? item.isSaved ?? item.saved) ?? false;
  const savesCount = Array.isArray(item.saves)
    ? item.saves.length
    : toNumber(item.saves ?? item.savedCount ?? item.savesCount) ?? 0;

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
    rentDurationDays:
      typeof rentDurationDays === "number" ? rentDurationDays : null,
    authorName,
    authorId,
    isSaved,
    savesCount,
    isAuthor,
  };
}

export function getBookSavedState(
  payload: unknown,
  fallback: boolean,
): boolean {
  const source = getRecordFromCandidates(payload);
  if (!source) {
    return fallback;
  }

  return (
    toBoolean(source.is_saved ?? source.isSaved ?? source.saved) ?? fallback
  );
}

export function formatDate(value: unknown): string {
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

export function formatRentalPrice(
  cents: number | null,
  currency: string,
  locale: string,
): string {
  if (typeof cents !== "number") {
    return `0 ${currency}`;
  }

  const amount = cents / 100;

  try {
    const localeTag =
      locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ";
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function normalizeChapters(payload: unknown): Chapter[] {
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

export function getFirstChapterOrder(chapters: Chapter[]): number | null {
  if (!chapters.length) {
    return null;
  }

  return chapters[0].order;
}

export function getCreatedChapterOrder(payload: unknown): number | null {
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

export function normalizeAuthor(
  payload: unknown,
  fallbackName: string,
  fallbackAuthorId: string | null,
): Author {
  const record = getRecordFromCandidates(payload);
  const source = record ?? {};

  const name =
    toText(
      (source as UnknownRecord).name ??
        (source as UnknownRecord).fullName ??
        (source as UnknownRecord).authorName,
    ) ?? fallbackName;
  const authorId =
    fallbackAuthorId ??
    toText(
      (source as UnknownRecord).authorId ??
        (source as UnknownRecord).id ??
        (source as UnknownRecord)._id,
    );
  const avatar =
    toText(
      (source as UnknownRecord).avatarUrl ??
        (source as UnknownRecord).avatar ??
        (source as UnknownRecord).image,
    ) ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=0f8d8f&color=fff&bold=true`;
  const bookCount =
    toNumber(
      (source as UnknownRecord).bookCount ??
        (source as UnknownRecord).booksCount,
    ) ?? 0;
  const bio =
    toText(
      (source as UnknownRecord).bio ?? (source as UnknownRecord).description,
    ) ?? "Fantastika va sarguzasht janrlarida ijod qiluvchi muallif.";

  return {
    name,
    authorId,
    role: "Muallif",
    bookCount,
    avatar,
    bio,
    isSaved: toBoolean(source.is_saved ?? source.isSaved ?? source.saved) ?? false,
  };
}
