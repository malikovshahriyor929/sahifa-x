import type { Metadata } from "next";
import CreateBook from "@/app/shared/books/create/CreateBook";
import type { LocaleParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type CreateBookPageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: CreateBookPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Kitob yaratish",
    description: "Sahifa X platformasida yangi kitob yarating va nashrga tayyorlang.",
    path: "/books",
    noIndex: true,
  });
}

export default function CreateBookPage() {
  return <CreateBook />;
}
