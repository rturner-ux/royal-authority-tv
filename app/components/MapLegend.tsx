"use client";

import { useState } from "react";
import type { IncidentCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";

export default function MapLegend({
  hidden,
  onToggle,
}: {
  hidden: Set<IncidentCategory>;
  onToggle: (category: IncidentCategory) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const categories = Object.keys(CATEGORY_COLORS) as IncidentCategory[];

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A] backdrop-blur-sm"
      >
        Filter Cases ▸
      </button>
    );
  }

  return (
    <div
      style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
      className="max-w-[calc(100vw-2.5rem)] min-w-[200px] rounded-xl border border-white/10 bg-[#0f172a]/95 p-4 text-xs text-slate-200 backdrop-blur-sm"
    >
      <button
        onClick={() => setExpanded(false)}
        className="mb-3 flex w-full items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A]"
      >
        Filter Cases <span>▾</span>
      </button>

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
  );
}
