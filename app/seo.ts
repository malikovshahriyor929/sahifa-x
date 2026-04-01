import type { Metadata } from "next";
import { defaultLocale, supportedLocales, type AppLocale } from "@/types/auth";

const siteName = "Sahifa X";
const defaultDescription = "Sahifa X kitob o'qish, yozish va ulashish platformasi.";

function normalizeUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getSiteUrl(): string {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.NEXTAUTH_URL) ??
    "http://localhost:3000"
  );
}

export function getSiteMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function localePath(locale: string, path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function getLanguageAlternates(path = ""): Record<string, string> {
  return Object.fromEntries(
    supportedLocales.map((locale) => [locale, localePath(locale, path)])
  );
}

type BuildMetadataInput = {
  title: string;
  description?: string;
  locale?: AppLocale | string;
  path?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = defaultDescription,
  locale = defaultLocale,
  path = "",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const canonical = localePath(locale, path);
  const languages = getLanguageAlternates(path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale,
      type: "website",
      images: [
        {
          url: "/logo-round.svg",
          width: 380,
          height: 380,
          alt: `${siteName} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/logo-round.svg"],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
  };
}

export const seoConfig = {
  siteName,
  defaultDescription,
};
