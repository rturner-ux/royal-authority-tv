"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const DISMISS_KEY = "ra-subscribe-prompt-dismissed";
const DELAY_MS = 8000;
const SKIP_PREFIXES = ["/subscribe", "/login", "/signup", "/join"];

export default function SubscribePrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const skip = SKIP_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (skip) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || d.isActive) return;
        timer = setTimeout(() => setVisible(true), DELAY_MS);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [skip]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:p-0">
      <div className="relative rounded-2xl border border-[#C9A24A]/40 bg-[#0a0d14] p-5 shadow-2xl shadow-black/50">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 text-slate-500 transition hover:text-white"
        >
          ✕
        </button>

        <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">Royal Authority TV</div>
        <p className="mt-2 pr-4 text-sm leading-6 text-slate-300">
          Unlock Court &amp; Arrest Records, Member Analysis, and the full Investigation Board.
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href="/subscribe"
            onClick={dismiss}
            className="flex-1 rounded-xl bg-[#C9A24A] px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:opacity-90"
          >
            Subscribe for $4.99/mo
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
