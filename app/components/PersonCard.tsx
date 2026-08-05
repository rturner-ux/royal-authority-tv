"use client";

import { useState } from "react";
import Image from "next/image";
import type { IncidentPerson } from "@/lib/types";
import { PERSON_ROLE_LABELS, PERSON_ROLE_CLASSES } from "@/lib/labels";
import PersonPhotoVideo from "./PersonPhotoVideo";
import PersonProfileTabs from "./PersonProfileTabs";

// Collapsed by default (compact, scannable in a grid) since a case can have
// a dozen-plus people; clicking expands the card in place to the full
// profile. Click/tap rather than hover-only so this works on mobile too.
export default function PersonCard({
  person,
  isMissingAlert,
}: {
  person: IncidentPerson;
  isMissingAlert: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <div
        className={`col-span-full rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm ${
          isMissingAlert ? "ra-alert-card" : ""
        }`}
      >
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.3em] text-red-400">
              Investigative Focus
            </div>
            <h3 className="mt-2 font-serif text-2xl text-white md:text-3xl">
              {PERSON_ROLE_LABELS[person.role]}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {person.status && (
              <div
                className={`max-w-full whitespace-normal break-words rounded-2xl border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.15em] md:max-w-[380px] ${PERSON_ROLE_CLASSES[person.role]}`}
              >
                {person.status}
              </div>
            )}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex-shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Collapse
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Profile
            </div>

            <PersonPhotoVideo
              photoUrl={person.photo_url}
              videoUrl={person.video_url}
              name={person.name}
              photoFit={person.photo_fit}
            />

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-white">Name:</span>{" "}
                {person.name}
              </div>
              {person.age && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">Age:</span>{" "}
                  {person.age}
                </div>
              )}
            </div>
          </div>

          <PersonProfileTabs person={person} />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      aria-expanded={false}
      className={`group flex items-center gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 text-left backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C9A24A]/30 hover:bg-white/[0.05] ${
        isMissingAlert ? "ra-alert-card" : ""
      }`}
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
        {person.photo_url ? (
          <Image src={person.photo_url} alt={person.name} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/40">
            {person.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-red-400">
          {PERSON_ROLE_LABELS[person.role]}
        </div>
        <div className="mt-1 truncate font-serif text-lg text-white">{person.name}</div>
        {person.status && (
          <div
            className={`mt-1.5 inline-block max-w-full truncate rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${PERSON_ROLE_CLASSES[person.role]}`}
          >
            {person.status}
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5 flex-shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#C9A24A]"
      >
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
