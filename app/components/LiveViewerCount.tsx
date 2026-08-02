"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Uses Supabase Realtime Presence (not a DB table) to count open tabs on
// this page right now -- counts every visitor watching, not just people
// who chat, and updates instantly with no polling/analytics lag.
export default function LiveViewerCount({ streamId }: { streamId: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const clientId = crypto.randomUUID();
    const channel = supabaseBrowser().channel(`live-viewers-${streamId}`, {
      config: { presence: { key: clientId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") channel.track({ online_at: Date.now() });
      });

    return () => {
      supabaseBrowser().removeChannel(channel);
    };
  }, [streamId]);

  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {count} watching
    </span>
  );
}
