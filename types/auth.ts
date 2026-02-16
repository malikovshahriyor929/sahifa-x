export const supportedLocales = ["uz", "en", "ru"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const defaultLocale: AppLocale = "uz";

export type LocaleParams = {
  locale: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export type LoginFormProps = {
  callbackUrl: string;
  locale: string;
};

export type RegisterFormProps = {
  locale: string;
};

export type SignOutButtonProps = {
  locale: string;
  className?: string;
};

export type LoginPageSearchParams = {
  callbackUrl?: string | string[];
};

export type DemoAuthUser = {
  id: string;
  name: string;
  email: string;
};
