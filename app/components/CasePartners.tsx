"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRole } from "@/lib/roles";
import Avatar from "./Avatar";
import VerifiedBadge from "./VerifiedBadge";
import CasePartnerNotes from "./CasePartnerNotes";

type OtherUser = {
  user_id: string;
  callsign: string | null;
  role: string | null;
  avatar_url: string | null;
  is_verified: boolean;
};
type Partnership = {
  id: string;
  status: "pending" | "accepted" | "declined";
  otherUser: OtherUser;
};
type Friend = { otherUser: OtherUser };

function Person({ otherUser }: { otherUser: OtherUser }) {
  const role = getRole(otherUser.role);
  const name = otherUser.callsign || "Unnamed Investigator";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar avatarUrl={otherUser.avatar_url} roleBadge={role?.badge ?? null} name={name} size={40} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-white">{name}</span>
          {otherUser.is_verified && <VerifiedBadge className="h-3.5 w-3.5" />}
        </div>
        {role && <div className="truncate text-xs text-slate-500">{role.title}</div>}
      </div>
    </div>
  );
}

export default function CasePartners({
  slug,
  isActive,
  currentUserId,
}: {
  slug: string;
  isActive: boolean;
  currentUserId: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<Partnership[]>([]);
  const [incoming, setIncoming] = useState<Partnership[]>([]);
  const [outgoing, setOutgoing] = useState<Partnership[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [openNotesFor, setOpenNotesFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([
      fetch(`/api/case-partners?slug=${slug}`).then((r) => r.json()),
      fetch("/api/friends").then((r) => r.json()),
    ]).then(([cp, f]) => {
      if (cp.success) {
        setAccepted(cp.accepted);
        setIncoming(cp.incoming);
        setOutgoing(cp.outgoing);
      }
      if (f.success) setFriends(f.friends);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (isActive && currentUserId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentUserId, slug]);

  async function invite(partnerId: string) {
    setBusy(partnerId);
    setError(null);
    const res = await fetch("/api/case-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, partnerId }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "Could not send partner invite.");
      return;
    }
    load();
  }

  async function respond(id: string, action: "accept" | "decline") {
    setBusy(id);
    const res = await fetch(`/api/case-partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) load();
  }

  async function cancel(id: string) {
    setBusy(id);
    const res = await fetch(`/api/case-partners/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) load();
  }

  if (!isActive) {
    return (
      <section className="rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Partner Up</div>
          <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
            Premium
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Investigate this case with a friend. Partner up to get a private, shared notes thread just for the two of you.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Subscribe to Unlock Partner Up
        </Link>
      </section>
    );
  }

  if (!currentUserId) return null;

  const partneredIds = new Set([
    ...accepted.map((p) => p.otherUser.user_id),
    ...incoming.map((p) => p.otherUser.user_id),
    ...outgoing.map((p) => p.otherUser.user_id),
  ]);
  const invitable = friends.filter((f) => !partneredIds.has(f.otherUser.user_id));

  return (
    <section className="rounded-[32px] border border-[#C9A24A]/20 bg-gradient-to-br from-[#C9A24A]/[0.07] to-transparent p-7 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Partner Up</div>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        Investigate this case with a friend. Partner up to get a private, shared notes thread just for the two of you.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="mt-5 space-y-5">
          {incoming.length > 0 && (
            <div className="space-y-2">
              {incoming.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  <Person otherUser={p.otherUser} />
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      onClick={() => respond(p.id, "accept")}
                      disabled={busy === p.id}
                      className="rounded-full bg-[#C9A24A] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#E8D19A] disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(p.id, "decline")}
                      disabled={busy === p.id}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {accepted.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-3">
                <Person otherUser={p.otherUser} />
                <button
                  onClick={() => setOpenNotesFor(openNotesFor === p.id ? null : p.id)}
                  className="flex-shrink-0 rounded-full border border-[#C9A24A]/30 px-3 py-1.5 text-xs font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/10"
                >
                  {openNotesFor === p.id ? "Hide Notes" : "Shared Notes"}
                </button>
              </div>
              {openNotesFor === p.id && (
                <CasePartnerNotes partnershipId={p.id} currentUserId={currentUserId} otherUser={p.otherUser} />
              )}
            </div>
          ))}

          {outgoing.length > 0 && (
            <div className="space-y-2">
              {outgoing.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  <Person otherUser={p.otherUser} />
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-500">Invite sent</span>
                    <button
                      onClick={() => cancel(p.id)}
                      disabled={busy === p.id}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-300">{error}</p>}

          {invitable.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Invite a friend to partner on this case
              </div>
              <div className="space-y-2">
                {invitable.map((f) => (
                  <div key={f.otherUser.user_id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                    <Person otherUser={f.otherUser} />
                    <button
                      onClick={() => invite(f.otherUser.user_id)}
                      disabled={busy === f.otherUser.user_id}
                      className="flex-shrink-0 rounded-full bg-[#C9A24A] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#E8D19A] disabled:opacity-50"
                    >
                      Partner Up
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {accepted.length === 0 && incoming.length === 0 && outgoing.length === 0 && invitable.length === 0 && (
            <p className="text-sm leading-7 text-slate-400">
              No friends yet. Visit the{" "}
              <Link href="/account/directory" className="text-[#E8D19A] hover:underline">
                directory
              </Link>{" "}
              to find people, then partner up here.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
