"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CaseReactionEmoji, CaseReactionSummary } from "@/lib/types";

const ICON_BASE = "https://alkmgedjgmaibfpyszij.supabase.co/storage/v1/object/public/case-photos/reactions";

const REACTIONS: { key: CaseReactionEmoji; iconUrl: string; label: string }[] = [
  { key: "support", iconUrl: `${ICON_BASE}/support.svg`, label: "Support" },
  { key: "sad", iconUrl: `${ICON_BASE}/sad.svg`, label: "Sad" },
  { key: "angry", iconUrl: `${ICON_BASE}/angry.svg`, label: "Angry" },
  { key: "shocked", iconUrl: `${ICON_BASE}/shocked.svg`, label: "Shocked" },
  { key: "prayers", iconUrl: `${ICON_BASE}/prayers.svg`, label: "Prayers" },
];

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinejoin="round" />
    </svg>
  );
}

export default function CaseReactionBar({
  incidentId,
  discussionHref,
  commentCount,
  initialShareCount,
  isSignedIn,
}: {
  incidentId: string;
  discussionHref: string;
  commentCount: number;
  initialShareCount: number;
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<CaseReactionSummary | null>(null);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/case-reactions?incidentId=${incidentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSummary(d);
      });
  }, [incidentId]);

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300);
  }

  async function react(emoji: CaseReactionEmoji) {
    setPickerOpen(false);
    if (!isSignedIn) return;
    const next = summary?.myReaction === emoji ? null : emoji;
    const res = await fetch("/api/case-reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId, emoji: next }),
    });
    const data = await res.json();
    if (data.success) setSummary(data);
  }

  async function handleShare() {
    const url = window.location.origin + pathname;
    try {
      const res = await fetch("/api/case-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      });
      const data = await res.json();
      if (data.success) setShareCount(data.shareCount);
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share can be cancelled by the user -- not an error worth surfacing.
    }
  }

  const myReactionInfo = summary?.myReaction ? REACTIONS.find((r) => r.key === summary.myReaction) : null;

  // Which reactions to show as the small summary cluster (most-used first),
  // matching Facebook's overlapping-icon treatment next to the count.
  const topReactions = summary
    ? REACTIONS.filter((r) => summary.counts[r.key] > 0)
        .sort((a, b) => summary.counts[b.key] - summary.counts[a.key])
        .slice(0, 3)
    : [];

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          {topReactions.length > 0 && (
            <div className="flex -space-x-1.5">
              {topReactions.map((r) => (
                <span
                  key={r.key}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-[#05070b] bg-[#1a1d24] p-0.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.iconUrl} alt={r.label} className="h-full w-full object-contain" />
                </span>
              ))}
            </div>
          )}
          <span>
            {summary?.total ?? 0} reaction{summary?.total === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={discussionHref} className="transition hover:text-white">
            {commentCount} comment{commentCount === 1 ? "" : "s"}
          </Link>
          <span>
            {shareCount} share{shareCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1" onMouseEnter={openPicker} onMouseLeave={scheduleClose}>
          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-2xl border border-white/10 bg-[#0a0d14] p-2 shadow-2xl">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => react(r.key)}
                  title={r.label}
                  className={`group flex h-11 w-11 items-center justify-center rounded-full p-1.5 transition duration-150 ease-out hover:-translate-y-1.5 hover:scale-125 ${
                    summary?.myReaction === r.key ? "bg-[#C9A24A]/20" : "hover:bg-white/5"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.iconUrl} alt={r.label} className="h-full w-full object-contain drop-shadow" />
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              summary?.myReaction ? "bg-[#C9A24A]/15 text-[#E8D19A]" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {myReactionInfo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={myReactionInfo.iconUrl} alt="" className="h-5 w-5 object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={REACTIONS[0].iconUrl} alt="" className="h-5 w-5 object-contain opacity-70" />
            )}
            {myReactionInfo?.label ?? "Support"}
          </button>
        </div>

        <Link
          href={discussionHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          <CommentIcon />
          Comment
        </Link>

        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          {copied ? "✓ Link Copied" : "↗ Share"}
        </button>
      </div>
    </div>
  );
}
