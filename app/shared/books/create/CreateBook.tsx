"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdCalendarToday,
  MdCheckCircle,
  MdChevronRight,
  MdEditSquare,
  MdMonetizationOn,
  MdPublic,
  MdSave,
  MdSchedule,
  MdShoppingCart,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBook, getLookup, uploadFile } from "@/server/api";
import { CoverPreview } from "./components/CoverPreview";
import type { BookFormState, LookupOption, MonetizationType } from "./types";

type UnknownRecord = Record<string, unknown>;

const FALLBACK_CATEGORIES: LookupOption[] = [
  { label: "Fantasy", value: "Fantasy" },
  { label: "Drama", value: "Drama" },
  { label: "Romance", value: "Romance" },
  { label: "Adventure", value: "Adventure" },
];

const LANGUAGE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "O'zbek", value: "uz" },
  { label: "English", value: "en" },
  { label: "Русский", value: "ru" },
];

const INITIAL_STATE: BookFormState = {
  title: "",
  description: "",
  categoryValue: "",
  language: "",
  status: "PUBLISHED",
  monetizationType: "FREE",
  rentPrice: "0",
  rentDurationDays: 0,
  buyPrice: "",
  currency: "",
  coverUrl: "",
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

function parsePrice(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLookupOptions(payload: unknown): LookupOption[] {
  if (!isRecord(payload)) {
    return FALLBACK_CATEGORIES;
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  const rawList =
    (Array.isArray(data.category) ? data.category : null) ??
    (Array.isArray(data.categories) ? data.categories : null) ??
    [];

  const options = rawList
    .filter((item): item is UnknownRecord => isRecord(item))
    .map((item) => {
      const label = toText(item.label ?? item.name);
      const value = toText(item.value ?? item.id) ?? label;
      if (!label || !value) {
        return null;
      }
      return { label, value };
    })
    .filter((item): item is LookupOption => Boolean(item));

  if (options.length === 0) {
    return FALLBACK_CATEGORIES;
  }

  return options;
}

function resolveUploadedUrl(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const directUrl = toText(payload.url);
  if (directUrl) {
    return directUrl;
  }

  if (isRecord(payload.data)) {
    return toText(payload.data.url);
  }

  return null;
}

function resolveCreatedBookId(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const direct = toText(payload.id);
  if (direct) {
    return direct;
  }

  const nested = isRecord(payload.data) ? payload.data : isRecord(payload.book) ? payload.book : null;
  if (!nested) {
    return null;
  }

  return toText(nested.id ?? nested._id);
}

export default function CreateBook() {
  const params = useParams<{ locale?: string }>();
  const router = useRouter();
  const locale = typeof params?.locale === "string" ? params.locale : "uz";

  const [formData, setFormData] = useState<BookFormState>(INITIAL_STATE);
  const [categories, setCategories] = useState<LookupOption[]>(FALLBACK_CATEGORIES);
  const [loadingLookup, setLoadingLookup] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLookup() {
      setLoadingLookup(true);
      try {
        const payload = await getLookup();
        if (!active) {
          return;
        }
        const options = normalizeLookupOptions(payload);
        setCategories(options);
        setFormData((prev) => {
          if (options.some((item) => item.value === prev.categoryValue)) {
            return prev;
          }
          return { ...prev, categoryValue: options[0]?.value ?? prev.categoryValue };
        });
      } catch {
        if (!active) {
          return;
        }
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        if (active) {
          setLoadingLookup(false);
        }
      }
    }

    loadLookup();

    return () => {
      active = false;
    };
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    const fromLookup = categories.find((item) => item.value === formData.categoryValue);
    return fromLookup?.label ?? formData.categoryValue;
  }, [categories, formData.categoryValue]);

  const monetizationOptions: Array<{ type: MonetizationType; icon: ReactNode; label: string }> = [
    { type: "FREE", icon: <MdPublic />, label: "Bepul" },
    { type: "SELL", icon: <MdShoppingCart />, label: "Sotuv" },
    { type: "RENT_ONLY", icon: <MdSchedule />, label: "Faqat ijara" },
  ];

  function handleChange<K extends keyof BookFormState>(field: K, value: BookFormState[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(file: File) {
    setError(null);
    setSuccessMessage(null);
    setUploadingCover(true);

    try {
      const payload = await uploadFile(file);
      const uploadedUrl = resolveUploadedUrl(payload);
      if (!uploadedUrl) {
        throw new Error("Upload javobidan url topilmadi.");
      }
      handleChange("coverUrl", uploadedUrl);
    } catch {
      setError("Rasmni yuklab bo'lmadi. Qaytadan urinib ko'ring.");
    } finally {
      setUploadingCover(false);
    }
  }

  function handleImageRemove() {
    handleChange("coverUrl", null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    const categoryFromLookup = categories.find((item) => item.value === formData.categoryValue);
    const category = categoryFromLookup?.label ?? formData.categoryValue.trim();
    const rentPrice = parsePrice(formData.rentPrice);
    const buyPrice = parsePrice(formData.buyPrice);

    if (!formData.title.trim()) {
      setError("Kitob nomini kiriting.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Kitob tavsifini kiriting.");
      return;
    }
    if (!category) {
      setError("Janrni tanlang.");
      return;
    }
    if (!formData.coverUrl) {
      setError("Muqova rasmini yuklang.");
      return;
    }
    if (formData.monetizationType === "RENT_ONLY" && !rentPrice) {
      setError("Ijara narxini to'g'ri kiriting.");
      return;
    }
    if (formData.monetizationType === "SELL" && !buyPrice) {
      setError("Sotuv narxini to'g'ri kiriting.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = await createBook({
        title: formData.title.trim(),
        description: formData.description.trim(),
        coverUrl: formData.coverUrl,
        language: formData.language,
        category,
        status: formData.status,
        monetization: formData.monetizationType,
        buyPriceCents: formData.monetizationType === "SELL" ? buyPrice : null,
        rentPriceCents: formData.monetizationType === "RENT_ONLY" ? rentPrice : null,
        currency: formData.currency,
        rentDurationDays:
          formData.monetizationType === "RENT_ONLY"
            ? Math.max(1, Number(formData.rentDurationDays) || 1)
            : null,
      });

      const createdId = resolveCreatedBookId(payload);
      setSuccessMessage("Kitob muvaffaqiyatli yaratildi.");

      if (createdId) {
        router.push(`/${locale}/books/${encodeURIComponent(createdId)}`);
        return;
      }
    } catch {
      setError("Kitobni yaratib bo'lmadi. Ma'lumotlarni tekshirib qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-dark-900/55">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${locale}`)}
          className="gap-1 px-0 hover:text-primary"
        >
          <MdArrowBack />
          Dashboard
        </Button>
        <MdChevronRight className="text-xs" />
        <span className="font-medium text-dark-900">Yangi kitob</span>
      </div>

      <div className="flex flex-col gap-1 border-b border-primary-light/20 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-dark-900">Yangi kitob yaratish</h1>
        <p className="text-sm text-dark-900/55 sm:text-base">
          Kitob ma&apos;lumotlarini kiriting va saqlang. 
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 border-b border-primary-light/20">
              <MdEditSquare className="text-2xl text-primary" />
              <CardTitle>Asosiy ma&apos;lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="book-title">Kitob nomi</Label>
                <Input
                  id="book-title"
                  value={formData.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  placeholder="Kitob nomini kiriting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-description">Qisqacha tavsif</Label>
                <Textarea
                  id="book-description"
                  rows={5}
                  maxLength={500}
                  value={formData.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  placeholder="Kitob haqida qisqacha ma'lumot..."
                  className="resize-y"
                />
                <p className="text-right text-xs text-dark-900/45">{formData.description.length}/500</p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="book-category">Janr</Label>
                  <Select
                    id="book-category"
                    value={formData.categoryValue}
                    onChange={(event) => handleChange("categoryValue", event.target.value)}
                  >
                    {categories.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {loadingLookup ? <p className="text-xs text-dark-900/45">Janrlar yuklanmoqda...</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="book-language">Til</Label>
                  <Select
                    id="book-language"
                    value={formData.language}
                    onChange={(event) => handleChange("language", event.target.value)}
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 border-b border-primary-light/20">
              <MdMonetizationOn className="text-2xl text-primary" />
              <CardTitle>Monetizatsiya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="book-status">Status</Label>
                <Select
                  id="book-status"
                  value={formData.status}
                  onChange={(event) => handleChange("status", event.target.value as BookFormState["status"])}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {monetizationOptions.map((option) => {
                  const active = formData.monetizationType === option.type;
                  return (
                    <Button
                      key={option.type}
                      type="button"
                      variant={active ? "secondary" : "outline"}
                      onClick={() => handleChange("monetizationType", option.type)}
                      aria-pressed={active}
                      className={`relative h-auto min-h-28 flex-col items-center justify-center gap-2 p-4 text-center ${
                        active
                          ? "border border-primary/35 bg-primary/8 text-primary hover:bg-primary/12"
                          : "border border-primary-light/25 bg-white text-dark-900/60 hover:border-primary/40 hover:bg-white"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                      {active ? (
                        <span className="absolute right-2 top-2 text-primary">
                          <MdCheckCircle />
                        </span>
                      ) : null}
                    </Button>
                  );
                })}
              </div>

              {formData.monetizationType === "RENT_ONLY" ? (
                <div className="grid grid-cols-1 gap-5 border-t border-primary-light/20 pt-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rent-price">Ijara narxi</Label>
                    <div className="relative">
                      <Input
                        id="rent-price"
                        value={formData.rentPrice}
                        onChange={(event) => handleChange("rentPrice", event.target.value)}
                        placeholder="30,062"
                        className="pr-14"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-900/45">
                        UZS
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent-duration">Ijara muddati (kun)</Label>
                    <div className="relative">
                      <Input
                        id="rent-duration"
                        type="number"
                        min={1}
                        value={formData.rentDurationDays}
                        onChange={(event) =>
                          handleChange("rentDurationDays", Math.max(1, Number(event.target.value) || 1))
                        }
                        className="pr-10"
                      />
                      <MdCalendarToday className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dark-900/45" />
                    </div>
                  </div>
                </div>
              ) : null}

              {formData.monetizationType === "SELL" ? (
                <div className="border-t border-primary-light/20 pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="buy-price">Sotuv narxi</Label>
                    <div className="relative">
                      <Input
                        id="buy-price"
                        value={formData.buyPrice}
                        onChange={(event) => handleChange("buyPrice", event.target.value)}
                        placeholder="0"
                        className="pr-14"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-900/45">
                        UZS
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <CoverPreview
            title={formData.title}
            genre={selectedCategoryLabel}
            image={formData.coverUrl}
            uploading={uploadingCover}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>

        <div className="col-span-12 mt-2 border-t border-primary-light/20 pt-6">
          {error ? (
            <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {error}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="text-dark-900/65 hover:text-dark-900"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingCover}
              className="px-6 text-sm font-bold"
            >
              <MdSave className="text-lg" />
              {submitting ? "Saqlanmoqda..." : "Saqlash va davom etish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
