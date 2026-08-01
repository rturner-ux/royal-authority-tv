"use client";

import MuxPlayer from "@mux/mux-player-react";

export default function LivePlayer({ playbackId, title }: { playbackId: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <MuxPlayer
        playbackId={playbackId}
        streamType="live"
        metadata={{ video_title: title }}
        accentColor="#C9A24A"
        autoPlay
        muted
        style={{ width: "100%", aspectRatio: "16 / 9" }}
      />
    </div>
  );
}
