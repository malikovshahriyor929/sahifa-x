type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return decodeURIComponent(
        Array.from(window.atob(padded))
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      );
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }

  return null;
}

function decodeJwtPayload(token: string): UnknownRecord | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(payloadJson);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getSessionSources(session: unknown): UnknownRecord[] {
  if (!isRecord(session)) {
    return [];
  }

  const sources: UnknownRecord[] = [];
  const user = isRecord(session.user) ? session.user : null;

  if (user) {
    sources.push(user);
  }
  sources.push(session);

  const accessToken = toText(user?.accessToken);
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      sources.push(payload);
    }
  }

  const refreshToken = toText(user?.refreshToken);
  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken);
    if (payload) {
      sources.push(payload);
    }
  }

  return sources;
}

function isTruthyFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
}

function hasAuthorRole(value: unknown): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    return (
      normalized === "AUTHOR" ||
      normalized === "WRITER" ||
      normalized === "MUALLIF"
    );
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasAuthorRole(item));
  }

  if (isRecord(value)) {
    return Object.entries(value).some(
      ([key, flag]) =>
        isTruthyFlag(flag) &&
        ["AUTHOR", "WRITER", "MUALLIF"].includes(key.trim().toUpperCase()),
    );
  }

  return false;
}

export function getSessionUserId(session: unknown): string | null {
  const sources = getSessionSources(session);
  const sessionRecord = isRecord(session) ? session : null;
  const user =
    sessionRecord && isRecord(sessionRecord.user) ? sessionRecord.user : null;

  if (!sessionRecord) {
    return null;
  }

  for (const source of sources) {
    const tokenUserId =
      toText(source.id) ??
      toText(source.userId) ??
      toText(source._id) ??
      toText(source.sub);
    if (tokenUserId) {
      return tokenUserId;
    }
  }

  return (
    toText(user?.userId) ??
    toText(user?.id) ??
    toText(sessionRecord.userId) ??
    toText(sessionRecord.id)
  );
}

export function isSessionAuthor(session: unknown): boolean {
  const sources = getSessionSources(session);

  return sources.some((source) => {
    if (
      isTruthyFlag(source.is_Author) ||
      isTruthyFlag(source.isAuthor) ||
      isTruthyFlag(source.is_author)
    ) {
      return true;
    }

    return hasAuthorRole(source.role) || hasAuthorRole(source.roles);
  });
}
