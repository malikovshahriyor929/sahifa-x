import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import type { LocaleParams } from "@/types/auth";
import { CurrentUser } from "@/types";
import Header from "@/layout/Header";
import Sidebar from "@/layout/Sidebar";
import RefreshTokenTicker from "@/app/shared/RefreshTokenTicker";
import SessionProviderClient from "@/providers/SessionProviderClient";

type MainLayoutProps = {
  children: React.ReactNode;
  params: Promise<LocaleParams>;
};

export default async function MainLayout({
  children,
  params,
}: MainLayoutProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  const safeUser: CurrentUser = {
    name: session?.user?.name ?? session?.user?.email ?? "",
    role: "",
    avatarUrl: session?.user?.image ?? "",
  };

  return (
    <SessionProviderClient session={session}>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-dark-900 font-sans">
        <RefreshTokenTicker />
        <Header currentUser={safeUser} locale={locale} />
        <div className="relative flex flex-1 overflow-hidden">
          <Sidebar locale={locale} />
          <main className="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f3fbfb_0%,#f7fbfb_100%)] scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </SessionProviderClient>
  );
}
