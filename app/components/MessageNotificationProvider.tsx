"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { playMessageNotificationSound } from "@/lib/notificationSound";
import type { DirectMessage } from "@/lib/types";

const UnreadMessageCountContext = createContext(0);
// Bumped on every incoming DM -- lets any mounted component (e.g. the
// conversation list) react to a new message without opening its own
// duplicate realtime subscription for the same table.
const NewMessageSignalContext = createContext(0);

export function useUnreadMessageCount() {
  return useContext(UnreadMessageCountContext);
}

export function useNewMessageSignal() {
  return useContext(NewMessageSignalContext);
}

type Toast = { id: string; senderId: string; senderName: string; body: string };

// Mounted once in the root layout (alongside PresenceProvider) so a DM
// triggers a sound + toast + updated Navbar badge no matter what page the
// recipient is on -- previously, new messages were only visible after a
// manual refresh unless you already had that exact thread open (which has
// its own separate realtime subscription in ThreadClient).
export default function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageSignal, setNewMessageSignal] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const currentUserIdRef = useRef<string | null>(null);

  async function refreshUnreadCount() {
    try {
      const r = await fetch("/api/messages");
      const d = await r.json();
      if (d.success) {
        const total = (d.conversations as { unreadCount: number }[]).reduce((sum, c) => sum + c.unreadCount, 0);
        setUnreadCount(total);
      }
    } catch {
      // Non-critical; badge just stays at its last known value.
    }
  }

  // Refetch whenever the route changes -- covers the same "opening a
  // thread marks it read" case ConversationList already relies on, so the
  // badge count stays in sync with the DB without hand-rolled decrement
  // logic.
  useEffect(() => {
    if (currentUserIdRef.current) refreshUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabaseBrowser().auth.getUser();
      if (cancelled || !user) return;
      currentUserIdRef.current = user.id;
      refreshUnreadCount();

      const client = supabaseBrowser();
      channel = client
        .channel(`dm-notify-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${user.id}` },
          async (payload: { new: DirectMessage }) => {
            const message = payload.new;
            setUnreadCount((c) => c + 1);
            setNewMessageSignal((s) => s + 1);
            playMessageNotificationSound();

            let senderName = "New message";
            try {
              const { data } = await client
                .from("subscriber_profiles")
                .select("callsign")
                .eq("user_id", message.sender_id)
                .single();
              if (data?.callsign) senderName = data.callsign;
            } catch {
              // Fall back to the generic label.
            }

            const toastId = message.id;
            setToasts((prev) => [...prev, { id: toastId, senderId: message.sender_id, senderName, body: message.body }]);
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 6000);
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabaseBrowser().removeChannel(channel);
    };
  }, []);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function openThread(senderId: string, id: string) {
    dismissToast(id);
    router.push(`/account/messages/${senderId}`);
  }

  return (
    <UnreadMessageCountContext.Provider value={unreadCount}>
      <NewMessageSignalContext.Provider value={newMessageSignal}>
        {children}
        <div className="pointer-events-none fixed right-4 top-20 z-[2000] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
          {toasts.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t.senderId, t.id)}
              className="pointer-events-auto flex items-start gap-1 rounded-xl border border-white/10 bg-[#0f172a]/95 p-4 text-left shadow-2xl backdrop-blur-sm transition hover:bg-[#0f172a]"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black uppercase tracking-[0.1em] text-[#E8D19A]">
                  New message from {t.senderName}
                </div>
                <p className="mt-1 truncate text-sm text-slate-200">{t.body}</p>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(t.id);
                }}
                className="flex-shrink-0 px-1 text-slate-500 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </span>
            </button>
          ))}
        </div>
      </NewMessageSignalContext.Provider>
    </UnreadMessageCountContext.Provider>
  );
}
