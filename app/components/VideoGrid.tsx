"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { extractYouTubeId } from "@/lib/youtube";
import { playSfx } from "@/lib/sfx";

type FeedVideo = {
  id: string;
  title: string;
  source_label: string | null;
  youtube_url: string;
  view_count: number;
  like_count: number;
  share_count: number;
  likedByMe: boolean;
  incident: { title: string; slug: string | null } | null;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VideoGrid({ isSignedIn, filter = "all" }: { isSignedIn: boolean; filter?: "all" | "liked" }) {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVideo, setOpenVideo] = useState<FeedVideo | null>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVideos(d.videos);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!openVideo) return;
    fetch("/api/videos/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: openVideo.id }),
    });
    setVideos((prev) => prev.map((v) => (v.id === openVideo.id ? { ...v, view_count: v.view_count + 1 } : v)));

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenVideo(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openVideo?.id]);

  async function toggleLike(video: FeedVideo, e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) return;
    const wasLiked = video.likedByMe;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? { ...v, likedByMe: !wasLiked, like_count: v.like_count + (wasLiked ? -1 : 1) }
          : v
      )
    );
    await fetch("/api/videos/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id }),
    });
  }

  async function share(video: FeedVideo, e: React.MouseEvent) {
    e.stopPropagation();
    const url = video.incident?.slug
      ? `${window.location.origin}/case-file/${video.incident.slug}`
      : window.location.origin;
    if (navigator.share) {
      navigator.share({ title: video.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, share_count: v.share_count + 1 } : v)));
    await fetch("/api/videos/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id }),
    });
  }

  const shown = filter === "liked" ? videos.filter((v) => v.likedByMe) : videos;

  if (loading) return <p className="text-sm text-slate-400">Loading videos...</p>;

  if (shown.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-400">
        {filter === "liked" ? "You haven't liked any videos yet." : "No videos yet."}
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((video) => {
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
              className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-left transition hover:border-[#C9A24A]/40"
            >
              <div className="relative aspect-[9/12] w-full overflow-hidden bg-black/40">
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={video.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="line-clamp-2 text-xs font-semibold leading-4 text-white">{video.title}</p>
                  <div className="mt-1.5 flex items-center justify-between text-white">
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {formatCount(video.view_count)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        role="button"
                        onClick={(e) => toggleLike(video, e)}
                        className={`flex items-center gap-1 text-[11px] font-semibold transition ${
                          video.likedByMe ? "text-red-500" : "text-white hover:text-red-400"
                        }`}
                      >
                        <HeartIcon filled={video.likedByMe} />
                        {formatCount(video.like_count)}
                      </span>
                      <span
                        role="button"
                        onClick={(e) => share(video, e)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-white hover:text-[#E8D19A]"
                      >
                        <ShareIcon />
                        {formatCount(video.share_count)}
                      </span>
                    </div>
                  </div>
                </div>
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
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(openVideo.youtube_url)}?autoplay=1`}
                title={openVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            {openVideo.incident?.slug && (
              <Link
                href={`/case-file/${openVideo.incident.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-[#E8D19A] hover:underline"
              >
                View case: {openVideo.incident.title} →
              </Link>
            )}
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
