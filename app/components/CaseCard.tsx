import Link from "next/link";
import Image from "next/image";
import type { Incident } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/labels";

export default function CaseCard({ incident }: { incident: Incident }) {
  return (
    <Link
      href={`/case-file/${incident.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition hover:scale-[1.02] hover:border-[#C9A24A]/30"
    >
      <div className="relative h-[280px] overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01]">
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
      </div>

      <div className="space-y-3 p-5">
        <span className="text-xs tracking-[0.2em] text-red-400">
          {CATEGORY_LABELS[incident.category].toUpperCase()}
        </span>

        <h3 className="text-xl font-bold text-white">{incident.title}</h3>

        <p className="text-sm leading-6 text-gray-400">{incident.location_label || ""}</p>

        <div className="pt-2">
          <span className="text-sm font-semibold text-[#C9A24A] transition group-hover:text-white">
            Open Case →
          </span>
        </div>
      </div>
    </Link>
  );
}
