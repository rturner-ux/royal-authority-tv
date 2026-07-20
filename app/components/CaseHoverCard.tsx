"use client";

import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

// Netflix's real hover card doesn't just scale the thumbnail in place -- it
// expands into a taller popover with a dark info panel (title, a play-style
// button, category/status tags) that floats above the row. The outer div
// stays a fixed-size spacer so the row itself never reflows; the inner card
// is what grows and detaches on hover.
export default function CaseHoverCard({ incident }: { incident: Incident }) {
  return (
    <div className="relative h-[210px] w-[140px] flex-shrink-0">
      <Link
        href={`/case-file/${incident.slug}`}
        className="group absolute left-0 right-0 top-0 z-0 rounded-md border border-white/10 bg-black/40 shadow-xl transition-all duration-200 ease-out hover:z-30 hover:-translate-y-3 hover:scale-[1.3] hover:rounded-b-none hover:shadow-2xl"
      >
        <div className="relative h-[210px] w-full overflow-hidden rounded-md group-hover:rounded-b-none">
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

        <div className="hidden overflow-hidden rounded-b-md bg-[#141414] p-3 group-hover:block">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-3.5 w-3.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              View Case
            </span>
          </div>
          <div className="line-clamp-2 text-sm font-bold leading-tight text-white">
            {incident.title}
          </div>
          <div className="mt-1.5 text-[11px] text-white/50">
            {incident.status === "active" ? "Active Investigation" : incident.status === "resolved" ? "Resolved" : "Cleared"}
            {" · "}Verified Sourcing
          </div>
        </div>
      </Link>
    </div>
  );
}
