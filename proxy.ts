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

  const expiresAt = asFiniteNumber((token as Record<string, unknown>).exp);
  if (!expiresAt) {
    return false;
  }

  return expiresAt * 1000 <= Date.now();
}

function getRequestRefreshToken(request: NextRequest, token: AuthToken): string | null {
  const cookieValue = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return cookieValue ?? getRefreshTokenFromAuthToken(token);
}

function isAccessTokenExpired(accessToken: string | null): boolean {
  if (!accessToken) {
    return true;
  }

  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    const expiresAt = asFiniteNumber(payload.exp);
    return expiresAt ? expiresAt * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
}

function getApiBaseUrl(): string | null {
  const base =
    process.env.API_BASE_URL ??
    process.env.AUTH_API_BASE_URL ??
    process.env.API_URL ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";

  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed || null;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const locale = (process.env.AUTH_API_LOCALE ?? process.env.NEXT_PUBLIC_API_LOCALE ?? "").trim();
  const authPrefix = (process.env.AUTH_API_PREFIX ?? "auth").trim().replace(/^\/+|\/+$/g, "");
  const localeSegment = locale ? `/${locale.replace(/^\/+|\/+$/g, "")}` : "";
  const endpoint = `${baseUrl}${localeSegment}/${authPrefix}/refresh-token`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const data =
      typeof payload.data === "object" && payload.data
        ? (payload.data as Record<string, unknown>)
        : payload;
    const tokens =
      typeof data.tokens === "object" && data.tokens
        ? (data.tokens as Record<string, unknown>)
        : {};

    return {
      accessToken:
        asNonEmptyString(data.accessToken) ??
        asNonEmptyString(tokens.accessToken),
      refreshToken:
        asNonEmptyString(data.refreshToken) ??
        asNonEmptyString(tokens.refreshToken) ??
        refreshToken,
    };
  } catch {
    return null;
  }
}

async function isUnauthorizedByBackend(accessToken: string): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return false;
  }

  try {
    const response = await fetch(`${baseUrl}/profile`, {
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

function clearAuthCookies(response: NextResponse): void {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
    });
  }
}

function setRefreshTokenCookie(response: NextResponse, refreshToken: string): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function buildLoginRedirect(request: NextRequest, locale: AppLocale): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/login`;
  url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

function isProtectedPath(pathname: string, locale: AppLocale): boolean {
  const normalizedPath = pathname.replace(/\/+$/, "") || `/${locale}`;
  const publicPaths = new Set([
    `/${locale}`,
    `/${locale}/login`,
    `/${locale}/register`,
    `/${locale}/search`,
  ]);

  if (publicPaths.has(normalizedPath)) {
    return false;
  }

  // Public book detail and reader routes for SEO/discovery.
  if (normalizedPath.startsWith(`/${locale}/books/`)) {
    return false;
  }

  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);

  if (!localeFromPath) {
    if (legacyPaths.has(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const locale = localeFromPath;
  const token = await getToken({ req: request });
  let accessToken = getAccessToken(token);
  let requestRefreshToken = getRequestRefreshToken(request, token);
  let refreshedRefreshToken: string | null = null;
  const isProtectedPage = isProtectedPath(pathname, locale);
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
    const response = NextResponse.redirect(new URL(`/${locale}/`, request.nextUrl));
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
