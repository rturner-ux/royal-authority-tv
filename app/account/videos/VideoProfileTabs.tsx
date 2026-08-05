"use client";

import { useState } from "react";
import VideoGrid from "../../components/VideoGrid";

type Sort = "latest" | "popular" | "oldest";

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VideoProfileTabs() {
  const [tab, setTab] = useState<"videos" | "liked">("videos");
  const [sort, setSort] = useState<Sort>("latest");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex">
          <button
            onClick={() => setTab("videos")}
            className={`flex items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-bold uppercase tracking-[0.15em] transition ${
              tab === "videos"
                ? "border-[#C9A24A] text-[#E8D19A]"
                : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            <GridIcon />
            Videos
          </button>
          <button
            onClick={() => setTab("liked")}
            className={`flex items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-bold uppercase tracking-[0.15em] transition ${
              tab === "liked"
                ? "border-[#C9A24A] text-[#E8D19A]"
                : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            <HeartIcon />
            Liked
          </button>
        </div>

        <div className="flex gap-1 pb-2">
          {(["latest", "popular", "oldest"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                sort === s ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <VideoGrid isSignedIn filter={tab === "liked" ? "liked" : "all"} sort={sort} />
      </div>
    </div>
  );
}
