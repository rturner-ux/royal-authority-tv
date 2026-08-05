"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function DirectoryVisibleToggle({
  userId,
  initialVisible,
}: {
  userId: string;
  initialVisible: boolean;
}) {
  const [visible, setVisible] = useState(initialVisible);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !visible;
    setVisible(next);
    setSaving(true);
    const db = supabaseBrowser();
    const { error } = await db
      .from("subscriber_profiles")
      .update({ directory_visible: next })
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      console.error("Failed to save directory visibility:", error);
      setVisible(!next);
    }
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <div className="text-sm font-semibold text-white">Show Me in the Directory</div>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Other subscribers can find you by callsign and send a friend request. Off by default.
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        aria-pressed={visible}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
          visible ? "bg-[#C9A24A]" : "bg-white/15"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            visible ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
