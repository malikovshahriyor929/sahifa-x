"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { clearRefreshTokenCookie } from "@/app/shared/authCookies";
import { cn } from "@/lib/utils";
import type { SignOutButtonProps } from "@/types/auth";

export default function SignOutButton({ locale, className }: SignOutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);
    clearRefreshTokenCookie();

    try {
      await signOut({
        callbackUrl: `/${locale}/login`,
        redirect: true,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full border border-primary-light/40 px-4 text-sm font-semibold text-dark-900 transition hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {pending ? "Chiqilmoqda..." : "Chiqish"}
    </button>
  );
}
