"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, PERSON_ROLE_LABELS } from "@/lib/labels";
import type { IncidentCategory, PersonRole } from "@/lib/types";

type SearchResult = {
  id: string;
  title: string;
  slug: string | null;
  category: IncidentCategory;
  image_url: string | null;
};

type IncidentDetail = {
  id: string;
  title: string;
  slug: string | null;
  category: IncidentCategory;
  image_url: string | null;
  poster_url: string | null;
  scene_image_url: string | null;
};

type Person = {
  id: string;
  name: string;
  role: PersonRole;
  photo_url: string | null;
  sequence: number;
};

const CASE_FIELDS: { field: "image_url" | "poster_url" | "scene_image_url"; label: string; hint: string }[] = [
  { field: "image_url", label: "Case Photo", hint: "Primary photo shown on the case card and map popup." },
  { field: "poster_url", label: "Poster Art", hint: "Stylized homepage \"Top 10\" card image." },
  { field: "scene_image_url", label: "Scene Photo", hint: "Shown on the case's Scene page." },
];

function PhotoSlot({
  label,
  hint,
  photoUrl,
  uploading,
  error,
  onSelect,
}: {
  label: string;
  hint?: string;
  photoUrl: string | null;
  uploading: boolean;
  error: string | null;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative block h-32 w-full overflow-hidden rounded-lg bg-black/40 disabled:opacity-60"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No photo</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-black/60 group-hover:opacity-100">
          Change Photo
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-semibold text-white">
            Uploading...
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onSelect(file);
        }}
      />
      <div className="mt-2 text-xs font-semibold text-slate-200">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{hint}</div>}
      {error && <div className="mt-1 text-[11px] text-red-400">{error}</div>}
    </div>
  );
}

export default function PhotosClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<IncidentDetail | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      fetch(`/api/admin/incidents/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setResults(d.incidents);
        })
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  async function selectCase(id: string) {
    setLoadingDetail(true);
    setSelected(null);
    setPeople([]);
    setErrors({});
    try {
      const r = await fetch(`/api/admin/incidents/${id}`);
      const d = await r.json();
      if (d.success) {
        setSelected(d.incident);
        setPeople(d.people);
      }
    } finally {
      setLoadingDetail(false);
    }
  }

  async function uploadCasePhoto(field: "image_url" | "poster_url" | "scene_image_url", file: File) {
    if (!selected) return;
    setUploadingKey(field);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("field", field);
    const r = await fetch(`/api/admin/incidents/${selected.id}/photo`, { method: "POST", body: formData });
    const d = await r.json();
    setUploadingKey(null);
    if (!d.success) {
      setErrors((prev) => ({ ...prev, [field]: d.error || "Upload failed" }));
      return;
    }
    setSelected((prev) => (prev ? { ...prev, [field]: d.url } : prev));
  }

  async function uploadPersonPhoto(personId: string, file: File) {
    setUploadingKey(personId);
    setErrors((prev) => ({ ...prev, [personId]: "" }));
    const formData = new FormData();
    formData.append("photo", file);
    const r = await fetch(`/api/admin/incident-people/${personId}/photo`, { method: "POST", body: formData });
    const d = await r.json();
    setUploadingKey(null);
    if (!d.success) {
      setErrors((prev) => ({ ...prev, [personId]: d.error || "Upload failed" }));
      return;
    }
    setPeople((prev) => prev.map((p) => (p.id === personId ? { ...p, photo_url: d.url } : p)));
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cases by title..."
        className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C9A24A]/50"
      />

      {searching && <p className="mt-2 text-xs text-slate-500">Searching...</p>}

      {results.length > 0 && !selected && (
        <div className="mt-3 space-y-1.5">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => selectCase(r.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#C9A24A]/30 hover:bg-white/[0.06]"
            >
              {r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image_url} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-black/40" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                <div className="text-xs text-slate-500">{CATEGORY_LABELS[r.category]}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {loadingDetail && <p className="mt-4 text-sm text-slate-400">Loading case...</p>}

      {selected && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{selected.title}</h2>
            <button
              onClick={() => {
                setSelected(null);
                setPeople([]);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              ← Back to search
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CASE_FIELDS.map(({ field, label, hint }) => (
              <PhotoSlot
                key={field}
                label={label}
                hint={hint}
                photoUrl={selected[field]}
                uploading={uploadingKey === field}
                error={errors[field] || null}
                onSelect={(file) => uploadCasePhoto(field, file)}
              />
            ))}
          </div>

          {people.length > 0 && (
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#E8D19A]">People</div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {people.map((p) => (
                  <PhotoSlot
                    key={p.id}
                    label={p.name}
                    hint={PERSON_ROLE_LABELS[p.role]}
                    photoUrl={p.photo_url}
                    uploading={uploadingKey === p.id}
                    error={errors[p.id] || null}
                    onSelect={(file) => uploadPersonPhoto(p.id, file)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
