"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { register as registerRequest } from "@/server/api";
import type { RegisterFormProps } from "@/types/auth";

type RegisterState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

function MailIcon({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7L12 13L21 7" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
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

function UserPlusIcon({ className }: { className?: string }) {
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
      <path d="M15 21V15" />
      <path d="M12 18H18" />
      <path d="M10 7C10 9.20914 8.20914 11 6 11C3.79086 11 2 9.20914 2 7C2 4.79086 3.79086 3 6 3C8.20914 3 10 4.79086 10 7Z" />
      <path d="M2 21C2 17.6863 3.79086 15 6 15C8.20914 15 10 17.6863 10 21" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
      <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.2091 4 16.2091 4.89543 17.6569 6.34315" />
      <path d="M20 4V9H15" />
    </svg>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 9.5 16 10.5 14.5 11.5L9.5 14.5C8 15.5 7 16.5 7 18C7 20.7614 9.23858 23 12 23C14.7614 23 17 20.7614 17 18" />
    </svg>
  );
}

function Branding() {
  return (
    <div className="max-w-lg space-y-6 text-center text-white md:text-left">
      <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/10 transition-transform duration-300 hover:scale-105">
        <Logo className="h-[60px] w-[60px] text-white drop-shadow-md" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight drop-shadow-sm md:text-6xl">
          SAHIFA-X
        </h1>
        <h2 className="max-w-sm text-lg font-medium leading-relaxed text-white/90 md:max-w-none md:text-2xl">
          Anonim kitob yozish platformasi
        </h2>
      </div>

      <p className="hidden max-w-md text-base leading-relaxed text-white/70 md:block">
        O&apos;z g&apos;oyalaringizni erkin ifoda eting. Hech qanday
        cheklovlarsiz, o&apos;z dunyoqarashingizni boshqalar bilan baham
        ko&apos;ring.
      </p>
    </div>
  );
}

export default function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [formData, setFormData] = useState<RegisterState>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Parollar bir xil emas." });
      return;
    }

    if (!formData.agreed) {
      setMessage({
        type: "error",
        text: "Davom etish uchun shartlarga rozilik berish kerak.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await registerRequest({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        isAnonymous,
      });

      setMessage({
        type: "success",
        text: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi.",
      });

      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1000);
    } catch (error) {
      let text = "Ro'yxatdan o'tishda xatolik yuz berdi.";
      if (isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === "string" && apiMessage.trim()) {
          text = apiMessage;
        }
      }
      setMessage({ type: "error", text });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-auto bg-gradient-to-br from-primary via-primary-dark to-dark-900 p-4 selection:bg-primary-light selection:text-white md:overflow-hidden">
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-white opacity-5 blur-[100px]" />
        <div className="absolute -right-[10%] top-[40%] h-[60%] w-[40%] rounded-full bg-[#053334] opacity-20 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 py-8 md:flex-row md:justify-around md:gap-16">
        <div className="flex w-full justify-center md:w-1/2 md:justify-start">
          <Branding />
        </div>

        <div className="flex w-full justify-center md:w-auto">
          <div className="group relative w-full rounded-[20px] bg-[#f6f8f8] p-8 shadow-2xl md:w-[440px]">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />

            <div className="mb-6">
              <h3 className="mb-1 text-2xl font-bold text-gray-900">
                Ro&apos;yxatdan o&apos;tish
              </h3>
              <p className="text-sm text-gray-500">
                Yangi hisob yaratish uchun ma&apos;lumotlarni kiriting
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label
                  className="ml-1 text-sm font-semibold text-gray-700"
                  htmlFor="email"
                >
                  Elektron pochta
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 transition-colors duration-200 group-focus-within:text-primary">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="email@example.com"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="ml-1 text-sm font-semibold text-gray-700"
                  htmlFor="username"
                >
                  Taxallus
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 transition-colors duration-200 group-focus-within:text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    type="text"
                    placeholder="Taxallusingizni kiriting"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <p className="ml-1 text-xs text-gray-500">
                  Platformada shu nom bilan ko&apos;rinasiz
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  className="ml-1 text-sm font-semibold text-gray-700"
                  htmlFor="password"
                >
                  Parol
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 transition-colors duration-200 group-focus-within:text-primary">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 cursor-pointer text-gray-400 transition-colors hover:text-primary"
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

              <div className="space-y-1.5">
                <label
                  className="ml-1 text-sm font-semibold text-gray-700"
                  htmlFor="confirmPassword"
                >
                  Parolni tasdiqlang
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 transition-colors duration-200 group-focus-within:text-primary">
                    <RefreshIcon
                      className={`h-5 w-5 ${
                        formData.confirmPassword ? "text-primary" : ""
                      }`}
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700">
                    Anonim rejim
                  </span>
                  <span className="text-xs text-gray-500">
                    Shaxsingiz sir saqlanadi
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="mt-1 flex items-start gap-3">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    name="agreed"
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 accent-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-xs leading-tight text-gray-600"
                >
                  Men{" "}
                  <a
                    href="#"
                    className="font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
                  >
                    foydalanish shartlari
                  </a>
                  ga roziman.
                </label>
              </div>

              {message ? (
                <p
                  className={`rounded-xl px-3 py-2 text-sm ${
                    message.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {message.text}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !formData.agreed}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-primary/30 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Hisob yaratish</span>
                    <UserPlusIcon className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#f6f8f8] px-2 text-gray-500">yoki</span>
              </div>
            </div>

            <div className="pb-2 text-center">
              <p className="text-sm text-gray-600">
                Hisobingiz bormi?{" "}
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary-dark hover:underline"
                >
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
