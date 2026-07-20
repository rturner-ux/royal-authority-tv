"use client";

import { useState } from "react";

export default function ShareButton({
  url,
  title,
  className,
  children,
}: {
  url?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = url || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl, title: title || document.title });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
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
      aria-label="Share"
      className={
        className ||
        "rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      }
    >
      {copied ? (children ? "✓" : "✓ Link Copied") : children || "↗ Share"}
    </button>
  );
}
