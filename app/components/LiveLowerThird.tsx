"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type GraphicState = {
  visible: boolean;
  title: string | null;
  location: string | null;
  status: string | null;
};

function statusLabel(status: string | null): string {
  if (status === "active") return "Investigation ongoing";
  if (status === "resolved") return "Resolved";
  if (status === "cleared") return "Cleared";
  return "";
}

// Realtime-driven lower third for OBS -- the admin toggles a case on/off
// from the Studio page, which updates live_streams, and this reacts to
// that UPDATE instantly rather than polling.
export default function LiveLowerThird({ streamId, initial }: { streamId: string; initial: GraphicState }) {
  const [graphic, setGraphic] = useState<GraphicState>(initial);

  useEffect(() => {
    const channel = supabaseBrowser()
      .channel(`live-graphic-${streamId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${streamId}` },
        (payload) => {
          const row = payload.new as any;
          setGraphic({
            visible: row.graphic_visible,
            title: row.graphic_title,
            location: row.graphic_location,
            status: row.graphic_status,
          });
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser().removeChannel(channel);
    };
  }, [streamId]);

  return (
    <div className="flex min-h-screen w-screen items-end p-10">
      <div
        className={`flex items-stretch overflow-hidden rounded-xl shadow-2xl transition-all duration-500 ease-out ${
          graphic.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="w-2 bg-[#C9A24A]" />
        <div className="bg-black/85 px-6 py-4 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-white">{graphic.title}</div>
          {(graphic.location || graphic.status) && (
            <div className="mt-1 text-sm text-slate-300">
              {[graphic.location, statusLabel(graphic.status)].filter(Boolean).join(" | ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
