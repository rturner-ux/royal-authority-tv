"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { IncidentCategory } from "@/lib/types";
import { playSfx } from "@/lib/sfx";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as IncidentCategory[];

export default function InterestsPicker({
  userId,
  initialInterests,
}: {
  userId: string;
  initialInterests: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialInterests));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function toggle(category: string) {
    const next = new Set(selected);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    setSelected(next);

    setSaving(true);
    setSaveError(null);
    const db = supabaseBrowser();
    const { error } = await db
      .from("subscriber_profiles")
      .update({ interests: Array.from(next) })
      .eq("user_id", userId);
    setSaving(false);

    if (error) {
      console.error("Failed to save interests:", error);
      setSaveError("Couldn't save that. Please try again.");
      return;
    }
    playSfx("pin");
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-semibold text-white">Case Type Interests</div>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        Pick what you actually want to see more of. Your video feed and homepage rows lean toward
        these instead of showing everything flat.
      </p>

      {saveError && <p className="mt-2 text-xs text-red-300">{saveError}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const active = selected.has(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              disabled={saving}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                active
                  ? "border-[#C9A24A] bg-[#C9A24A]/15 text-[#E8D19A]"
                  : "border-white/15 text-slate-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
