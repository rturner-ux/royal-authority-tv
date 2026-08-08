"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PendingComment = {
  id: string;
  incident_id: string;
  display_name: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
  incident: { title: string; slug: string } | null;
};

export default function ModerationQueueClient() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/moderation/comments")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setComments(d.comments);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function act(commentId: string, action: "approve" | "reject") {
    setActing(commentId);
    const res = await fetch("/api/moderation/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action }),
    });
    setActing(null);
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  if (comments.length === 0) {
    return <p className="text-sm leading-7 text-slate-400">No pending comments. Queue is clear.</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              <span className="font-semibold text-white">{c.display_name}</span>
              {c.parent_comment_id && <span className="ml-1.5 text-slate-500">(reply)</span>}
              {c.incident && (
                <>
                  {" on "}
                  <Link href={`/case-file/${c.incident.slug}`} className="text-[#E8D19A] hover:underline">
                    {c.incident.title}
                  </Link>
                </>
              )}
            </span>
            <span>{new Date(c.created_at).toLocaleString()}</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-200">{c.body}</p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => act(c.id, "approve")}
              disabled={acting === c.id}
              className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => act(c.id, "reject")}
              disabled={acting === c.id}
              className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
