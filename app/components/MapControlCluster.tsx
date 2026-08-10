"use client";

import { useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { MapStyleKey } from "@/lib/mapStyles";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
    </svg>
  );
}

const buttonBase: React.CSSProperties = {
  width: 36,
  height: 36,
  background: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#94a3b8",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)",
};

export default function MapControlCluster({
  map,
  mapStyle,
  onToggleStyle,
}: {
  map: MapRef | null;
  mapStyle: MapStyleKey;
  onToggleStyle: () => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(false);

  function locate() {
    if (!map || !navigator.geolocation) return;
    setLocating(true);
    setLocateError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        map.getMap().flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 });
      },
      () => {
        setLocating(false);
        setLocateError(true);
        setTimeout(() => setLocateError(false), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Sun/moon dark-mode pill -- same mapStyle/switchStyle state SiteMapGL
          already owns, just restyled from a text button into this. */}
      <div
        style={{
          width: 36,
          borderRadius: 999,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          backdropFilter: "blur(4px)",
        }}
      >
        <button
          onClick={() => mapStyle !== "satellite" && onToggleStyle()}
          aria-label="Switch to satellite"
          style={{
            width: "100%",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: mapStyle === "satellite" ? "#fff" : "#64748b",
            background: mapStyle === "satellite" ? "#0c4a6e" : "transparent",
          }}
        >
          <SunIcon />
        </button>
        <button
          onClick={() => mapStyle !== "dark" && onToggleStyle()}
          aria-label="Switch to dark map"
          style={{
            width: "100%",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: mapStyle === "dark" ? "#fff" : "#64748b",
            background: mapStyle === "dark" ? "#0c4a6e" : "transparent",
          }}
        >
          <MoonIcon />
        </button>
      </div>

      <button
        onClick={locate}
        aria-label="Find my location"
        style={{ ...buttonBase, borderRadius: 999, color: locateError ? "#f87171" : locating ? "#38bdf8" : "#94a3b8" }}
      >
        <LocateIcon />
      </button>

      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={() => map?.getMap().zoomIn()}
          aria-label="Zoom in"
          style={{ ...buttonBase, border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", fontSize: 18, fontWeight: 700 }}
        >
          +
        </button>
        <button onClick={() => map?.getMap().zoomOut()} aria-label="Zoom out" style={{ ...buttonBase, border: "none", fontSize: 18, fontWeight: 700 }}>
          −
        </button>
      </div>
    </div>
  );
}
