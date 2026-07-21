"use client";

import { useState } from "react";
import Image from "next/image";
import CaseMapClient from "./CaseMapClient";

export default function LocationZoomReveal({
  lat,
  lng,
  label,
  preciseLat,
  preciseLng,
  preciseLabel,
  isActive,
  thenPhotoUrl,
  thenCaption,
  thenSourceUrl,
  annotation,
}: {
  lat: number;
  lng: number;
  label?: string | null;
  preciseLat?: number | null;
  preciseLng?: number | null;
  preciseLabel?: string | null;
  isActive?: boolean;
  thenPhotoUrl?: string | null;
  thenCaption?: string | null;
  thenSourceUrl?: string | null;
  annotation?: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const [deepZoomed, setDeepZoomed] = useState(false);

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
    <div>
      <div className="h-[380px] w-full overflow-hidden rounded-2xl md:h-[440px]">
        <CaseMapClient
          lat={lat}
          lng={lng}
          label={label}
          preciseLat={preciseLat}
          preciseLng={preciseLng}
          preciseLabel={preciseLabel}
          isActive={isActive}
          onDeepZoomChange={setDeepZoomed}
        />
      </div>

      {deepZoomed && thenPhotoUrl && (
        <div className="mt-4 rounded-2xl border border-[#C9A24A]/30 bg-[#0a0d14] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
            Then &amp; Now
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <Image
                  src={thenPhotoUrl}
                  alt={thenCaption || "Historical photo of this location"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              {(thenCaption || thenSourceUrl) && (
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {thenCaption}
                  {thenSourceUrl && (
                    <>
                      {thenCaption ? " " : null}
                      <a
                        href={thenSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#67e8f9] hover:underline"
                      >
                        Source
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Now
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {annotation || "This is the same location as it appears today."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
