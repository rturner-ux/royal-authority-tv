"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRole } from "@/lib/roles";

type OtherUser = { user_id: string; callsign: string | null; role: string | null };
type Row = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined";
  otherUser: OtherUser;
};

function Person({ otherUser }: { otherUser: OtherUser }) {
  const role = getRole(otherUser.role);
  const name = otherUser.callsign || "Unnamed Investigator";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white/50">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">{name}</div>
        {role && <div className="truncate text-xs text-slate-500">{role.title}</div>}
      </div>
    </div>
  );
}

export default function FriendsClient() {
  const [friends, setFriends] = useState<Row[]>([]);
  const [incoming, setIncoming] = useState<Row[]>([]);
  const [outgoing, setOutgoing] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFriends(d.friends);
          setIncoming(d.incoming);
          setOutgoing(d.outgoing);
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: string, action: "accept" | "decline") {
    setBusy(id);
    const res = await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) load();
  }

  async function cancel(id: string) {
    setBusy(id);
    const res = await fetch(`/api/friends/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) load();
  }

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div className="space-y-10">
      {incoming.length > 0 && (
        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
            Requests ({incoming.length})
          </div>
          <div className="space-y-2">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Person otherUser={r.otherUser} />
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    onClick={() => respond(r.id, "accept")}
                    disabled={busy === r.id}
                    className="rounded-full bg-[#C9A24A] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#E8D19A] disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, "decline")}
                    disabled={busy === r.id}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
          Friends ({friends.length})
        </div>
        {friends.length === 0 ? (
          <p className="text-sm leading-7 text-slate-400">
            No friends yet. Visit the{" "}
            <Link href="/account/directory" className="text-[#E8D19A] hover:underline">
              directory
            </Link>{" "}
            to find people.
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((r) => (
              <Link
                key={r.id}
                href={`/account/messages/${r.otherUser.user_id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25"
              >
                <Person otherUser={r.otherUser} />
                <span className="flex-shrink-0 text-xs font-semibold text-[#E8D19A]">Message →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {outgoing.length > 0 && (
        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
            Sent Requests ({outgoing.length})
          </div>
          <div className="space-y-2">
            {outgoing.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Person otherUser={r.otherUser} />
                <button
                  onClick={() => cancel(r.id)}
                  disabled={busy === r.id}
                  className="flex-shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
