"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/roles";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type Crumb = { label: string; href?: string };

type NavbarProps = {
  breadcrumbs?: Crumb[];
  accountLabel?: string;
  accountHref?: string;
};

const PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Case Files", href: "/case-file" },
  { label: "Transcript Archive", href: "/transcript" },
  { label: "Investigation Map", href: "/map" },
  { label: "Subscribe", href: "/subscribe" },
];

const MENU_LINKS = [
  { label: "Home", href: "/" },
  { label: "Case Files", href: "/case-file" },
  { label: "Transcript Archive", href: "/transcript" },
  { label: "Investigation Map", href: "/map" },
  { label: "Subscribe", href: "/subscribe" },
  { label: "My Account", href: "/account" },
];

// Only shown to active subscribers -- both in the primary link row and the
// hamburger menu, so these tools are actually reachable instead of only
// linked from deep inside the Member Room page.
const SUBSCRIBER_LINKS = [
  { label: "Investigation Board", href: "/investigation-board" },
  { label: "Pattern Intelligence", href: "/pattern-intelligence" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px]">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Navbar({
  breadcrumbs,
  accountLabel,
  accountHref,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [roleKey, setRoleKey] = useState<string | null>(null);
  const [callsign, setCallsign] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscriber-status")
      .then((r) => r.json())
      .then((d) => {
        setIsActive(Boolean(d.isActive));
        setRoleKey(d.role ?? null);
        setCallsign(d.callsign ?? null);
      })
      .catch(() => setIsActive(false));
  }, []);

  const role = getRole(roleKey);

  function isLinkActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  async function handleSignOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className={`sticky top-0 z-[999] w-screen ml-[calc(50%-50vw)] mb-10 backdrop-blur-xl transition-colors ${
        isActive
          ? "border-b border-[#C9A24A]/50 bg-[#0a0704]/90"
          : "border-b border-white/10 bg-[#05070b]/90"
      }`}
    >
      {/* Single row: menu (mobile only) / logo / pill nav (xl+) / icon cluster -- nothing wraps, ever */}
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="relative flex-shrink-0 xl:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold tracking-widest text-white transition hover:text-[#E8D19A] sm:gap-2 sm:text-sm"
            aria-expanded={menuOpen}
          >
            <span className="text-base leading-none sm:text-lg">☰</span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 top-full z-[9999] mt-3 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d14] shadow-2xl">
                {MENU_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

                {isActive && (
                  <>
                    <div className="border-t border-[#C9A24A]/20 px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
                      Subscriber Tools
                    </div>
                    {SUBSCRIBER_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block bg-[#C9A24A]/[0.06] px-4 py-3 text-sm text-[#E8D19A] transition hover:bg-[#C9A24A]/10"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <Link href="/" className="flex-shrink-0">
          <Image
            src="/royal-authority-wordmark.png"
            alt="Royal Authority TV"
            width={65}
            height={60}
            unoptimized
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        {/* Pill nav: only shown once there's room for all of them in one line;
            below that breakpoint everything still works via the hamburger menu. */}
        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-sm font-semibold xl:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 transition ${
                isLinkActive(link.href)
                  ? "bg-[#C9A24A]/15 text-[#E8D19A]"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isActive &&
            SUBSCRIBER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 transition ${
                  isLinkActive(link.href)
                    ? "bg-[#C9A24A]/15 text-[#E8D19A]"
                    : "text-[#E8D19A]/80 hover:text-[#E8D19A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="min-w-0 flex-1 xl:hidden" />

        {/* Icon cluster: search, then account -- mirrors the profile-row
            pattern of icon-first controls instead of a permanently open
            search box and a plain text account link. */}
        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
          {!isActive && (
            <Link
              href="/subscribe"
              className="rounded-full bg-[#C9A24A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-black transition hover:opacity-90 sm:px-4 sm:text-xs xl:hidden"
            >
              Subscribe
            </Link>
          )}

          {searchOpen ? (
            <form action="/search" className="flex items-center">
              <input
                type="search"
                name="q"
                autoFocus
                placeholder="Search cases…"
                onBlur={(e) => {
                  if (!e.target.value) setSearchOpen(false);
                }}
                className="w-32 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#C9A24A]/40 sm:w-44 sm:px-4 sm:py-2 sm:text-sm"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="text-slate-300 transition hover:text-white"
            >
              <SearchIcon />
            </button>
          )}

          {accountLabel && accountHref && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 text-xs font-semibold text-[#C9A24A] transition hover:text-[#E8D19A]"
              >
                {role ? (
                  <span className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={role.badge} alt="" fill unoptimized className="object-contain" />
                  </span>
                ) : (
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-sm">
                    👤
                  </span>
                )}
                <span className="hidden uppercase tracking-[0.1em] sm:inline">
                  {role ? callsign || role.title : accountLabel}
                </span>
                {isActive && !role && (
                  <span className="hidden rounded-full border border-[#C9A24A]/40 bg-[#C9A24A]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#E8D19A] sm:inline">
                    PREMIUM
                  </span>
                )}
                <ChevronIcon open={accountOpen} />
              </button>

              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-[9999] mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d14] shadow-2xl">
                    <Link
                      href={accountHref}
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 text-[11px] text-slate-500 sm:px-4 sm:text-xs">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-700">›</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="transition hover:text-slate-300">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-300">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
