"use client";

import { useState } from "react";
import CaseMapClient from "./CaseMapClient";

export default function LocationZoomReveal({
  lat,
  lng,
  label,
  preciseLat,
  preciseLng,
  preciseLabel,
  isActive,
}: {
  lat: number;
  lng: number;
  label?: string | null;
  preciseLat?: number | null;
  preciseLng?: number | null;
  preciseLabel?: string | null;
  isActive?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left transition hover:border-[#C9A24A]/40 hover:bg-white/[0.05]"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Satellite Location
          </div>
          <div className="mt-1 text-sm text-slate-300">
            {label || "View this case's location"}
          </div>
        </div>
        <span className="flex-shrink-0 rounded-xl bg-[#C9A24A] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black transition group-hover:opacity-90">
          Zoom to Location →
        </span>
      </button>
    );
  }

  return (
    <div className="h-[380px] w-full overflow-hidden rounded-2xl md:h-[440px]">
      <CaseMapClient
        lat={lat}
        lng={lng}
        label={label}
        preciseLat={preciseLat}
        preciseLng={preciseLng}
        preciseLabel={preciseLabel}
        isActive={isActive}
      />
    </div>
  );
}
