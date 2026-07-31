"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function EmailAlertsToggle({
  userId,
  initialEnabled,
}: {
  userId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    const db = supabaseBrowser();
    const { error } = await db
      .from("subscriber_profiles")
      .update({ email_alerts_enabled: next })
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      console.error("Failed to save alert preference:", error);
      setEnabled(!next);
    }
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <div className="text-sm font-semibold text-white">Case Update Alerts</div>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Get an email when a case in one of your Playlists gets a new update, video, or court record.
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        aria-pressed={enabled}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
          enabled ? "bg-[#C9A24A]" : "bg-white/15"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
