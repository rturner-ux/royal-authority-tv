"use client";

import { useState } from "react";

export default function ShareButton({ incidentId, initialShareCount }: { incidentId: string; initialShareCount: number }) {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);

  async function handleShare() {
    const url = window.location.href;
    try {
      const res = await fetch("/api/case-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      });
      const data = await res.json();
      if (data.success) setShareCount(data.shareCount);

      if (navigator.share) {
        await navigator.share({ url, title: document.title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled the native share sheet, or clipboard denied -- no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {copied ? "✓ Link Copied" : `↗ Share${shareCount > 0 ? ` · ${shareCount}` : ""}`}
    </button>
  );
}
