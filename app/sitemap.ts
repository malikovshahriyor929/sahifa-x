import type { MetadataRoute } from "next";
import { supportedLocales } from "@/types/auth";
import { getSiteUrl, localePath } from "./seo";

const publicRoutePaths = ["", "/search"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return supportedLocales.flatMap((locale) =>
    publicRoutePaths.map((path) => ({
      url: `${siteUrl}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.8,
    }))
  );
}
