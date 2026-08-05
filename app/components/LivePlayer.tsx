"use client";

import MuxPlayer, { type MuxPlayerCSSProperties } from "@mux/mux-player-react";
import type { LiveStream } from "@/lib/types";

// Cloudflare Stream's documented playback method is a plain iframe embed
// (no custom element/SDK needed) -- customer code + the live input's uid
// are both required to build the URL. Mux branch kept working for any
// historical Mux row (mux_playback_id) still reachable via getCurrentLiveStream.
export default function LivePlayer({ stream }: { stream: LiveStream }) {
  return (
    <div className="overflow-hidden rounded-[32px] border-2 border-red-500">
      {stream.provider === "cloudflare" && stream.cf_live_input_uid ? (
        <iframe
          src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${stream.cf_live_input_uid}/iframe?autoplay=true&muted=true&controls=true`}
          style={{ width: "100%", aspectRatio: "16 / 9", border: "none", display: "block" }}
          allow="autoplay; fullscreen"
          allowFullScreen
          title={stream.title}
        />
      ) : stream.mux_playback_id ? (
        <MuxPlayer
          playbackId={stream.mux_playback_id}
          streamType="ll-live"
          metadata={{ video_title: stream.title }}
          accentColor="#C9A24A"
          autoPlay
          muted
          style={{ width: "100%", aspectRatio: "16 / 9", "--media-object-fit": "cover" } as MuxPlayerCSSProperties}
        />
      ) : null}
    </div>
  );
}
