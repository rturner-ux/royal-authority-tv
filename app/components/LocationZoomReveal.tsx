"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CaseMapClient from "./CaseMapClient";
import { playSfx } from "@/lib/sfx";

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
  sceneVideoUrl,
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
  sceneVideoUrl?: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const [deepZoomed, setDeepZoomed] = useState(false);
  const [showFlyover, setShowFlyover] = useState(false);
  const [flyoverEntered, setFlyoverEntered] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (deepZoomed && isActive && sceneVideoUrl) {
      playSfx("zoom");
      setShowFlyover(true);
    }
    // Only fire once per case-file visit, right as the close-up view lands
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepZoomed]);

  useEffect(() => {
    if (!showFlyover) {
      setFlyoverEntered(false);
      setShowTitle(false);
      return;
    }
    const enter = requestAnimationFrame(() => setFlyoverEntered(true));
    const titleIn = setTimeout(() => setShowTitle(true), 500);
    const titleOut = setTimeout(() => setShowTitle(false), 3200);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(titleIn);
      clearTimeout(titleOut);
    };
  }, [showFlyover]);

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

      {showFlyover && sceneVideoUrl && (
        <div
          className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 ${
            flyoverEntered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Video fills the full viewport, scaling in from slightly zoomed
              so the reveal reads as "arriving" at the location rather than
              a dialog popping open. */}
          <video
            src={sceneVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${
              flyoverEntered ? "scale-100" : "scale-125"
            }`}
          />

          {/* Cinematic letterbox bars, slide in from the edges */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-[10vh] bg-black transition-transform duration-700 ease-out ${
              flyoverEntered ? "translate-y-0" : "-translate-y-full"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[10vh] bg-black transition-transform duration-700 ease-out ${
              flyoverEntered ? "translate-y-0" : "translate-y-full"
            }`}
          />

          {/* Title card */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-[12vh] flex flex-col items-center text-center transition-all duration-700 ${
              showTitle ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-[#E8D19A] drop-shadow-lg">
              Close-Up View
            </div>
            <div className="mt-2 font-serif text-2xl text-white drop-shadow-lg md:text-3xl">
              {preciseLabel || label}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFlyover(false)}
            aria-label="Close"
            className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 ${
              flyoverEntered ? "opacity-100" : "opacity-0"
            }`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
