"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/server/api";

const REFRESH_INTERVAL_MS = 14.5 * 60 * 1000;

export default function RefreshTokenTicker() {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshAccessToken();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
