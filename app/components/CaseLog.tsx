"use client";

import Link from "next/link";
import { useState } from "react";
import type { IncidentUpdate } from "@/lib/types";
import { CLAIM_TYPE_LABELS, CLAIM_TYPE_CLASSES } from "@/lib/labels";

const COLLAPSED_COUNT = 6;

function formatDate(u: IncidentUpdate) {
  const d = u.event_date ? new Date(u.event_date + "T12:00:00") : new Date(u.created_at);
  return d.toLocaleDateString("en-US", { dateStyle: "medium" });
}

function snippet(body: string, max = 90) {
  const clean = body.trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

export default function CaseLog({
  updates,
  isActive,
}: {
  updates: IncidentUpdate[];
  isActive: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const visible = showAll ? updates : updates.slice(0, COLLAPSED_COUNT);
  const hiddenCount = updates.length - visible.length;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
          Case Log
        </div>
        <div className="text-xs text-slate-500">
          {updates.length} {updates.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      <div className="mt-5 divide-y divide-white/5">
        {visible.map((u) => {
          const contradicted = u.contradicts_update_id
            ? updates.find((x) => x.id === u.contradicts_update_id)
            : null;
          const locked = u.is_premium && !isActive;
          const isOpen = expanded.has(u.id);

          return (
            <div key={u.id} className="py-3 first:pt-0 last:pb-0">
              <button
                onClick={() => toggle(u.id)}
                className="flex w-full items-start gap-3 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className={`mt-0.5 flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CLAIM_TYPE_CLASSES[u.claim_type]}`}
                >
                  {CLAIM_TYPE_LABELS[u.claim_type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-slate-500">
                    {formatDate(u)}
                    {contradicted && (
                      <span className="ml-2 text-amber-400">⚠ Corrected</span>
                    )}
                    {u.is_premium && (
                      <span className="ml-2 text-[#E8D19A]">Premium</span>
                    )}
                  </span>
                  {!isOpen && (
                    <span className="mt-0.5 block truncate text-sm text-slate-400">
                      {locked ? "Subscriber-only update" : snippet(u.body)}
                    </span>
                  )}
                </span>
                <span
                  className={`mt-1 flex-shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="mt-2 pl-[70px]">
                  {locked ? (
                    <div className="relative">
                      <div className="select-none text-sm leading-7 text-slate-400 blur-sm">
                        {u.body}
                      </div>
                      <Link
                        href="/subscribe"
                        className="mt-2 inline-block text-xs font-semibold text-[#E8D19A] hover:underline"
                      >
                        Subscribe to read this update →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm leading-7 text-slate-400">
                        {u.body}
                      </div>
                      {contradicted && (
                        <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-6 text-amber-200/80">
                          <span className="font-semibold text-amber-300">Originally stated:</span> {contradicted.body}
                          {u.correction_note && <div className="mt-1.5 text-amber-200/70">{u.correction_note}</div>}
                        </div>
                      )}
                      {u.source_url && (
                        <a
                          href={u.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-[#67e8f9]"
                        >
                          Source
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {updates.length === 0 && (
          <p className="py-3 text-sm text-slate-500">No case facts logged yet.</p>
        )}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Show {hiddenCount} More {hiddenCount === 1 ? "Entry" : "Entries"}
        </button>
      )}
      {showAll && updates.length > COLLAPSED_COUNT && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-4 w-full rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Show Fewer
        </button>
      )}
    </div>
  );
}
