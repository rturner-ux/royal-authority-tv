"use client";

import { useEffect, useRef, useState } from "react";
import type { PersonComment } from "@/lib/types";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export default function WitnessComments({
  personId,
  comments,
}: {
  personId: string;
  comments: PersonComment[];
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaLoaded = useRef(false);

  useEffect(() => {
    if (!recaptchaLoaded.current && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const rc = document.createElement("script");
      rc.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      document.body.appendChild(rc);
      recaptchaLoaded.current = true;
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    let recaptchaToken = "";
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
      recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "person_comment" });
    }

    try {
      const res = await fetch("/api/person-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, displayName: name, body, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your comment.");
        return;
      }
      setSubmitted(true);
      setBody("");
      setName("");
    } catch {
      setError("Could not save your comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-white">{c.display_name || "Anonymous"}</span>
                <span className="text-xs text-slate-500">
                  {new Date(c.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No public comments yet. If you have insight on this case, add one below.
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">Share What You Know</div>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          If you have insight on this case, from the neighborhood, from that day, or otherwise, share it
          here. Comments are reviewed before they appear publicly.
        </p>

        {submitted ? (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            Thanks. Your comment is awaiting review and will appear here once approved.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              maxLength={60}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What do you know about this?"
              maxLength={2000}
              rows={4}
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-[#C9A24A] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Comment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
