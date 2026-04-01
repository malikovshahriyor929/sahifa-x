import type { Metadata } from "next";
import LoginForm from "@/app/shared/components/LoginForm";
import type { LocaleParams, LoginPageSearchParams } from "@/types/auth";
import { buildPageMetadata } from "@/app/seo";

type LoginPageProps = {
  params: Promise<LocaleParams>;
  searchParams?: Promise<LoginPageSearchParams>;
};

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    title: "Kirish",
    description: "Sahifa X hisobingizga kiring.",
    path: "/login",
    noIndex: true,
  });
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackRaw = resolvedSearchParams?.callbackUrl;
  const callbackUrl =
    typeof callbackRaw === "string" ? callbackRaw : `/${locale}/`;

  return <LoginForm callbackUrl={callbackUrl} locale={locale} />;
}
