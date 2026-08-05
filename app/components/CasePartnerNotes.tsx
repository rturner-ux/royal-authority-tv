"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { CasePartnerNote } from "@/lib/types";
import Avatar from "./Avatar";

type OtherUser = {
  user_id: string;
  callsign: string | null;
  avatar_url: string | null;
};

// Private notes thread shared by exactly the two partners on one case --
// same realtime postgres_changes pattern as the DM ThreadClient, filtered to
// this one case_partner_id instead of a user pair.
export default function CasePartnerNotes({
  partnershipId,
  currentUserId,
  otherUser,
}: {
  partnershipId: string;
  currentUserId: string;
  otherUser: OtherUser;
}) {
  const [notes, setNotes] = useState<CasePartnerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/case-partners/${partnershipId}/notes`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNotes(d.notes);
        setLoading(false);
      });

    const client = supabaseBrowser();
    const channel = client
      .channel(`case-partner-notes-${partnershipId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "case_partner_notes", filter: `case_partner_id=eq.${partnershipId}` },
        (payload: { new: CasePartnerNote }) => {
          const incoming = payload.new;
          setNotes((prev) => (prev.some((n) => n.id === incoming.id) ? prev : [...prev, incoming]));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [partnershipId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length]);

  async function submit() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/case-partners/${partnershipId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add your note.");
        return;
      }
      setNotes((prev) => (prev.some((n) => n.id === data.note.id) ? prev : [...prev, data.note]));
      setDraft("");
    } catch {
      setError("Could not add your note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#E8D19A]">
        Shared Notes -- private to you two
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-500">No notes yet. Start the thread below.</p>
        ) : (
          notes.map((n) => {
            const mine = n.author_id === currentUserId;
            return (
              <div key={n.id} className={`flex items-start gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <Avatar
                  avatarUrl={mine ? null : otherUser.avatar_url}
                  roleBadge={null}
                  name={mine ? "You" : otherUser.callsign || "?"}
                  size={26}
                />
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-6 ${
                    mine ? "bg-[#C9A24A] text-black" : "bg-white/10 text-white"
                  }`}
                >
                  {n.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

      <div className="mt-3 flex items-center gap-1 rounded-full bg-white/10 py-1 pl-4 pr-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          maxLength={2000}
          placeholder="Add a note..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        <button
          onClick={submit}
          disabled={submitting || !draft.trim()}
          className="flex-shrink-0 rounded-full bg-[#C9A24A] px-4 py-1.5 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
