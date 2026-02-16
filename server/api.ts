import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { defaultLocale } from "@/types/auth";
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/app/shared/authCookies";

type SessionLike = {
  user?: {
    accessToken?: string;
  } | null;
  error?: string;
};

type HeaderValue = string | number | boolean;
type QueryParams = Record<string, HeaderValue>;
type UnknownRecord = Record<string, unknown>;
type BookPayload = UnknownRecord;

// Fallback local lookup types. Replace with project-specific types if available.
export type UserLookupMap = Record<string, unknown>;
export type UserLookupKey = string;
export type UserLookupFlags = Partial<Record<UserLookupKey, true | 1 | boolean>>;

const apiHost = (
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
)
  .trim()
  .replace(/\/+$/, "");
const apiLocale = (process.env.NEXT_PUBLIC_API_LOCALE ?? "en")
  .trim()
  .replace(/^\/+|\/+$/g, "");

export const baseURL = apiHost
  ? `${apiHost}${apiLocale ? `/${apiLocale}` : ""}`
  : `${apiLocale ? `/${apiLocale}` : ""}`;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 30_000,
});

export const axiosPublic = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 30_000,
});

const authPrefix = (process.env.NEXT_PUBLIC_AUTH_PREFIX ?? "/auth")
  .replace(/\/+$/, "")
  .replace(/^([^/])/, "/$1");
const booksPrefix = (process.env.NEXT_PUBLIC_BOOKS_PREFIX ?? "/book")
  .replace(/\/+$/, "")
  .replace(/^([^/])/, "/$1");

function authPath(path: string): string {
  return `${authPrefix}${path.startsWith("/") ? path : `/${path}`}`;
}

