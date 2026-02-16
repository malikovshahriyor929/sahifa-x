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

export function getSessionUserId(session: unknown): string | null {
  if (!isRecord(session)) {
    return null;
  }

  const user = isRecord(session.user) ? session.user : null;
  const accessToken = toText(user?.accessToken);
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      const tokenUserId =
        toText(payload.id) ??
        toText(payload.userId) ??
        toText(payload._id) ??
        toText(payload.sub);
      if (tokenUserId) {
        return tokenUserId;
      }
    }
  }

  const refreshToken = toText(user?.refreshToken);
  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken);
    if (payload) {
      const tokenUserId =
        toText(payload.id) ??
        toText(payload.userId) ??
        toText(payload._id) ??
        toText(payload.sub);
      if (tokenUserId) {
        return tokenUserId;
      }
    }
  }

  return (
    toText(user?.userId) ??
    toText(user?.id) ??
    toText((session as UnknownRecord).userId) ??
    toText((session as UnknownRecord).id)
  );
}
