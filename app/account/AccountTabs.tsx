"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoGrid from "../components/VideoGrid";

type PlaylistPreview = {
  id: string;
  name: string;
  caseCount: number;
  thumbnails: string[];
};

type CaseRequest = {
  id: string;
  topic: string;
  message: string;
  created_at: string;
  incident: { title: string; slug: string | null } | null;
};

type Incident = { id: string; title: string; slug: string | null; category: string; image_url: string | null };
type Person = { id: string; name: string; role: string; photo_url: string | null; incident_id: string };

type BoardItem = {
  id: string;
  item_type: "case_pin" | "person_pin" | "suspect_note";
  incident_id: string | null;
  person_id: string | null;
  note: string | null;
  incident: Incident | null;
  person: Person | null;
};

export default function AccountTabs({
  playlists,
  caseRequests,
}: {
  playlists: PlaylistPreview[];
  caseRequests: CaseRequest[];
}) {
  const [tab, setTab] = useState<"playlists" | "requests" | "notes" | "videos" | "liked">("playlists");

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setTab("playlists")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "playlists"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "requests"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Case Requests
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "notes"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setTab("videos")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "videos"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
            tab === "liked"
              ? "border-b-2 border-[#C9A24A] text-[#E8D19A]"
              : "border-b-2 border-transparent text-slate-500 hover:text-white"
          }`}
        >
          Liked
        </button>
      </div>

      {tab === "playlists" && (
        <div className="mt-5">
          {playlists.length === 0 ? (
            <p className="text-sm leading-7 text-slate-400">
              You don&apos;t have any playlists yet.{" "}
              <Link href="/account/playlists" className="text-[#E8D19A] hover:underline">
                Create one →
              </Link>
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {playlists.map((p) => (
                <Link
                  key={p.id}
                  href="/account/playlists"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.05]"
                >
                  {p.thumbnails.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnails[0]}
                      alt=""
                      className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-xl bg-[#181818] text-white/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
                        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-serif text-xl text-white">{p.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {p.caseCount} {p.caseCount === 1 ? "case" : "cases"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="mt-5">
          {caseRequests.length === 0 ? (
            <p className="text-sm leading-7 text-slate-400">
              You haven&apos;t submitted any case requests yet. Open any case&apos;s Member Room to
              submit one.
            </p>
          ) : (
            <div className="space-y-4">
              {caseRequests.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                  {r.incident?.slug && (
                    <Link
                      href={`/case-file/${r.incident.slug}`}
                      className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-[#E8D19A] hover:underline"
                    >
                      {r.incident.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notes" && <NotesTab />}

      {tab === "videos" && (
        <div className="mt-5">
          <VideoGrid isSignedIn filter="all" />
        </div>
      )}

      {tab === "liked" && (
        <div className="mt-5">
          <VideoGrid isSignedIn filter="liked" />
        </div>
      )}
    </div>
  );
}

function NotesTab() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ cases: Incident[]; people: Person[] }>({ cases: [], people: [] });
  const [target, setTarget] = useState<{ type: "case_pin" | "person_pin"; id: string; label: string; photo: string | null } | null>(
    null
  );
  const [draftNote, setDraftNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  function load() {
    fetch("/api/board")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems((d.items as BoardItem[]).filter((i) => i.item_type !== "suspect_note" && i.note));
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults({ cases: [], people: [] });
      return;
    }
    const res = await fetch(`/api/board/search?q=${encodeURIComponent(q.trim())}`);
    const d = await res.json();
    if (d.success) setResults({ cases: d.cases, people: d.people });
  }

  async function saveNewNote() {
    if (!target || !draftNote.trim() || saving) return;
    setSaving(true);
    const res = await fetch("/api/board/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemType: target.type,
        incidentId: target.type === "case_pin" ? target.id : undefined,
        personId: target.type === "person_pin" ? target.id : undefined,
        note: draftNote.trim(),
        posX: 40 + Math.floor(Math.random() * 200),
        posY: 40 + Math.floor(Math.random() * 200),
      }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.success) {
      setAdding(false);
      setTarget(null);
      setDraftNote("");
      setQuery("");
      setResults({ cases: [], people: [] });
      load();
    }
  }

  async function saveEdit(id: string) {
    await fetch("/api/board/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, note: editDraft.trim() }),
    });
    setEditingId(null);
    load();
  }

  async function removeNote(id: string) {
    await fetch(`/api/board/items?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return <p className="mt-5 text-sm text-slate-400">Loading your notes...</p>;
  }

  return (
    <div className="mt-5">
      <p className="mb-4 text-sm leading-6 text-slate-400">
        Attach a private note to a case or a person, and it shows up automatically pinned on your{" "}
        <Link href="/investigation-board" className="text-[#E8D19A] hover:underline">
          Investigation Board
        </Link>{" "}
        with their photo, no dragging required.
      </p>

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          + Add Note
        </button>
      ) : (
        <div className="rounded-2xl border border-[#C9A24A]/30 bg-black/30 p-4">
          {!target ? (
            <>
              <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">Attach to a case or person</div>
              <div className="relative mt-3">
                <input
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Search cases or people..."
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#C9A24A]/40 focus:outline-none"
                />
                {(results.cases.length > 0 || results.people.length > 0) && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0e14] shadow-xl">
                    {results.cases.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setTarget({ type: "case_pin", id: c.id, label: c.title, photo: c.image_url })}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                      >
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-[#181818]">
                          {c.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="truncate">{c.title}</span>
                        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-slate-500">Case</span>
                      </button>
                    ))}
                    {results.people.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTarget({ type: "person_pin", id: p.id, label: p.name, photo: p.photo_url })}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                      >
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#181818]">
                          {p.photo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="truncate">{p.name}</span>
                        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-slate-500">{p.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setAdding(false)}
                className="mt-3 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#181818]">
                  {target.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={target.photo} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="truncate text-sm font-semibold text-white">{target.label}</div>
              </div>
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Write your note..."
                autoFocus
                rows={4}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#C9A24A]/40 focus:outline-none"
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={saveNewNote}
                  disabled={saving || !draftNote.trim()}
                  className="rounded-2xl bg-[#C9A24A] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setTarget(null);
                    setQuery("");
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-sm leading-7 text-slate-400">No notes yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const photo = item.incident?.image_url ?? item.person?.photo_url ?? null;
            const label = item.incident?.title ?? item.person?.name ?? "Untitled";
            return (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#181818]">
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-white">{label}</div>
                    <div className="flex shrink-0 gap-2">
                      {editingId !== item.id && (
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditDraft(item.note ?? "");
                          }}
                          className="text-xs font-semibold text-slate-400 hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => removeNote(item.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {editingId === item.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#C9A24A]/40 focus:outline-none"
                      />
                      <div className="mt-2 flex gap-3">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="rounded-xl bg-[#C9A24A] px-4 py-1.5 text-xs font-semibold text-black hover:opacity-90"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs font-semibold text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
