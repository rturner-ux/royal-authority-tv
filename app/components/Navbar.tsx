"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type Crumb = { label: string; href?: string };

type NavbarProps = {
  breadcrumbs?: Crumb[];
  accountLabel?: string;
  accountHref?: string;
};

const PRIMARY_LINKS = [
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

export default function Navbar({
  breadcrumbs,
  accountLabel,
  accountHref,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 mb-10 border-b border-white/10 bg-[#05070b]/90 backdrop-blur-xl">
      {/* Top row: menu / logo / search */}
      <div className="relative flex items-center justify-between gap-4 px-4 py-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-white transition hover:text-[#E8D19A]"
            aria-expanded={menuOpen}
          >
            <span className="text-lg leading-none">☰</span>
            MENU
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d14] shadow-2xl">
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
              </div>
            </>
          )}
        </div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
        >
          <Image src="/crown-logo.png" alt="Royal Authority" width={34} height={34} unoptimized />
          <span className="hidden text-sm font-bold tracking-[0.2em] text-white sm:inline">
            ROYAL AUTHORITY
          </span>
        </Link>

        <form action="/search" className="flex items-center">
          <input
            type="search"
            name="q"
            placeholder="Search cases…"
            className="w-32 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 transition focus:w-48 focus:border-[#C9A24A]/40 sm:w-48 sm:focus:w-64"
          />
        </form>
      </div>

      {/* Primary nav row */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em]">
        {PRIMARY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-slate-300 transition hover:text-[#E8D19A]"
          >
            {link.label}
          </Link>
        ))}

        {accountLabel && accountHref && (
          <Link
            href={accountHref}
            className="text-[#C9A24A] transition hover:text-[#E8D19A]"
          >
            {accountLabel}
          </Link>
        )}
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 text-xs text-slate-500">
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
