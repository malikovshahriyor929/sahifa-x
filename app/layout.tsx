import type { Metadata } from "next";
import "./globals.css";
import { geistMono, interSans } from "./fonts";
import { defaultLocale } from "@/types/auth";
import { getSiteMetadataBase, seoConfig } from "./seo";

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  applicationName: seoConfig.siteName,
  title: {
    default: seoConfig.siteName,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  keywords: [
    "Sahifa X",
    "kitob",
    "o'qish",
    "yozish",
    "ebook",
    "adabiyot",
    "uzbek books",
  ],
  category: "books",
  alternates: {
    canonical: `/${defaultLocale}`,
    languages: {
      uz: "/uz",
      en: "/en",
      ru: "/ru",
    },
  },
  icons: {
    icon: [
      { url: "/logo-round.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
    shortcut: ["/logo-round.svg"],
  },
  openGraph: {
    title: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    images: [
      {
        url: "/logo-round.svg",
        width: 380,
        height: 380,
        alt: "Sahifa X logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    images: ["/logo-round.svg"],
  },
  verification: {
    google: "Hv8lqnEoVwMsdjC3-JelQnl29UF2i74Hy--Xa_bcj1g",
  },
  robots: {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale}>
      <body
        className={`${interSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
