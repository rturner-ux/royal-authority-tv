"use client";

import { useState } from "react";
import Image from "next/image";

export default function PersonPhotoVideo({
  photoUrl,
  videoUrl,
  name,
  photoFit,
}: {
  photoUrl: string | null;
  videoUrl: string | null;
  name: string;
  photoFit: "cover" | "contain";
}) {
  const [playing, setPlaying] = useState(false);
  // A direct video file (CDN-hosted mp4/webm/etc.) can play in a native
  // <video> tag; anything else (YouTube, TMZ, or any other third-party
  // embed page) only works as an <iframe> -- there's no fixed list of
  // embeddable hosts to check against, so treat "not a direct file" as the
  // iframe case rather than allowlisting domains one at a time.
  const isDirectVideoFile = videoUrl ? /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(videoUrl) : false;

  if (playing && videoUrl) {
    return (
      <div className="relative mt-5 w-full overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[4/5]">
        {isDirectVideoFile ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={videoUrl}
            title={`Video of ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => videoUrl && setPlaying(true)}
      disabled={!videoUrl}
      aria-label={videoUrl ? `Play video of ${name}` : name}
      className={`group relative mt-5 block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${
        photoFit === "contain" ? "aspect-square p-8" : "aspect-[4/5]"
      } ${videoUrl ? "cursor-pointer" : "cursor-default"}`}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          unoptimized
          className={photoFit === "contain" ? "object-contain" : "object-cover"}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-white/[0.02] py-10">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-bold text-white/40">
            {name.charAt(0)}
          </div>
          <span className="text-xs uppercase tracking-[0.15em] text-white/30">No Public Photo Available</span>
        </div>
      )}
      {videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7 translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
