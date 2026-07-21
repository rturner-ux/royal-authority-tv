"use client";

import { useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { INVESTIGATOR_ROLES, getRole } from "@/lib/roles";
import { playSfx } from "@/lib/sfx";

export default function InvestigatorProfile({
  userId,
  initialRole,
  initialCallsign,
}: {
  userId: string;
  initialRole: string | null;
  initialCallsign: string | null;
}) {
  const [roleKey, setRoleKey] = useState(initialRole);
  const [callsign, setCallsign] = useState(initialCallsign ?? "");
  const [picking, setPicking] = useState(!initialRole);
  const [draftCallsign, setDraftCallsign] = useState(initialCallsign ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const role = getRole(roleKey);

  async function saveRole(key: string) {
    setSaving(true);
    setSaveError(null);
    const db = supabaseBrowser();
    const { error } = await db.from("subscriber_profiles").upsert({
      user_id: userId,
      role: key,
      callsign: draftCallsign.trim() || null,
    });
    setSaving(false);

    if (error) {
      console.error("Failed to save investigator profile:", error);
      setSaveError("Couldn't save that. Please try again.");
      return;
    }

    setRoleKey(key);
    setCallsign(draftCallsign.trim());
    setPicking(false);
    playSfx("pin");
  }

  if (picking) {
    return (
      <div className="mt-8 rounded-[30px] border border-[#C9A24A]/30 bg-black/30 p-6 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
          Build Your Investigator Profile
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick a role, or skip this entirely. It's just for you.
        </p>

        {saveError && (
          <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {saveError}
          </p>
        )}

        <input
          value={draftCallsign}
          onChange={(e) => setDraftCallsign(e.target.value)}
          placeholder="Callsign (optional)"
          maxLength={40}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {INVESTIGATOR_ROLES.map((r) => (
            <button
              key={r.key}
              disabled={saving}
              onClick={() => saveRole(r.key)}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-[#C9A24A]/40 hover:bg-white/[0.06] disabled:opacity-50"
            >
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image src={r.badge} alt="" fill unoptimized className="object-contain" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white">{r.title}</div>
                <div className="mt-0.5 text-xs leading-5 text-slate-400">{r.tagline}</div>
              </div>
            </button>
          ))}
        </div>

        {roleKey && (
          <button
            onClick={() => setPicking(false)}
            className="mt-4 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[30px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.08] to-transparent p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 rounded-full border border-[#C9A24A]/30 bg-black/30 p-2">
          <Image src={role!.badge} alt="" fill unoptimized className="object-contain p-2" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">{role!.title}</div>
          <div className="mt-1 truncate text-lg font-bold text-white">
            {callsign || "Unnamed Investigator"}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{role!.tagline}</p>
      <button
        onClick={() => {
          setDraftCallsign(callsign);
          setPicking(true);
        }}
        className="mt-4 text-xs font-semibold text-[#E8D19A] hover:underline"
      >
        Change Role
      </button>
    </div>
  );
}
