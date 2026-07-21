"use client";

import Image from "next/image";
import { useState } from "react";
import type { IncidentPhoto } from "@/lib/types";

export default function PhotoGallery({
  photos,
  title,
  altFallback,
}: {
  photos: IncidentPhoto[];
  title: string;
  altFallback: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
          {title}
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300 transition hover:text-white">
          {open ? "Hide Photos" : `View Photos (${photos.length})`}
          <span
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <Image
                  src={p.url}
                  alt={p.caption || altFallback}
                  fill
                  unoptimized
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              {p.caption && (
                <p className="mt-2 text-xs leading-5 text-slate-400">{p.caption}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
