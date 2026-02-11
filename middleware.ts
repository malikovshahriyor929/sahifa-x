import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  defaultLocale,
  supportedLocales,
  type AppLocale,
} from "@/types/auth";

const legacyPaths = new Set(["/login", "/register", "/dashboard"]);

function isSupportedLocale(locale: string): locale is AppLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

function getLocaleFromPath(pathname: string): AppLocale | null {
  const maybeLocale = pathname.split("/")[1] ?? "";
  return isSupportedLocale(maybeLocale) ? maybeLocale : null;
}

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, nextUrl));
  }

  if (legacyPaths.has(pathname)) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}${search}`, nextUrl)
    );
  }

  const locale = getLocaleFromPath(pathname);
  if (!locale) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const isLoggedIn = Boolean(token);
  const isDashboard =
    pathname === `/${locale}/dashboard` ||
    pathname.startsWith(`/${locale}/dashboard/`);
  const isAuthPage =
    pathname === `/${locale}/login` || pathname === `/${locale}/register`;

  if (isDashboard && !isLoggedIn) {
    const redirectUrl = new URL(`/${locale}/login`, nextUrl);
    redirectUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/:locale/dashboard/:path*",
    "/:locale/login",
    "/:locale/register",
  ],
};
