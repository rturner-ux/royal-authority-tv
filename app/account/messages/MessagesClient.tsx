"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRole } from "@/lib/roles";

type Conversation = {
  friend: { user_id: string; callsign: string | null; role: string | null };
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  unreadCount: number;
};

export default function MessagesClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConversations(d.conversations);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  if (conversations.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-400">
        No conversations yet. Add friends from the{" "}
        <Link href="/account/directory" className="text-[#E8D19A] hover:underline">
          directory
        </Link>{" "}
        to start messaging.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((c) => {
        const role = getRole(c.friend.role);
        const name = c.friend.callsign || "Unnamed Investigator";
        return (
          <Link
            key={c.friend.user_id}
            href={`/account/messages/${c.friend.user_id}`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white/50">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">{name}</span>
                {role && <span className="flex-shrink-0 text-xs text-slate-500">{role.title}</span>}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {c.lastMessage ? c.lastMessage.body : "Say hello."}
              </p>
            </div>
            {c.unreadCount > 0 && (
              <span className="flex-shrink-0 rounded-full bg-[#C9A24A] px-2 py-0.5 text-[0.65rem] font-bold text-black">
                {c.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
