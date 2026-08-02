"use client";

import MuxPlayer, { type MuxPlayerCSSProperties } from "@mux/mux-player-react";

export default function LivePlayer({ playbackId, title }: { playbackId: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-[32px] border-2 border-red-500">
      <MuxPlayer
        playbackId={playbackId}
        streamType="ll-live"
        metadata={{ video_title: title }}
        accentColor="#C9A24A"
        autoPlay
        muted
        style={{ width: "100%", aspectRatio: "16 / 9", "--media-object-fit": "cover" } as MuxPlayerCSSProperties}
      />
    </div>
  );
}
