"use client";

import { signOut } from "next-auth/react";
import type { SignOutButtonProps } from "@/types/auth";

export default function SignOutButton({ locale }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
      className="inline-flex h-10 items-center justify-center rounded-full border border-primary-light/40 px-4 text-sm font-semibold text-dark-900 transition hover:border-primary hover:text-primary-dark"
    >
      Chiqish
    </button>
  );
}
