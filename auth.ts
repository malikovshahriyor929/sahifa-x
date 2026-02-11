import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { defaultLocale } from "@/types/auth";

type JsonRecord = Record<string, unknown>;

type BackendLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string | number;
    name?: string;
    fullName?: string;
    email?: string;
  };
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asStringId(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function trimSegment(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function joinUrl(base: string, ...segments: string[]): string {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedSegments = segments.map(trimSegment).filter(Boolean);
  return [normalizedBase, ...normalizedSegments].join("/");
}

function getLoginEndpoints(): string[] {
  const base = (
    process.env.API_BASE_URL ??
    process.env.AUTH_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).trim();

  if (!base) {
    return [];
  }

  const locale = (
    process.env.AUTH_API_LOCALE ?? process.env.NEXT_PUBLIC_API_LOCALE ?? ""
  ).trim();
  const authPrefix = (process.env.AUTH_API_PREFIX ?? "auth").trim();
  const endpoints = new Set<string>();

  if (locale) {
    endpoints.add(joinUrl(base, locale, authPrefix, "login"));
  }

  endpoints.add(joinUrl(base, authPrefix, "login"));
  endpoints.add(joinUrl(base, "api", authPrefix, "login"));

  return [...endpoints];
}

function parseLoginResponse(
  payload: unknown,
  fallbackIdentity: string
): BackendLoginResponse | null {
  if (!isRecord(payload)) {
    return null;
  }

  const nestedData = isRecord(payload.data) ? payload.data : payload;
  const nestedUser = isRecord(nestedData.user)
    ? nestedData.user
    : isRecord(payload.user)
      ? payload.user
      : {};
  const nestedTokens = isRecord(nestedData.tokens) ? nestedData.tokens : {};

  const id =
    asStringId(nestedUser.id) ??
    asStringId(nestedData.userId) ??
    asStringId(payload.userId) ??
    fallbackIdentity;
  const name =
    asNonEmptyString(nestedUser.name) ??
    asNonEmptyString(nestedUser.fullName) ??
    asNonEmptyString(nestedUser.username) ??
    fallbackIdentity.split("@")[0] ??
    fallbackIdentity;
  const email = asNonEmptyString(nestedUser.email) ?? fallbackIdentity;

  const accessToken =
    asNonEmptyString(nestedData.accessToken) ??
    asNonEmptyString(payload.accessToken) ??
    asNonEmptyString(nestedTokens.accessToken) ??
    asNonEmptyString(nestedData.token);
  const refreshToken =
    asNonEmptyString(nestedData.refreshToken) ??
    asNonEmptyString(payload.refreshToken) ??
    asNonEmptyString(nestedTokens.refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id,
      name,
      email,
    },
  };
}

function buildLoginPayloads(identity: string, password: string): JsonRecord[] {
  return [
    { email: identity, password },
    { login: identity, password },
    { identifier: identity, password },
    { username: identity, password },
    { emailOrPhone: identity, password },
    { email: identity, login: identity, identifier: identity, password },
  ];
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: `/${defaultLocale}/login`,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : undefined;
        session.user.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
        session.user.refreshToken =
          typeof token.refreshToken === "string"
            ? token.refreshToken
            : undefined;
      }

      if (typeof token.error === "string") {
        session.error = token.error;
      }

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const loginEndpoints = getLoginEndpoints();
        if (loginEndpoints.length === 0) {
          return null;
        }

        const payloads = buildLoginPayloads(email, password);

        for (const endpoint of loginEndpoints) {
          for (const body of payloads) {
            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify(body),
              });

              if (!response.ok) {
                if (
                  response.status === 401 ||
                  response.status === 404 ||
                  response.status === 400 ||
                  response.status === 422
                ) {
                  continue;
                }
                return null;
              }

              const parsed = parseLoginResponse(await response.json(), email);
              if (!parsed || !parsed.user) {
                continue;
              }

              const apiUser = parsed.user;
              return {
                id: String(apiUser.id ?? email),
                name: apiUser.name ?? email.split("@")[0],
                email: apiUser.email ?? email,
                accessToken: parsed.accessToken,
                refreshToken: parsed.refreshToken,
              };
            } catch {
              continue;
            }
          }
        }

        return null;
      },
    }),
  ],
};
