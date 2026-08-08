"use client";

import { useEffect, useState } from "react";

type Ban = {
  user_id: string;
  display_name: string;
  banned_at: string;
  reason: string | null;
};

export default function ChatBansClient() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/moderation/chat-bans")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBans(d.bans);
        setLoading(false);
      });
  }, []);

  async function unban(userId: string) {
    setRemoving(userId);
    const res = await fetch(`/api/moderation/chat-bans?userId=${userId}`, { method: "DELETE" });
    setRemoving(null);
    if (res.ok) setBans((prev) => prev.filter((b) => b.user_id !== userId));
  }

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  if (bans.length === 0) {
    return <p className="text-sm leading-7 text-slate-400">No one is currently banned from chat.</p>;
  }

  return (
    <div className="space-y-3">
      {bans.map((b) => (
        <div
          key={b.user_id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{b.display_name}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              Banned {new Date(b.banned_at).toLocaleString()}
              {b.reason ? ` (${b.reason})` : ""}
            </div>
          </div>
          <button
            onClick={() => unban(b.user_id)}
            disabled={removing === b.user_id}
            className="flex-shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            Unban
          </button>
        </div>
      ))}
    </div>
  );
}
