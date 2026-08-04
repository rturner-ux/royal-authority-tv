"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { SITE_PRESENCE_CHANNEL } from "@/lib/presence";

const VisitorCountContext = createContext(1);

export function useVisitorCount() {
  return useContext(VisitorCountContext);
}

// Mounted once in the root layout, wrapping every page, so there's exactly
// one Presence channel/subscription per tab no matter how many pages want
// to display the count. Descendants read the live count via
// useVisitorCount() instead of each opening their own channel (which would
// double-count the tab they're rendered in).
export default function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const clientId = crypto.randomUUID();
    const channel = supabaseBrowser().channel(SITE_PRESENCE_CHANNEL, {
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
  }, []);

  return <VisitorCountContext.Provider value={count}>{children}</VisitorCountContext.Provider>;
}
