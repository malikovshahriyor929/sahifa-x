import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  defaultLocale,
  supportedLocales,
  type AppLocale,
} from "@/types/auth";

const legacyPaths = new Set(["/login", "/register", "/"]);
const TOKEN_REFRESH_ERROR = "RefreshAccessTokenError";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const SESSION_COOKIE_NAMES = [
  REFRESH_TOKEN_COOKIE,
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

type AuthToken = Awaited<ReturnType<typeof getToken>>;
type TokenPair = {
  accessToken: string | null;
  refreshToken: string | null;
};

function isSupportedLocale(locale: string): locale is AppLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

function getLocaleFromPath(pathname: string): AppLocale | null {
  const maybeLocale = pathname.split("/")[1] ?? "";
  return isSupportedLocale(maybeLocale) ? maybeLocale : null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getAccessToken(token: AuthToken): string | null {
  if (!token || typeof token !== "object") {
    return null;
  }
  return asNonEmptyString((token as Record<string, unknown>).accessToken);
}

function getRefreshTokenFromAuthToken(token: AuthToken): string | null {
  if (!token || typeof token !== "object") {
    return null;
  }
  return asNonEmptyString((token as Record<string, unknown>).refreshToken);
}

function hasTokenAuthError(token: AuthToken): boolean {
  if (!token || typeof token !== "object") {
    return false;
  }

  const error = asNonEmptyString((token as Record<string, unknown>).error);
  if (!error) {
    return false;
  }

  const normalized = error.toLowerCase();
  return (
    error === TOKEN_REFRESH_ERROR ||
    normalized.includes("401") ||
    normalized.includes("unauthorized")
  );
}

function isTokenExpired(token: AuthToken): boolean {
  if (!token || typeof token !== "object") {
    return false;
  }

  const exp = asFiniteNumber((token as Record<string, unknown>).exp);
  if (!exp) {
    return false;
  }

  return Date.now() >= exp * 1000;
}

function decodeBase64Url(input: string): string | null {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    return atob(padded);
  } catch {
    return null;
  }
}

function isAccessTokenExpired(accessToken: string | null): boolean {
  if (!accessToken) {
    return false;
  }

  const parts = accessToken.split(".");
  if (parts.length < 2) {
    return false;
  }

  const payload = decodeBase64Url(parts[1] ?? "");
  if (!payload) {
    return false;
  }

  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    const exp = asFiniteNumber(parsed.exp);
    if (!exp) {
      return false;
    }
    return Date.now() >= exp * 1000;
  } catch {
    return false;
  }
}

function getApiHost(): string | null {
  const apiHost = (
    process.env.API_BASE_URL ??
    process.env.AUTH_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  return apiHost || null;
}

function getApiLocale(): string {
  return (
    process.env.AUTH_API_LOCALE ??
    process.env.NEXT_PUBLIC_API_LOCALE ??
    "en"
  )
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function asApiPrefix(value: string, fallback: string): string {
  return (value || fallback).replace(/\/+$/, "").replace(/^([^/])/, "/$1");
}

function parseTokenPair(payload: unknown): TokenPair {
  if (!payload || typeof payload !== "object") {
    return { accessToken: null, refreshToken: null };
  }

  const record = payload as Record<string, unknown>;
  const nestedData =
    typeof record.data === "object" && record.data
      ? (record.data as Record<string, unknown>)
      : record;
  const nestedTokens =
    typeof nestedData.tokens === "object" && nestedData.tokens
      ? (nestedData.tokens as Record<string, unknown>)
      : {};

  const accessToken =
    asNonEmptyString(nestedData.accessToken) ??
    asNonEmptyString(record.accessToken) ??
    asNonEmptyString(nestedTokens.accessToken);
  const refreshToken =
    asNonEmptyString(nestedData.refreshToken) ??
    asNonEmptyString(record.refreshToken) ??
    asNonEmptyString(nestedTokens.refreshToken);

  return { accessToken, refreshToken };
}

function setRefreshTokenCookie(response: NextResponse, refreshToken: string): void {
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearAuthCookies(response: NextResponse): void {
  SESSION_COOKIE_NAMES.forEach((name) => {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
    });
  });
}

function getMyBooksEndpoint(): string | null {
  const apiHost = getApiHost();
  if (!apiHost) {
    return null;
  }

  const apiLocale = getApiLocale();

  const booksPrefix = asApiPrefix(process.env.NEXT_PUBLIC_BOOKS_PREFIX ?? "/book", "/book");

  return `${apiHost}${apiLocale ? `/${apiLocale}` : ""}${booksPrefix}/my-books`;
}

function getRefreshTokenEndpoints(): string[] {
  const apiHost = getApiHost();
  if (!apiHost) {
    return [];
  }

  const apiLocale = getApiLocale();
  const authPrefix = asApiPrefix(
    process.env.AUTH_API_PREFIX ?? process.env.NEXT_PUBLIC_AUTH_PREFIX ?? "/auth",
    "/auth"
  );

  const endpoints = new Set<string>();
  endpoints.add(`${apiHost}${authPrefix}/refresh-token`);
  if (apiLocale) {
    endpoints.add(`${apiHost}/${apiLocale}${authPrefix}/refresh-token`);
  }

  return [...endpoints];
}

async function isUnauthorizedByBackend(accessToken: string): Promise<boolean> {
  const endpoint = getMyBooksEndpoint();
  if (!endpoint) {
    return false;
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    return response.status === 401;
  } catch {
    return false;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const endpoints = getRefreshTokenEndpoints();
  if (endpoints.length === 0) {
    return null;
  }

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        continue;
      }

      const parsed = parseTokenPair(await response.json());
      if (!parsed.accessToken) {
        continue;
      }

      return parsed;
    } catch {
      continue;
    }
  }

  return null;
}

