"use client";

import { useEffect, useState } from "react";
import { getRole } from "@/lib/roles";
import Avatar from "../../components/Avatar";
import VerifiedBadge from "../../components/VerifiedBadge";

type Profile = {
  user_id: string;
  callsign: string;
  role: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  friendStatus: "none" | "pending" | "friends";
};

export default function DirectoryClient() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  function load(q?: string) {
    setLoading(true);
    fetch(`/api/directory${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProfiles(d.profiles);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function sendRequest(recipientId: string) {
    setSending(recipientId);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    setSending(null);
    if (res.ok) {
      setProfiles((prev) =>
        prev.map((p) => (p.user_id === recipientId ? { ...p, friendStatus: "pending" } : p))
      );
    }
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by callsign..."
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {profiles.map((p) => {
          const role = getRole(p.role);
          return (
            <div
              key={p.user_id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <Avatar avatarUrl={p.avatar_url} roleBadge={role?.badge ?? null} name={p.callsign} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-white">{p.callsign}</span>
                  {p.is_verified && <VerifiedBadge className="h-3.5 w-3.5" />}
                </div>
                {role && <div className="truncate text-xs text-slate-500">{role.title}</div>}
              </div>

              {p.friendStatus === "friends" ? (
                <span className="flex-shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300">
                  Friends
                </span>
              ) : p.friendStatus === "pending" ? (
                <span className="flex-shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-400">
                  Pending
                </span>
              ) : (
                <button
                  onClick={() => sendRequest(p.user_id)}
                  disabled={sending === p.user_id}
                  className="flex-shrink-0 rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1.5 text-xs font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/20 disabled:opacity-50"
                >
                  Add Friend
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!loading && profiles.length === 0 && (
        <p className="mt-6 text-sm leading-7 text-slate-400">
          {query ? "No one matches that search." : "No one has opted into the directory yet."}
        </p>
      )}
    </div>
  );
}
