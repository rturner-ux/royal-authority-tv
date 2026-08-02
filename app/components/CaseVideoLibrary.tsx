"use client";

import { useEffect, useState } from "react";
import type { IncidentVideo } from "@/lib/types";
import { playSfx } from "@/lib/sfx";
import { extractYouTubeId } from "@/lib/youtube";

export default function CaseVideoLibrary({ videos }: { videos: IncidentVideo[] }) {
  const [openVideo, setOpenVideo] = useState<IncidentVideo | null>(null);

  useEffect(() => {
    if (!openVideo) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenVideo(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openVideo]);

  if (videos.length === 0) return null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const videoId = extractYouTubeId(video.youtube_url);
          const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

          return (
            <button
              key={video.id}
              type="button"
              onClick={() => {
                playSfx("zoom");
                setOpenVideo(video);
              }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition hover:border-[#C9A24A]/40 hover:bg-white/[0.05]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/20">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A24A] text-black shadow-lg">
                    ▶
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                {video.source_label && (
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
                    {video.source_label}
                  </div>
                )}
                <div className="text-sm font-semibold leading-5 text-white">{video.title}</div>
              </div>
            </button>
          );
        })}
      </div>

      {openVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpenVideo(null)}
        >
          <div
            className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(openVideo.youtube_url)}?autoplay=1`}
              title={openVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpenVideo(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
