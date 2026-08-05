"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Incident } from "@/lib/types";
import { isActiveAlert, statusBadgeLabel } from "@/lib/labels";

// Wide landscape by default (genre rows); the Top 10 row passes its own
// tall-poster width/height instead. No category label anywhere -- just
// title, status badge, and a Recently Added ribbon when relevant.
export const COLLAPSED_WIDTH = 300;
export const COLLAPSED_HEIGHT = 170;

const RECENT_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;
const HOVER_DELAY_MS = 350;
const HOVER_SCALE = 1.08;
const HOVER_LIFT = 12;

export default function CaseHoverCard({
  incident,
  width = COLLAPSED_WIDTH,
  height = COLLAPSED_HEIGHT,
  basePath = "/case-file",
}: {
  incident: Incident;
  width?: number;
  height?: number;
  basePath?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const href = `${basePath}/${incident.slug}`;
  const alert = isActiveAlert(incident);
  const badge = statusBadgeLabel(incident);
  const isRecent = Date.now() - new Date(incident.published_at).getTime() < RECENT_WINDOW_MS;
  const year = incident.published_at ? new Date(incident.published_at).getFullYear() : null;
  const place = [incident.city, incident.state].filter(Boolean).join(", ") || incident.location_label;

  function onEnter() {
    timerRef.current = setTimeout(() => setExpanded(true), HOVER_DELAY_MS);
  }
  function onLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setExpanded(false);
  }

  return (
    // Fixed-size placeholder that reserves the card's normal spot in the
    // row's flex layout; the animated pop-out below is absolutely
    // positioned so it can grow over neighboring cards without shifting them.
    <div className="relative flex-shrink-0" style={{ width, height }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <motion.div
        className="absolute left-0 top-0"
        style={{ width, transformOrigin: "center top" }}
        animate={{ scale: expanded ? HOVER_SCALE : 1, y: expanded ? -HOVER_LIFT : 0, zIndex: expanded ? 30 : 1 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <Link
          href={href}
          className={`group flex flex-col overflow-hidden rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.55)] transition-shadow duration-200 ${
            expanded ? "shadow-[0_18px_44px_rgba(0,0,0,0.85)]" : ""
          } ${alert ? "ra-alert-card" : ""}`}
        >
          <div className="relative flex-shrink-0" style={{ width, height }}>
            {badge && (
              <span className="absolute left-1.5 top-1.5 z-[3] rounded-full bg-emerald-600 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
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
            {!incident.poster_url && !expanded && (
              <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10">
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
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden bg-[#141414]"
              >
                <div className="px-3 pb-2.5 pt-2">
                  <div className="line-clamp-2 text-[0.8rem] font-bold leading-tight text-white">{incident.title}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] font-semibold text-white/55">
                    {place && <span>{place}</span>}
                    {place && year && <span className="text-white/25">•</span>}
                    {year && <span>{year}</span>}
                    {isRecent && !badge && (
                      <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2.5 py-1 text-[0.68rem] font-bold text-black transition group-hover:bg-white/85">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      View Case
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    </div>
  );
}
