"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { LiveChatMessage } from "@/lib/types";

const NAME_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#4ade80", "#fb923c"];

function nameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  );
}

export default function LiveChat({ streamId, isSignedIn }: { streamId: string; isSignedIn: boolean }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canModerate, setCanModerate] = useState(false);
  const [banning, setBanning] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => setCanModerate(Boolean(d.isAdmin) || (d.moderatorPermissions ?? []).includes("moderate_chat")))
      .catch(() => {});
  }, []);

  async function banUser(userId: string, displayName: string) {
    if (!window.confirm(`Remove ${displayName} from chat?`)) return;
    setBanning(userId);
    await fetch("/api/moderation/chat-bans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, displayName }),
    });
    setBanning(null);
  }

  useEffect(() => {
    fetch(`/api/live-chat?streamId=${streamId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMessages(d.messages);
      });

    const channel = supabaseBrowser()
      .channel(`live-chat-${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `live_stream_id=eq.${streamId}` },
        (payload) => {
          const incoming = payload.new as LiveChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_chat_messages", filter: `live_stream_id=eq.${streamId}` },
        (payload) => {
          const removed = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== removed.id));
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser().removeChannel(channel);
    };
  }, [streamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function submit() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId, body: draft }),
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

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0f0f0f]">
      <div className="border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">Live chat</div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-500">No messages yet. Be the first to say something.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="group flex items-start gap-2 rounded-md px-2 py-1 hover:bg-white/5">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black"
                style={{ backgroundColor: nameColor(m.display_name) }}
              >
                {m.display_name.charAt(0).toUpperCase()}
              </div>
              <p className="min-w-0 flex-1 break-words text-[13px] leading-5">
                <span className="mr-1 font-medium" style={{ color: nameColor(m.display_name) }}>
                  {m.display_name}
                </span>
                <span className="text-white/90">{m.body}</span>
              </p>
              {canModerate && (
                <button
                  onClick={() => banUser(m.user_id, m.display_name)}
                  disabled={banning === m.user_id}
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-red-400 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        {isSignedIn ? (
          <div>
            {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
            <div className="flex items-center gap-1 rounded-full bg-white/10 py-1 pl-4 pr-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                maxLength={300}
                placeholder="Say something..."
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
        ) : (
          <Link
            href={`/signup?next=${encodeURIComponent(pathname)}`}
            className="block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-[#E8D19A] transition hover:bg-white/10"
          >
            Sign up to join the chat
          </Link>
        )}
      </div>
    </div>
  );
}
