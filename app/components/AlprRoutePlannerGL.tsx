"use client";

import { useEffect, useState } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { MapMouseEvent } from "maplibre-gl";

type RouteResult = {
  geometry: [number, number][]; // [lng, lat] -- matches the API's GeoJSON convention, and MapLibre's own
  distanceMeters: number;
  durationSeconds: number;
  cameraCount: number;
};

type Point = { lat: number; lng: number; label: string };

function metersToMiles(m: number): string {
  return (m / 1609.34).toFixed(1);
}

function secondsToMinutes(s: number): string {
  return Math.round(s / 60).toString();
}

function routeLineData(geometry: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: geometry },
  };
}

function PointField({
  label,
  value,
  onQueryChange,
  picking,
  onTogglePick,
}: {
  label: string;
  value: Point | null;
  onQueryChange: (lat: number, lng: number, label: string) => void;
  picking: boolean;
  onTogglePick: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (d.success && d.result) {
        onQueryChange(d.result.lat, d.result.lng, d.result.label);
      }
    } catch {
      // Best-effort; leave the field as-is on failure.
    } finally {
      setSearching(false);
    }
  }

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.05, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={value ? value.label : query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={label === "From" ? "Search address..." : "Where to?"}
          style={{
            flex: 1,
            minWidth: 0,
            background: "rgba(255,255,255,0.06)",
            border: picking ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 12,
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          onClick={search}
          disabled={searching}
          style={{
            background: "#0c4a6e",
            border: "1px solid rgba(56,189,248,0.5)",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          →
        </button>
      </div>
      <button
        onClick={onTogglePick}
        style={{
          marginTop: 4,
          background: picking ? "#0c4a6e" : "transparent",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6,
          padding: "4px 8px",
          fontSize: 11,
          color: picking ? "#38bdf8" : "#94a3b8",
          cursor: "pointer",
        }}
      >
        {picking ? "Click the map..." : "Choose on map"}
      </button>
    </div>
  );
}

export default function AlprRoutePlannerGL({ map }: { map: MapRef }) {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [picking, setPicking] = useState<"origin" | "destination" | null>(null);
  const [result, setResult] = useState<{ direct: RouteResult; privacy: RouteResult | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m = map.getMap();
    function onClick(e: MapMouseEvent) {
      setPicking((current) => {
        if (!current) return current;
        const p = { lat: e.lngLat.lat, lng: e.lngLat.lng, label: `${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}` };
        if (current === "origin") setOrigin(p);
        else setDestination(p);
        return null;
      });
    }
    m.on("click", onClick);
    return () => {
      m.off("click", onClick);
    };
  }, [map]);

  async function getRoute() {
    if (!origin || !destination) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({
        originLat: String(origin.lat),
        originLng: String(origin.lng),
        destLat: String(destination.lat),
        destLng: String(destination.lng),
      });
      const r = await fetch(`/api/alpr-route?${params}`);
      const d = await r.json();
      if (d.success) {
        setResult({ direct: d.direct, privacy: d.privacy });
        const lngs = d.direct.geometry.map((c: [number, number]) => c[0]);
        const lats = d.direct.geometry.map((c: [number, number]) => c[1]);
        const bounds: [[number, number], [number, number]] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ];
        map.getMap().fitBounds(bounds, { padding: 40 });
      } else {
        setError(d.error || "Could not compute a route.");
      }
    } catch {
      setError("Could not compute a route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <PointField
          label="From"
          value={origin}
          onQueryChange={(lat, lng, label) => setOrigin({ lat, lng, label })}
          picking={picking === "origin"}
          onTogglePick={() => setPicking(picking === "origin" ? null : "origin")}
        />
        <PointField
          label="To"
          value={destination}
          onQueryChange={(lat, lng, label) => setDestination({ lat, lng, label })}
          picking={picking === "destination"}
          onTogglePick={() => setPicking(picking === "destination" ? null : "destination")}
        />
        <button
          onClick={getRoute}
          disabled={!origin || !destination || loading}
          style={{
            width: "100%",
            marginTop: 4,
            background: origin && destination ? "#0c4a6e" : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(56,189,248,0.5)",
            borderRadius: 6,
            padding: "8px",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            cursor: origin && destination ? "pointer" : "default",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Routing..." : "Get Route"}
        </button>

        {error && <div style={{ marginTop: 6, color: "#f87171", fontSize: 11 }}>{error}</div>}

        {result && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 14, height: 2, background: "#f97316", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#e2e8f0" }}>
                Direct: {metersToMiles(result.direct.distanceMeters)} mi, {secondsToMinutes(result.direct.durationSeconds)} min
              </span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#38bdf8", fontWeight: 700 }}>
                {result.direct.cameraCount}
              </span>
            </div>
            {result.privacy ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 2, background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#e2e8f0" }}>
                  Privacy: {metersToMiles(result.privacy.distanceMeters)} mi, {secondsToMinutes(result.privacy.durationSeconds)} min
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#38bdf8", fontWeight: 700 }}>
                  {result.privacy.cameraCount}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                No lower-camera-count alternative found -- the direct route is already the best option among real OSRM alternatives.
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>
              Camera counts are known ALPR cameras within ~150m of each route, from our synced OpenStreetMap/DeFlock data.
              Not a guarantee of avoidance.
            </div>
          </div>
        )}
      </div>

      {result && (
        <>
          <Source id="route-direct" type="geojson" data={routeLineData(result.direct.geometry)}>
            <Layer id="route-direct-line" type="line" paint={{ "line-color": "#f97316", "line-width": 4, "line-opacity": 0.85 }} />
          </Source>
          {result.privacy && (
            <Source id="route-privacy" type="geojson" data={routeLineData(result.privacy.geometry)}>
              <Layer id="route-privacy-line" type="line" paint={{ "line-color": "#22c55e", "line-width": 4, "line-opacity": 0.85 }} />
            </Source>
          )}
        </>
      )}
    </>
  );
}
