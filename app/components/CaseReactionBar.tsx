"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CaseReactionEmoji, CaseReactionSummary } from "@/lib/types";

const REACTIONS: { key: CaseReactionEmoji; emoji: string; label: string }[] = [
  { key: "support", emoji: "👍", label: "Support" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "angry", emoji: "😡", label: "Angry" },
  { key: "shocked", emoji: "😮", label: "Shocked" },
  { key: "prayers", emoji: "🙏", label: "Prayers" },
];

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

  // Which reaction emojis to show as the small summary cluster (most-used
  // first), matching Facebook's overlapping-icon treatment next to the count.
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
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-[#05070b] bg-[#1a1d24] text-[11px]"
                >
                  {r.emoji}
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
        <div
          className="relative flex-1"
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClose}
        >
          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-2xl border border-white/10 bg-[#0a0d14] p-2 shadow-2xl">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => react(r.key)}
                  title={r.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:scale-125 hover:bg-white/10 ${
                    summary?.myReaction === r.key ? "bg-[#C9A24A]/20" : ""
                  }`}
                >
                  {r.emoji}
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
            <span>{myReactionInfo?.emoji ?? "👍"}</span>
            {myReactionInfo?.label ?? "Support"}
          </button>
        </div>

        <Link
          href={discussionHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          💬 Comment
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
