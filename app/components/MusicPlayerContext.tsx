"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { TRACKS, trackUrl, type MusicGenre, type Track } from "@/lib/music";

type MusicPlayerState = {
  expanded: boolean;
  setExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  activeGenre: MusicGenre;
  setActiveGenre: (g: MusicGenre) => void;
  current: Track | null;
  isPlaying: boolean;
  volume: number;
  setVolume: (v: number) => void;
  playTrack: (t: Track) => void;
  togglePlay: () => void;
  playNext: () => void;
};

const MusicPlayerCtx = createContext<MusicPlayerState | null>(null);

// Owns the actual <audio> element and all playback state -- mounted once
// in the root layout so both the persistent bottom bar (MusicPlayer) and
// the account-section sidebar's "Music" nav entry can control the same
// player instead of each running their own.
export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeGenre, setActiveGenre] = useState<MusicGenre>("mystery");
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function playTrack(track: Track) {
    setCurrent(track);
    setIsPlaying(true);
  }

  useEffect(() => {
    if (!current || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = trackUrl(current);
    audio.volume = volume;
    audio.play().catch(() => setIsPlaying(false));
    // Only re-run when the track itself changes, not on every volume tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function togglePlay() {
    if (!current) {
      const first = TRACKS.find((t) => t.genre === activeGenre) ?? TRACKS[0];
      playTrack(first);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function playNext() {
    const inGenre = TRACKS.filter((t) => t.genre === (current?.genre ?? activeGenre));
    const idx = current ? inGenre.findIndex((t) => t.slug === current.slug) : -1;
    playTrack(inGenre[(idx + 1) % inGenre.length]);
  }

  return (
    <MusicPlayerCtx.Provider
      value={{
        expanded,
        setExpanded,
        activeGenre,
        setActiveGenre,
        current,
        isPlaying,
        volume,
        setVolume,
        playTrack,
        togglePlay,
        playNext,
      }}
    >
      <audio
        ref={audioRef}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {children}
    </MusicPlayerCtx.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerState {
  const ctx = useContext(MusicPlayerCtx);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
}
