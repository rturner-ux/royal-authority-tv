"use client";

import type { IncidentCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/labels";

export default function MapLegend({
  hidden,
  onToggle,
}: {
  hidden: Set<IncidentCategory>;
  onToggle: (category: IncidentCategory) => void;
}) {
  const categories = Object.keys(CATEGORY_COLORS) as IncidentCategory[];

  return (
    <div
      style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
      className="min-w-[200px] rounded-xl border border-white/10 bg-[#0f172a]/95 p-4 text-xs text-slate-200 backdrop-blur-sm"
    >
      <div className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-[#E8D19A]">
        Filter Cases
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <label key={c} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={!hidden.has(c)}
              onChange={() => onToggle(c)}
              style={{ accentColor: CATEGORY_COLORS[c] }}
            />
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: CATEGORY_COLORS[c] }}
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
