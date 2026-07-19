"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";

// A fixed genre-style row (no filter pills), mirroring Netflix's per-category
// rows like "Documentaries" -- unlike TrendingCarousel, this always shows the
// same set of cases for its category rather than letting the viewer filter.
export default function CaseRow({ title, cases }: { title: string; cases: Incident[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const capped = cases.slice(0, 10);

  if (capped.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-black md:text-3xl">{title}</h2>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto pb-4 pl-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {capped.map((c) => (
            <Link
              key={c.id}
              href={`/case-file/${c.slug}`}
              className="group relative flex flex-shrink-0 items-end"
              style={{ width: 220 }}
            >
              <div className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl transition group-hover:scale-105 group-hover:border-[#C9A24A]/50">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-white/20">?</div>
                )}
                <span
                  className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black"
                  style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                >
                  {CATEGORY_LABELS[c.category]}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <button
          type="button"
          aria-label={`Scroll ${title}`}
          onClick={() => scrollerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90 md:flex"
        >
          →
        </button>
      </div>
    </div>
  );
}
