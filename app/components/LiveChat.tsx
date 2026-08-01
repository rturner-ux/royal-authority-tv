"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { LiveChatMessage } from "@/lib/types";

const AVATAR_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#4ade80", "#fb923c"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function LiveChat({ streamId, isSignedIn }: { streamId: string; isSignedIn: boolean }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <div className="flex h-[500px] flex-col rounded-2xl border border-white/10 bg-black/30">
      <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
        Live Chat
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet. Be the first to say something.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black"
                style={{ backgroundColor: avatarColor(m.display_name) }}
              >
                {m.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="mr-1.5 text-xs font-semibold text-white">{m.display_name}</span>
                <span className="break-words text-sm text-slate-300">{m.body}</span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        {isSignedIn ? (
          <div>
            {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                maxLength={300}
                placeholder="Say something..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
              />
              <button
                onClick={submit}
                disabled={submitting || !draft.trim()}
                className="shrink-0 rounded-xl bg-[#C9A24A] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <Link
            href={`/signup?next=${encodeURIComponent(pathname)}`}
            className="block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-[#E8D19A] transition hover:bg-white/10"
          >
            Sign up to join the chat
          </Link>
        )}
      </div>
    </div>
  );
}
