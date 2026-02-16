"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MdAdd, MdAutoStories, MdLocalFireDepartment, MdStar } from "react-icons/md";
import { getMyBooks, getProfile } from "@/server/api";
import { DEFAULT_BOOK_COVER } from "@/app/shared/dashboard/constants";
import type { Achievement, Activity, ProfileBook, ProfileBookStatus, ProfileUser } from "./types";
import ProfileHeader from "./components/ProfileHeader";
import Tabs from "./components/Tabs";
import BookCard from "./components/BookCard";
import Achievements from "./components/Achievements";
import ActivityFeed from "./components/ActivityFeed";

type ProfileAppProps = {
  locale: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
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

function formatRelative(value: unknown): string {
  const raw = toText(value);
  if (!raw) {
    return "Hozirgina";
  }
  const time = new Date(raw).getTime();
  if (Number.isNaN(time)) {
    return "Hozirgina";
  }

  const diffMs = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Hozirgina";
  }
  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))} daqiqa oldin`;
  }
  if (diffMs < day) {
    return `${Math.max(1, Math.floor(diffMs / hour))} soat oldin`;
  }
  return `${Math.max(1, Math.floor(diffMs / day))} kun oldin`;
}

function normalizeProfile(payload: unknown, works: number): ProfileUser {
  const source =
    isRecord(payload) && isRecord(payload.data)
      ? payload.data
      : payload;
  const data = isRecord(source) ? source : {};

  const id = toText(data.id ?? data._id, "unknown");
  const email = toText(data.email, "");
  const name = toText(data.name, email || "Foydalanuvchi");
  const role = toText(data.role, "USER");
  const createdAtText = formatDate(data.createdAt);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0f8d8f&color=fff&bold=true`;

  return {
    id,
    email,
    name,
    handle: email ? email.split("@")[0] : name.toLowerCase().replace(/\s+/g, ""),
    avatarUrl,
    bio: `${role} sifatida ro'yxatdan o'tgan. Profil yaratilgan sana: ${createdAtText}.`,
    role,
    isPremium: false,
    stats: {
      works,
      followers: "0",
      likes: "0",
    },
  };
}

function normalizeMyBooks(payload: unknown, locale: string): { books: ProfileBook[]; total: number } {
  if (!isRecord(payload)) {
    return { books: [], total: 0 };
  }

  const rawData = Array.isArray(payload.data)
    ? payload.data
    : isRecord(payload.data) && Array.isArray(payload.data.data)
      ? payload.data.data
      : [];
  const meta = isRecord(payload._meta)
    ? payload._meta
    : isRecord(payload.data) && isRecord(payload.data._meta)
      ? payload.data._meta
      : {};
  const total = toNumber(meta.total) ?? rawData.length;

  const books = rawData
    .filter((item): item is UnknownRecord => isRecord(item))
    .map((item, index) => {
      const id = toText(item.id ?? item._id, `book-${index + 1}`);
      const statusRaw = toText(item.status, "DRAFT").toUpperCase();
      const status: ProfileBookStatus = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

      return {
        id,
        title: toText(item.title, `Nomsiz asar ${index + 1}`),
        genre: toText(item.category, "Boshqa"),
        coverUrl: toText(item.coverUrl, DEFAULT_BOOK_COVER),
        status,
        views: "0",
        comments: 0,
        lastEdited: `Oxirgi tahrir: ${formatDate(item.updatedAt ?? item.createdAt)}`,
        updatedAt: toText(item.updatedAt ?? item.createdAt),
        href: `/${locale}/books/${encodeURIComponent(id)}`,
      };
    });

  return { books, total };
}

function buildAchievements(totalBooks: number): Achievement[] {
  return [
    {
      id: "achievement-1",
      title: "Ilk qadam",
      subtitle: `${Math.max(totalBooks, 1)} ta asar yaratildi`,
      icon: <MdAutoStories className="text-lg text-white" />,
      colorClass: "from-emerald-500 to-teal-500",
    },
    {
      id: "achievement-2",
      title: "Faol muallif",
      subtitle: "5 ta asarga yeting",
      icon: <MdLocalFireDepartment className="text-lg text-white" />,
      colorClass: "from-orange-500 to-amber-500",
      opacity: totalBooks < 5,
    },
    {
      id: "achievement-3",
      title: "Top ijodkor",
      subtitle: "10 ta asar chop eting",
      icon: <MdStar className="text-lg text-white" />,
      colorClass: "from-indigo-500 to-violet-500",
      opacity: totalBooks < 10,
    },
  ];
}

function buildActivities(books: ProfileBook[]): Activity[] {
  if (books.length === 0) {
    return [
      {
        id: "activity-empty",
        text: "Hozircha faoliyat mavjud emas",
        time: "Hozir",
        dotColor: "bg-primary-light",
      },
    ];
  }

  return books.slice(0, 5).map((book, index) => ({
    id: `activity-${book.id}`,
    text: `"${book.title}" asari yangilandi`,
    time: formatRelative(book.updatedAt),
    dotColor:
      index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-emerald-500" : "bg-amber-500",
  }));
}

export default function ProfileApp({ locale }: ProfileAppProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [books, setBooks] = useState<ProfileBook[]>([]);
  const [worksTotal, setWorksTotal] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [profilePayload, myBooksPayload] = await Promise.all([
          getProfile(),
          getMyBooks({ page: 1, per_page: 10 }),
        ]);

        if (!active) {
          return;
        }

        const normalizedBooks = normalizeMyBooks(myBooksPayload, locale);
        const normalizedUser = normalizeProfile(profilePayload, normalizedBooks.total);

        setBooks(normalizedBooks.books);
        setWorksTotal(normalizedBooks.total);
        setUser(normalizedUser);
      } catch {
        if (!active) {
          return;
        }
        setError("Profil ma'lumotlarini yuklab bo'lmadi.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [locale]);

  const achievements = useMemo(() => buildAchievements(worksTotal), [worksTotal]);
  const activities = useMemo(() => buildActivities(books), [books]);

  if (loading) {
    return (
      <main className="min-h-screen flex-1 overflow-y-auto bg-background">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-56 animate-pulse rounded-3xl bg-primary/10" />
          <div className="h-12 animate-pulse rounded-2xl bg-primary/10" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-primary/10 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-primary/10" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error ?? "Profil topilmadi."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex-1 overflow-y-auto bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <ProfileHeader user={user} />
        <Tabs />

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-xl font-bold text-dark-900">Chop etilgan asarlar</h3>
              <div className="flex gap-2">
                <select className="block rounded-lg border border-primary-light/30 bg-white p-2.5 text-sm text-dark-900/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/25">
                  <option>Barchasi</option>
                  <option>Chop etilgan</option>
                  <option>Qoralamalar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}

              <div className="group relative flex h-full flex-col gap-3">
                <Link
                  href={`/${locale}/books`}
                  className="relative flex aspect-[2/3] w-full flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-dashed border-primary-light/35 transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-dark-900/55 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                    <MdAdd className="text-3xl" />
                  </div>
                  <span className="text-sm font-bold text-dark-900/60 group-hover:text-dark-900">
                    Yangi asar qo&apos;shish
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-4 xl:col-span-3">
            <Achievements items={achievements} locale={locale} />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </main>
  );
}
