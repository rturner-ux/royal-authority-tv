"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getRole } from "@/lib/roles";
import { supabaseBrowser } from "@/lib/supabase/browser";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FilesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M15 4v5h5" strokeLinejoin="round" />
    </svg>
  );
}
function LiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <rect x="2" y="6" width="15" height="12" rx="2" />
      <path d="M22 8.5l-5 3.5 5 3.5v-7Z" strokeLinejoin="round" />
    </svg>
  );
}
function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.5 13.6c2.6.5 3.9 2.5 3.9 5.4" strokeLinecap="round" />
    </svg>
  );
}
function MessagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinejoin="round" />
    </svg>
  );
}
function DirectoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
    </svg>
  );
}
function PlaylistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M4 6h12M4 12h12M4 18h7" strokeLinecap="round" />
      <path d="M17 15l5 3-5 3v-6Z" strokeLinejoin="round" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10l6-3.5v11L16 14" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Case Files", href: "/case-file", icon: FilesIcon },
  { label: "Live", href: "/live", icon: LiveIcon },
  { label: "Friends", href: "/account/friends", icon: FriendsIcon },
  { label: "Messages", href: "/account/messages", icon: MessagesIcon },
  { label: "Directory", href: "/account/directory", icon: DirectoryIcon },
  { label: "My Playlists", href: "/account/playlists", icon: PlaylistIcon },
  { label: "My Video Profile", href: "/account/videos", icon: VideoIcon },
];

// Persistent left nav for the account/subscriber section only -- public
// pages (homepage, case files, live) keep the existing top Navbar. Only
// shown at lg+; each account page's own Navbar stays visible below that so
// there's no navigation dead-end on mobile.
export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [callsign, setCallsign] = useState<string | null>(null);
  const [roleKey, setRoleKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => {
        setRoleKey(d.role ?? null);
        setCallsign(d.callsign ?? null);
      })
      .catch(() => {});
  }, []);

  const role = getRole(roleKey);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  async function handleSignOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-white/10 bg-[#05070b] px-3 py-6 lg:flex">
      <Link href="/" className="flex items-center px-3">
        <Image
          src="/royal-authority-wordmark.png"
          alt="Royal Authority TV"
          width={130}
          height={30}
          unoptimized
          className="h-7 w-auto"
        />
      </Link>

      <Link
        href="/search"
        className="mt-6 flex items-center gap-3 rounded-full bg-white/5 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/10"
      >
        <SearchIcon />
        Search
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <Link
          href="/account"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            pathname === "/account" ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-white/10">
            {role ? (
              <Image src={role.badge} alt="" fill unoptimized className="object-contain p-0.5" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[10px] font-bold text-white/50">
                {(callsign || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <SignOutIcon />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
