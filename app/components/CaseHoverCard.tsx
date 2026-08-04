"use client";

import Link from "next/link";
import type { Incident } from "@/lib/types";
import { isActiveAlert, statusBadgeLabel } from "@/lib/labels";

// Wide landscape by default (genre rows); the Top 10 row passes its own
// tall-poster width/height instead. No category label anywhere -- just
// title, status badge, and a Recently Added ribbon when relevant.
export const COLLAPSED_WIDTH = 300;
export const COLLAPSED_HEIGHT = 170;

const RECENT_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;

export default function CaseHoverCard({
  incident,
  width = COLLAPSED_WIDTH,
  height = COLLAPSED_HEIGHT,
}: {
  incident: Incident;
  width?: number;
  height?: number;
}) {
  const href = `/case-file/${incident.slug}`;
  const alert = isActiveAlert(incident);
  const badge = statusBadgeLabel(incident);
  const isRecent = Date.now() - new Date(incident.published_at).getTime() < RECENT_WINDOW_MS;

  return (
    <Link
      href={href}
      className={`group relative flex flex-shrink-0 flex-col overflow-hidden rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.55)] transition-transform duration-[250ms] ease-out hover:z-10 hover:scale-[1.06] hover:shadow-[0_8px_26px_rgba(0,0,0,0.8)] ${
        alert ? "ra-alert-card" : ""
      }`}
      style={{ width, height }}
    >
      {badge && (
        <span className="absolute left-1.5 top-1.5 z-[3] rounded-full bg-emerald-600 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}

      <div className="absolute inset-0">
        {incident.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={incident.poster_url} alt={incident.title} className="h-full w-full object-cover" />
        ) : incident.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={incident.image_url} alt={incident.title} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#181818]">
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

      {!incident.poster_url && (
        <div className="relative z-[2] mt-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10">
          <div
            className="line-clamp-2 px-2.5 pb-2 text-sm font-extrabold leading-tight text-white"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}
          >
            {incident.title}
          </div>
          {isRecent && !badge && (
            <div className="bg-red-600 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white">
              Recently Added
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
