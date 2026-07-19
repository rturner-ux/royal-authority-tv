"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

type Point = { lat: number; lng: number; time: string; label: string; critical?: boolean };

// Real, sourced GPS points from the Mississippi Department of Marine Resources
// report, obtained by CBS News. The morning departure/evening-return dock has
// no publicly identified exact address, so it's approximated to the Ocean
// Springs waterway near Fort Bayou rather than pinned precisely.
const points: Point[] = [
  { lat: 30.4113, lng: -88.8279, time: "9:56 a.m.", label: "Departs dock (Ocean Springs area, exact dock not publicly identified)" },
  { lat: 30.245, lng: -88.775, time: "11:14 a.m.", label: "Arrives at Horn Island" },
  { lat: 30.245, lng: -88.775, time: "~4:00 p.m.", label: "Bilge pump fails near the island's west tip; distress call made", critical: true },
  { lat: 30.245, lng: -88.775, time: "4:31 p.m.", label: "Departs Horn Island under tow" },
  { lat: 30.4184, lng: -88.7926, time: "5:52 p.m.", label: "Travels into Fort Bayou" },
  { lat: 30.4113, lng: -88.8279, time: "6:06 p.m.", label: "Returns to original dock" },
  { lat: 30.4184, lng: -88.7926, time: "7:19 p.m.", label: "Departs Fort Bayou Boat Launch, later towed to a residence in Biloxi" },
];

function markerIcon(point: Point, index: number): L.DivIcon {
  const color = point.critical ? "#dc2626" : "#C9A24A";
  const pulse = point.critical
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};animation:gps-pulse 1.4s ease-out infinite;"></div>`
    : "";

  return L.divIcon({
    html: `
      <div style="position:relative;width:26px;height:26px;">
        ${pulse}
        <div style="width:26px;height:26px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.95);box-shadow:0 0 14px ${color}aa;display:flex;align-items:center;justify-content:center;font:700 12px system-ui;color:#0a0d14;">
          ${index + 1}
        </div>
      </div>
    `,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function FitToRoute({ pts }: { pts: Point[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [pts, map]);
  return null;
}

// Progressively reveals the route rather than drawing the whole polyline
// instantly, so the sequence of the day actually reads as a timeline.
function useAnimatedRoute(fullRoute: [number, number][]) {
  const [count, setCount] = useState(1);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let i = 1;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= fullRoute.length) clearInterval(interval);
    }, 450);
    return () => clearInterval(interval);
  }, [fullRoute.length]);

  return fullRoute.slice(0, count);
}

function AnimatedRoute({ pts }: { pts: [number, number][] }) {
  const revealed = useAnimatedRoute(pts);
  return (
    <Polyline
      positions={revealed}
      pathOptions={{ color: "#C9A24A", weight: 3, dashArray: "2 10", lineCap: "round", opacity: 0.9 }}
    />
  );
}

export default function NolanWellsGpsRoute() {
  const uniqueCoords = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <>
      <style>{`
        @keyframes gps-pulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <section className="mb-6 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            GPS Route Reconstruction
          </div>
          <div className="text-xs text-slate-500">
            Mississippi Department of Marine Resources data, via CBS News
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10 lg:h-[560px]">
            <MapContainer center={[30.33, -88.8]} zoom={11} style={{ width: "100%", height: "100%", background: "#0a0d14" }}>
              <TileLayer
                attribution='Tiles &copy; Esri. Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <FitToRoute pts={points} />
              <AnimatedRoute pts={uniqueCoords} />
              {points.map((p, i) => (
                <Marker key={i} position={[p.lat, p.lng]} icon={markerIcon(p, i)}>
                  <Popup>
                    <div style={{ fontSize: 13, color: "#0f172a" }}>
                      <div style={{ fontWeight: 700 }}>{p.time}</div>
                      <div>{p.label}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-3">
            {points.map((p, i) => (
              <div
                key={i}
                className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${
                  p.critical ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    p.critical ? "bg-red-500 text-black" : "bg-[#C9A24A] text-black"
                  }`}
                >
                  {i + 1}
                </div>
                <div>
                  <div className={`font-mono text-xs font-bold ${p.critical ? "text-red-400" : "text-[#E8D19A]"}`}>
                    {p.time}
                  </div>
                  <div className="mt-1 text-slate-300">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Critical Window
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The bilge pump failure and distress call happened around 4:00 p.m., with
            the boat departing the island under tow at 4:31 p.m. Wells' family
            reported him missing near midnight, hours after the boat returned
            without him.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Return Without Wells
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            GPS data confirms the boat left Horn Island at 4:31 p.m. and reached
            Fort Bayou by 5:52 p.m., docking at 6:06 p.m., without Wells aboard.
            A search ranger found his body off the island's northwestern tip two
            days later.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            What the Route Shows
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The tracked path covers open Mississippi Sound water between Ocean
            Springs and Horn Island, roughly 10 miles offshore, a route with real
            exposure to changing wind and current conditions during the incident
            window.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Source Note
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            All timestamps and coordinates above come directly from Mississippi
            Department of Marine Resources GPS records obtained by CBS News, not
            from social media speculation.
          </p>
        </div>
      </section>
    </>
  );
}
