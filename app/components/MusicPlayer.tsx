"use client";

import { MUSIC_GENRE_LABELS, TRACKS, type MusicGenre } from "@/lib/music";
import { useMusicPlayer } from "./MusicPlayerContext";

const GENRES: MusicGenre[] = ["mystery", "suspense", "dark_ambient", "investigation"];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6 4.5v15l14-7.5-14-7.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Mounted once in the root layout. Case-scoped sound effects (lib/sfx.ts)
// stay separate from this -- this is ambient mood music the listener
// chooses and keeps playing across pages, not short interaction stings.
// All playback state lives in MusicPlayerContext so the account
// sidebar's "Music" nav entry can drive the same player.
export default function MusicPlayer() {
  const { expanded, setExpanded, activeGenre, setActiveGenre, current, isPlaying, volume, setVolume, playTrack, togglePlay } =
    useMusicPlayer();

  return (
    <div className="fixed inset-x-0 bottom-14 z-[998] lg:bottom-0">
      {expanded && (
        <div className="max-h-[60vh] overflow-y-auto border-t border-[#C9A24A]/30 bg-[#05070b]/98 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl px-5 py-5">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    activeGenre === g
                      ? "bg-[#C9A24A] text-black"
                      : "border border-white/15 text-slate-300 hover:border-[#C9A24A]/40 hover:text-white"
                  }`}
                >
                  {MUSIC_GENRE_LABELS[g]}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {TRACKS.filter((t) => t.genre === activeGenre).map((t) => {
                const isCurrent = current?.slug === t.slug;
                return (
                  <button
                    key={t.slug}
                    onClick={() => (isCurrent ? togglePlay() : playTrack(t))}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isCurrent
                        ? "border-[#C9A24A]/50 bg-[#C9A24A]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        isCurrent ? "bg-[#C9A24A] text-black" : "bg-white/10 text-white"
                      }`}
                    >
                      {isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </span>
                    <span className="text-sm font-semibold text-white">{t.title}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Instrumental tracks by{" "}
              <a
                href="https://incompetech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:underline"
              >
                Kevin MacLeod (incompetech.com)
              </a>
              , licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:underline"
              >
                CC BY 4.0
              </a>
              .
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-white/10 bg-[#0a0d14]/98 px-4 py-2.5 backdrop-blur-xl">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A24A] text-black transition hover:opacity-90"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <NoteIcon />
          <span className="truncate text-xs font-semibold text-white sm:text-sm">
            {current ? current.title : "Listen to Music"}
          </span>
          {current && (
            <span className="hidden flex-shrink-0 text-[10px] uppercase tracking-wide text-slate-500 sm:inline">
              {MUSIC_GENRE_LABELS[current.genre]}
            </span>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="hidden w-20 accent-[#C9A24A] sm:block"
        />

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="flex-shrink-0 text-slate-400 transition hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
