import ProfileApp from "@/app/shared/profile/ProfileApp";
import type { LocaleParams } from "@/types/auth";

type ProfilePageProps = {
  params: Promise<LocaleParams>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  return <ProfileApp locale={locale} />;
}

