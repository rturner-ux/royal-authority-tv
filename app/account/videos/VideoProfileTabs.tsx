"use client";

import { useState } from "react";
import VideoGrid from "../../components/VideoGrid";

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

  return (
    <div>
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setTab("videos")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-4 text-sm font-bold uppercase tracking-[0.15em] transition ${
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
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-4 text-sm font-bold uppercase tracking-[0.15em] transition ${
            tab === "liked"
              ? "border-[#C9A24A] text-[#E8D19A]"
              : "border-transparent text-slate-500 hover:text-white"
          }`}
        >
          <HeartIcon />
          Liked
        </button>
      </div>

      <div className="mt-6">
        <VideoGrid isSignedIn filter={tab === "liked" ? "liked" : "all"} />
      </div>
    </div>
  );
}
