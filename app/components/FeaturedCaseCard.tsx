"use client";

import Link from "next/link";
import Image from "next/image";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS, isActiveAlert, statusBadgeLabel } from "@/lib/labels";
import { playSfx } from "@/lib/sfx";
import { formatCompactCount } from "@/lib/format";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 4.5v15l14-7.5-14-7.5Z" />
    </svg>
  );
}

export default function FeaturedCaseCard({
  incident,
  basePath = "/case-file",
}: {
  incident: Incident;
  // Lets the wrapped /account/case-file listing keep case clicks inside
  // "profile mode" (/account/case-file/[slug]) instead of dropping back to
  // the public route.
  basePath?: string;
}) {
  const alert = isActiveAlert(incident);
  const badge = statusBadgeLabel(incident);

  return (
    <Link
      href={`${basePath}/${incident.slug}`}
      onClick={() => playSfx("shutter")}
      className={`group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition hover:scale-[1.02] hover:border-[#C9A24A]/30 ${
        alert ? "ra-alert-card" : ""
      }`}
    >
      <div className="relative h-[280px] overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01]">
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}
        {incident.image_url ? (
          <Image
            src={incident.image_url}
            alt={incident.title}
            fill
            unoptimized
            className="object-cover object-top transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-white/10">?</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          <PlayIcon />
          {formatCompactCount(incident.view_count ?? 0)}
        </div>
      </div>

      <div className="space-y-3 p-5">
        {incident.is_featured && (
          <span className="text-xs tracking-[0.2em] text-red-400">FEATURED CASE</span>
        )}

        <h3 className="text-xl font-bold text-white">{incident.title}</h3>

        <p className="text-sm leading-6 text-gray-400">
          {CATEGORY_LABELS[incident.category]}
          {incident.location_label ? ` · ${incident.location_label}` : ""}
        </p>

        <div className="pt-2">
          <span className="text-sm font-semibold text-[#C9A24A] transition group-hover:text-white">
            Open Case →
          </span>
        </div>
      </div>
    </Link>
  );
}
