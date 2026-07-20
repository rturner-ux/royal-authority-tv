"use client";

import { useRef } from "react";
import type { Incident } from "@/lib/types";
import CaseHoverCard from "./CaseHoverCard";

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
          className="flex gap-6 overflow-x-auto pb-40 pl-1 pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {capped.map((c) => (
            <CaseHoverCard key={c.id} incident={c} />
          ))}
        </div>
        <button
          type="button"
          aria-label={`Scroll ${title}`}
          onClick={() => scrollerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          className="absolute right-0 top-[129px] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90 md:flex"
        >
          →
        </button>
      </div>
    </div>
  );
}
