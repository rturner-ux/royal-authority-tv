"use client";

import { useState } from "react";
import Link from "next/link";
import { playSfx } from "@/lib/sfx";

const TOOLKIT_LABELS: Record<string, string> = {
  journalist: "Content Kit",
  detective: "Case Workup",
  lawyer: "Evidentiary Review",
  profiler: "Pattern Notes",
  field_agent: "Ground Truth Brief",
};

type JournalistBlocks = {
  headlines: string;
  script: string;
  quotes: string;
  questions: string;
  hashtags: string;
};

function parseJournalistContent(text: string): JournalistBlocks | null {
  const grab = (label: string, nextLabels: string[]): string => {
    const start = text.indexOf(`${label}:`);
    if (start === -1) return "";
    const from = start + label.length + 1;
    let end = text.length;
    for (const next of nextLabels) {
      const idx = text.indexOf(`${next}:`, from);
      if (idx !== -1 && idx < end) end = idx;
    }
    return text.slice(from, end).trim();
  };

  const headlines = grab("HEADLINES", ["SCRIPT", "QUOTES", "QUESTIONS", "HASHTAGS"]);
  const script = grab("SCRIPT", ["QUOTES", "QUESTIONS", "HASHTAGS"]);
  const quotes = grab("QUOTES", ["QUESTIONS", "HASHTAGS"]);
  const questions = grab("QUESTIONS", ["HASHTAGS"]);
  const hashtags = grab("HASHTAGS", []);

  if (!headlines && !script && !quotes && !questions && !hashtags) return null;
  return { headlines, script, quotes, questions, hashtags };
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard permission denied -- no-op
    }
  }

  if (!text) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
          {label}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

export default function InvestigatorToolkit({
  slug,
  isActive,
  hasRole,
  initialRole,
}: {
  slug: string;
  isActive: boolean;
  hasRole: boolean;
  initialRole: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(initialRole);
  const [content, setContent] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    playSfx("paper");
    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not generate content right now.");
        return;
      }
      setRole(data.role);
      setContent(data.content);
    } catch {
      setError("Could not generate content right now.");
    } finally {
      setLoading(false);
    }
  }

  if (!isActive) {
    return (
      <section className="mt-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
            Investigator Toolkit
          </div>
          <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
            Premium
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Generate content tailored to your Investigator Role: journalists get a ready-to-use Content Kit
          (headlines, a livestream script, pull quotes, interview prep questions, hashtags), detectives get
          a Case Workup, lawyers get an Evidentiary Review, profilers get Pattern Notes, and field agents
          get a Ground Truth Brief.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Subscribe to Unlock the Investigator Toolkit
        </Link>
      </section>
    );
  }

  const label = (role && TOOLKIT_LABELS[role]) || "Investigator Briefing";
  const journalistBlocks = role === "journalist" && content ? parseJournalistContent(content) : null;

  return (
    <section className="mt-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
            Investigator Toolkit
          </div>
          <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
            Premium
          </span>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-2xl bg-[#C9A24A] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating..." : content ? `Regenerate ${label}` : `Generate ${label}`}
        </button>
      </div>

      {!hasRole && (
        <p className="mt-4 text-xs text-slate-400">
          Pick an Investigator Role on your{" "}
          <Link href="/account" className="text-[#E8D19A] hover:underline">
            account page
          </Link>{" "}
          to tailor this to how you use the site. You can still generate a general briefing now.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {content && (
        <div className="mt-5 space-y-3">
          {journalistBlocks ? (
            <>
              <CopyBlock label="Headlines" text={journalistBlocks.headlines} />
              <CopyBlock label="Livestream Script" text={journalistBlocks.script} />
              <CopyBlock label="Pull Quotes" text={journalistBlocks.quotes} />
              <CopyBlock label="Interview Prep Questions" text={journalistBlocks.questions} />
              <CopyBlock label="Hashtags" text={journalistBlocks.hashtags} />
            </>
          ) : (
            <CopyBlock label={label} text={content} />
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Generated from the sourced Case Log below. Always double-check against the full timeline before publishing.
      </p>
    </section>
  );
}
