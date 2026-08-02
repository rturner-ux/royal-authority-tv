"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { LiveChatMessage } from "@/lib/types";

const AVATAR_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#4ade80", "#fb923c"];
const VISIBLE_MS = 12000;
const MAX_VISIBLE = 6;

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Read-only, transparent-background feed meant to be captured as an OBS
// Browser Source over the broadcast video -- no compose box, no auth, and
// messages age out on their own instead of piling up on screen forever.
export default function LiveChatOverlay({ streamId }: { streamId: string }) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);

  useEffect(() => {
    const channel = supabaseBrowser()
      .channel(`live-chat-overlay-${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `live_stream_id=eq.${streamId}` },
        (payload) => {
          const incoming = payload.new as LiveChatMessage;
          setMessages((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), incoming]);
          setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== incoming.id));
          }, VISIBLE_MS);
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

  return (
    <div className="flex min-h-screen w-screen flex-col justify-end gap-2 p-8">
      {messages.map((m) => (
        <div
          key={m.id}
          className="flex w-fit max-w-xl animate-[ra-overlay-in_0.25s_ease-out] items-center gap-2 rounded-2xl bg-black/70 px-4 py-2.5 backdrop-blur-sm"
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
            style={{ backgroundColor: avatarColor(m.display_name) }}
          >
            {m.display_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-base font-semibold text-[#E8D19A]">{m.display_name}</span>
          <span className="break-words text-base text-white">{m.body}</span>
        </div>
      ))}
    </div>
  );
}
