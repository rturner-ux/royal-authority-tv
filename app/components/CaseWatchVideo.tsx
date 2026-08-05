"use client";

import { useEffect, useState } from "react";

// Same compact-card-that-opens-a-lightbox treatment as CaseVideoLibrary,
// but for the single "primary" video_embed_url field (which isn't always a
// YouTube URL -- news station embeds, etc. -- so it can't reuse
// extractYouTubeId/i.ytimg.com thumbnails the way the library cards do).
export default function CaseWatchVideo({
  embedUrl,
  title,
  thumbnailUrl,
}: {
  embedUrl: string;
  title: string;
  thumbnailUrl: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative mx-auto mt-4 block aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/40 mb-6"
      >
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/20">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A24A] text-black shadow-lg">
            ▶
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
