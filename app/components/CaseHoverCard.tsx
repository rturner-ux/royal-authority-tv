"use client";

import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

export const COLLAPSED_WIDTH = 165;
export const COLLAPSED_HEIGHT = 235;

// Matches the reference implementation exactly: a plain poster card with a
// subtle scale + shadow lift on hover (pure CSS, no JS state), the case
// title overlaid at the bottom of the photo, and a full-width category
// strip below it -- no expanding popover, no icon row.
export default function CaseHoverCard({ incident }: { incident: Incident }) {
  const href = `/case-file/${incident.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-shrink-0 flex-col overflow-hidden rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.55)] transition-transform duration-[250ms] ease-out hover:z-10 hover:scale-[1.06] hover:shadow-[0_8px_26px_rgba(0,0,0,0.8)]"
      style={{ width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }}
    >
      <div className="absolute inset-0">
        {incident.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={incident.image_url} alt={incident.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#181818]">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[incident.category]}26, transparent)` }}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="relative h-8 w-8 text-white/25">
              <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
              <path d="M15 4v5h5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {/* subtle scanline texture for that streaming-thumbnail feel */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(180deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>

      <div className="relative z-[2] mt-auto px-2.5 py-3 text-center">
        <div
          className="line-clamp-2 text-sm font-extrabold leading-tight text-white"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}
        >
          {incident.title}
        </div>
      </div>

      <div
        className="relative z-[2] w-full py-1 text-center text-[0.72rem] font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: CATEGORY_COLORS[incident.category] }}
      >
        {CATEGORY_LABELS[incident.category]}
      </div>
    </Link>
  );
}
