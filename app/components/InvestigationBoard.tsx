"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

type Incident = { id: string; title: string; slug: string | null; category: string; image_url: string | null };
type Person = { id: string; name: string; role: string; photo_url: string | null; incident_id: string };

type BoardItem = {
  id: string;
  item_type: "case_pin" | "person_pin" | "suspect_note";
  incident_id: string | null;
  person_id: string | null;
  suspect_name: string | null;
  note: string | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  incident: Incident | null;
  person: Person | null;
};

type BoardConnection = { id: string; item_a_id: string; item_b_id: string; label: string | null };

const CARD_WIDTH = 160;
const CARD_HEIGHT = 190;
const MIN_NOTE_SIZE = 120;
const MAX_NOTE_SIZE = 420;
const EDIT_WIDTH = 340;
const EDIT_HEIGHT = 380;
const CLICK_MOVE_THRESHOLD = 4;

function itemWidth(item: BoardItem): number {
  return item.item_type === "suspect_note" ? item.width || CARD_WIDTH : CARD_WIDTH;
}
function itemHeight(item: BoardItem): number {
  return item.item_type === "suspect_note" ? item.height || CARD_HEIGHT : CARD_HEIGHT;
}

export default function InvestigationBoard() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [connections, setConnections] = useState<BoardConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ cases: Incident[]; people: Person[] }>({ cases: [], people: [] });
  const [suspectName, setSuspectName] = useState("");
  const [suspectNote, setSuspectNote] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [interactingId, setInteractingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; note: string } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    moved: boolean;
  } | null>(null);
  const resizeState = useRef<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const loadBoard = useCallback(() => {
    fetch("/api/board")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems(d.items);
          setConnections(d.connections);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ cases: [], people: [] });
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/board/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => d.success && setResults({ cases: d.cases, people: d.people }));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function addCasePin(incident: Incident) {
    const res = await fetch("/api/board/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "case_pin", incidentId: incident.id, posX: 60 + Math.random() * 200, posY: 60 + Math.random() * 200 }),
    });
    const d = await res.json();
    if (d.success) setItems((prev) => [...prev, { ...d.item, incident, person: null }]);
    setShowAdd(false);
    setQuery("");
  }

  async function addPersonPin(person: Person) {
    const res = await fetch("/api/board/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "person_pin", personId: person.id, posX: 60 + Math.random() * 200, posY: 60 + Math.random() * 200 }),
    });
    const d = await res.json();
    if (d.success) setItems((prev) => [...prev, { ...d.item, incident: null, person }]);
    setShowAdd(false);
    setQuery("");
  }

  async function addSuspectNote() {
    if (!suspectName.trim()) return;
    const res = await fetch("/api/board/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemType: "suspect_note",
        suspectName: suspectName.trim(),
        note: suspectNote.trim() || null,
        posX: 60 + Math.random() * 200,
        posY: 60 + Math.random() * 200,
      }),
    });
    const d = await res.json();
    if (d.success) setItems((prev) => [...prev, { ...d.item, incident: null, person: null }]);
    setSuspectName("");
    setSuspectNote("");
    setShowAdd(false);
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConnections((prev) => prev.filter((c) => c.item_a_id !== id && c.item_b_id !== id));
    await fetch(`/api/board/items?id=${id}`, { method: "DELETE" });
  }

  async function removeConnection(id: string) {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/board/connections?id=${id}`, { method: "DELETE" });
  }

  function onPinMouseDown(e: React.MouseEvent, item: BoardItem) {
    if (editingId === item.id) return;

    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(item.id);
      } else if (connectFrom !== item.id) {
        fetch("/api/board/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemAId: connectFrom, itemBId: item.id }),
        })
          .then((r) => r.json())
          .then((d) => d.success && setConnections((prev) => [...prev, d.connection]));
        setConnectFrom(null);
      }
      return;
    }

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    setInteractingId(item.id);
    dragState.current = {
      id: item.id,
      offsetX: e.clientX - boardRect.left - item.pos_x,
      offsetY: e.clientY - boardRect.top - item.pos_y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false,
    };
  }

  function openEdit(item: BoardItem) {
    setEditingId(item.id);
    setDraft({ name: item.suspect_name || "", note: item.note || "" });
  }

  async function saveAndCloseEdit(id: string) {
    const current = draft;
    setEditingId(null);
    setDraft(null);
    if (!current) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, suspect_name: current.name || i.suspect_name, note: current.note } : i))
    );
    await fetch("/api/board/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, suspectName: current.name, note: current.note }),
    });
  }

  function onEditContainerBlur(e: React.FocusEvent<HTMLDivElement>, id: string) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    saveAndCloseEdit(id);
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (dragState.current && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left - dragState.current.offsetX);
        const y = Math.max(0, e.clientY - rect.top - dragState.current.offsetY);
        if (
          Math.abs(e.clientX - dragState.current.startClientX) > CLICK_MOVE_THRESHOLD ||
          Math.abs(e.clientY - dragState.current.startClientY) > CLICK_MOVE_THRESHOLD
        ) {
          dragState.current.moved = true;
        }
        setItems((prev) => prev.map((i) => (i.id === dragState.current!.id ? { ...i, pos_x: x, pos_y: y } : i)));
      }
      if (resizeState.current) {
        const { id, startX, startY, startWidth, startHeight } = resizeState.current;
        const newWidth = Math.min(MAX_NOTE_SIZE, Math.max(MIN_NOTE_SIZE, startWidth + (e.clientX - startX)));
        const newHeight = Math.min(MAX_NOTE_SIZE, Math.max(MIN_NOTE_SIZE, startHeight + (e.clientY - startY)));
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, width: newWidth, height: newHeight } : i)));
      }
    }
    function onUp() {
      setInteractingId(null);
      if (dragState.current) {
        const id = dragState.current.id;
        const wasClick = !dragState.current.moved;
        const item = items.find((i) => i.id === id);
        dragState.current = null;
        if (item) {
          if (wasClick && item.item_type === "suspect_note") {
            openEdit(item);
          } else {
            fetch("/api/board/items", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, posX: item.pos_x, posY: item.pos_y }),
            });
          }
        }
      }
      if (resizeState.current) {
        const id = resizeState.current.id;
        const item = items.find((i) => i.id === id);
        resizeState.current = null;
        if (item) {
          fetch("/api/board/items", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, width: item.width, height: item.height }),
          });
        }
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function onResizeMouseDown(e: React.MouseEvent, item: BoardItem) {
    e.stopPropagation();
    e.preventDefault();
    setInteractingId(item.id);
    resizeState.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: itemWidth(item),
      startHeight: itemHeight(item),
    };
  }

  const itemById = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="rounded-2xl bg-[#C9A24A] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            + Add Pin
          </button>
          <button
            onClick={() => {
              setConnectMode((v) => !v);
              setConnectFrom(null);
            }}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
              connectMode ? "border-red-500 bg-red-500/20 text-red-300" : "border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {connectMode ? (connectFrom ? "Click second pin..." : "Click first pin...") : "🧵 Connect Pins"}
          </button>
        </div>
        <div className="text-xs text-slate-500">Private to your account only. Drag pins to arrange your board.</div>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E8D19A]">
                Pin a case or person from the site
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cases or people..."
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
              {(results.cases.length > 0 || results.people.length > 0) && (
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {results.cases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addCasePin(c)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-white hover:bg-white/10"
                    >
                      📌 {c.title}
                    </button>
                  ))}
                  {results.people.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addPersonPin(p)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-white hover:bg-white/10"
                    >
                      👤 {p.name} <span className="text-slate-500">({p.role})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E8D19A]">
                Add a private suspect note (text only, no photo)
              </div>
              <input
                value={suspectName}
                onChange={(e) => setSuspectName(e.target.value)}
                placeholder="Name"
                className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <textarea
                value={suspectNote}
                onChange={(e) => setSuspectNote(e.target.value)}
                placeholder="Why do you suspect them? (private, only you can see this)"
                rows={2}
                className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                onClick={addSuspectNote}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={boardRef}
        className="relative h-[640px] w-full overflow-auto rounded-[24px] border border-black/40 shadow-inner"
        style={{
          backgroundImage: "url('/board/corkboard-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.6)",
        }}
      >
        <svg className="pointer-events-none absolute left-0 top-0 h-full w-full" style={{ minWidth: "100%", minHeight: "100%" }}>
          {connections.map((conn) => {
            const a = itemById.get(conn.item_a_id);
            const b = itemById.get(conn.item_b_id);
            if (!a || !b) return null;
            const ax = a.pos_x + itemWidth(a) / 2;
            const ay = a.pos_y + itemHeight(a) / 2;
            const bx = b.pos_x + itemWidth(b) / 2;
            const by = b.pos_y + itemHeight(b) / 2;
            return (
              <g key={conn.id} className="pointer-events-auto" onClick={() => removeConnection(conn.id)} style={{ cursor: "pointer" }}>
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#b91c1c" strokeWidth={2.5} strokeOpacity={0.85} />
              </g>
            );
          })}
        </svg>

        {loading && <div className="p-6 text-sm text-white/60">Loading your board...</div>}

        {items.map((item) => {
          const isEditing = editingId === item.id;
          const isHovered = hoveredId === item.id && interactingId !== item.id && !isEditing;
          const noteScale = item.item_type === "suspect_note" && isHovered ? 1.4 : 1;
          return (
          <div
            key={item.id}
            onMouseDown={(e) => onPinMouseDown(e, item)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
            style={{
              position: "absolute",
              left: item.pos_x,
              top: item.pos_y,
              width: itemWidth(item),
              cursor: connectMode ? "crosshair" : isEditing ? "text" : "grab",
              zIndex: isEditing ? 40 : isHovered ? 30 : connectFrom === item.id ? 20 : 10,
              outline: connectFrom === item.id ? "2px solid #ef4444" : "none",
            }}
          >
            {item.item_type === "suspect_note" ? (
              isEditing ? (
                <div
                  onBlur={(e) => onEditContainerBlur(e, item.id)}
                  className="relative bg-contain bg-center bg-no-repeat p-4 pt-7"
                  style={{
                    backgroundImage: "url('/board/sticky-note.png')",
                    color: "#3a2f10",
                    width: EDIT_WIDTH,
                    height: EDIT_HEIGHT,
                    filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.6))",
                  }}
                >
                  <PinIcon />
                  <input
                    autoFocus
                    value={draft?.name ?? ""}
                    onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                    placeholder="Name"
                    className="w-full bg-transparent text-base font-bold leading-tight outline-none placeholder:text-black/40"
                  />
                  <textarea
                    value={draft?.note ?? ""}
                    onChange={(e) => setDraft((d) => (d ? { ...d, note: e.target.value } : d))}
                    placeholder="Why do you suspect them?"
                    className="mt-2 h-[calc(100%-72px)] w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-black/40"
                  />
                  <div className="absolute bottom-2 right-3 text-[10px] font-semibold uppercase tracking-wide text-black/40">
                    Saves automatically
                  </div>
                </div>
              ) : (
                <div
                  className="relative bg-contain bg-center bg-no-repeat p-4 pt-6"
                  style={{
                    backgroundImage: "url('/board/sticky-note.png')",
                    color: "#3a2f10",
                    transform: "rotate(-2deg)",
                    width: itemWidth(item) * noteScale,
                    height: itemHeight(item) * noteScale,
                    transition: "width 150ms ease, height 150ms ease",
                    filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.55))",
                  }}
                >
                  <PinIcon />
                  <div className="overflow-hidden text-sm font-bold leading-tight">{item.suspect_name}</div>
                  {item.note && <div className="mt-1.5 overflow-hidden text-xs leading-snug">{item.note}</div>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="absolute right-2 top-2 text-xs text-black/40 hover:text-black/70"
                  >
                    ✕
                  </button>
                  <div
                    onMouseDown={(e) => onResizeMouseDown(e, item)}
                    className="absolute bottom-1 right-1 h-4 w-4 cursor-nwse-resize"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 0%, transparent 45%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.35) 55%, transparent 55%, transparent 100%)",
                    }}
                    title="Drag to resize"
                  />
                </div>
              )
            ) : (
              <div
                className="relative rounded-sm bg-white p-1.5"
                style={{ transform: "rotate(1.5deg)", filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.6))" }}
              >
                <PinIcon />
                <div className="relative h-[110px] w-full overflow-hidden bg-slate-800">
                  {(item.incident?.image_url || item.person?.photo_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.incident?.image_url || item.person?.photo_url || ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-white/20">?</div>
                  )}
                </div>
                <div className="px-1 pb-1 pt-1.5 text-center text-[11px] font-bold leading-tight text-black">
                  {item.incident?.title || item.person?.name}
                </div>
                {item.incident?.slug && (
                  <Link
                    href={`/case-file/${item.incident.slug}`}
                    className="block px-1 pb-1 text-center text-[10px] font-semibold text-blue-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View case →
                  </Link>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/50 px-1.5 text-xs text-white/80 hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/board/thumbtack.png"
      alt=""
      className="pointer-events-none absolute left-1/2 top-0 z-10 h-7 w-7 -translate-x-1/2 -translate-y-[45%]"
      style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.6))" }}
    />
  );
}
