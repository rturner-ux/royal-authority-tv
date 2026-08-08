"use client";

import { useEffect, useState } from "react";
import Avatar from "../../../components/Avatar";
import VerifiedBadge from "../../../components/VerifiedBadge";

type Member = {
  user_id: string;
  callsign: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_admin: boolean;
  is_moderator: boolean;
};

export default function ModeratorsClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  function load(q?: string) {
    setLoading(true);
    fetch(`/api/admin/moderators${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMembers(d.members);
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

  async function toggleModerator(userId: string, next: boolean) {
    setSaving(userId);
    const res = await fetch("/api/admin/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isModerator: next }),
    });
    setSaving(null);
    if (res.ok) {
      setMembers((prev) => prev.map((m) => (m.user_id === userId ? { ...m, is_moderator: next } : m)));
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
        {members.map((m) => (
          <div
            key={m.user_id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <Avatar avatarUrl={m.avatar_url} roleBadge={null} name={m.callsign} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-white">{m.callsign}</span>
                {m.is_verified && <VerifiedBadge className="h-3.5 w-3.5" />}
              </div>
              {m.is_admin && (
                <div className="truncate text-xs font-semibold uppercase tracking-wide text-[#E8D19A]">Admin</div>
              )}
            </div>

            {m.is_admin ? (
              <span className="flex-shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Admin
              </span>
            ) : m.is_moderator ? (
              <button
                onClick={() => toggleModerator(m.user_id, false)}
                disabled={saving === m.user_id}
                className="flex-shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
              >
Remove Moderator
              </button>
            ) : (
              <button
                onClick={() => toggleModerator(m.user_id, true)}
                disabled={saving === m.user_id}
                className="flex-shrink-0 rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1.5 text-xs font-semibold text-[#E8D19A] transition hover:bg-[#C9A24A]/20 disabled:opacity-50"
              >
                Make Moderator
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && members.length === 0 && (
        <p className="mt-6 text-sm leading-7 text-slate-400">
          {query ? "No one matches that search." : "No members with a callsign yet."}
        </p>
      )}
    </div>
  );
}