function buildLoginRedirect(request: NextRequest, locale: AppLocale) {
  const redirectUrl = new URL(`/${locale}/login`, request.nextUrl);
  redirectUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(redirectUrl);
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

  let requestRefreshToken =
    asNonEmptyString(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value) ??
    getRefreshTokenFromAuthToken(token);
  let accessToken = getAccessToken(token);
  let refreshedRefreshToken: string | null = null;
  const isAuthPage =
    pathname === `/${locale}/login` || pathname === `/${locale}/register`;
  const isProtectedPage = !isAuthPage;

  const tokenHasError = hasTokenAuthError(token);
  const tokenExpired = isTokenExpired(token) || isAccessTokenExpired(accessToken);
  let isLoggedIn = Boolean(accessToken) && !tokenHasError && !tokenExpired;
  let shouldClearCookies = tokenHasError || tokenExpired;

  async function tryRefreshToken(): Promise<boolean> {
    if (!requestRefreshToken) {
      return false;
    }

    const pair = await refreshAccessToken(requestRefreshToken);
    if (!pair?.accessToken) {
      return false;
    }

    accessToken = pair.accessToken;

    if (pair.refreshToken) {
      requestRefreshToken = pair.refreshToken;
      refreshedRefreshToken = pair.refreshToken;
    }

    return true;
  }

  if (isProtectedPage) {
    if (!isLoggedIn) {
      const refreshed = await tryRefreshToken();
      isLoggedIn = refreshed;
      if (!refreshed) {
        shouldClearCookies = true;
      }
    }

    if (isLoggedIn && accessToken) {
      let backendUnauthorized = await isUnauthorizedByBackend(accessToken);

      if (backendUnauthorized) {
        const refreshed = await tryRefreshToken();
        if (refreshed && accessToken) {
          backendUnauthorized = await isUnauthorizedByBackend(accessToken);
        }
      }

      if (backendUnauthorized) {
        isLoggedIn = false;
        shouldClearCookies = true;
      }
    }

    if (!isLoggedIn) {
      const response = buildLoginRedirect(request, locale);
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.next();
    const nextRefreshToken = refreshedRefreshToken;
    if (nextRefreshToken) {
      setRefreshTokenCookie(response, nextRefreshToken);
    }
    return response;
  }

  if (!isLoggedIn && requestRefreshToken) {
    const refreshed = await tryRefreshToken();
    isLoggedIn = refreshed;
    if (!refreshed) {
      shouldClearCookies = true;
    }
  }

  if (isLoggedIn) {
    const response = NextResponse.redirect(new URL(`/${locale}/`, nextUrl));
    const nextRefreshToken = refreshedRefreshToken;
    if (nextRefreshToken) {
      setRefreshTokenCookie(response, nextRefreshToken);
    }
    return response;
  }

  const response = NextResponse.next();
  if (shouldClearCookies) {
    clearAuthCookies(response);
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/:locale/:path*",
    "/:locale/login",
    "/:locale/register",
  ],
};
