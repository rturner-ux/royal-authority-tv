"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRole } from "@/lib/roles";
import Avatar from "../../components/Avatar";
import VerifiedBadge from "../../components/VerifiedBadge";
import { useNewMessageSignal } from "../../components/MessageNotificationProvider";

type Conversation = {
  friend: { user_id: string; callsign: string | null; role: string | null; avatar_url: string | null; is_verified: boolean };
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  unreadCount: number;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ConversationList() {
  const pathname = usePathname();
  const newMessageSignal = useNewMessageSignal();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Opening a thread marks its messages read server-side -- refetch on every
  // route change (not just mount) so its row's unread badge clears as soon
  // as you leave the thread, instead of waiting for a full reload. Also
  // refetch whenever MessageNotificationProvider's realtime subscription
  // sees a new DM land, so a conversation you're sitting on this list page
  // for (not inside) updates live instead of needing a manual refresh.
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConversations(d.conversations);
        setLoading(false);
      });
  }, [pathname, newMessageSignal]);

  const activeFriendId = pathname.startsWith("/account/messages/") ? pathname.split("/").pop() : null;
  const shown = unreadOnly ? conversations.filter((c) => c.unreadCount > 0) : conversations;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Link
          href="/account"
          aria-label="Back to profile"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <BackIcon />
        </Link>
        <h1 className="text-lg font-bold text-white">Messages</h1>
      </div>

      <label className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-xs font-semibold text-slate-400">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
          className="h-3.5 w-3.5 accent-[#C9A24A]"
        />
        Unread only
      </label>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="px-5 py-4 text-sm text-slate-500">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="px-5 py-4 text-sm leading-6 text-slate-400">
            {unreadOnly ? "Nothing unread." : (
              <>
                No conversations yet. Add friends from the{" "}
                <Link href="/account/directory" className="text-[#E8D19A] hover:underline">
                  directory
                </Link>{" "}
                to start messaging.
              </>
            )}
          </p>
        ) : (
          shown.map((c) => {
            const role = getRole(c.friend.role);
            const name = c.friend.callsign || "Unnamed Investigator";
            const active = activeFriendId === c.friend.user_id;
            return (
              <Link
                key={c.friend.user_id}
                href={`/account/messages/${c.friend.user_id}`}
                className={`flex items-center gap-3 border-b border-white/5 px-5 py-3.5 transition ${
                  active ? "bg-white/10" : "hover:bg-white/[0.04]"
                }`}
              >
                <Avatar avatarUrl={c.friend.avatar_url} roleBadge={role?.badge ?? null} name={name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-white">{name}</span>
                    {c.friend.is_verified && <VerifiedBadge className="h-3 w-3" />}
                    {role && <span className="flex-shrink-0 text-[0.65rem] text-slate-500">{role.title}</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {c.lastMessage ? c.lastMessage.body : "Say hello."}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  {c.lastMessage && (
                    <span className="text-[0.65rem] text-slate-500">{formatDate(c.lastMessage.created_at)}</span>
                  )}
                  {c.unreadCount > 0 && (
                    <span className="rounded-full bg-[#C9A24A] px-1.5 py-0.5 text-[0.6rem] font-bold text-black">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
