const REFRESH_TOKEN_COOKIE = "refreshToken";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!cookie) {
    return null;
  }
  const value = cookie.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : null;
}

export function getRefreshTokenCookie(): string | null {
  return getCookieValue(REFRESH_TOKEN_COOKIE);
}

export function setRefreshTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(
    token
  )}; path=/; samesite=lax${secure}`;
}

export function clearRefreshTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}
