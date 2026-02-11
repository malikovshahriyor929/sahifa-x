import LoginForm from "@/app/shared/components/LoginForm";
import type { LocaleParams, LoginPageSearchParams } from "@/types/auth";

type LoginPageProps = {
  params: Promise<LocaleParams>;
  searchParams?: Promise<LoginPageSearchParams>;
};

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackRaw = resolvedSearchParams?.callbackUrl;
  const callbackUrl =
    typeof callbackRaw === "string" ? callbackRaw : `/${locale}/dashboard`;

  return <LoginForm callbackUrl={callbackUrl} locale={locale} />;
}
