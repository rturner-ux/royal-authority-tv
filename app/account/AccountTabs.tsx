"use client";

import { useState } from "react";
import Link from "next/link";

type PlaylistPreview = {
  id: string;
  name: string;
  caseCount: number;
  thumbnails: string[];
};

type CaseRequest = {
  id: string;
  topic: string;
  message: string;
  created_at: string;
  incident: { title: string; slug: string | null } | null;
};

export default function AccountTabs({
  playlists,
  caseRequests,
}: {
  playlists: PlaylistPreview[];
  caseRequests: CaseRequest[];
}) {
  const [tab, setTab] = useState<"playlists" | "requests">("playlists");

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setTab("playlists")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "playlists"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "requests"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Case Requests
        </button>
      </div>

      {tab === "playlists" && (
        <div className="mt-5">
          {playlists.length === 0 ? (
            <p className="text-sm leading-7 text-slate-400">
              You don&apos;t have any playlists yet.{" "}
              <Link href="/account/playlists" className="text-[#E8D19A] hover:underline">
                Create one →
              </Link>
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p) => (
                <Link
                  key={p.id}
                  href="/account/playlists"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25"
                >
                  <div className="flex gap-1">
                    {p.thumbnails.length > 0 ? (
                      p.thumbnails.slice(0, 3).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                          style={{ marginLeft: i > 0 ? "-0.5rem" : 0 }}
                        />
                      ))
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#181818] text-white/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                          <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 truncate font-serif text-base text-white">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.caseCount} {p.caseCount === 1 ? "case" : "cases"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="mt-5">
          {caseRequests.length === 0 ? (
            <p className="text-sm leading-7 text-slate-400">
              You haven&apos;t submitted any case requests yet. Open any case&apos;s Member Room to
              submit one.
            </p>
          ) : (
            <div className="space-y-4">
              {caseRequests.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-white">{r.topic}</h3>
                    <span className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{r.message}</p>
                  {r.incident?.slug && (
                    <Link
                      href={`/case-file/${r.incident.slug}`}
                      className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-[#E8D19A] hover:underline"
                    >
                      {r.incident.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
