"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

type Comment = {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  score: number;
  myVote: number;
};

type SortMode = "best" | "newest" | "oldest";

const AVATAR_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#4ade80", "#fb923c"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default function CaseComments({ incidentId, isSignedIn }: { incidentId: string; isSignedIn: boolean }) {
  const pathname = usePathname();
  const [sort, setSort] = useState<SortMode>("best");
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const recaptchaLoaded = useRef(false);

  useEffect(() => {
    if (!recaptchaLoaded.current && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const rc = document.createElement("script");
      rc.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      document.body.appendChild(rc);
      recaptchaLoaded.current = true;
    }
  }, []);

  const load = useCallback(
    (sortMode: SortMode, pageNum: number) => {
      const setter = pageNum === 0 ? setLoading : setLoadingMore;
      setter(true);
      fetch(`/api/case-comments?incidentId=${incidentId}&sort=${sortMode}&page=${pageNum}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.success) return;
          setComments((prev) => (pageNum === 0 ? d.comments : [...prev, ...d.comments]));
          setTotal(d.total);
          setHasMore(d.hasMore);
        })
        .finally(() => setter(false));
    },
    [incidentId]
  );

  useEffect(() => {
    setPage(0);
    load(sort, 0);
  }, [sort, load]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(sort, next);
  }

  async function vote(commentId: string, direction: 1 | -1) {
    if (!isSignedIn) return;
    const current = comments.find((c) => c.id === commentId);
    if (!current) return;
    const nextDirection = current.myVote === direction ? 0 : direction;
    const scoreDelta = nextDirection - current.myVote;

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, myVote: nextDirection, score: c.score + scoreDelta } : c))
    );

    await fetch("/api/case-comments/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, direction: nextDirection }),
    });
  }

  async function submitComment() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    let recaptchaToken = "";
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
      recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "case_comment" });
    }

    try {
      const res = await fetch("/api/case-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, body: draft, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Could not post your comment.");
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setTotal((t) => t + 1);
      setDraft("");
    } catch {
      setSubmitError("Could not post your comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {!isSignedIn ? (
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-black via-black to-red-700 px-5 py-4">
            <span className="text-lg font-black uppercase tracking-tight text-white">Sign Up to Comment!</span>
            <Link
              href={`/signup?next=${encodeURIComponent(pathname)}`}
              className="shrink-0 rounded-xl border-2 border-white px-4 py-2 text-sm font-black uppercase text-white transition hover:bg-white hover:text-black"
            >
              Add Comment
            </Link>
          </div>
          <p className="bg-black/40 px-5 py-2 text-xs text-slate-400">
            Read our{" "}
            <Link href="/community-guidelines" className="text-[#E8D19A] hover:underline">
              community guidelines
            </Link>{" "}
            for comments on Royal Authority TV.
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Join the discussion..."
            maxLength={2000}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
          />
          {submitError && <p className="mt-2 text-xs text-red-300">{submitError}</p>}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Comments are reviewed before appearing publicly.</span>
            <button
              onClick={submitComment}
              disabled={submitting || !draft.trim()}
              className="rounded-xl bg-[#C9A24A] px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-sm text-slate-400">{total} comment{total === 1 ? "" : "s"}</span>
        <div className="flex gap-1">
          {(["best", "newest", "oldest"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                sort === mode ? "bg-[#C9A24A] text-black" : "text-slate-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet. Be the first to join the discussion.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundColor: avatarColor(c.display_name) }}
              >
                {c.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{c.display_name}</span>
                  <span className="text-xs text-slate-500">{timeAgo(c.created_at)}</span>
                  {c.status === "pending" && (
                    <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E8D19A]">
                      Pending review
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-300">{c.body}</p>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    onClick={() => vote(c.id, 1)}
                    disabled={!isSignedIn}
                    className={`flex items-center gap-1 text-xs transition ${
                      c.myVote === 1 ? "text-[#E8D19A]" : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 4l8 8h-5v8h-6v-8H4z" />
                    </svg>
                    {c.score > 0 ? c.score : ""}
                  </button>
                  <button
                    onClick={() => vote(c.id, -1)}
                    disabled={!isSignedIn}
                    className={`flex items-center gap-1 text-xs transition ${
                      c.myVote === -1 ? "text-red-400" : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 20l-8-8h5V4h6v8h5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : "Load more comments"}
        </button>
      )}
    </div>
  );
}
