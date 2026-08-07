"use client";

import { useEffect } from "react";

// A "visit" is one browsing session, not one click -- matches the standard
// 30-minute inactivity window most analytics tools use for a session, so
// browsing around the site for the next half hour only counts once.
const SESSION_MAX_AGE_SECONDS = 60 * 30;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Mounted once in the root layout. Fires at most once per session (and
// never for a browser that's visited /api/track/optout) instead of once
// per click -- the old per-click counter padded the total with every
// click a visitor made, including our own testing traffic.
export default function SiteClickTracker() {
  useEffect(() => {
    if (getCookie("ra_notrack")) return;
    if (getCookie("ra_visited")) return;

    document.cookie = `ra_visited=1; max-age=${SESSION_MAX_AGE_SECONDS}; path=/; samesite=lax`;

    fetch("/api/clicks/increment", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
