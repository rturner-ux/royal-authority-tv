"use client";

import { useState } from "react";
import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import ShareButton from "./ShareButton";

// Netflix's real hover card doesn't just scale the thumbnail in place -- it
// widens into a landscape preview with an icon row (play, add, rate, more
// info), badges, and tag line, floating above the row. The outer div stays a
// fixed-size spacer so the row itself never reflows; the inner card is what
// grows and detaches on hover. "Rate this case" doesn't fit real cases, so
// the icon row here is Play / Share / More Info instead.
export default function CaseHoverCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const href = `/case-file/${incident.slug}`;
  const statusLabel =
    incident.status === "active" ? "Active Investigation" : incident.status === "resolved" ? "Resolved" : "Cleared";

  return (
    <div className="relative h-[210px] w-[140px] flex-shrink-0">
      <div
        className="group absolute left-0 top-0 z-0 w-[140px] rounded-md border border-white/10 bg-black/40 shadow-xl transition-all duration-300 ease-out hover:z-30 hover:w-[240px] hover:-translate-y-3 hover:shadow-2xl"
        onMouseLeave={() => setExpanded(false)}
      >
        <Link href={href} className="block">
          <div className="relative h-[210px] w-full overflow-hidden rounded-t-md transition-all duration-300 ease-out group-hover:h-[135px]">
            {incident.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={incident.image_url} alt={incident.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl text-white/20">?</div>
            )}
            <span
              className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black"
              style={{ backgroundColor: CATEGORY_COLORS[incident.category] }}
            >
              {CATEGORY_LABELS[incident.category]}
            </span>
          </div>
        </Link>

        <div className="hidden rounded-b-md bg-[#141414] p-3 group-hover:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Link
                href={href}
                aria-label="View Case"
                className="grid h-7 w-7 place-items-center rounded-full bg-white text-black transition hover:bg-white/90"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-3.5 w-3.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
              <ShareButton
                url={typeof window !== "undefined" ? `${window.location.origin}${href}` : href}
                title={incident.title}
                className="grid h-7 w-7 place-items-center rounded-full border border-white/40 text-white transition hover:border-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path d="M12 5v9m0-9 3.5 3.5M12 5 8.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 13v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ShareButton>
            </div>

            <button
              type="button"
              aria-label="More info"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="grid h-7 w-7 place-items-center rounded-full border border-white/40 text-white transition hover:border-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <Link href={href} className="mt-2 block line-clamp-2 text-sm font-bold leading-tight text-white">
            {incident.title}
          </Link>

          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded border border-white/25 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
              {statusLabel}
            </span>
            <span className="rounded border border-white/25 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
              Verified
            </span>
          </div>

          {incident.location_label && (
            <div className="mt-1.5 text-[11px] text-white/50">{incident.location_label}</div>
          )}

          {expanded && incident.description && (
            <p className="mt-2 line-clamp-4 text-xs leading-5 text-white/60">{incident.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
