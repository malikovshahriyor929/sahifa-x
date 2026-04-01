import type { MetadataRoute } from "next";
import { getSiteUrl } from "./seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/uz/login", "/en/login", "/ru/login", "/uz/register", "/en/register", "/ru/register"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
