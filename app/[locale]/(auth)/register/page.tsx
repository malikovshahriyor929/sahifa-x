import RegisterForm from "@/app/shared/components/RegisterForm";
import type { LocaleParams } from "@/types/auth";

type RegisterPageProps = {
  params: Promise<LocaleParams>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  return <RegisterForm locale={locale} />;
}
