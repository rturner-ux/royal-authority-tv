"use client";

import { useEffect, useState } from "react";

export default function DocumentLink({
  url,
  label = "View Document",
  className,
}: {
  url: string;
  label?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "inline-block text-xs text-[#67e8f9] hover:underline"}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">Document</span>
              <div className="flex items-center gap-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 transition hover:text-white"
                >
                  Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <iframe src={url} title="Document viewer" className="h-full w-full flex-1 bg-white" />
          </div>
        </div>
      )}
    </>
  );
}