function booksPath(path: string): string {
  return `${booksPrefix}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface AuthApiResponse extends UnknownRecord {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  user?: UnknownRecord;
}

export interface RegisterRequest extends UnknownRecord {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest extends UnknownRecord {
  email: string;
  password: string;
}

export interface RefreshTokenRequest extends UnknownRecord {
  refreshToken: string;
}

export interface CreateBookRequest extends UnknownRecord {
  title: string;
  description: string;
  coverUrl: string;
  language: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | string;
  monetization: "FREE" | "BUY_ONLY" | "BUY_AND_RENT" | "RENT_ONLY" | string;
  visibility?: "PUBLIC" | "PRIVATE" | string;
  buyPriceCents?: number | null;
  rentPriceCents?: number | null;
  currency?: string;
  rentDurationDays?: number | null;
}

export interface ChapterWriteRequest extends UnknownRecord {
  title: string;
  content: string;
  contentUrl?: string | null;
  isPreview?: boolean;
}

type TokenPair = {
  accessToken?: string;
  refreshToken?: string;
};

export interface ForgotPasswordRequest extends UnknownRecord {
  email: string;
}

export interface ResetPasswordRequest extends UnknownRecord {
  password: string;
  confirmPassword?: string;
}

export interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

let accessTokenOverride: string | null = null;

function getAccessToken(session: SessionLike | null): string | undefined {
  return accessTokenOverride ?? session?.user?.accessToken;
}

function setAuthHeader(config: AxiosRequestConfig, token: string): void {
  const headers = (config.headers ?? {}) as Record<string, string>;
  headers.Authorization = `Bearer ${token}`;
  config.headers = headers;
}

function parseTokenResponse(payload: unknown): TokenPair {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const record = payload as UnknownRecord;
  const nestedData = typeof record.data === "object" && record.data ? record.data : record;
  const nestedTokens =
    typeof (nestedData as UnknownRecord).tokens === "object" &&
    (nestedData as UnknownRecord).tokens
      ? (nestedData as UnknownRecord).tokens
      : {};

  const accessToken =
    typeof (nestedData as UnknownRecord).accessToken === "string"
      ? ((nestedData as UnknownRecord).accessToken as string)
      : typeof (record as UnknownRecord).accessToken === "string"
        ? ((record as UnknownRecord).accessToken as string)
        : typeof (nestedTokens as UnknownRecord).accessToken === "string"
          ? ((nestedTokens as UnknownRecord).accessToken as string)
          : undefined;

  const refreshToken =
    typeof (nestedData as UnknownRecord).refreshToken === "string"
      ? ((nestedData as UnknownRecord).refreshToken as string)
      : typeof (record as UnknownRecord).refreshToken === "string"
        ? ((record as UnknownRecord).refreshToken as string)
        : typeof (nestedTokens as UnknownRecord).refreshToken === "string"
          ? ((nestedTokens as UnknownRecord).refreshToken as string)
          : undefined;

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshToken = getRefreshTokenCookie();
  if (!refreshToken) {
    accessTokenOverride = null;
    clearRefreshTokenCookie();
    await signOut({ callbackUrl: `/${defaultLocale}/login` });
    return null;
  }

  try {
    const refreshed = await refreshTokens({ refreshToken });
    const { accessToken, refreshToken: nextRefreshToken } =
      parseTokenResponse(refreshed);

    if (!accessToken) {
      throw new Error("No access token returned");
    }

    accessTokenOverride = accessToken;

    if (nextRefreshToken && nextRefreshToken !== refreshToken) {
      setRefreshTokenCookie(nextRefreshToken);
    }

    return accessToken;
  } catch {
    accessTokenOverride = null;
    clearRefreshTokenCookie();
    await signOut({ callbackUrl: `/${defaultLocale}/login` });
    return null;
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = (await getSession()) as SessionLike | null;
      const token = getAccessToken(session);
      const refreshToken = getRefreshTokenCookie();

      if (!refreshToken) {
        accessTokenOverride = null;
        await signOut({ callbackUrl: `/${defaultLocale}/login` });
        return Promise.reject(new Error("Missing refresh token cookie"));
      }

      if (token) {
        setAuthHeader(config, token);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && typeof window !== "undefined") {
      original._retry = true;
      const accessToken = await refreshAccessToken();
      if (accessToken) {
        setAuthHeader(original, accessToken);
        return axiosInstance(original);
      }
      return Promise.reject(error);
    }

    if (status === 401 && typeof window !== "undefined") {
      accessTokenOverride = null;
      clearRefreshTokenCookie();
      await signOut({ callbackUrl: `/${defaultLocale}/login` });
    }

    return Promise.reject(error);
  }
);

export async function getUserLookups<const F extends UserLookupFlags>(
  flags: F,
  extraParams?: QueryParams
) {
  const res = await axiosInstance.get<
    Pick<UserLookupMap, Extract<keyof F, UserLookupKey>>
  >("/v1/lookup/index", {
    params: { ...flags, ...(extraParams ?? {}) },
  });
  return res.data;
}

export async function register(payload: RegisterRequest) {
  const res = await axiosPublic.post<AuthApiResponse>(
    authPath("/register"),
    payload
  );
  return res.data;
}

export async function login(payload: LoginRequest) {
  const res = await axiosPublic.post<AuthApiResponse>(authPath("/login"), payload);
  return res.data;
}

export async function refreshTokens(payload: RefreshTokenRequest) {
  const res = await axiosPublic.post<AuthApiResponse>(
    authPath("/refresh-token"),
    payload
  );
  return res.data;
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  const res = await axiosPublic.post<AuthApiResponse>(
    authPath("/forgot-password"),
    payload
  );
  return res.data;
}

export async function resetPassword(
  params: { userId: string; accessToken: string },
  payload: ResetPasswordRequest
) {
  const { userId, accessToken } = params;
  const res = await axiosPublic.post<AuthApiResponse>(
    authPath(
      `/reset-password/${encodeURIComponent(userId)}/${encodeURIComponent(
        accessToken
      )}`
    ),
    payload
  );
  return res.data;
}

export async function getBooks(params?: QueryParams) {
  const res = await axiosInstance.get<UnknownRecord>(booksPath("/get-books"), {
    params,
  });
  return res.data;
}

export async function getBookDetails(id: string) {
  const res = await axiosInstance.get<UnknownRecord>(
    booksPath(`/get-book/${encodeURIComponent(id)}`)
  );
  return res.data;
}

export async function getBookChapters(id: string, params?: QueryParams) {
  const res = await axiosInstance.get<UnknownRecord>(
    booksPath(`/chapters/${encodeURIComponent(id)}`),
    { params }
  );
  return res.data;
}

export async function getBookChapterByOrder(id: string, order: number | string) {
  const res = await axiosInstance.get<UnknownRecord>(
    booksPath(`/chapters/${encodeURIComponent(id)}/${encodeURIComponent(String(order))}`)
  );
  return res.data;
}

export async function getBookAuthorDetails(id: string) {
  const res = await axiosInstance.get<UnknownRecord>(
    booksPath(`/get-book-author/${encodeURIComponent(id)}`)
  );
  return res.data;
}

export async function createBook(payload: CreateBookRequest) {
  const res = await axiosInstance.post<UnknownRecord>(
    booksPath("/create-book"),
    payload
  );
  return res.data;
}

export async function createBookChapter(bookId: string, payload: ChapterWriteRequest) {
  const res = await axiosInstance.post<UnknownRecord>(
    booksPath(`/create-chapter/${encodeURIComponent(bookId)}`),
    payload
  );
  return res.data;
}

export async function editBookChapter(
  bookId: string,
  chapterId: string,
  payload: ChapterWriteRequest
) {
  const res = await axiosInstance.put<UnknownRecord>(
    booksPath(
      `/put-chapter/${encodeURIComponent(bookId)}/${encodeURIComponent(chapterId)}`
    ),
    payload
  );
  return res.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post<UnknownRecord>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function getLookup(params?: QueryParams) {
  const res = await axiosInstance.get<UnknownRecord>("/lookup", {
    params,
  });
  return res.data;
}

export async function getProfile() {
  const res = await axiosInstance.get<UnknownRecord>("/profile");
  return res.data;
}

export async function buyBook(payload: BookPayload) {
  const res = await axiosInstance.post<UnknownRecord>(
    booksPath("/buy-book"),
    payload
  );
  return res.data;
}

export async function rentBook(payload: BookPayload) {
  const res = await axiosInstance.post<UnknownRecord>(
    booksPath("/rent-book"),
    payload
  );
  return res.data;
}

export async function getMyBooks(params?: QueryParams) {
  const res = await axiosInstance.get<UnknownRecord>(booksPath("/my-books"), {
    params,
  });
  return res.data;
}

export async function editBook(payload: BookPayload) {
  const res = await axiosInstance.put<UnknownRecord>(
    booksPath("/edit-book"),
    payload
  );
  return res.data;
}

export async function getUserLookupsByKeys<
  const K extends readonly UserLookupKey[]
>(keys: K) {
  const params: Record<string, true> = {};
  for (const key of keys) {
    params[key] = true;
  }

  const res = await axiosInstance.get<Pick<UserLookupMap, K[number]>>(
    "/v1/lookup/index",
    { params }
  );
  return res.data;
}

export default axiosInstance;
