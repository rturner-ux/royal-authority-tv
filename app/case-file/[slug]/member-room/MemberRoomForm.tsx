"use client";

import { useState } from "react";

export default function MemberRoomForm({ incidentId }: { incidentId: string }) {
  const [form, setForm] = useState({ topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/member-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId, ...form }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Couldn't submit your question. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Member Question Form
          </div>
          <h2 className="mt-2 font-serif text-2xl text-white">
            Submit a Case Request
          </h2>
        </div>

        <div className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
          Premium
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="Topic or question title"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
            required
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Type your question, theory, or request here..."
            rows={7}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#C9A24A]/40"
            required
          />

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
          <div className="text-sm font-semibold text-green-300">Request submitted</div>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Your subscriber question has been recorded for review.
          </p>
        </div>
      )}
    </div>
  );
}
