"use client";

import { useState } from "react";
import { playSfx } from "@/lib/sfx";

type Verdict = "confirmed" | "disputed" | "unconfirmed" | "not_supported";

type FactCheckResult = {
  verdict: Verdict;
  explanation: string;
  sourceExcerpt: string | null;
  sourceUrl: string | null;
};

const VERDICT_STYLE: Record<Verdict, { label: string; classes: string }> = {
  confirmed: { label: "Confirmed", classes: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  disputed: { label: "Disputed", classes: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  unconfirmed: { label: "Unconfirmed", classes: "border-slate-400/40 bg-slate-400/10 text-slate-300" },
  not_supported: { label: "Not Supported by This Case Log", classes: "border-red-500/40 bg-red-500/10 text-red-300" },
};

export default function CaseFactChecker({ slug }: { slug: string }) {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FactCheckResult | null>(null);

  async function checkClaim() {
    if (!claim.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    playSfx("paper");
    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, claim: claim.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not check this claim right now.");
        return;
      }
      setResult(data);
    } catch {
      setError("Could not check this claim right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Fact Checker</div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        Seen a claim about this case online? Paste it below and we&apos;ll check it against the sourced
        Case Log on this page.
      </p>

      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="e.g. &quot;I heard the suspect confessed to police on the scene&quot;"
        className="mt-4 w-full rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#C9A24A]/50 focus:outline-none"
      />

      <button
        type="button"
        onClick={checkClaim}
        disabled={loading || !claim.trim()}
        className="mt-3 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check This Claim"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${VERDICT_STYLE[result.verdict].classes}`}
          >
            {VERDICT_STYLE[result.verdict].label}
          </span>
          <p className="mt-3 text-sm leading-6 text-slate-300">{result.explanation}</p>
          {result.sourceExcerpt && (
            <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-slate-400">
              &ldquo;{result.sourceExcerpt}&rdquo;
            </p>
          )}
          {result.sourceUrl && (
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-[#E8D19A] hover:underline"
            >
              View source →
            </a>
          )}
        </div>
      )}
    </section>
  );
}
