"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/labels";
import type { IncidentCategory } from "@/lib/types";

type Incident = { id: string; title: string; slug: string | null; category: IncidentCategory; image_url: string | null };

type PlaylistCase = {
  id: string;
  playlist_id: string;
  incident_id: string;
  sequence: number;
  incident: Incident | null;
};

type Playlist = {
  id: string;
  name: string;
  sequence: number;
  cases: PlaylistCase[];
};

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [searchByPlaylist, setSearchByPlaylist] = useState<Record<string, string>>({});
  const [resultsByPlaylist, setResultsByPlaylist] = useState<Record<string, Incident[]>>({});

  const load = useCallback(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPlaylists(d.playlists);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createPlaylist() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const d = await res.json();
    if (d.success) {
      setPlaylists((prev) => [...prev, d.playlist]);
      setNewName("");
      setExpandedId(d.playlist.id);
    }
    setCreating(false);
  }

  async function renamePlaylist(id: string) {
    if (!renameDraft.trim()) {
      setRenamingId(null);
      return;
    }
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name: renameDraft.trim() } : p)));
    setRenamingId(null);
    await fetch(`/api/playlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameDraft.trim() }),
    });
  }

  async function deletePlaylist(id: string) {
    if (!confirm("Delete this playlist? This can't be undone.")) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
  }

  async function movePlaylist(id: string, direction: -1 | 1) {
    const index = playlists.findIndex((p) => p.id === id);
    const swapIndex = index + direction;
    if (index === -1 || swapIndex < 0 || swapIndex >= playlists.length) return;

    const reordered = [...playlists];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setPlaylists(reordered);

    await Promise.all(reordered.map((p, i) => fetch(`/api/playlists/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequence: i }),
    })));
  }

  async function searchCases(playlistId: string, q: string) {
    setSearchByPlaylist((prev) => ({ ...prev, [playlistId]: q }));
    if (q.trim().length < 2) {
      setResultsByPlaylist((prev) => ({ ...prev, [playlistId]: [] }));
      return;
    }
    const res = await fetch(`/api/board/search?q=${encodeURIComponent(q.trim())}`);
    const d = await res.json();
    if (d.success) setResultsByPlaylist((prev) => ({ ...prev, [playlistId]: d.cases }));
  }

  async function addCase(playlistId: string, incident: Incident) {
    const res = await fetch("/api/playlists/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId, incidentId: incident.id }),
    });
    const d = await res.json();
    if (d.success) {
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, cases: [...p.cases, d.case] } : p)));
      setSearchByPlaylist((prev) => ({ ...prev, [playlistId]: "" }));
      setResultsByPlaylist((prev) => ({ ...prev, [playlistId]: [] }));
    }
  }

  async function removeCase(playlistId: string, caseId: string) {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, cases: p.cases.filter((c) => c.id !== caseId) } : p))
    );
    await fetch(`/api/playlists/cases?id=${caseId}&playlistId=${playlistId}`, { method: "DELETE" });
  }

  async function moveCase(playlistId: string, caseId: string, direction: -1 | 1) {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const index = playlist.cases.findIndex((c) => c.id === caseId);
    const swapIndex = index + direction;
    if (index === -1 || swapIndex < 0 || swapIndex >= playlist.cases.length) return;

    const reordered = [...playlist.cases];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, cases: reordered } : p)));

    await fetch("/api/playlists/cases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId, orderedIds: reordered.map((c) => c.id) }),
    });
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading your playlists...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
          placeholder="New playlist name..."
          className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#C9A24A]/40 focus:outline-none"
        />
        <button
          onClick={createPlaylist}
          disabled={creating || !newName.trim()}
          className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
        >
          Create
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="mt-8 text-sm leading-7 text-slate-400">
          You don&apos;t have any playlists yet. Create one above, then add cases to it.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {playlists.map((playlist, i) => {
            const isExpanded = expandedId === playlist.id;
            const query = searchByPlaylist[playlist.id] ?? "";
            const results = resultsByPlaylist[playlist.id] ?? [];

            return (
              <div key={playlist.id} className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : playlist.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    >
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {renamingId === playlist.id ? (
                      <input
                        autoFocus
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={() => renamePlaylist(playlist.id)}
                        onKeyDown={(e) => e.key === "Enter" && renamePlaylist(playlist.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-sm text-white focus:outline-none"
                      />
                    ) : (
                      <span className="font-serif text-lg text-white">{playlist.name}</span>
                    )}
                    <span className="text-xs text-slate-500">
                      {playlist.cases.length} {playlist.cases.length === 1 ? "case" : "cases"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => movePlaylist(playlist.id, -1)}
                      disabled={i === 0}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => movePlaylist(playlist.id, 1)}
                      disabled={i === playlists.length - 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setRenamingId(playlist.id);
                        setRenameDraft(playlist.name);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                      title="Rename"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-5 py-4">
                    {playlist.cases.length === 0 ? (
                      <p className="text-sm text-slate-500">No cases added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {playlist.cases.map((c, ci) =>
                          c.incident ? (
                            <div
                              key={c.id}
                              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2"
                            >
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#181818]">
                                {c.incident.image_url && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={c.incident.image_url} alt={c.incident.title} className="h-full w-full object-cover" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/case-file/${c.incident.slug}`}
                                  className="block truncate text-sm font-semibold text-white hover:underline"
                                >
                                  {c.incident.title}
                                </Link>
                                <span
                                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white"
                                  style={{ backgroundColor: CATEGORY_COLORS[c.incident.category] }}
                                >
                                  {CATEGORY_LABELS[c.incident.category]}
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  onClick={() => moveCase(playlist.id, c.id, -1)}
                                  disabled={ci === 0}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => moveCase(playlist.id, c.id, 1)}
                                  disabled={ci === playlist.cases.length - 1}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeCase(playlist.id, c.id)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="relative mt-4">
                      <input
                        value={query}
                        onChange={(e) => searchCases(playlist.id, e.target.value)}
                        placeholder="Search cases to add..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#C9A24A]/40 focus:outline-none"
                      />
                      {results.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0e14] shadow-xl">
                          {results.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => addCase(playlist.id, r)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                            >
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-[#181818]">
                                {r.image_url && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" />
                                )}
                              </div>
                              <span className="truncate">{r.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
