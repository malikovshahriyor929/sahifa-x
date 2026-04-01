import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import DashboardApp from "@/app/shared/dashboard/DashboardApp";
import type { LocaleParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type DashboardPageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Dashboard",
    description: "Sahifa X dashboardi: trending kitoblar, yangi asarlar va shaxsiy kutubxonangiz.",
    path: "",
    noIndex: true,
  });
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  return <DashboardApp locale={locale} user={session?.user} />;
}
