"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import ShareButton from "./ShareButton";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 140;
const COLLAPSED_HEIGHT = 210;
const IMAGE_HEIGHT_EXPANDED = 135;
const CLOSE_DELAY_MS = 120;

function CardImage({
  incident,
  className,
  height,
}: {
  incident: Incident;
  className?: string;
  height?: number;
}) {
  return (
    <div className={`relative w-full ${className || ""}`} style={height ? { height } : undefined}>
      {incident.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={incident.image_url} alt={incident.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#181818]">
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[incident.category]}26, transparent)` }}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-white/25">
            <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
            <path d="M15 4v5h5" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <span
        className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black"
        style={{ backgroundColor: CATEGORY_COLORS[incident.category] }}
      >
        {CATEGORY_LABELS[incident.category]}
      </span>
    </div>
  );
}

// Netflix's real hover card isn't an in-place CSS transform -- their scroll
// row is barely taller than the collapsed card, meaning the expanded state
// renders in a separate overlay layer that floats above the whole page. This
// portals the expanded card into document.body on hover, positioned over the
// original card's spot, so it's never clipped by the row's own overflow and
// the row needs no extra clearance padding around it.
export default function CaseHoverCard({ incident }: { incident: Incident }) {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!hovering) return;
    function closeNow() {
      setHovering(false);
      setExpanded(false);
    }
    window.addEventListener("scroll", closeNow, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", closeNow, { capture: true });
  }, [hovering]);

  function open() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const el = spacerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setAnchor({ top: r.top, left: r.left });
    }
    setHovering(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => {
      setHovering(false);
      setExpanded(false);
    }, CLOSE_DELAY_MS);
  }

  const href = `/case-file/${incident.slug}`;
  const statusLabel =
    incident.status === "active" ? "Active Investigation" : incident.status === "resolved" ? "Resolved" : "Cleared";

  return (
    <>
      <div
        ref={spacerRef}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        className="relative flex-shrink-0"
        style={{ width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }}
      >
        <Link href={href} className="block h-full w-full overflow-hidden rounded-md border border-white/10 bg-black/40 shadow-xl">
          <CardImage incident={incident} height={COLLAPSED_HEIGHT} />
        </Link>
      </div>

      {mounted &&
        hovering &&
        anchor &&
        createPortal(
          <div
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
            className="rounded-md border border-white/10 bg-black/95 shadow-2xl"
            style={{
              position: "fixed",
              top: anchor.top - 14,
              left: anchor.left,
              width: EXPANDED_WIDTH,
              zIndex: 9999,
              animation: "ra-hover-card-in 0.15s ease-out",
              transformOrigin: "top left",
            }}
          >
            <Link href={href} className="block">
              <CardImage incident={incident} className="overflow-hidden rounded-t-md" height={IMAGE_HEIGHT_EXPANDED} />
            </Link>

            <div className="rounded-b-md bg-[#141414] p-3" style={{ minHeight: 0 }}>
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
                    url={`${window.location.origin}${href}`}
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
          </div>,
          document.body
        )}
    </>
  );
}
