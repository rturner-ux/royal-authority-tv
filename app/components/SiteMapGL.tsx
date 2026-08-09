"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import { Map, NavigationControl } from "react-map-gl/maplibre";
import { resolveMapStyle, type MapStyleKey } from "@/lib/mapStyles";

const DFW_CENTER = { longitude: -97.05, latitude: 32.85 };

function MapStyleToggle({ mapStyle, onToggle }: { mapStyle: MapStyleKey; onToggle: () => void }) {
  return (
    <div style={{ maxWidth: 260 }}>
      <button
        onClick={onToggle}
        style={{
          background: "#0f172a",
          color: "#fff",
          border: "1px solid rgba(201,162,74,0.5)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {mapStyle === "satellite" ? "Switch to Dark Map" : "Switch to Satellite"}
      </button>
    </div>
  );
}

// Phase 1 scaffold: base MapLibre map + satellite/dark style toggle +
// NavigationControl (pan/zoom/compass -- this is what delivers the
// drag-to-tilt/rotate 3D interaction Leaflet could never do). Incident
// markers, boundaries, ALPR, sundown towns, and trafficking corridors are
// added in later phases -- see the migration plan for the phase breakdown.
export default function SiteMapGL({ isActive = false }: { isActive?: boolean }) {
  void isActive;
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("satellite");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        initialViewState={{ ...DFW_CENTER, zoom: 9 }}
        minZoom={4}
        mapStyle={resolveMapStyle(mapStyle)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />
      </Map>

      <div
        className="hidden sm:flex"
        style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, flexDirection: "column", gap: 8 }}
      >
        <MapStyleToggle mapStyle={mapStyle} onToggle={() => setMapStyle((v) => (v === "satellite" ? "dark" : "satellite"))} />
      </div>
    </div>
  );
}
