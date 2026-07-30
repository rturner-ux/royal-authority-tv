"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { playSfx } from "@/lib/sfx";

type Match = {
  type: "case" | "person";
  id: string;
  name: string;
  slug: string;
  category?: string;
  role?: string;
  photo_url: string | null;
};

type ScanResult = {
  extractedNames: string[];
  description: string;
  matches: Match[];
};

export default function PictureScanClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  async function scan() {
    if (!file) return;
    setStatus("loading");
    setError(null);
    playSfx("shutter");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/picture-scan", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not analyze this image right now.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch {
      setError("Could not analyze this image right now.");
      setStatus("error");
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-[32px] border border-[#C9A24A]/20 bg-gradient-to-br from-[#C9A24A]/[0.07] to-transparent p-7 backdrop-blur-sm">
      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-12 text-center transition hover:border-[#C9A24A]/40 hover:bg-[#C9A24A]/[0.06]">
          <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-semibold text-white">Upload a photo</span>
          <span className="text-xs text-slate-400">JPEG, PNG, or WEBP, up to 8MB</span>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
        </label>
      ) : (
        <div className="space-y-5">
          <div className="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10">
            <Image src={preview} alt="Uploaded photo" fill className="object-contain bg-black/40" unoptimized />
          </div>

          {status !== "done" && (
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={scan}
                disabled={status === "loading"}
                className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {status === "loading" ? "Scanning..." : "Scan Photo"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Choose a Different Photo
              </button>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
              {error}
            </p>
          )}

          {result && (
            <div className="space-y-4 border-t border-white/10 pt-5">
              <p className="text-sm leading-6 text-slate-300">{result.description}</p>

              {result.extractedNames.length > 0 && (
                <p className="text-xs text-slate-500">
                  Text detected in image: {result.extractedNames.join(", ")}
                </p>
              )}

              {result.matches.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.matches.map((m) => (
                    <Link
                      key={`${m.type}-${m.id}`}
                      href={`/case-file/${m.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#C9A24A]/40"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
                        {m.photo_url ? (
                          <Image src={m.photo_url} alt={m.name} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-white/20">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{m.name}</div>
                        <div className="truncate text-xs text-slate-400">
                          {m.type === "person" ? "Person on case" : "Case"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No matching case or person found on Royal Authority TV for the text detected in this image.
                </p>
              )}

              <button
                type="button"
                onClick={reset}
                className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Scan Another Photo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
