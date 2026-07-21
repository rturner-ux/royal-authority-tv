"use client";

import { useEffect } from "react";

// A speed bump, not a lock: this only discourages casual copying via
// right-click / devtools shortcuts. It does not and cannot stop anyone
// who disables JS, uses view-source:, or opens devtools some other way --
// the browser has to receive the real HTML/CSS/JS to render the page at
// all, so a determined scraper is unaffected. Text selection is left
// alone on purpose so visitors can still copy a quote or an address.
export default function ScrapeDeterrent() {
  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    function onKeyDown(e: KeyboardEvent) {
      const blockedKey =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U");
      if (blockedKey) e.preventDefault();
    }

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
