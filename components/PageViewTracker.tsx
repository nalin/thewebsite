"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function generateSessionId(): string {
  const key = "analytics_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const key = pathname + searchParams.toString();
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    // Skip tracking on analytics page itself to avoid noise
    if (pathname === "/analytics") return;

    const referrer = document.referrer ? getDomain(document.referrer) : null;
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");

    let sessionId: string | null = null;
    try {
      sessionId = generateSessionId();
    } catch {
      // sessionStorage may not be available in some environments
    }

    const payload = {
      path: pathname,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      session_id: sessionId,
    };

    // Use sendBeacon when available so tracking doesn't block navigation
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, searchParams]);

  return null;
}
