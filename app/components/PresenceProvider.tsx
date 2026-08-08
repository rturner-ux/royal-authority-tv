"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { SITE_PRESENCE_CHANNEL } from "@/lib/presence";

const VisitorCountContext = createContext(1);
const OnlineUsersContext = createContext<Set<string>>(new Set());

export function useVisitorCount() {
  return useContext(VisitorCountContext);
}

// Signed-in subscriber IDs currently on the site, for "online now" dots on
// Friends/Directory/Messages. Anonymous visitors track under a random key
// (still counted in useVisitorCount) so they never collide with a real
// user_id and never show up here.
export function useOnlineUserIds() {
  return useContext(OnlineUsersContext);
}

// Mounted once in the root layout, wrapping every page, so there's exactly
// one Presence channel/subscription per tab no matter how many pages want
// to display the count. Descendants read the live count via
// useVisitorCount() instead of each opening their own channel (which would
// double-count the tab they're rendered in).
export default function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(1);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabaseBrowser().auth.getUser();
      if (cancelled) return;

      const clientId = user?.id ?? crypto.randomUUID();
      channel = supabaseBrowser().channel(SITE_PRESENCE_CHANNEL, {
        config: { presence: { key: clientId } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const keys = Object.keys(channel!.presenceState());
          setCount(keys.length);
          setOnlineIds(new Set(keys));
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") channel!.track({ online_at: Date.now() });
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabaseBrowser().removeChannel(channel);
    };
  }, []);

  return (
    <VisitorCountContext.Provider value={count}>
      <OnlineUsersContext.Provider value={onlineIds}>{children}</OnlineUsersContext.Provider>
    </VisitorCountContext.Provider>
  );
}
