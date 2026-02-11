import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { defaultLocale } from "@/types/auth";

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

function getAccessToken(session: SessionLike | null): string | undefined {
  return session?.user?.accessToken;
}

function setAuthHeader(config: AxiosRequestConfig, token: string): void {
  const headers = (config.headers ?? {}) as Record<string, string>;
  headers.Authorization = `Bearer ${token}`;
  config.headers = headers;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = (await getSession()) as SessionLike | null;
      const token = getAccessToken(session);
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

    if (
      status === 401 &&
      original &&
      !original._retry &&
      typeof window !== "undefined"
    ) {
      original._retry = true;
      const newSession = (await getSession()) as SessionLike | null;
      if (newSession?.error === "RefreshAccessTokenError") {
        await signOut({ callbackUrl: `/${defaultLocale}/login` });
        return Promise.reject(error);
      }

      const newToken = getAccessToken(newSession);
      if (newToken) {
        setAuthHeader(original, newToken);
        return axiosInstance(original);
      }
    }

    if (status === 401 && typeof window !== "undefined") {
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

export async function getBooks() {
  const res = await axiosPublic.get<UnknownRecord>(booksPath("/get-books"));
  return res.data;
}

export async function getBookDetails(id: string) {
  const res = await axiosInstance.get<UnknownRecord>(
    booksPath(`/get-book/${encodeURIComponent(id)}`)
  );
  return res.data;
}

export async function getBookAuthorDetails(id: string) {
  const res = await axiosPublic.get<UnknownRecord>(
    booksPath(`/get-book-author/${encodeURIComponent(id)}`)
  );
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

export async function getMyBooks() {
  const res = await axiosInstance.get<UnknownRecord>(booksPath("/my-books"));
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
