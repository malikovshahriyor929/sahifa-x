import type { Metadata } from "next";
import ProfileApp from "@/app/shared/profile/ProfileApp";
import type { LocaleParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type ProfilePageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Profil",
    description: "Sahifa X profilingiz: asarlar, saqlanganlar va faoliyatlar.",
    path: "/profile",
    noIndex: true,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  return <ProfileApp locale={locale} />;
}
