"use client";

import { useVisitorCount } from "./PresenceProvider";

export default function SiteVisitorCount() {
  const count = useVisitorCount();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {count.toLocaleString()} {count === 1 ? "person" : "people"} on the site now
    </span>
  );
}
