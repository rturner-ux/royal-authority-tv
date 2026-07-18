"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

type Point = { lat: number; lng: number; time: string; label: string };

// Real, sourced GPS points from the Mississippi Department of Marine Resources
// report, obtained by CBS News. The morning departure/evening-return dock has
// no publicly identified exact address, so it's approximated to the Ocean
// Springs waterway near Fort Bayou rather than pinned precisely.
const points: Point[] = [
  { lat: 30.4113, lng: -88.8279, time: "9:56 a.m.", label: "Departs dock (Ocean Springs area, exact dock not publicly identified)" },
  { lat: 30.245, lng: -88.775, time: "11:14 a.m.", label: "Arrives at Horn Island" },
  { lat: 30.245, lng: -88.775, time: "~4:00 p.m.", label: "Bilge pump fails near the island's west tip; distress call made" },
  { lat: 30.245, lng: -88.775, time: "4:31 p.m.", label: "Departs Horn Island under tow" },
  { lat: 30.4184, lng: -88.7926, time: "5:52 p.m.", label: "Travels into Fort Bayou" },
  { lat: 30.4113, lng: -88.8279, time: "6:06 p.m.", label: "Returns to original dock" },
  { lat: 30.4184, lng: -88.7926, time: "7:19 p.m.", label: "Departs Fort Bayou Boat Launch, later towed to a residence in Biloxi" },
];

function markerIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ${color}aa;"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FitToRoute({ pts }: { pts: Point[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [pts, map]);
  return null;
}

export default function NolanWellsGpsRoute() {
  const uniqueCoords = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10 lg:h-[520px]">
        <MapContainer center={[30.33, -88.8]} zoom={11} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitToRoute pts={points} />
          <Polyline positions={uniqueCoords} pathOptions={{ color: "#C9A24A", weight: 2, dashArray: "6 8", opacity: 0.7 }} />
          {points.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]} icon={markerIcon(i === 2 ? "#dc2626" : "#C9A24A")}>
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
            className={`rounded-xl border px-4 py-3 text-sm ${
              i === 2 ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className={`font-mono text-xs font-bold ${i === 2 ? "text-red-400" : "text-[#E8D19A]"}`}>{p.time}</div>
            <div className="mt-1 text-slate-300">{p.label}</div>
          </div>
        ))}
        <p className="pt-2 text-xs text-slate-500">
          Source: Mississippi Department of Marine Resources GPS data, obtained by CBS News.
        </p>
      </div>
    </div>
  );
}
