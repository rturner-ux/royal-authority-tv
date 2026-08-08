"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminNotification = {
  id: string;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export default function ActivityClient() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.notifications);
        setLoading(false);
      });
    fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  if (items.length === 0) {
    return <p className="text-sm leading-7 text-slate-400">No activity yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((n) => {
        const inner = (
          <div
            className={`rounded-2xl border p-4 transition ${
              n.read_at ? "border-white/10 bg-white/[0.02]" : "border-[#C9A24A]/30 bg-[#C9A24A]/[0.05]"
            }`}
          >
            <p className="text-sm text-white">{n.message}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        );
        return n.link ? (
          <Link key={n.id} href={n.link}>
            {inner}
          </Link>
        ) : (
          <div key={n.id}>{inner}</div>
        );
      })}
    </div>
  );
}
