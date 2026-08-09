"use client";

import { useState } from "react";
import Link from "next/link";
import CasePartnerNotes from "../../components/CasePartnerNotes";

type OtherUser = {
  user_id: string;
  callsign: string | null;
  role: string | null;
  avatar_url: string | null;
  is_verified: boolean;
};
type CaseRef = { id: string; title: string; slug: string } | null;
type Partnership = { id: string; status: "pending" | "accepted" | "declined"; case: CaseRef };
type PlaylistCase = { incident: { id: string; title: string; slug: string } | null };
type Playlist = { id: string; name: string; cases: PlaylistCase[] };

// Case Partners moved here from the case-file page -- a partnership is
// always tied to one specific case, so inviting a friend now means picking
// which of your saved cases to invite them to, instead of that choice being
// implicit in "whatever case page you happen to be on."
export default function PartnerUpButton({
  friend,
  currentUserId,
}: {
  friend: OtherUser;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<Partnership[]>([]);
  const [incoming, setIncoming] = useState<Partnership[]>([]);
  const [outgoing, setOutgoing] = useState<Partnership[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openNotesFor, setOpenNotesFor] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch(`/api/case-partners?friendId=${friend.user_id}`).then((r) => r.json()),
      fetch("/api/playlists").then((r) => r.json()),
    ]).then(([cp, pl]) => {
      if (cp.success) {
        setAccepted(cp.accepted);
        setIncoming(cp.incoming);
        setOutgoing(cp.outgoing);
      }
      if (pl.success) setPlaylists(pl.playlists);
      setLoading(false);
      setLoaded(true);
    });
  }

  function toggleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
    if (!loaded) load();
  }

  async function invite(slug: string) {
    setSending(slug);
    setError(null);
    const res = await fetch("/api/case-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, partnerId: friend.user_id }),
    });
    const data = await res.json();
    setSending(null);
    if (!res.ok) {
      setError(data.error || "Could not send invite.");
      return;
    }
    load();
  }

  async function respond(id: string, action: "accept" | "decline") {
    setSending(id);
    await fetch(`/api/case-partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setSending(null);
    load();
  }

  async function cancel(id: string) {
    setSending(id);
    await fetch(`/api/case-partners/${id}`, { method: "DELETE" });
    setSending(null);
    load();
  }

  const partneredSlugs = new Set(
    [...accepted, ...incoming, ...outgoing].map((p) => p.case?.slug).filter(Boolean)
  );
  const uniqueCases = new Map<string, { title: string; slug: string }>();
  for (const pl of playlists) {
    for (const c of pl.cases) {
      if (c.incident && !partneredSlugs.has(c.incident.slug)) {
        uniqueCases.set(c.incident.slug, { title: c.incident.title, slug: c.incident.slug });
      }
    }
  }
  const invitable = Array.from(uniqueCases.values());
  const friendName = friend.callsign || "this friend";

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={toggleOpen}
        className="rounded-full border border-[#C9A24A]/30 px-3 py-1.5 text-xs font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/10"
      >
        Partner Up
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setOpen(false); }} />
          <div
            onClick={(e) => e.preventDefault()}
            className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0d14] p-4 shadow-2xl"
          >
            {loading ? (
              <p className="text-xs text-slate-500">Loading...</p>
            ) : (
              <div className="space-y-4">
                {incoming.length > 0 && (
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Wants to partner with you
                    </div>
                    {incoming.map((p) => (
                      <div
                        key={p.id}
                        className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                      >
                        <span className="truncate text-xs text-white">{p.case?.title ?? "Unknown case"}</span>
                        <div className="flex flex-shrink-0 gap-1">
                          <button
                            onClick={() => respond(p.id, "accept")}
                            disabled={sending === p.id}
                            className="rounded-full bg-[#C9A24A] px-2 py-1 text-[10px] font-bold text-black disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respond(p.id, "decline")}
                            disabled={sending === p.id}
                            className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-slate-300 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {accepted.length > 0 && (
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Partnered cases
                    </div>
                    {accepted.map((p) => (
                      <div key={p.id}>
                        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                          <Link
                            href={p.case ? `/case-file/${p.case.slug}` : "#"}
                            className="truncate text-xs text-white hover:underline"
                          >
                            {p.case?.title ?? "Unknown case"}
                          </Link>
                          <button
                            onClick={() => setOpenNotesFor(openNotesFor === p.id ? null : p.id)}
                            className="flex-shrink-0 rounded-full border border-[#C9A24A]/30 px-2 py-1 text-[10px] font-semibold text-[#E8D19A]"
                          >
                            {openNotesFor === p.id ? "Hide" : "Notes"}
                          </button>
                        </div>
                        {openNotesFor === p.id && (
                          <CasePartnerNotes partnershipId={p.id} currentUserId={currentUserId} otherUser={friend} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {outgoing.length > 0 && (
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Invite sent
                    </div>
                    {outgoing.map((p) => (
                      <div
                        key={p.id}
                        className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                      >
                        <span className="truncate text-xs text-white">{p.case?.title ?? "Unknown case"}</span>
                        <button
                          onClick={() => cancel(p.id)}
                          disabled={sending === p.id}
                          className="flex-shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px] text-slate-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && <p className="text-[10px] text-red-300">{error}</p>}

                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Invite to a saved case
                  </div>
                  {invitable.length === 0 ? (
                    <p className="text-xs leading-5 text-slate-500">
                      Save a case to a playlist first, then invite {friendName} to partner on it.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {invitable.map((c) => (
                        <div
                          key={c.slug}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                        >
                          <span className="truncate text-xs text-white">{c.title}</span>
                          <button
                            onClick={() => invite(c.slug)}
                            disabled={sending === c.slug}
                            className="flex-shrink-0 rounded-full bg-[#C9A24A] px-2 py-1 text-[10px] font-bold text-black disabled:opacity-50"
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
