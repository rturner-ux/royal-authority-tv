"use client";

import { useState } from "react";
import Image from "next/image";

export default function PersonPhotoVideo({
  photoUrl,
  videoUrl,
  name,
  photoFit,
}: {
  photoUrl: string;
  videoUrl: string | null;
  name: string;
  photoFit: "cover" | "contain";
}) {
  const [playing, setPlaying] = useState(false);

  if (playing && videoUrl) {
    return (
      <div className="relative mt-5 w-full overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[4/5]">
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
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
      <Image
        src={photoUrl}
        alt={name}
        fill
        unoptimized
        className={photoFit === "contain" ? "object-contain" : "object-cover"}
      />
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
