"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { DirectMessage } from "@/lib/types";
import Avatar from "../../../components/Avatar";
import VerifiedBadge from "../../../components/VerifiedBadge";

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  );
}

export default function ThreadClient({
  currentUserId,
  friendId,
  friendName,
  friendAvatarUrl = null,
  friendVerified = false,
}: {
  currentUserId: string;
  friendId: string;
  friendName: string;
  friendAvatarUrl?: string | null;
  friendVerified?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages/${friendId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMessages(d.messages);
        setLoading(false);
      });

    function onInsert(payload: { new: DirectMessage }) {
      const incoming = payload.new;
      const isThisThread =
        (incoming.sender_id === currentUserId && incoming.recipient_id === friendId) ||
        (incoming.sender_id === friendId && incoming.recipient_id === currentUserId);
      if (!isThisThread) return;
      setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
    }

    const client = supabaseBrowser();
    const channel = client
      .channel(`dm-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${currentUserId}` },
        onInsert
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `sender_id=eq.${currentUserId}` },
        onInsert
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [currentUserId, friendId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function submit() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${friendId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send your message.");
        return;
      }
      setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
      setDraft("");
    } catch {
      setError("Could not send your message.");
    } finally {
      setSubmitting(false);
    }
  }

  async function blockUser() {
    if (!confirm(`Block ${friendName}? This removes your friendship and they won't be able to message you.`)) return;
    const res = await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friendId }),
    });
    if (res.ok) router.push("/account/messages");
  }

  async function reportUser() {
    const reason = prompt(`Report ${friendName}. What happened?`);
    if (!reason?.trim()) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friendId, reason }),
    });
    setMenuOpen(false);
    alert("Report filed. Thanks for flagging it.");
  }

  return (
    <div className="flex h-full min-h-[500px] flex-col overflow-hidden bg-[#0f0f0f] lg:h-full">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Avatar avatarUrl={friendAvatarUrl} roleBadge={null} name={friendName} size={32} />
          <span className="text-sm font-semibold text-white">{friendName}</span>
          {friendVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
        </div>
        {/* Desktop gets a dedicated details panel (block/report live there);
            this menu is the mobile-only equivalent since that panel is
            hidden below lg. */}
        <div className="relative lg:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="rounded-full px-2 py-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            •••
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0a0d14] shadow-2xl">
                <button
                  onClick={reportUser}
                  className="block w-full px-4 py-3 text-left text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Report
                </button>
                <button
                  onClick={blockUser}
                  className="block w-full px-4 py-3 text-left text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  Block
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet. Say hello.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      mine ? "bg-[#C9A24A] text-black" : "bg-white/10 text-white"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
        <div className="flex items-center gap-1 rounded-full bg-white/10 py-1 pl-4 pr-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            maxLength={2000}
            placeholder="Message..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button
            onClick={submit}
            disabled={submitting || !draft.trim()}
            aria-label="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A24A] text-black transition hover:opacity-90 disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
