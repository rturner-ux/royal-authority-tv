"use client";

import { useEffect, useState, useCallback } from "react";

type MemberRequest = {
  id: string;
  topic: string;
  message: string;
  created_at: string;
  callsign: string;
  isMine: boolean;
};

export default function MemberRoomForm({ incidentId }: { incidentId: string }) {
  const [form, setForm] = useState({ topic: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/member-questions?incidentId=${incidentId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setLoadError(body?.error || `Couldn't load requests (${res.status}).`);
        return;
      }
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      setLoadError("Couldn't load requests. Check your connection and try again.");
    } finally {
      setLoadingRequests(false);
    }
  }, [incidentId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

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

    setForm({ topic: "", message: "" });
    await loadRequests();
  }

  return (
    <div className="space-y-6">
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
      </div>

      <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Member Case Requests
          </div>
          {requests.length > 0 && (
            <div className="text-xs text-slate-500">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </div>
          )}
        </div>

        {loadingRequests ? (
          <p className="text-sm text-slate-500">Loading requests…</p>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {loadError}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500">
            No case requests yet. Be the first to submit one above.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className={`rounded-2xl border p-4 ${
                  r.isMine
                    ? "border-[#C9A24A]/30 bg-[#C9A24A]/[0.05]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-white">{r.topic}</h3>
                  <span className="text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{r.message}</p>
                <div className="mt-3 text-xs uppercase tracking-[0.15em] text-[#E8D19A]">
                  {r.isMine ? "You" : r.callsign}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
