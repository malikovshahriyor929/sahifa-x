"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { LoginFormProps } from "@/types/auth";

function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 8C8 5.23858 10.2386 3 13 3C15.7614 3 18 5.23858 18 8C18 9.5 17 10.5 15.5 11.5L10.5 14.5C9 15.5 8 16.5 8 18C8 20.7614 10.2386 23 13 23C15.7614 23 18 20.7614 18 18" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21C20 17.6863 16.866 15 13 15H11C7.13401 15 4 17.6863 4 21" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12C2.8 8.2 6.4 6 12 6C17.6 6 21.2 8.2 23 12C21.2 15.8 17.6 18 12 18C6.4 18 2.8 15.8 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3L21 21" />
      <path d="M9.88 9.88C9.33 10.43 9 11.18 9 12C9 13.66 10.34 15 12 15C12.82 15 13.57 14.67 14.12 14.12" />
      <path d="M6.1 6.1C4.2 7.4 2.8 9.3 1.9 12C3.7 15.8 7.4 18 12 18C14.2 18 16.11 17.49 17.74 16.48" />
      <path d="M10.58 5.16C11.04 5.05 11.51 5 12 5C16.6 5 20.3 7.2 22.1 11" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </svg>
  );
}

export default function LoginForm({ callbackUrl, locale }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!response || response.error) {
      setError("Login yoki parol noto'g'ri.");
      setPending(false);
      return;
    }

    router.push(response.url ?? callbackUrl);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-dark-900 text-dark-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-white opacity-5 blur-[100px]" />
        <div className="absolute -right-[10%] top-[40%] h-[60%] w-[40%] rounded-full bg-[#053334] opacity-20 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-12 px-4 sm:px-6 lg:flex-row lg:justify-around lg:gap-24">
        <div className="max-w-lg space-y-8 text-center text-white lg:text-left">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-xl ring-1 ring-white/5 backdrop-blur-md lg:mx-0">
            <Logo className="h-14 w-14 text-white drop-shadow-md" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black leading-tight tracking-tighter drop-shadow-sm md:text-7xl">
              SAHIFA-X
            </h1>
            <h2 className="text-xl font-medium leading-relaxed text-white/90 md:text-2xl">
              Anonim kitob yozish platformasi
            </h2>
          </div>

          <p className="hidden max-w-md text-lg font-light leading-relaxed text-white/80 lg:block">
            O&apos;z g&apos;oyalaringizni erkin ifoda eting. Hech qanday
            cheklovlarsiz, o&apos;z dunyoqarashingizni boshqalar bilan baham
            ko&apos;ring.
          </p>
        </div>

        <div className="group relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/50 bg-[#f8fcfc] p-8 shadow-2xl md:p-10">
          <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

          <div className="mb-8">
            <h3 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
              Xush kelibsiz
            </h3>
            <p className="font-medium text-gray-500">
              Hisobingizga kirish uchun ma&apos;lumotlarni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="ml-1 block text-sm font-semibold text-gray-700"
              >
                Elektron pochta yoki telefon
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <PersonIcon className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Login yoki raqamingizni kiriting"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Parol
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
                >
                  Parolni unutdingizmi?
                </a>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockIcon className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-12 text-base text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Parolingizni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={
                    showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-primary/40 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:bg-primary-light"
            >
              <span>{pending ? "Kutilmoqda..." : "Kirish"}</span>
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#f8fcfc] px-4 font-medium text-gray-500">
                yoki
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hisobingiz yo&apos;qmi?{" "}
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary-dark hover:underline"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
