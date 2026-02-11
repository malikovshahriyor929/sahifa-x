import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { CURRENT_USER } from "@/app/shared/dashboard/constants";
import Header from "@/app/shared/dashboard/components/Header";
import Sidebar from "@/app/shared/dashboard/components/Sidebar";
import type { CurrentUser } from "@/app/shared/dashboard/types";
import type { LocaleParams } from "@/types/auth";

type MainLayoutProps = {
  children: React.ReactNode;
  params: Promise<LocaleParams>;
};

export default async function MainLayout({ children, params }: MainLayoutProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  const safeUser: CurrentUser = {
    name: session?.user?.name ?? CURRENT_USER.name,
    role: CURRENT_USER.role,
    avatarUrl: session?.user?.image ?? CURRENT_USER.avatarUrl,
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-dark-900 font-sans">
      <Header currentUser={safeUser} locale={locale} />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar locale={locale} />
        <main className="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
