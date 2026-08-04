"use client";

import { useEffect, useRef } from "react";

const FLUSH_INTERVAL_MS = 4000;

// Mounted once in the root layout. Counts every click anywhere on the site
// and batches them into one request every few seconds instead of firing an
// API call per click, then flushes whatever's left when the tab is hidden
// or closed via sendBeacon (fetch gets cancelled on unload, sendBeacon
// doesn't). Renders nothing.
export default function SiteClickTracker() {
  const pending = useRef(0);

  useEffect(() => {
    function onClick() {
      pending.current += 1;
    }

    function flush(useBeacon = false) {
      if (pending.current === 0) return;
      const count = pending.current;
      pending.current = 0;
      const body = JSON.stringify({ count });

      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon("/api/clicks/increment", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/clicks/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }

    document.addEventListener("click", onClick);
    const interval = setInterval(() => flush(false), FLUSH_INTERVAL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush(true);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", () => flush(true));

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
      flush(true);
    };
  }, []);

  return null;
}
