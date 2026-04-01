import type { Metadata } from "next";
import RegisterForm from "@/app/shared/components/RegisterForm";
import type { LocaleParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type RegisterPageProps = {
  params: Promise<LocaleParams>;
};

export async function generateMetadata({
  params,
}: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Ro'yxatdan o'tish",
    description: "Sahifa X platformasida yangi hisob yarating.",
    path: "/register",
    noIndex: true,
  });
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  return <RegisterForm locale={locale} />;
}
