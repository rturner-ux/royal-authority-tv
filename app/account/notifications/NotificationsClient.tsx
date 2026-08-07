"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CaseNotification } from "@/lib/types";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<CaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNotifications(d.notifications);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setBusy(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setBusy(false);
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={markAllRead}
            disabled={busy}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-sm leading-7 text-slate-400">No notifications yet. We&apos;ll let you know when a new case is published.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const unread = !n.read_at;
            return (
              <Link
                key={n.id}
                href={n.incident ? `/account/case-file/${n.incident.slug}` : "/account/case-file"}
                onClick={() => unread && markRead(n.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                  unread ? "border-red-500/30 bg-red-500/[0.04] hover:border-red-500/50" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                {unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />}
                {n.incident?.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.incident.image_url} alt="" className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#E8D19A]">New Case Published</div>
                  <div className="mt-1 truncate text-sm font-semibold text-white">{n.incident?.title ?? "Case no longer available"}</div>
                </div>
                <span className="flex-shrink-0 text-xs text-slate-500">{relativeTime(n.created_at)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
