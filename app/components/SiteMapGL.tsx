"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState } from "react";
import { Map, NavigationControl, type MapRef } from "react-map-gl/maplibre";
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
  const mapRef = useRef<MapRef | null>(null);
  const lastViewState = useRef({ ...DFW_CENTER, zoom: 9, pitch: 0, bearing: 0 });

  function switchStyle() {
    const map = mapRef.current?.getMap();
    if (map) {
      lastViewState.current = {
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      };
    }
    setMapStyle((v) => (v === "satellite" ? "dark" : "satellite"));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* key={mapStyle} forces a clean remount on style switch instead of
          relying on MapLibre's default diffed setStyle() -- switching
          between a raster-only style and a vector style with its own
          sprite/glyph stack silently registered the new vector source but
          never actually requested tiles for it under diffed updates,
          confirmed via a network-request trace. Same forced-remount
          pattern the old Leaflet TileLayer already used via `key`. */}
      <Map
        key={mapStyle}
        ref={mapRef}
        initialViewState={lastViewState.current}
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
        <MapStyleToggle mapStyle={mapStyle} onToggle={switchStyle} />
      </div>
    </div>
  );
}
