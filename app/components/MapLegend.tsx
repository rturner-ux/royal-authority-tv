"use client";

import { useState } from "react";
import type { IncidentCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";

export default function MapLegend({
  hidden,
  onToggle,
  topOffset = 84,
}: {
  hidden: Set<IncidentCategory>;
  onToggle: (category: IncidentCategory) => void;
  // Default (84) clears Leaflet's default zoom control (top:10, ~64px
  // tall) on the legacy map -- this used to sit at top:10 too and
  // physically overlap/intercept clicks on the zoom-in button. MapLibre's
  // NavigationControl is taller (top:10, ~87px -- 3 stacked buttons
  // instead of 2), so the GL map passes a larger measured value instead of
  // relying on this default.
  topOffset?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const categories = Object.keys(CATEGORY_COLORS) as IncidentCategory[];

  return (
    // pointerEvents:"none" on the outer wrapper, re-enabled explicitly on
    // the button and (conditionally) the panel below -- CSS `transform`
    // doesn't shrink an element's layout box, so the collapsed panel's
    // full height was still hit-testable even while invisible, silently
    // intercepting clicks on whatever sits underneath it in DOM order
    // (confirmed via elementFromPoint against the GL map's ALPR panel).
    <div style={{ position: "absolute", top: topOffset, left: 10, zIndex: 1000, pointerEvents: "none" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ pointerEvents: "auto" }}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/80 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A] backdrop-blur-sm"
      >
        Filter Cases <span>{expanded ? "▾" : "▸"}</span>
      </button>

      <div
        style={{
          marginTop: 8,
          width: 220,
          maxWidth: "calc(100vw - 2.5rem)",
          transform: expanded ? "translateX(0)" : "translateX(-130%)",
          opacity: expanded ? 1 : 0,
          transition: "transform 220ms ease-out, opacity 180ms ease-out",
          pointerEvents: expanded ? "auto" : "none",
        }}
        className="rounded-xl border border-white/10 bg-[#0f172a]/55 p-4 text-xs text-slate-200 backdrop-blur-sm"
      >
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {categories.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={!hidden.has(c)}
                onChange={() => onToggle(c)}
                style={{ accentColor: CATEGORY_COLORS[c] }}
              />
              <span
                className="flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: shapeSvg(CATEGORY_SHAPES[c], CATEGORY_COLORS[c], 14) }}
              />
              <span>{CATEGORY_LABELS[c]}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 border-t border-white/10 pt-3 text-[11px] text-slate-400">
          Faded pin = resolved / cleared. Pulsing pin = active.
        </div>
      </div>
    </div>
  );
}
