"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRole } from "@/lib/roles";
import Avatar from "./Avatar";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FriendsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="h-6 w-6">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.5 13.6c2.6.5 3.9 2.5 3.9 5.4" strokeLinecap="round" />
    </svg>
  );
}
function FilesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-black">
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M15 4v5h5" strokeLinejoin="round" />
    </svg>
  );
}
function MessagesIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinejoin="round" />
    </svg>
  );
}

// TikTok's mobile tab bar is Home / Friends / [+] / Inbox / Profile -- the
// center "+" is a content-creation button we have no equivalent for (no
// video upload here), so it's replaced with Case Files, the site's actual
// core browsing action, kept visually emphasized the same way.
export default function MobileTabBar() {
  const pathname = usePathname();
  const [callsign, setCallsign] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [roleKey, setRoleKey] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => {
        setCallsign(d.callsign ?? null);
        setAvatarUrl(d.avatarUrl ?? null);
        setRoleKey(d.role ?? null);
      })
      .catch(() => {});

    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const total = d.conversations.reduce((sum: number, c: { unreadCount: number }) => sum + c.unreadCount, 0);
          setUnreadCount(total);
        }
      })
      .catch(() => {});
  }, []);

  const role = getRole(roleKey);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const home = isActive("/account/home");
  const friends = isActive("/account/friends") || isActive("/account/directory");
  const messages = isActive("/account/messages");
  const profile = pathname === "/account";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[999] flex items-center justify-around border-t border-white/10 bg-[#05070b]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl lg:hidden">
      <Link href="/account/home" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${home ? "text-white" : "text-slate-500"}`}>
        <HomeIcon active={home} />
        <span className="text-[0.6rem] font-semibold">Home</span>
      </Link>

      <Link href="/account/friends" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${friends ? "text-white" : "text-slate-500"}`}>
        <FriendsIcon active={friends} />
        <span className="text-[0.6rem] font-semibold">Friends</span>
      </Link>

      <Link href="/account/case-file" aria-label="Case Files" className="flex flex-col items-center px-3 py-1">
        <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-[#C9A24A]">
          <FilesIcon />
        </span>
      </Link>

      <Link href="/account/messages" className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 ${messages ? "text-white" : "text-slate-500"}`}>
        <MessagesIcon active={messages} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[0.55rem] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="text-[0.6rem] font-semibold">Inbox</span>
      </Link>

      <Link href="/account" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${profile ? "text-white" : "text-slate-500"}`}>
        <Avatar avatarUrl={avatarUrl} roleBadge={role?.badge ?? null} name={callsign || "?"} size={24} className={profile ? "ring-2 ring-white" : ""} />
        <span className="text-[0.6rem] font-semibold">Profile</span>
      </Link>
    </nav>
  );
}
