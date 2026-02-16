import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import DashboardApp from "@/app/shared/dashboard/DashboardApp";
import type { LocaleParams } from "@/types/auth";

type DashboardPageProps = {
  params: Promise<LocaleParams>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  return <DashboardApp locale={locale} user={session?.user} />;
}
