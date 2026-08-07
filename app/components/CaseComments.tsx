"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CaseComment } from "@/lib/types";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

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

export default function CaseComments({
  incidentId,
  isSignedIn,
  onTotalChange,
}: {
  incidentId: string;
  isSignedIn: boolean;
  onTotalChange?: (total: number) => void;
}) {
  const pathname = usePathname();
  const [sort, setSort] = useState<SortMode>("best");
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const recaptchaLoaded = useRef(false);

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

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

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(sort, next);
  }

  async function getRecaptchaToken(action: string): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) return "";
    await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
    return window.grecaptcha.execute(siteKey, { action });
  }

  function updateComment(id: string, updater: (c: CaseComment) => CaseComment) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) return updater(c);
        if (c.replies?.some((r) => r.id === id)) {
          return { ...c, replies: c.replies.map((r) => (r.id === id ? updater(r) : r)) };
        }
        return c;
      })
    );
  }

  async function vote(commentId: string, direction: 1 | -1) {
    if (!isSignedIn) return;
    const all = comments.flatMap((c) => [c, ...(c.replies ?? [])]);
    const current = all.find((c) => c.id === commentId);
    if (!current) return;
    const nextDirection = current.myVote === direction ? 0 : direction;
    const scoreDelta = nextDirection - current.myVote;

    updateComment(commentId, (c) => ({ ...c, myVote: nextDirection, score: c.score + scoreDelta }));

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
    try {
      const recaptchaToken = await getRecaptchaToken("case_comment");
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

  async function submitReply(parentId: string) {
    if (!replyDraft.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      const recaptchaToken = await getRecaptchaToken("case_comment");
      const res = await fetch("/api/case-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, body: replyDraft, recaptchaToken, parentCommentId: parentId }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setComments((prev) => prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), data.comment] } : c)));
      setTotal((t) => t + 1);
      setExpandedReplies((prev) => new Set(prev).add(parentId));
      setReplyDraft("");
      setReplyOpenFor(null);
    } finally {
      setSubmittingReply(false);
    }
  }

  function toggleReplies(id: string) {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderComment(c: CaseComment, isReply: boolean) {
    return (
      <div key={c.id} className="flex gap-3">
        <div
          className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
          style={{ backgroundColor: avatarColor(c.display_name), width: isReply ? 32 : 40, height: isReply ? 32 : 40 }}
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
          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => vote(c.id, 1)}
                disabled={!isSignedIn}
                className={`text-xs font-semibold transition ${
                  c.myVote === 1 ? "text-[#E8D19A]" : "text-slate-500 hover:text-white"
                }`}
              >
                Like
              </button>
              <button
                onClick={() => vote(c.id, -1)}
                disabled={!isSignedIn}
                className={`text-xs font-semibold transition ${
                  c.myVote === -1 ? "text-red-400" : "text-slate-500 hover:text-white"
                }`}
              >
                Dislike
              </button>
              {!isReply && isSignedIn && (
                <button
                  onClick={() => setReplyOpenFor(replyOpenFor === c.id ? null : c.id)}
                  className="text-xs font-semibold text-slate-500 transition hover:text-white"
                >
                  Reply
                </button>
              )}
            </div>

            {c.score > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0a0d14] px-2 py-0.5 text-[11px] font-semibold text-slate-300 shadow">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] leading-none text-white">
                  👍
                </span>
                {c.score}
              </span>
            )}
          </div>

          {!isReply && replyOpenFor === c.id && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder={`Reply to ${c.display_name}...`}
                maxLength={2000}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
              />
              <button
                onClick={() => submitReply(c.id)}
                disabled={submittingReply || !replyDraft.trim()}
                className="shrink-0 self-end rounded-xl bg-[#C9A24A] px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
              >
                Post
              </button>
            </div>
          )}

          {!isReply && c.replies && c.replies.length > 0 && (
            <div className="mt-3">
              {!expandedReplies.has(c.id) ? (
                <button
                  onClick={() => toggleReplies(c.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#E8D19A] transition hover:underline"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  View {c.replies.length} repl{c.replies.length === 1 ? "y" : "ies"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleReplies(c.id)}
                    className="mb-3 flex items-center gap-1 text-xs font-semibold text-[#E8D19A] transition hover:underline"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Hide replies
                  </button>
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {c.replies.map((r) => renderComment(r, true))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
        <div className="space-y-5">{comments.map((c) => renderComment(c, false))}</div>
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
