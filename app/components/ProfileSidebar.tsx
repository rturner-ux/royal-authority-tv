"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getRole } from "@/lib/roles";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Avatar from "./Avatar";
import VerifiedBadge from "./VerifiedBadge";
import { useMusicPlayer } from "./MusicPlayerContext";

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
function NotificationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
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
function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function TranscriptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8 9l8 5" />
    </svg>
  );
}
function PatternIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M7.8 8.5L10.5 16M16.2 8.5L13.5 16M8.2 7h7.6" />
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 1-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
    </svg>
  );
}

// Most items navigate (href); "Music" instead opens the persistent
// player's panel in place, since there's no dedicated music page.
const NAV_ITEMS: { label: string; href?: string; action?: "music"; icon: () => React.JSX.Element }[] = [
  { label: "Home", href: "/account/home", icon: HomeIcon },
  { label: "Case Files", href: "/account/case-file", icon: FilesIcon },
  { label: "Live", href: "/account/live", icon: LiveIcon },
  { label: "Investigation Map", href: "/account/map", icon: MapIcon },
  { label: "Friends", href: "/account/friends", icon: FriendsIcon },
  { label: "Messages", href: "/account/messages", icon: MessagesIcon },
  { label: "Notifications", href: "/account/notifications", icon: NotificationsIcon },
  { label: "Directory", href: "/account/directory", icon: DirectoryIcon },
  { label: "My Playlists", href: "/account/playlists", icon: PlaylistIcon },
  { label: "My Video Profile", href: "/account/videos", icon: VideoIcon },
  { label: "Music", action: "music", icon: MusicIcon },
  { label: "Transcript Archive", href: "/account/transcript", icon: TranscriptIcon },
  { label: "Investigation Board", href: "/account/investigation-board", icon: BoardIcon },
  { label: "Pattern Intelligence", href: "/account/pattern-intelligence", icon: PatternIcon },
  { label: "AI Picture Scan", href: "/account/picture-scan", icon: ScanIcon },
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { expanded: musicExpanded, setExpanded: setMusicExpanded, current: currentTrack, isPlaying } = useMusicPlayer();

  useEffect(() => {
    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => {
        setRoleKey(d.role ?? null);
        setCallsign(d.callsign ?? null);
        setAvatarUrl(d.avatarUrl ?? null);
        setIsVerified(Boolean(d.isVerified));
        setIsAdmin(Boolean(d.isAdmin));
      })
      .catch(() => {});
  }, []);

  // Opening a thread marks its messages read server-side, but that only
  // updates this badge if we refetch -- rerun on every route change (not
  // just on mount) so leaving a thread reflects the drop immediately.
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const total = d.conversations.reduce((sum: number, c: { unreadCount: number }) => sum + c.unreadCount, 0);
          setUnreadCount(total);
        }
      })
      .catch(() => {});

    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUnreadNotifications(d.notifications.filter((n: { read_at: string | null }) => !n.read_at).length);
        }
      })
      .catch(() => {});
  }, [pathname]);

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
    <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#05070b] px-3 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex">
      <Link href="/account/home" className="flex items-center px-3">
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
        href="/account/search"
        className="mt-6 flex items-center gap-3 rounded-full bg-white/5 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/10"
      >
        <SearchIcon />
        Search
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.action === "music") {
            return (
              <button
                key="music"
                onClick={() => setMusicExpanded((v) => !v)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  musicExpanded ? "text-red-500" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="relative flex-shrink-0">
                  <Icon />
                  {isPlaying && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{currentTrack ? currentTrack.title : item.label}</span>
              </button>
            );
          }

          const active = isActive(item.href!);
          const badgeCount =
            item.href === "/account/messages"
              ? unreadCount
              : item.href === "/account/notifications"
              ? unreadNotifications
              : 0;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "text-red-500" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="relative flex-shrink-0">
                <Icon />
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[0.6rem] font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/account/admin/moderators"
            className={`mt-2 flex items-center gap-3 rounded-xl border border-[#C9A24A]/20 bg-[#C9A24A]/[0.04] px-3 py-2.5 text-sm font-semibold transition ${
              isActive("/account/admin/moderators") ? "text-red-500" : "text-[#E8D19A] hover:bg-[#C9A24A]/10"
            }`}
          >
            <AdminIcon />
            Moderators
          </Link>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <Link
          href="/account"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            pathname === "/account" ? "text-red-500" : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Avatar avatarUrl={avatarUrl} roleBadge={role?.badge ?? null} name={callsign || "?"} size={24} />
          Profile
          {isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <SignOutIcon />
          Sign Out
        </button>

        {/* The one deliberate way out of the sidebar-nav experience -- every
            other link here (Home, Case Files) stays inside it. */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/10"
        >
          <ExitIcon />
          Exit Profile
        </Link>
      </div>
    </aside>
  );
}
