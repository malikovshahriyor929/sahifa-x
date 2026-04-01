import type { Metadata } from "next";
import SearchContent from "@/app/shared/SearchContent";
import type { LocaleParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type SearchPageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Qidiruv",
    description: "Sahifa X qidiruv sahifasi orqali kitob, muallif va janrlarni toping.",
    path: "/search",
  });
}

export default function SearchPage() {
  return <SearchContent />;
}
