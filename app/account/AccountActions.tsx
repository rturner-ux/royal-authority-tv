"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AccountActions({
  isActive,
}: {
  isActive: boolean;
}) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription at the end of the current billing period?")) {
      return;
    }

    setCanceling(true);
    setError(null);

    const res = await fetch("/api/square/cancel-subscription", { method: "POST" });

    setCanceling(false);

    if (!res.ok) {
      setError("Couldn't cancel your subscription. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {isActive && (
        <button
          onClick={handleCancel}
          disabled={canceling}
          className="rounded-2xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {canceling ? "Canceling…" : "Cancel Subscription"}
        </button>
      )}

      <button
        onClick={handleSignOut}
        className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Sign Out
      </button>

      {error && <div className="w-full text-sm text-red-300">{error}</div>}
    </div>
  );
}
