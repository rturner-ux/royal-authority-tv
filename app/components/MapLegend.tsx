"use client";

import type { IncidentCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/labels";
import { CATEGORY_SHAPES, shapeSvg } from "@/lib/mapShapes";
import CollapsibleEdgeTab from "./CollapsibleEdgeTab";

export default function MapLegend({
  hidden,
  onToggle,
}: {
  hidden: Set<IncidentCategory>;
  onToggle: (category: IncidentCategory) => void;
}) {
  const categories = Object.keys(CATEGORY_COLORS) as IncidentCategory[];

  return (
    <CollapsibleEdgeTab side="left">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#E8D19A]">Filter Cases</div>
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
    </CollapsibleEdgeTab>
  );
}
