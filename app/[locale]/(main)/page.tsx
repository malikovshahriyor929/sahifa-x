import Link from "next/link";
import type { LocaleParams } from "@/types/auth";

type HomePageProps = {
  params: Promise<LocaleParams>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <div className="rounded-3xl border border-primary-light/30 bg-white/90 p-8 shadow-[0_35px_100px_-65px_rgba(17,33,33,0.35)] backdrop-blur">
        <div className="mb-6 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-dark">Sahifa X</span>
          <h1 className="text-3xl font-semibold text-dark-900 md:text-4xl">Asosiy boshqaruv paneli</h1>
          <p className="max-w-2xl text-sm text-dark-900/75 md:text-base">
            Bu sahifa `app/[locale]/(main)/layout.tsx` ichidagi umumiy `Header` va `Sidebar` bilan ishlaydi.
            Dashboard ham shu layoutdan foydalanadi.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/login`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary-light/40 bg-white px-5 text-sm font-semibold text-dark-900 transition hover:border-primary"
          >
            Kirish
          </Link>
          <Link
            href={`/${locale}/register`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary-light/40 bg-white px-5 text-sm font-semibold text-dark-900 transition hover:border-primary"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-dark-900/70 md:grid-cols-3">
          <div className="rounded-2xl border border-primary-light/30 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Login
            </p>
            <p className="mt-2 text-dark-900/80">
              Demo email/parol bilan kirish va redirect nazorati.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-light/30 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Register
            </p>
            <p className="mt-2 text-dark-900/80">
              UI tayyor, backend yo&apos;qligi foydalanuvchiga tushuntiriladi.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-light/30 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Middleware
            </p>
            <p className="mt-2 text-dark-900/80">
              Faqat avtorizatsiyadan keyin dashboardga o&apos;tish mumkin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
