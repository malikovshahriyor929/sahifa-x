"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

type SessionProviderClientProps = {
  session: Session | null;
  children: ReactNode;
};

export default function SessionProviderClient({
  session,
  children,
}: SessionProviderClientProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
